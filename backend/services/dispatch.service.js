const { prisma } = require('../lib/prisma');
const { calculateDistanceInMiles } = require('./locate.service');
const { sendOrderOtpEmail } = require('../lib/email');
const pushService = require('./push.service');

// In-memory cache for fast order dispatch sessions with automatic 10-minute TTL
const dispatchSessions = new Map();

const STAGE_CONFIG = [
  { stage: 1, minRadius: 0.0, maxRadius: 1.0, durationSec: 15 },
  { stage: 2, minRadius: 1.0, maxRadius: 3.0, durationSec: 15 },
  { stage: 3, minRadius: 3.0, maxRadius: 5.0, durationSec: 15 },
];

const DISPATCH_TTL_MS = 1 * 60 * 1000; // 1 minute TTL
const HARD_TIMEOUT_SEC = 45; // 45 seconds hard dispatch cap (3 stages × 15s)

/**
 * Clean up expired dispatch sessions from memory
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [orderId, session] of dispatchSessions.entries()) {
    if (session.cacheExpiresAt && now > session.cacheExpiresAt) {
      if (session.timer) clearTimeout(session.timer);
      if (session.hardTimer) clearTimeout(session.hardTimer);
      dispatchSessions.delete(orderId);
    }
  }
}

// Run cleanup periodically every 30 seconds
setInterval(cleanupExpiredSessions, 30 * 1000);

/**
 * Helper to check if a studio catalog item matches the requested service
 */
function matchesServiceItem(item, requestedService = {}) {
  const reqServiceId = requestedService.serviceId ? String(requestedService.serviceId).toLowerCase().trim() : '';
  const reqServiceName = requestedService.serviceName ? String(requestedService.serviceName).toLowerCase().trim() : '';
  const reqGarmentId = requestedService.garmentId ? String(requestedService.garmentId).toLowerCase().trim() : '';
  const reqCategoryId = requestedService.categoryId ? String(requestedService.categoryId).toLowerCase().trim() : '';

  const itemServiceId = item.serviceId ? String(item.serviceId).toLowerCase().trim() : '';
  const itemName = item.name ? String(item.name).toLowerCase().trim() : '';
  const itemCatId = item.categoryId ? String(item.categoryId).toLowerCase().trim() : '';

  // 1. Direct serviceId match
  if (reqServiceId && itemServiceId && reqServiceId === itemServiceId) {
    return true;
  }
  // 2. Direct service name match
  if (reqServiceName && itemName && reqServiceName === itemName) {
    return true;
  }
  // 3. Category match fallback if serviceId/serviceName not specific or matching category
  if ((reqGarmentId || reqCategoryId) && itemCatId && (reqGarmentId === itemCatId || reqCategoryId === itemCatId)) {
    return true;
  }
  return false;
}

/**
 * Fetch eligible tailors within 5.0 miles ONCE from PostgreSQL
 */
