const express = require('express');
const { prisma } = require('../lib/prisma');
const dispatchService = require('../services/dispatch.service');

const router = express.Router();

// GET /api/orders/dispatch/pending - Live feed of pending requests for a tailor studio
router.get('/dispatch/pending', async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ error: 'storeId is required' });
    }
    const pending = dispatchService.getPendingRequestsForTailor(storeId);
    return res.json({ success: true, pendingRequests: pending });
  } catch (err) {
    console.error('Pending dispatch fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// POST /api/orders/dispatch/start - Start single 5-mile dispatch session purely in server cache
router.post('/dispatch/start', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      postcode,
      garmentId,
      garmentName,
      serviceId,
      serviceName,
      date,
      timeSlot,
      garmentBrand,
      fitNotes,
      measurements,
      imageUrl,
      price,
      customerLat,
      customerLng,
    } = req.body;

    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ error: 'Customer email or phone is required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const uniqueTs = Date.now().toString().slice(-6);
    const uniqueRand = Math.floor(100 + Math.random() * 900);
    const orderId = req.body.id || `TG-${uniqueTs}${uniqueRand}`;
    const parsedPrice = price ? parseFloat(price) : 25;
    const partnerPayout = parsedPrice;

    let measurementsStr = '';
    if (measurements) {
      measurementsStr = typeof measurements === 'object' ? JSON.stringify(measurements) : String(measurements);
    }

    // Connect user if exists or match by email/phone
    let linkedUserId = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) linkedUserId = userExists.id;
    }
    if (!linkedUserId && customerEmail) {
      const userByEmail = await prisma.user.findFirst({
        where: {
          OR: [
            { email: customerEmail.trim().toLowerCase() },
            { contact: customerEmail.trim().toLowerCase() },
          ],
        },
      });
      if (userByEmail) linkedUserId = userByEmail.id;
    }
    if (!linkedUserId && customerPhone) {
      const userByPhone = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: customerPhone.trim() },
            { contact: customerPhone.trim() },
          ],
        },
      });
      if (userByPhone) linkedUserId = userByPhone.id;
    }

    // Auto-create customer user if not found so they appear in Admin Customer Master
    if (!linkedUserId && (customerEmail || customerPhone)) {
      try {
        const cleanPhone = customerPhone ? customerPhone.trim() : null;
        const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
        const newCustomer = await prisma.user.create({
          data: {
            name: customerName || 'Valued Customer',
            email: cleanEmail,
            phone: cleanPhone,
            contact: cleanEmail || cleanPhone || '',
            postcode: postcode ? postcode.trim().toUpperCase() : null,
            role: 'CUSTOMER',
            status: 'ACTIVE',
          },
        });
        linkedUserId = newCustomer.id;
      } catch (userErr) {
        // If unique constraint conflict, find existing
        const found = await prisma.user.findFirst({
          where: {
            OR: [
              ...(customerEmail ? [{ email: customerEmail.trim().toLowerCase() }] : []),
              ...(customerPhone ? [{ phone: customerPhone.trim() }] : []),
            ],
          },
        });
        if (found) linkedUserId = found.id;
      }
    } else if (linkedUserId) {
      // Sync missing phone or email to existing user
      try {
        const u = await prisma.user.findUnique({ where: { id: linkedUserId } });
        if (u) {
          const syncData = {};
          if (!u.phone && customerPhone) syncData.phone = customerPhone.trim();
          if (!u.email && customerEmail) syncData.email = customerEmail.trim().toLowerCase();
          if ((!u.name || u.name === 'Member') && customerName) syncData.name = customerName.trim();
          if (Object.keys(syncData).length > 0) {
            await prisma.user.update({ where: { id: linkedUserId }, data: syncData });
          }
        }
      } catch (syncErr) {}
    }

    // Pure server-side cache session — DO NOT insert into PostgreSQL until accepted by a tailor!
    const orderSessionPayload = {
      id: orderId,
      userId: linkedUserId,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : 'customer@example.com',
      customerPhone: customerPhone ? customerPhone.trim() : null,
      postcode: postcode || 'W8 4EP',
      garmentId: garmentId || 'trousers',
      garmentName: garmentName || 'Trousers & Jeans',
      serviceId: serviceId || 'trouser-hem',
      serviceName: serviceName || 'Standard Hemming',
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '14:00 - 15:00',
      garmentBrand: garmentBrand || '',
      fitNotes: fitNotes || req.body.notes || req.body.bookingNotes || measurementsStr || '',
      pinnedAdjustment: measurementsStr || '',
      measurements: measurements || null,
      partnerPayout,
      imageUrl: req.body.intakePhotoUrl || imageUrl || null,
      price: parsedPrice,
      otp,
      customerLat: parseFloat(customerLat) || 51.5074,
      customerLng: parseFloat(customerLng) || -0.1278,
    };

    const dispatchSession = await dispatchService.startOrderDispatch(orderSessionPayload);

    return res.status(201).json({
      success: true,
      order: orderSessionPayload,
      dispatch: dispatchSession,
    });
  } catch (err) {
    console.error('Dispatch start error:', err);
    return res.status(500).json({ error: 'Failed to initiate dispatch session' });
  }
});

