const { prisma } = require('../lib/prisma');
const { calculateDistanceInMiles } = require('./locate.service');

// In-memory cache for fast order dispatch sessions with automatic 10-minute TTL
const dispatchSessions = new Map();

const STAGE_CONFIG = [
  { stage: 1, minRadius: 0.0, maxRadius: 1.0, durationSec: 20 },
  { stage: 2, minRadius: 1.0, maxRadius: 3.0, durationSec: 20 },
  { stage: 3, minRadius: 3.0, maxRadius: 5.0, durationSec: 20 },
];

const DISPATCH_TTL_MS = 10 * 60 * 1000; // 10 minutes TTL
const HARD_TIMEOUT_SEC = 60; // 60 seconds hard dispatch cap

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

// Run cleanup periodically
setInterval(cleanupExpiredSessions, 60 * 1000);

/**
 * Fetch eligible tailors within 5.0 miles ONCE from PostgreSQL
 */
async function fetchEligible5MilePool(lat, lng) {
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  if (isNaN(centerLat) || isNaN(centerLng)) {
    throw new Error('Valid latitude and longitude required');
  }

  const stores = await prisma.partnerStore.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const pool = [];
  if (Array.isArray(stores)) {
    stores.forEach((store) => {
      if (typeof store.lat === 'number' && typeof store.lng === 'number') {
        const dist = calculateDistanceInMiles(centerLat, centerLng, store.lat, store.lng);
        if (dist <= 5.0) {
          pool.push({
            tailorId: store.id,
            name: store.name || 'Darzi Partner Atelier',
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
  const orderId = order.id || `TG-${Math.floor(100000 + Math.random() * 900000)}`;
  const lat = parseFloat(order.customerLat) || 51.5074;
  const lng = parseFloat(order.customerLng) || -0.1278;

  // Clear any existing active session timer for this order
  if (dispatchSessions.has(orderId)) {
    const existing = dispatchSessions.get(orderId);
    if (existing.timer) clearTimeout(existing.timer);
    if (existing.hardTimer) clearTimeout(existing.hardTimer);
  }

  // Fetch 5-mile pool ONCE from DB
  const tailorPool = await fetchEligible5MilePool(lat, lng);

  const now = Date.now();
  const parsedPrice = order.price ? parseFloat(order.price) : 25;
  const partnerPayout = order.partnerPayout || Math.round(parsedPrice * 0.75 * 100) / 100;
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
      serviceId: order.serviceId || 'trouser-hem',
      serviceName: order.serviceName || 'Standard Hemming',
      date: order.date || new Date().toISOString().split('T')[0],
      timeSlot: order.timeSlot || '14:00 - 15:00',
      garmentBrand: order.garmentBrand || '',
      fitNotes: order.fitNotes || measurementsStr || '',
      pinnedAdjustment: measurementsStr || '',
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
    stageEndsAt: now + 20 * 1000,
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
    if (session.declinedTailorIds.has(t.tailorId)) return false;
    return t.distanceMiles <= config.maxRadius;
  });

  session.activeCandidateTailorIds = new Set(currentCandidates.map((t) => t.tailorId));

  console.log(
    `[Dispatch Engine] Order ${session.orderId} -> Stage ${stageNum} (${config.maxRadius} mi) activated. ` +
    `Contacting ${currentCandidates.length} tailors. ` +
    `Permanently excluded: ${session.declinedTailorIds.size}`
  );

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

  session.declinedTailorIds.add(tailorId);
  session.activeCandidateTailorIds.delete(tailorId);

  console.log(`[Dispatch Engine] Tailor ${tailorId} SKIPPED Order ${orderId}. Excluded (${session.declinedTailorIds.size}/${session.tailorPool.length}).`);

  // Instant Check 1: If ALL tailors in the entire 5-mile pool have declined, end search immediately!
  if (session.declinedTailorIds.size >= session.tailorPool.length) {
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
      if (session.declinedTailorIds.has(t.tailorId)) return false;
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
            status: 'Allocated',
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
            serviceId: oData.serviceId || 'trouser-hem',
            serviceName: oData.serviceName || 'Standard Hemming',
            storeId: store.id,
            storeName: store.name,
            storePhone: store.phone,
            date: oData.date || new Date().toISOString().split('T')[0],
            timeSlot: oData.timeSlot || '14:00 - 15:00',
            garmentBrand: oData.garmentBrand || '',
            fitNotes: oData.fitNotes || '',
            pinnedAdjustment: oData.pinnedAdjustment || '',
            sewingNotes: '',
            slaHours: 48,
            partnerPayout: oData.partnerPayout || 18,
            retailSold: false,
            intakePhotoUrl: oData.imageUrl || null,
            status: 'Allocated',
            price: oData.price || 25,
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
 * Customer cancels search before acceptance - Immediately clears timers and purges from memory cache
 */
function cancelDispatch(orderId) {
  const session = dispatchSessions.get(orderId);
  if (!session) return { success: true, message: 'Session already cleared' };

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

  return { success: true, message: 'Dispatch search cancelled and cleared from server cache' };
}

/**
 * Fetch active pending orders waiting for a specific tailor studio
 */
function getPendingRequestsForTailor(tailorId) {
  if (!tailorId) return [];
  const now = Date.now();
  const pending = [];

  for (const [orderId, session] of dispatchSessions.entries()) {
    if (session.status === 'SEARCHING') {
      // Check if tailor is an active candidate and hasn't declined
      if (session.activeCandidateTailorIds.has(tailorId) && !session.declinedTailorIds.has(tailorId)) {
        const tailorInfo = session.tailorPool.find((t) => t.tailorId === tailorId);
        const stageSecondsRemaining = Math.max(0, Math.ceil((session.stageEndsAt - now) / 1000));

        pending.push({
          orderId: session.orderId,
          order: session.orderData,
          distanceMiles: tailorInfo?.distanceMiles || 0.8,
          distance: tailorInfo?.distance || '0.8 mi away',
          stage: session.stage,
          currentRadius: session.currentRadius,
          secondsRemaining: stageSecondsRemaining,
          payout: session.orderData.partnerPayout,
          customerName: session.orderData.customerName,
          garmentName: session.orderData.garmentName,
          serviceName: session.orderData.serviceName,
          timeSlot: session.orderData.timeSlot,
          date: session.orderData.date,
        });
      }
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
      fitNotes: oData.fitNotes || '',
      pinnedAdjustment: oData.pinnedAdjustment || '',
      sewingNotes: '',
      slaHours: 48,
      partnerPayout: oData.partnerPayout || 18,
      retailSold: false,
      intakePhotoUrl: oData.imageUrl || null,
      status: 'Allocated',
      price: oData.price || 25,
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
};