async function fetchEligible5MilePool(lat, lng, requestedService = {}) {
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  if (isNaN(centerLat) || isNaN(centerLng)) {
    throw new Error('Valid latitude and longitude required');
  }

  const stores = await prisma.partnerStore.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all catalog items to evaluate both enabled and disabled status
  const allCatalogItems = await prisma.studioCatalogItem.findMany({
    select: {
      studioId: true,
      userId: true,
      serviceId: true,
      name: true,
      categoryId: true,
      enabled: true,
      price: true,
    },
  });

  // Group catalog items by studio identifiers (studioId and userId)
  const studioItemsMap = new Map();
  allCatalogItems.forEach((item) => {
    const keys = [item.studioId, item.userId].filter(Boolean);
    keys.forEach((k) => {
      const lowerKey = String(k).toLowerCase();
      if (!studioItemsMap.has(lowerKey)) {
        studioItemsMap.set(lowerKey, []);
      }
      studioItemsMap.get(lowerKey).push(item);
    });
  });

  const pool = [];
  if (Array.isArray(stores)) {
    stores.forEach((store) => {
      const storeKey = String(store.id).toLowerCase();
      const userKey = store.userId ? String(store.userId).toLowerCase() : null;
      const storeCatalog = [
        ...(studioItemsMap.get(storeKey) || []),
        ...(userKey ? studioItemsMap.get(userKey) || [] : []),
      ];

      // 1. Studio must have at least one active configured service
      const hasAnyConfigured = storeCatalog.some((i) => i.enabled && Number(i.price) > 0);
      if (!hasAnyConfigured) {
        return;
      }

      // 2. Check if the specific requested service is explicitly disabled by this studio
      if (requestedService && (requestedService.serviceId || requestedService.serviceName || requestedService.garmentId)) {
        const matchingItems = storeCatalog.filter((item) => matchesServiceItem(item, requestedService));
        if (matchingItems.length > 0) {
          // If there are matching items, check if ANY are enabled with price > 0
          const hasEnabledMatch = matchingItems.some((item) => item.enabled && Number(item.price) > 0);
          if (!hasEnabledMatch) {
            // All matches for this service are disabled (toggled off) -> EXCLUDE this studio!
            return;
          }
        }
      }

      if (typeof store.lat === 'number' && typeof store.lng === 'number') {
        const dist = calculateDistanceInMiles(centerLat, centerLng, store.lat, store.lng);
        if (dist <= 5.0) {
          pool.push({
            tailorId: store.id,
            name: store.name || 'Raffu Partner Atelier',
            area: store.area || 'Neighborhood Studio',
            address: store.address || '',
            postcode: store.postcode || '',
            rating: store.rating || 4.96,
            reviewCount: store.reviewCount || 100,
            specialties: store.specialties || ['Custom Alterations'],
            phone: store.phone || '',
            coords: { lat: store.lat, lng: store.lng },
            distanceMiles: dist,
            distance: `${dist} mi away`,
          });
        }
      }
    });
  }

  // Sort closest first
  pool.sort((a, b) => a.distanceMiles - b.distanceMiles);

  return pool;
}

/**
 * Start or initialize a single dispatch session in server cache (WITHOUT creating unconfirmed DB order)
 */
async function startOrderDispatch(order) {
  const uniqueTs = Date.now().toString().slice(-6);
  const uniqueRand = Math.floor(100 + Math.random() * 900);
  const orderId = order.id || `TG-${uniqueTs}${uniqueRand}`;
  const lat = parseFloat(order.customerLat) || 51.5074;
  const lng = parseFloat(order.customerLng) || -0.1278;

  // Clear any existing active session timer for this order
  if (dispatchSessions.has(orderId)) {
    const existing = dispatchSessions.get(orderId);
    if (existing.timer) clearTimeout(existing.timer);
    if (existing.hardTimer) clearTimeout(existing.hardTimer);
  }

  // Fetch 5-mile pool ONCE from DB, filtering out studios that have disabled this service
  const tailorPool = await fetchEligible5MilePool(lat, lng, {
    serviceId: order.serviceId,
    serviceName: order.serviceName,
    garmentId: order.garmentId,
  });

  const now = Date.now();
  const parsedPrice = order.price ? parseFloat(order.price) : 20;
  const partnerPayout = order.partnerPayout || parsedPrice;
  const otp = order.otp || String(Math.floor(1000 + Math.random() * 9000));

  let measurementsStr = '';
  if (order.measurements) {
    measurementsStr = typeof order.measurements === 'object' ? JSON.stringify(order.measurements) : String(order.measurements);
  }

  const session = {
    orderId,
    orderData: {
      id: orderId,
      userId: order.userId || null,
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || null,
      customerEmail: order.customerEmail || '',
      postcode: order.postcode || 'W8 4EP',
      garmentId: order.garmentId || 'trousers',
      garmentName: order.garmentName || 'Trousers & Jeans',
      quantity: order.quantity ? Math.max(1, parseInt(order.quantity, 10)) : 1,
      serviceId: order.serviceId || 'trouser-hem',
      serviceName: order.serviceName || 'Standard Hemming',
      date: order.date || new Date().toISOString().split('T')[0],
      timeSlot: order.timeSlot || '14:00 - 15:00',
      garmentBrand: order.garmentBrand || '',
      measurements: order.measurements || null,
      fitNotes: order.fitNotes || order.notes || order.bookingNotes || measurementsStr || '',
      pinnedAdjustment: measurementsStr || (typeof order.measurements === 'string' ? order.measurements : ''),
      price: parsedPrice,
      partnerPayout,
      otp,
      imageUrl: order.imageUrl || order.intakePhotoUrl || null,
    },
    customerCoords: { lat, lng },
    stage: 1,
    currentRadius: 1.0,
    startedAt: now,
    stageStartedAt: now,
    stageEndsAt: now + 15 * 1000,
    hardTimeoutAt: now + HARD_TIMEOUT_SEC * 1000,
    cacheExpiresAt: now + DISPATCH_TTL_MS,
    status: tailorPool.length === 0 ? 'ZERO_TAILORS' : 'SEARCHING', // SEARCHING, ASSIGNED, EXHAUSTED, ZERO_TAILORS, CANCELLED, SCHEDULED
    tailorPool,
    totalEligibleCount: tailorPool.length,
    declinedTailorIds: new Set(),
    activeCandidateTailorIds: new Set(),
    acceptedTailorId: null,
    acceptedTailor: null,
    confirmedOrder: null,
    timer: null,
    hardTimer: null,
  };

  dispatchSessions.set(orderId, session);

  if (session.status === 'ZERO_TAILORS') {
    return formatSessionOutput(session);
  }

  // Set hard 60-second cap timer
  session.hardTimer = setTimeout(() => {
    handleHardTimeout(orderId);
  }, HARD_TIMEOUT_SEC * 1000);

  // Activate Stage 1
  activateStage(session, 1);

  return formatSessionOutput(session);
}