// POST /api/orders/:id/dispatch/cancel - Customer cancels search before acceptance
router.post('/:id/dispatch/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dispatchService.cancelDispatch(id);
    return res.json(result);
  } catch (err) {
    console.error('Dispatch cancel error:', err);
    return res.status(500).json({ error: 'Failed to cancel dispatch session' });
  }
});

// GET /api/orders/:id/dispatch/status - Customer live progress monitor
router.get('/:id/dispatch/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = dispatchService.getDispatchSessionStatus(id);

    // If session not found in memory, fall back to checking PostgreSQL Order status
    if (status.status === 'NOT_FOUND') {
      const dbOrder = await prisma.order.findUnique({
        where: { id },
        include: { store: true },
      });

      if (dbOrder) {
        return res.json({
          success: true,
          dispatch: {
            orderId: id,
            status: dbOrder.storeId ? 'ASSIGNED' : 'EXHAUSTED',
            acceptedTailor: dbOrder.store || null,
            order: formatOrderOutput(dbOrder),
          },
        });
      }
    }

    return res.json({ success: true, dispatch: status });
  } catch (err) {
    console.error('Dispatch status error:', err);
    return res.status(500).json({ error: 'Failed to get dispatch status' });
  }
});

// POST /api/orders/:id/dispatch/respond - Tailor Accept or Skip response
router.post('/:id/dispatch/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { tailorId, action } = req.body;

    if (!tailorId || !action) {
      return res.status(400).json({ error: 'tailorId and action (ACCEPT | SKIP) are required' });
    }

    if (action === 'SKIP') {
      const skipResult = await dispatchService.recordTailorSkip(id, tailorId);
      return res.json(skipResult);
    }

    if (action === 'ACCEPT') {
      const acceptResult = await dispatchService.recordTailorAccept(id, tailorId);
      if (!acceptResult.success) {
        return res.status(409).json(acceptResult); // 409 Conflict if already assigned
      }
      return res.json(acceptResult);
    }

    return res.status(400).json({ error: 'Invalid action. Expected ACCEPT or SKIP' });
  } catch (err) {
    console.error('Dispatch respond error:', err);
    return res.status(500).json({ error: 'Failed to process dispatch response' });
  }
});

// POST /api/orders/:id/dispatch/schedule - Customer fallback to schedule later slot
router.post('/:id/dispatch/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body;
    const result = await dispatchService.scheduleOrderForLater(id, date, timeSlot);
    return res.json(result);
  } catch (err) {
    console.error('Dispatch schedule error:', err);
    return res.status(500).json({ error: 'Failed to schedule order' });
  }
});

