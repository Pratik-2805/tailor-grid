const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

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

    const todayPayouts = todayOrders.reduce((sum, o) => sum + (o.partnerPayout || o.price * 0.75 || 18), 0);
    const weeklyPayouts = orders.reduce((sum, o) => sum + (o.partnerPayout || o.price * 0.75 || 18), 0);
    const retailRevenue = orders
      .filter((o) => o.retailSold && o.retailValue)
      .reduce((sum, o) => sum + parseFloat(o.retailValue || 0), 0);

    return res.json({
      success: true,
      stats: {
        todayPayouts: Math.round(todayPayouts * 100) / 100,
        weeklyPayouts: Math.round(weeklyPayouts * 100) / 100,
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

// GET /api/orders - Fetch orders list with flexible filters
router.get('/', async (req, res) => {
  try {
    const { email, phone, userId, contact, storeId, status } = req.query;
    const searchContact = (contact || email || phone || '').toLowerCase().trim();

    const where = {};
    if (searchContact) {
      where.OR = [
        { customerEmail: { equals: searchContact, mode: 'insensitive' } },
        { customerPhone: searchContact },
      ];
      if (userId) {
        where.OR.push({ userId: userId });
      }
    } else if (userId) {
      where.userId = userId;
    }

    if (storeId) {
      const storeClause = [
        { storeId: storeId },
        { status: 'Allocated' },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: storeClause }];
        delete where.OR;
      } else {
        where.OR = storeClause;
      }
    }
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({ orders });
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
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (order) return res.json({ order });
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
    const partnerPayout = Math.round(parsedPrice * 0.75 * 100) / 100;

    let measurementsStr = '';
    if (measurements) {
      measurementsStr = typeof measurements === 'object' ? JSON.stringify(measurements) : String(measurements);
    }

    // Connect user if exists
    let linkedUserId = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) linkedUserId = userExists.id;
    }
    if (!linkedUserId && customerEmail) {
      const userByEmail = await prisma.user.findUnique({ where: { email: customerEmail.trim().toLowerCase() } });
      if (userByEmail) linkedUserId = userByEmail.id;
    }

    // Ensure store exists if storeId provided
    let validStoreId = null;
    if (storeId) {
      const storeExists = await prisma.partnerStore.findUnique({ where: { id: storeId } });
      if (storeExists) validStoreId = storeId;
    }

    const newOrder = await prisma.order.create({
      data: {
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
        storeId: validStoreId,
        storeName: storeName || null,
        date: date || new Date().toISOString().split('T')[0],
        timeSlot: timeSlot || '14:00 - 15:00',
        garmentBrand: garmentBrand || '',
        fitNotes: fitNotes || (measurementsStr ? `Measurements: ${measurementsStr}` : ''),
        pinnedAdjustment: measurementsStr || '',
        sewingNotes: '',
        slaHours: 48,
        partnerPayout,
        retailSold: false,
        intakePhotoUrl: imageUrl || null,
        status: status || 'Allocated',
        price: parsedPrice,
        otp,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order created and saved successfully',
      order: newOrder,
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
      otp,
      fitNotes,
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
    } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (storeName !== undefined) updateData.storeName = storeName;
    if (otp !== undefined) updateData.otp = otp;
    if (fitNotes !== undefined) updateData.fitNotes = fitNotes;
    if (pinnedAdjustment !== undefined) updateData.pinnedAdjustment = pinnedAdjustment;
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

    if (storeId !== undefined) {
      if (storeId) {
        const storeExists = await prisma.partnerStore.findUnique({ where: { id: storeId } });
        if (storeExists) {
          updateData.storeId = storeId;
        }
      } else {
        updateData.storeId = null;
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      order: updated,
    });
  } catch (err) {
    console.error('Update order error:', err);
    return res.status(500).json({ error: 'Failed to update order in database' });
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