/**
 * Activate a radius stage (1, 2, or 3)
 */
function activateStage(session, stageNum) {
  if (session.status !== 'SEARCHING') return;

  const config = STAGE_CONFIG.find((c) => c.stage === stageNum) || STAGE_CONFIG[STAGE_CONFIG.length - 1];
  session.stage = stageNum;
  session.currentRadius = config.maxRadius;
  session.stageStartedAt = Date.now();
  session.stageEndsAt = Date.now() + config.durationSec * 1000;

  // Filter tailors for this stage:
  // Must be within current radius (0 to maxRadius)
  // Must NOT be in declinedTailorIds (permanent exclusion)
  const currentCandidates = session.tailorPool.filter((t) => {
    const isDeclined =
      session.declinedTailorIds.has(t.tailorId) ||
      session.declinedTailorIds.has(String(t.tailorId).toLowerCase());
    if (isDeclined) return false;
    return t.distanceMiles <= config.maxRadius;
  });

  session.activeCandidateTailorIds = new Set(currentCandidates.map((t) => t.tailorId));

  console.log(
    `[Dispatch Engine] Order ${session.orderId} -> Stage ${stageNum} (${config.maxRadius} mi) activated. ` +
    `Contacting ${currentCandidates.length} tailors. ` +
    `Permanently excluded: ${session.declinedTailorIds.size}`
  );

  // Dispatch Web Push notification to all active devices of candidate ateliers
  currentCandidates.forEach((candidate) => {
    pushService.sendNotificationToStore(candidate.tailorId, {
      title: `⚡ Incoming Dispatch: ${session.orderData.garmentName || 'Garment'}`,
      body: `${session.orderData.serviceName || 'Alteration'} · ${candidate.distanceMiles ? candidate.distanceMiles.toFixed(1) : '0.2'} mi away · 15s to accept`,
      url: `/?orderId=${session.orderId}&dispatch=true`,
      tag: `dispatch-${session.orderId}`,
      renotify: true,
      data: {
        orderId: session.orderId,
        type: 'INCOMING_DISPATCH',
        garment: session.orderData.garmentName,
        service: session.orderData.serviceName,
        payout: session.orderData.partnerPayout,
      },
    }).catch((err) => console.warn('Dispatch push notice:', err.message));
  });

  // Clear previous stage timer
  if (session.timer) clearTimeout(session.timer);

  // Set timer for the next expansion
  session.timer = setTimeout(() => {
    handleStageTimeout(session.orderId, stageNum);
  }, config.durationSec * 1000);
}

/**
 * Handle 20-second timeout for a stage
 */
function handleStageTimeout(orderId, completedStage) {
  const session = dispatchSessions.get(orderId);
  if (!session || session.status !== 'SEARCHING') return;

  if (completedStage < 3) {
    // Progress to next stage (Stage 1 -> Stage 2 -> Stage 3)
    activateStage(session, completedStage + 1);
  } else {
    // Completed all 3 stages with no acceptance -> EXHAUSTED
    session.status = 'EXHAUSTED';
    session.activeCandidateTailorIds.clear();
    if (session.timer) clearTimeout(session.timer);
    if (session.hardTimer) clearTimeout(session.hardTimer);
    console.log(`[Dispatch Engine] Order ${orderId} -> All 3 stages exhausted (60s). No tailor accepted.`);
  }
}