// POST /api/orders/:id/dispatch/retry - Re-dispatch order
router.post('/:id/dispatch/retry', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerLat, customerLng } = req.body;

    let orderData = null;
    const existingSession = dispatchService.getDispatchSessionStatus(id);
    if (existingSession && existingSession.order) {
      orderData = existingSession.order;
    } else {
      orderData = await prisma.order.findUnique({ where: { id } });
    }

    if (!orderData) {
      return res.status(404).json({ error: 'Order not found for retry' });
    }

    const session = await dispatchService.startOrderDispatch({
      ...orderData,
      customerLat: parseFloat(customerLat) || orderData.customerLat || 51.5074,
      customerLng: parseFloat(customerLng) || orderData.customerLng || -0.1278,
    });

    return res.json({ success: true, dispatch: session });
  } catch (err) {
    console.error('Dispatch retry error:', err);
    return res.status(500).json({ error: 'Failed to retry dispatch session' });
  }
});

// GET /api/orders/studio/stats - Studio analytics & settlements directly from PostgreSQL
router.get('/studio/stats', async (req, res) => {
  try {
    const { storeId } = req.query;
    const where = {};
    if (storeId) where.storeId = storeId;

    const orders = await prisma.order.findMany({ where });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.date === todayStr || o.createdAt?.toISOString?.().startsWith(todayStr));
    const activeOrders = orders.filter((o) => !['Collected', 'Closed'].includes(o.status));
    const completedOrders = orders.filter((o) => ['Collected', 'Closed', 'Ready'].includes(o.status));

    const todayPayouts = todayOrders.filter((o) => ['Collected', 'Closed'].includes(o.status)).reduce((sum, o) => sum + (o.price || o.partnerPayout || 20), 0);
    const weeklyPayouts = orders.filter((o) => ['Collected', 'Closed'].includes(o.status)).reduce((sum, o) => sum + (o.price || o.partnerPayout || 20), 0);
    const pendingPayouts = orders.filter((o) => ['Work in Progress', 'Ready'].includes(o.status)).reduce((sum, o) => sum + (o.price || o.partnerPayout || 20), 0);
    const retailRevenue = orders
      .filter((o) => o.retailSold && o.retailValue)
      .reduce((sum, o) => sum + parseFloat(o.retailValue || 0), 0);

    return res.json({
      success: true,
      stats: {
        todayPayouts: Math.round(todayPayouts * 100) / 100,
        weeklyPayouts: Math.round(weeklyPayouts * 100) / 100,
        pendingPayouts: Math.round(pendingPayouts * 100) / 100,
        retailRevenue: Math.round(retailRevenue * 100) / 100,
        totalJobs: orders.length,
        activeJobs: activeOrders.length,
        completedJobs: completedOrders.length,
        dailyCapacity: 25,
        dailyBooked: todayOrders.length,
        rating: 4.96,
        reviewCount: 312,
      },
    });
  } catch (err) {
    console.error('Studio stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch studio stats' });
  }
});

function parseOrderMeasurements(pinnedAdjustment) {
  if (!pinnedAdjustment) return {};
  if (typeof pinnedAdjustment === 'object') return pinnedAdjustment;
  const raw = String(pinnedAdjustment).trim();
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch { }
  } else if (raw.includes('·') || raw.includes(':') || raw.includes(',')) {
    const result = {};
    const parts = raw.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      const colonIdx = p.indexOf(':');
      if (colonIdx !== -1) {
        const k = p.slice(0, colonIdx).trim();
        const v = p.slice(colonIdx + 1).trim();
        if (k && v) result[k] = v;
      }
    });
    if (Object.keys(result).length > 0) return result;
  }
  return {};
}