/**
 * Handle hard 60s timeout
 */
function handleHardTimeout(orderId) {
  const session = dispatchSessions.get(orderId);
  if (!session || session.status !== 'SEARCHING') return;

  session.status = 'EXHAUSTED';
  session.activeCandidateTailorIds.clear();
  if (session.timer) clearTimeout(session.timer);
  if (session.hardTimer) clearTimeout(session.hardTimer);
  console.log(`[Dispatch Engine] Order ${orderId} -> Reached hard 60s cap. Marked EXHAUSTED.`);
}

/**
 * Tailor responds: SKIP / DECLINE (Permanent exclusion + instant exhaust check)
 */
async function recordTailorSkip(orderId, tailorId) {
  const session = dispatchSessions.get(orderId);
  if (!session) {
    return { success: false, message: 'Dispatch session expired or not found' };
  }

  const cleanId = String(tailorId).trim();
  const poolTailor = session.tailorPool.find(
    (t) =>
      t.tailorId === cleanId ||
      String(t.tailorId).toLowerCase() === cleanId.toLowerCase()
  );

  if (poolTailor) {
    session.declinedTailorIds.add(poolTailor.tailorId);
    session.declinedTailorIds.add(String(poolTailor.tailorId).toLowerCase());
    session.activeCandidateTailorIds.delete(poolTailor.tailorId);
    session.activeCandidateTailorIds.delete(cleanId);
    console.log(`[Dispatch Engine] Tailor ${poolTailor.tailorId} SKIPPED Order ${orderId}. Excluded (${session.declinedTailorIds.size}/${session.tailorPool.length}).`);
  } else {
    // Non-pooled tailor skipped, safely ignore so we don't skew the pool count
    console.warn(`[Dispatch Engine] Non-pooled tailor ${cleanId} skipped Order ${orderId}. Ignored.`);
    return {
      success: true,
      message: 'Not an active candidate for this order.',
      status: session.status,
    };
  }

  // Instant Check 1: If ALL tailors in the entire 5-mile pool have declined, end search immediately!
  const allPoolDeclined =
    session.tailorPool.length > 0 &&
    session.tailorPool.every((t) =>
      session.declinedTailorIds.has(t.tailorId) ||
      session.declinedTailorIds.has(String(t.tailorId).toLowerCase())
    );

  if (allPoolDeclined) {
    session.status = 'EXHAUSTED';
    session.activeCandidateTailorIds.clear();
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }
    if (session.hardTimer) {
      clearTimeout(session.hardTimer);
      session.hardTimer = null;
    }
    console.log(`[Dispatch Engine] Order ${orderId} -> All ${session.tailorPool.length} available tailors declined. Immediately ending search (EXHAUSTED).`);
  } else if (session.activeCandidateTailorIds.size === 0 && session.stage < 3) {
    // If all candidates in current stage declined, fast-forward to next stage immediately!
    const nextConfig = STAGE_CONFIG.find((c) => c.stage === session.stage + 1);
    const nextCandidates = session.tailorPool.filter((t) => {
      const isDeclined =
        session.declinedTailorIds.has(t.tailorId) ||
        session.declinedTailorIds.has(String(t.tailorId).toLowerCase());
      if (isDeclined) return false;
      return t.distanceMiles <= (nextConfig?.maxRadius || 5.0);
    });
    if (nextCandidates.length > 0) {
      console.log(`[Dispatch Engine] Order ${orderId} -> Current stage candidates all declined. Advancing immediately to Stage ${session.stage + 1}`);
      activateStage(session, session.stage + 1);
    }
  }

  return {
    success: true,
    message: 'Request skipped. Excluded from this order.',
    remainingCandidates: session.activeCandidateTailorIds.size,
    status: session.status,
  };
}

/**
 * Tailor responds: ACCEPT (Atomically creates the confirmed order in PostgreSQL)
 */