function formatOrderOutput(o) {
  if (!o) return o;
  let measurements = parseOrderMeasurements(o.pinnedAdjustment);

  if (Object.keys(measurements).length === 0 && o.user?.measurements) {
    try {
      const userMeas = typeof o.user.measurements === 'object' ? o.user.measurements : JSON.parse(o.user.measurements);
      if (userMeas && typeof userMeas === 'object') {
        const prefilled = {};
        if (userMeas.waist) prefilled.waist = String(userMeas.waist).endsWith('in') || String(userMeas.waist).endsWith('cm') ? String(userMeas.waist) : `${userMeas.waist} in`;
        if (userMeas.inseam) prefilled.inseam = String(userMeas.inseam).endsWith('in') || String(userMeas.inseam).endsWith('cm') ? String(userMeas.inseam) : `${userMeas.inseam} in`;
        if (userMeas.sleeve) prefilled.sleeve = String(userMeas.sleeve).endsWith('in') || String(userMeas.sleeve).endsWith('cm') ? String(userMeas.sleeve) : `${userMeas.sleeve} in`;
        if (userMeas.chest) prefilled.chest = String(userMeas.chest).endsWith('in') || String(userMeas.chest).endsWith('cm') ? String(userMeas.chest) : `${userMeas.chest} in`;
        if (Object.keys(prefilled).length > 0) measurements = prefilled;
      }
    } catch (e) { }
  }

  let cleanNotes = o.fitNotes || o.notes || o.sewingNotes || '';
  if (typeof cleanNotes === 'string') {
    const trimmed = cleanNotes.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      cleanNotes = '';
    }
  }

  let finalFitNotes = o.fitNotes || '';
  if (typeof finalFitNotes === 'string') {
    const trimmed = finalFitNotes.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      finalFitNotes = '';
    }
  }

  const updated = {
    ...o,
    notes: cleanNotes || '',
    fitNotes: cleanNotes || finalFitNotes || '',
    measurements,
    pinnedAdjustment: o.pinnedAdjustment || (Object.keys(measurements).length > 0 ? JSON.stringify(measurements) : null),
    customerLocation: (o.customerLat && o.customerLng) ? { lat: o.customerLat, lng: o.customerLng } : null,
    tailorLocation: (o.tailorLat && o.tailorLng)
      ? { lat: o.tailorLat, lng: o.tailorLng }
      : (o.store?.lat && o.store?.lng ? { lat: o.store.lat, lng: o.store.lng } : null),
  };
  if (o.store && (!o.storeName || o.storeName === 'Atelier SoHo' || o.storeName === 'Local Partner Atelier')) {
    updated.storeName = o.store.name;
  }
  return updated;
}

// GET /api/orders - Fetch orders list with flexible filters
router.get('/', async (req, res) => {
  try {
    const { email, phone, userId, contact, storeId, status } = req.query;
    const searchContact = (contact || email || phone || '').toLowerCase().trim();

    const where = {};
    const orClauses = [];
    if (searchContact) {
      orClauses.push({ customerEmail: { equals: searchContact, mode: 'insensitive' } });
      orClauses.push({ customerPhone: searchContact });
      orClauses.push({ userId: searchContact });
    }
    if (userId) {
      orClauses.push({ userId: userId });
    }
    if (email) {
      orClauses.push({ customerEmail: { equals: email.toLowerCase().trim(), mode: 'insensitive' } });
    }
    if (orClauses.length > 0) {
      where.OR = orClauses;
    }

    if (storeId) {
      where.storeId = storeId;
    }
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const processedOrders = orders.map(formatOrderOutput);

    return res.json({ orders: processedOrders });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠️ [Database Notice] PostgreSQL is temporarily unreachable. Waiting for reconnect...');
      return res.status(503).json({ orders: [], error: 'Database temporarily unreachable' });
    }
    console.error('Fetch orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders from database' });
  }
});

// GET /api/orders/:id - Fetch single order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        user: true,
      },
    });

    if (!order) {
      const cleanDigits = id.replace(/[^0-9]/g, '');
      const searchConditions = [{ id: { contains: id } }];
      if (cleanDigits && cleanDigits.length >= 3) {
        searchConditions.push({ id: { contains: cleanDigits } });
      }
      order = await prisma.order.findFirst({
        where: { OR: searchConditions },
        include: {
          store: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (order) {
      return res.json({ order: formatOrderOutput(order) });
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order from database' });
  }
});

// POST /api/orders - Create a new alteration order
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      postcode,
      garmentId,
      garmentName,
      serviceId,
      serviceName,
      storeId,
      storeName,
      storePhone,
      date,
      timeSlot,
      garmentBrand,
      fitNotes,
      measurements,
      imageUrl,
      price,
      status,
    } = req.body;

    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ error: 'Customer email or phone is required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = req.body.id || `TG-${Math.floor(100000 + Math.random() * 900000)}`;
    const parsedPrice = price ? parseFloat(price) : 25;
    const partnerPayout = parsedPrice;

    let measurementsStr = '';
    if (measurements) {
      measurementsStr = typeof measurements === 'object' ? JSON.stringify(measurements) : String(measurements);
    }

    // Connect user if exists or match by email/phone
    let linkedUserId = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) linkedUserId = userExists.id;
    }
    if (!linkedUserId && customerEmail) {
      const userByEmail = await prisma.user.findFirst({
        where: {
          OR: [
            { email: customerEmail.trim().toLowerCase() },
            { contact: customerEmail.trim().toLowerCase() },
          ],
        },
      });
      if (userByEmail) linkedUserId = userByEmail.id;
    }
    if (!linkedUserId && customerPhone) {
      const userByPhone = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: customerPhone.trim() },
            { contact: customerPhone.trim() },
          ],
        },
      });
      if (userByPhone) linkedUserId = userByPhone.id;
    }

    if (!linkedUserId && (customerEmail || customerPhone)) {
      try {
        const cleanPhone = customerPhone ? customerPhone.trim() : null;
        const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
        const newCustomer = await prisma.user.create({
          data: {
            name: customerName || 'Valued Customer',
            email: cleanEmail,
            phone: cleanPhone,
            contact: cleanEmail || cleanPhone || '',
            postcode: postcode ? postcode.trim().toUpperCase() : null,
            role: 'CUSTOMER',
            status: 'ACTIVE',
          },
        });
        linkedUserId = newCustomer.id;
      } catch (userErr) {
        const found = await prisma.user.findFirst({
          where: {
            OR: [
              ...(customerEmail ? [{ email: customerEmail.trim().toLowerCase() }] : []),
              ...(customerPhone ? [{ phone: customerPhone.trim() }] : []),
            ],
          },
        });
        if (found) linkedUserId = found.id;
      }
    } else if (linkedUserId) {
      try {
        const u = await prisma.user.findUnique({ where: { id: linkedUserId } });
        if (u) {
          const syncData = {};
          if (!u.phone && customerPhone) syncData.phone = customerPhone.trim();
          if (!u.email && customerEmail) syncData.email = customerEmail.trim().toLowerCase();
          if ((!u.name || u.name === 'Member') && customerName) syncData.name = customerName.trim();
          if (Object.keys(syncData).length > 0) {
            await prisma.user.update({ where: { id: linkedUserId }, data: syncData });
          }
        }
      } catch (syncErr) {}
    }

    // Ensure store exists if storeId provided
    let validStoreId = null;
    let storeLat = null;
    let storeLng = null;
    if (storeId) {
      const storeExists = await prisma.partnerStore.findUnique({ where: { id: storeId } });
      if (storeExists) {
        validStoreId = storeId;
        storeLat = storeExists.lat;
        storeLng = storeExists.lng;
      }
    }

    const customerLatVal = req.body.customerLat ? parseFloat(req.body.customerLat) : null;
    const customerLngVal = req.body.customerLng ? parseFloat(req.body.customerLng) : null;

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        userId: linkedUserId,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : 'customer@example.com',
        customerPhone: customerPhone ? customerPhone.trim() : null,
        postcode: postcode || 'W8 4EP',
        customerLat: customerLatVal,
        customerLng: customerLngVal,
        tailorLat: storeLat,
        tailorLng: storeLng,
        garmentId: garmentId || 'trousers',
        garmentName: garmentName || 'Trousers & Jeans',
        serviceId: serviceId || 'trouser-hem',
        serviceName: serviceName || 'Standard Hemming',
        storeId: validStoreId,
        storeName: storeName || null,
        storePhone: storePhone || null,
        date: date || new Date().toISOString().split('T')[0],
        timeSlot: timeSlot || '14:00 - 15:00',
        garmentBrand: garmentBrand || '',
        fitNotes: (() => {
          if (fitNotes) return fitNotes;
          if (req.body.notes) return req.body.notes;
          if (req.body.bookingNotes) return req.body.bookingNotes;
          if (!measurementsStr) return '';
          try {
            const parsed = JSON.parse(measurementsStr);
            if (parsed && typeof parsed === 'object') {
              const parts = Object.entries(parsed)
                .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
                .map(([k, v]) => {
                  const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                  return `${label}: ${v}`;
                });
              if (parts.length > 0) return parts.join(' · ');
            }
          } catch { }
          return measurementsStr;
        })(),
        pinnedAdjustment: measurementsStr || '',
        sewingNotes: '',
        slaHours: 48,
        partnerPayout,
        retailSold: false,
        intakePhotoUrl: req.body.intakePhotoUrl || imageUrl || null,
        status: status || 'Allocated',
        price: parsedPrice,
        otp,
      },
    });

    // Start single 5-mile dispatch session quietly in background for tailor studios
    dispatchService.startOrderDispatch({
      ...newOrder,
      customerLat: parseFloat(req.body.customerLat) || 51.5074,
      customerLng: parseFloat(req.body.customerLng) || -0.1278,
    }).catch((err) => {
      console.warn('Background dispatch session warning:', err.message || err);
    });

    return res.status(201).json({
      success: true,
      message: 'Order created and saved successfully',
      order: formatOrderOutput(newOrder),
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create order in database' });
  }
});