async function recordTailorAccept(orderId, tailorId) {
  const session = dispatchSessions.get(orderId);

  if (session && session.status === 'ASSIGNED') {
    return {
      success: false,
      code: 'ORDER_ALREADY_ASSIGNED',
      message: 'This order has already been accepted by another atelier.',
      assignedStoreName: session.acceptedTailor?.name || 'Another Atelier',
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if order already exists in DB
      const existingDbOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { store: true },
      });

      if (existingDbOrder && existingDbOrder.storeId && existingDbOrder.storeId !== tailorId) {
        return {
          success: false,
          code: 'ORDER_ALREADY_ASSIGNED',
          message: 'This order has already been accepted by another atelier.',
          assignedStoreName: existingDbOrder.store?.name || existingDbOrder.storeName || 'Another Atelier',
        };
      }

      // 2. Fetch tailor store
      const store = await tx.partnerStore.findUnique({
        where: { id: tailorId },
      });

      if (!store) {
        throw new Error('STORE_NOT_FOUND');
      }

      const oData = session?.orderData || {};
      const customerCoords = session?.customerCoords || { lat: 51.5074, lng: -0.1278 };

      // Look up all catalog items (both enabled and disabled) from the accepting studio
      const allStudioCatalogItems = await tx.studioCatalogItem.findMany({
        where: {
          OR: [
            { studioId: store.id },
            ...(store.userId ? [{ userId: store.userId }] : []),
          ],
        },
      });

      // Verify studio has not disabled this requested service
      if (allStudioCatalogItems.length > 0) {
        const orderSvc = {
          serviceId: oData.serviceId,
          serviceName: oData.serviceName,
          garmentId: oData.garmentId,
        };
        const matchingItems = allStudioCatalogItems.filter((item) => matchesServiceItem(item, orderSvc));
        if (matchingItems.length > 0) {
          const hasEnabledMatch = matchingItems.some((item) => item.enabled && Number(item.price) > 0);
          if (!hasEnabledMatch) {
            return {
              success: false,
              code: 'SERVICE_DISABLED',
              message: 'You have disabled this alteration service in your Workshop Price Catalog.',
            };
          }
        }
      }

      const studioCatalogItems = allStudioCatalogItems.filter((item) => item.enabled && Number(item.price) > 0);

      let calculatedPrice = oData.price ? parseFloat(oData.price) : 20;
      let studioCurrency = (store.currency && store.currency !== 'GBP' ? store.currency : 'USD');
      let studioCurrencySymbol = (store.currency && store.currency !== 'GBP' ? store.currencySymbol : '$') || '$';

      if (studioCatalogItems.length > 0) {
        if (studioCatalogItems[0].currency) studioCurrency = studioCatalogItems[0].currency;
        if (studioCatalogItems[0].currencySymbol) studioCurrencySymbol = studioCatalogItems[0].currencySymbol;

        // Find match: by serviceId, or service name case-insensitive, or category
        const matchedItem = studioCatalogItems.find((item) => matchesServiceItem(item, {
          serviceId: oData.serviceId,
          serviceName: oData.serviceName,
          garmentId: oData.garmentId,
        }));

        if (matchedItem && Number(matchedItem.price) > 0) {
          calculatedPrice = Number(matchedItem.price);
          calculatedPayout = Number(matchedItem.partnerPayout) || calculatedPrice * 0.75;
          if (matchedItem.currency) studioCurrency = matchedItem.currency;
          if (matchedItem.currencySymbol) studioCurrencySymbol = matchedItem.currencySymbol;
        }
      }

      // 3. Insert or update confirmed order in PostgreSQL
      let savedOrder;
      if (existingDbOrder) {
        savedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            storeId: store.id,
            storeName: store.name,
            storePhone: store.phone,
            tailorLat: store.lat,
            tailorLng: store.lng,
            price: calculatedPrice,
            partnerPayout: calculatedPayout,
            currency: studioCurrency,
            currencySymbol: studioCurrencySymbol,
            status: 'Accepted',
          },
          include: { store: true },
        });
      } else {
        savedOrder = await tx.order.create({
          data: {
            id: orderId,
            userId: oData.userId || null,
            customerName: oData.customerName || 'Valued Customer',
            customerEmail: oData.customerEmail || 'customer@example.com',
            customerPhone: oData.customerPhone || null,
            postcode: oData.postcode || 'W8 4EP',
            customerLat: customerCoords.lat,
            customerLng: customerCoords.lng,
            tailorLat: store.lat,
            tailorLng: store.lng,
            garmentId: oData.garmentId || 'trousers',
            garmentName: oData.garmentName || 'Trousers & Jeans',
            quantity: oData.quantity ? Math.max(1, parseInt(oData.quantity, 10)) : 1,
            serviceId: oData.serviceId || 'trouser-hem',
            serviceName: oData.serviceName || 'Standard Hemming',
            storeId: store.id,
            storeName: store.name,
            storePhone: store.phone,
            date: oData.date || new Date().toISOString().split('T')[0],
            timeSlot: oData.timeSlot || '14:00 - 15:00',
            garmentBrand: oData.garmentBrand || '',
            fitNotes: oData.fitNotes || oData.notes || oData.bookingNotes || '',
            pinnedAdjustment: oData.pinnedAdjustment || (typeof oData.measurements === 'object' ? JSON.stringify(oData.measurements) : (oData.measurements || '')),
            sewingNotes: '',
            slaHours: 48,
            partnerPayout: calculatedPayout,
            retailSold: false,
            intakePhotoUrl: oData.imageUrl || null,
            status: 'Accepted',
            price: calculatedPrice,
            currency: studioCurrency,
            currencySymbol: studioCurrencySymbol,
            otp: oData.otp || '1234',
          },
          include: { store: true },
        });
      }

      return {
        success: true,
        order: savedOrder,
        store,
      };
    });

    if (result.success && session) {
      session.status = 'ASSIGNED';
      session.acceptedTailorId = tailorId;
      session.acceptedTailor = result.store;
      session.confirmedOrder = result.order;
      if (session.orderData) {
        session.orderData.price = result.order.price;
        session.orderData.partnerPayout = result.order.partnerPayout;
        session.orderData.currency = result.order.currency;
        session.orderData.currencySymbol = result.order.currencySymbol;
      }
      session.activeCandidateTailorIds.clear();
      if (session.timer) {
        clearTimeout(session.timer);
        session.timer = null;
      }
      if (session.hardTimer) {
        clearTimeout(session.hardTimer);
        session.hardTimer = null;
      }
      console.log(`[Dispatch Engine] Order ${orderId} successfully ACCEPTED & created in PostgreSQL for ${result.store.name} (${tailorId})`);
    }

    if (result.success && result.order) {
      // Asynchronously dispatch Order OTP confirmation email to customer via Resend
      (async () => {
        try {
          let customerEmail = result.order.customerEmail;
          let customerName = result.order.customerName;
          if ((!customerEmail || customerEmail.includes('example.com')) && result.order.userId) {
            const user = await prisma.user.findUnique({ where: { id: result.order.userId } });
            if (user?.email) {
              customerEmail = user.email;
              if (user.name) customerName = user.name;
            }
          }
          if (customerEmail && customerEmail.includes('@') && !customerEmail.includes('example.com')) {
            await sendOrderOtpEmail({
              toEmail: customerEmail,
              otp: result.order.otp,
              orderId: result.order.id,
              customerName: customerName || 'Valued Customer',
              garmentName: result.order.garmentName,
              serviceName: result.order.serviceName,
              storeName: result.store?.name || result.order.storeName,
              storeAddress: result.store?.address,
              storePhone: result.store?.phone,
            });
          }
        } catch (emailErr) {
          console.error('[Dispatch Engine] Error dispatching order OTP email:', emailErr.message || emailErr);
        }
      })();
    }

    return result;
  } catch (err) {
    console.error(`[Dispatch Engine] Error accepting order ${orderId}:`, err);
    return {
      success: false,
      code: 'SERVER_ERROR',
      message: err.message || 'Failed to accept order',
    };
  }
}