// PUT /api/orders/:id - Update order status, measurements, notes, and retail tracking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      storeId,
      storeName,
      storePhone,
      otp,
      fitNotes,
      measurements,
      pinnedAdjustment,
      sewingNotes,
      assignedWorker,
      machineNo,
      hangTagNo,
      intakePhotoUrl,
      fabricConditionNotes,
      priceAdjustment,
      priceAdjustmentReason,
      priceAdjustmentStatus,
      slaStartedAt,
      retailSold,
      retailValue,
      retailCategory,
      rating,
      ratingFeedback,
      tailorLat,
      tailorLng,
      customerLat,
      customerLng,
    } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (storeName !== undefined) updateData.storeName = storeName;
    if (storePhone !== undefined) updateData.storePhone = storePhone;
    if (otp !== undefined) updateData.otp = otp;
    if (fitNotes !== undefined) updateData.fitNotes = fitNotes;
    else if (req.body.notes !== undefined) updateData.fitNotes = req.body.notes;
    if (measurements !== undefined && measurements !== null) {
      updateData.pinnedAdjustment = typeof measurements === 'object' ? JSON.stringify(measurements) : String(measurements);
    } else if (pinnedAdjustment !== undefined) {
      updateData.pinnedAdjustment = typeof pinnedAdjustment === 'object' ? JSON.stringify(pinnedAdjustment) : String(pinnedAdjustment);
    }
    if (sewingNotes !== undefined) updateData.sewingNotes = sewingNotes;
    if (assignedWorker !== undefined) updateData.assignedWorker = assignedWorker;
    if (machineNo !== undefined) updateData.machineNo = machineNo;
    if (hangTagNo !== undefined) updateData.hangTagNo = hangTagNo;
    if (intakePhotoUrl !== undefined) updateData.intakePhotoUrl = intakePhotoUrl;
    if (fabricConditionNotes !== undefined) updateData.fabricConditionNotes = fabricConditionNotes;
    if (priceAdjustment !== undefined) updateData.priceAdjustment = priceAdjustment ? parseFloat(priceAdjustment) : null;
    if (priceAdjustmentReason !== undefined) updateData.priceAdjustmentReason = priceAdjustmentReason;
    if (priceAdjustmentStatus !== undefined) updateData.priceAdjustmentStatus = priceAdjustmentStatus;
    if (slaStartedAt !== undefined) updateData.slaStartedAt = slaStartedAt ? new Date(slaStartedAt) : new Date();
    if (retailSold !== undefined) updateData.retailSold = Boolean(retailSold);
    if (retailValue !== undefined) updateData.retailValue = retailValue ? parseFloat(retailValue) : null;
    if (retailCategory !== undefined) updateData.retailCategory = retailCategory;
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (ratingFeedback !== undefined) updateData.ratingFeedback = ratingFeedback;

    // Direct coordinate overrides from request body
    if (tailorLat !== undefined && tailorLat !== null) updateData.tailorLat = parseFloat(tailorLat);
    if (tailorLng !== undefined && tailorLng !== null) updateData.tailorLng = parseFloat(tailorLng);
    if (customerLat !== undefined && customerLat !== null) updateData.customerLat = parseFloat(customerLat);
    if (customerLng !== undefined && customerLng !== null) updateData.customerLng = parseFloat(customerLng);

    if (storeId !== undefined) {
      if (storeId) {
        const storeExists = await prisma.partnerStore.findUnique({ where: { id: storeId } });
        if (storeExists) {
          updateData.storeId = storeId;
          if (!updateData.storeName || (updateData.storeName === 'Atelier SoHo' && storeExists.name !== 'Atelier SoHo')) {
            updateData.storeName = storeExists.name;
          }
          if (!updateData.storePhone && storeExists.phone) {
            updateData.storePhone = storeExists.phone;
          }
          // ✅ Always persist the tailor's precise coordinates when a store is linked
          if (typeof storeExists.lat === 'number' && !updateData.tailorLat) {
            updateData.tailorLat = storeExists.lat;
          }
          if (typeof storeExists.lng === 'number' && !updateData.tailorLng) {
            updateData.tailorLng = storeExists.lng;
          }
        }
      } else {
        updateData.storeId = null;
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        store: true,
      },
    });

    return res.json({
      success: true,
      order: formatOrderOutput(updated),
    });
  } catch (err) {
    console.error('Update order error:', err);
    return res.status(500).json({ error: 'Failed to update order in database' });
  }
});