/**
 * Customer cancels search before acceptance - Immediately clears timers, purges from memory cache and DB
 */
async function cancelDispatch(orderId) {
  const session = dispatchSessions.get(orderId);
  if (session) {
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }
    if (session.hardTimer) {
      clearTimeout(session.hardTimer);
      session.hardTimer = null;
    }
    session.activeCandidateTailorIds.clear();
    session.declinedTailorIds.clear();
    session.status = 'CANCELLED';

    // Immediately remove from server-side memory cache
    dispatchSessions.delete(orderId);
    console.log(`[Dispatch Engine] Order ${orderId} CANCELLED by customer and completely removed from server cache.`);
  }

  // Also clean up any unaccepted allocated record from DB
  try {
    await prisma.order.deleteMany({
      where: { id: orderId, status: 'Allocated' }
    });
  } catch (err) {
    // Ignore if not in DB
  }

  return { success: true, message: 'Dispatch search cancelled and cleared from server cache' };
}

/**
 * Fetch active pending orders waiting for a specific tailor studio
 */
async function getPendingRequestsForTailor(tailorId) {
  if (!tailorId) return [];
  const now = Date.now();
  const pending = [];
  const cleanTailorId = String(tailorId).trim().toLowerCase();

  // Fetch this studio's catalog items to ensure disabled services are never served in pending requests
  let disabledItems = [];
  try {
    const catalogItems = await prisma.studioCatalogItem.findMany({
      where: {
        OR: [
          { studioId: tailorId },
          { studioId: cleanTailorId },
          { userId: tailorId },
          { userId: cleanTailorId },
        ],
      },
      select: {
        serviceId: true,
        name: true,
        categoryId: true,
        enabled: true,
        price: true,
      },
    });
    disabledItems = catalogItems.filter((i) => i.enabled === false || Number(i.price) <= 0);
  } catch (err) {
    console.warn('[Dispatch Engine] Warning querying studio catalog in getPendingRequestsForTailor:', err.message);
  }

  for (const [orderId, session] of dispatchSessions.entries()) {
    if (session.status === 'SEARCHING') {
      // 1. Check if tailor has declined this order
      const hasDeclined =
        session.declinedTailorIds.has(cleanTailorId) ||
        Array.from(session.declinedTailorIds).some(
          (id) => String(id).toLowerCase() === cleanTailorId
        );
      if (hasDeclined) continue;

      // 2. Check if tailor is an active candidate for the current radius stage
      const isActiveCandidate =
        Array.from(session.activeCandidateTailorIds).some(
          (id) => String(id).toLowerCase() === cleanTailorId
        );
      if (!isActiveCandidate) continue;

      // 3. Find tailor info in session's 5-mile pool
      const tailorInfo = session.tailorPool.find(
        (t) => String(t.tailorId).toLowerCase() === cleanTailorId
      );
      if (!tailorInfo) continue;

      // 4. Double check that tailor is strictly within currentRadius
      if (typeof tailorInfo.distanceMiles === 'number' && tailorInfo.distanceMiles > session.currentRadius) {
        continue;
      }

      // 5. Fail-safe: Double check that tailor has NOT disabled this order's service
      if (disabledItems.length > 0) {
        const orderSvc = {
          serviceId: session.orderData?.serviceId,
          serviceName: session.orderData?.serviceName,
          garmentId: session.orderData?.garmentId,
        };
        const isServiceDisabled = disabledItems.some((item) => matchesServiceItem(item, orderSvc));
        if (isServiceDisabled) {
          continue;
        }
      }

      const stageSecondsRemaining = Math.max(0, Math.ceil((session.stageEndsAt - now) / 1000));

      pending.push({
        orderId: session.orderId,
        order: {
          ...session.orderData,
          measurements: session.orderData.measurements || session.orderData.pinnedAdjustment,
          pinnedAdjustment: session.orderData.pinnedAdjustment,
        },
        measurements: session.orderData.measurements || session.orderData.pinnedAdjustment,
        pinnedAdjustment: session.orderData.pinnedAdjustment,
        distanceMiles: tailorInfo.distanceMiles,
        distance: tailorInfo.distance,
        stage: session.stage,
        currentRadius: session.currentRadius,
        secondsRemaining: stageSecondsRemaining,
        payout: session.orderData.partnerPayout,
        customerName: session.orderData.customerName,
        garmentName: session.orderData.garmentName,
        quantity: session.orderData.quantity || 1,
        serviceName: session.orderData.serviceName,
        timeSlot: session.orderData.timeSlot,
        date: session.orderData.date,
      });
    }
  }

  return pending;
}