// POST /api/orders/lookup-by-pin - Securely locate an order by authentic PIN for drop-off intake
router.post('/lookup-by-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'PIN is required' });
    }
    const cleanPin = String(pin).trim();

    const order = await prisma.order.findFirst({
      where: {
        otp: cleanPin,
        status: 'Accepted',
      },
      include: { store: true },
    });

    if (order) {
      return res.json({ success: true, order: formatOrderOutput(order) });
    }

    // Check if order exists in other status for helpful feedback
    const anyOrder = await prisma.order.findFirst({
      where: { otp: cleanPin },
      include: { store: true },
    });

    if (anyOrder) {
      return res.json({
        success: false,
        order: formatOrderOutput(anyOrder),
        status: anyOrder.status,
        message: `Order #${anyOrder.id} is in "${anyOrder.status}" status.`,
      });
    }

    return res.status(404).json({ success: false, message: `No order found with PIN "${cleanPin}".` });
  } catch (err) {
    console.error('Lookup by PIN error:', err);
    return res.status(500).json({ success: false, error: 'Failed to lookup order by PIN' });
  }
});

// POST /api/orders/:id/verify-pin - Securely verify customer PIN directly against backend database
router.post('/:id/verify-pin', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ success: false, valid: false, message: 'PIN is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, valid: false, message: 'Order not found' });
    }

    const cleanInput = String(pin).trim();
    const cleanStored = String(order.otp || '').trim();

    if (!cleanStored || cleanInput !== cleanStored) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: `Incorrect PIN "${cleanInput}". Check with customer.`,
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: 'PIN verified successfully',
      order: formatOrderOutput(order),
    });
  } catch (err) {
    console.error('Verify PIN error:', err);
    return res.status(500).json({ success: false, valid: false, error: 'Failed to verify PIN' });
  }
});

// DELETE /api/orders/:id - Remove order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    return res.status(500).json({ error: 'Failed to delete order from database' });
  }
});

module.exports = router;