/**
 * Get current dispatch session status for Customer Book page
 */
function getDispatchSessionStatus(orderId) {
  const session = dispatchSessions.get(orderId);
  if (!session) {
    return {
      orderId,
      status: 'NOT_FOUND',
      message: 'No active dispatch session',
    };
  }
  return formatSessionOutput(session);
}

/**
 * Format session for customer / client view
 */
function formatSessionOutput(session) {
  const now = Date.now();
  const stageSecondsRemaining = Math.max(0, Math.ceil((session.stageEndsAt - now) / 1000));
  const totalSecondsElapsed = Math.max(0, Math.floor((now - session.startedAt) / 1000));

  return {
    orderId: session.orderId,
    status: session.status, // SEARCHING, ASSIGNED, EXHAUSTED, ZERO_TAILORS, CANCELLED, SCHEDULED
    stage: session.stage,
    currentRadius: session.currentRadius,
    stageSecondsRemaining,
    totalSecondsElapsed,
    hardTimeoutSec: HARD_TIMEOUT_SEC,
    totalEligibleCount: session.totalEligibleCount,
    contactedCount: session.activeCandidateTailorIds.size,
    declinedCount: session.declinedTailorIds.size,
    acceptedTailorId: session.acceptedTailorId,
    acceptedTailor: session.acceptedTailor,
    order: session.confirmedOrder || session.orderData,
  };
}

/**
 * Schedule fallback when customer schedules for later (Creates DB record)
 */
async function scheduleOrderForLater(orderId, scheduledDate, scheduledTimeSlot) {
  const session = dispatchSessions.get(orderId);
  if (session) {
    if (session.timer) clearTimeout(session.timer);
    if (session.hardTimer) clearTimeout(session.hardTimer);
    session.status = 'SCHEDULED';
  }

  const oData = session?.orderData || {};
  const customerCoords = session?.customerCoords || { lat: 51.5074, lng: -0.1278 };

  // Resolve tailor coordinates from the store record if a store is already known
  let tailorLatVal = null;
  let tailorLngVal = null;
  if (oData.storeId) {
    try {
      const store = await prisma.partnerStore.findUnique({ where: { id: oData.storeId } });
      if (store && typeof store.lat === 'number' && typeof store.lng === 'number') {
        tailorLatVal = store.lat;
        tailorLngVal = store.lng;
      }
    } catch (e) {
      console.warn('[Dispatch] Could not resolve store coords for scheduled order:', e.message);
    }
  }

  const scheduledOrder = await prisma.order.upsert({
    where: { id: orderId },
    update: {
      date: scheduledDate || new Date().toISOString().split('T')[0],
      timeSlot: scheduledTimeSlot || '10:00 - 11:00',
      status: 'Allocated',
      // ✅ Refresh customer coords on reschedule in case GPS updated
      customerLat: customerCoords.lat,
      customerLng: customerCoords.lng,
      ...(tailorLatVal !== null ? { tailorLat: tailorLatVal } : {}),
      ...(tailorLngVal !== null ? { tailorLng: tailorLngVal } : {}),
    },
    create: {
      id: orderId,
      userId: oData.userId || null,
      customerName: oData.customerName || 'Valued Customer',
      customerEmail: oData.customerEmail || 'customer@example.com',
      customerPhone: oData.customerPhone || null,
      postcode: oData.postcode || 'W8 4EP',
      customerLat: customerCoords.lat,
      customerLng: customerCoords.lng,
      tailorLat: tailorLatVal,
      tailorLng: tailorLngVal,
      garmentId: oData.garmentId || 'trousers',
      garmentName: oData.garmentName || 'Trousers & Jeans',
      serviceId: oData.serviceId || 'trouser-hem',
      serviceName: oData.serviceName || 'Standard Hemming',
      date: scheduledDate || new Date().toISOString().split('T')[0],
      timeSlot: scheduledTimeSlot || '10:00 - 11:00',
      garmentBrand: oData.garmentBrand || '',
      fitNotes: oData.fitNotes || oData.notes || oData.bookingNotes || '',
      pinnedAdjustment: oData.pinnedAdjustment || (typeof oData.measurements === 'object' ? JSON.stringify(oData.measurements) : (oData.measurements || '')),
      sewingNotes: '',
      slaHours: 48,
      partnerPayout: oData.partnerPayout || oData.price || 20,
      retailSold: false,
      intakePhotoUrl: oData.imageUrl || null,
      status: 'Allocated',
      price: oData.price || 20,
      otp: oData.otp || '1234',
    },
    include: { store: true },
  });

  return {
    success: true,
    message: 'Order scheduled for later slot successfully',
    order: scheduledOrder,
  };
}

module.exports = {
  startOrderDispatch,
  recordTailorSkip,
  recordTailorAccept,
  cancelDispatch,
  getPendingRequestsForTailor,
  getDispatchSessionStatus,
  scheduleOrderForLater,
  matchesServiceItem,
};
