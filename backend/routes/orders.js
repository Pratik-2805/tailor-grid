const express = require('express');
const { prisma } = require('../lib/prisma');
const { readDb, writeDb } = require('../db');

const router = express.Router();

// GET /api/orders/studio/stats - Studio analytics & settlements
router.get('/studio/stats', async (req, res) => {
  try {
    const { storeId } = req.query;
    const where = {};
    if (storeId) where.storeId = storeId;

    let orders = [];
    try {
      orders = await prisma.order.findMany({ where });
    } catch (dbErr) {
      console.warn('Prisma stats fallback:', dbErr.message);
      const db = readDb();
      orders = db.orders || [];
      if (storeId) orders = orders.filter((o) => o.storeId === storeId);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.date === todayStr || o.createdAt?.startsWith?.(todayStr));
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

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { email, storeId, status } = req.query;

    const where = {};
    if (email) {
      where.customerEmail = {
        equals: email.toLowerCase(),
        mode: 'insensitive',
      };
    }
    if (storeId) {
      // When a studio queries, show both their assigned orders AND unassigned/allocated broadcast orders
      where.OR = [
        { storeId: storeId },
        { status: 'Allocated' },
      ];
    }
    if (status) {
      where.status = status;
    }

    try {
      const orders = await prisma.order.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (orders && orders.length > 0) {
        return res.json({ orders });
      }
    } catch (prismaErr) {
      console.warn('Prisma fetch orders fallback:', prismaErr.message);
    }

    // Fallback to local store
    const db = readDb();
    let localOrders = db.orders || [];
    if (email) {
      localOrders = localOrders.filter(
        (o) => o.customerEmail?.toLowerCase() === email.toLowerCase()
      );
    }
    if (storeId) {
      localOrders = localOrders.filter((o) => !o.storeId || o.storeId === storeId || o.status === 'Allocated');
    }
    if (status) {
      localOrders = localOrders.filter((o) => o.status === status);
    }
    return res.json({ orders: localOrders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    const db = readDb();
    return res.json({ orders: db.orders || [] });
  }
});

// GET /api/orders/:id - Fetch single order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const order = await prisma.order.findUnique({
        where: { id },
      });
      if (order) return res.json({ order });
    } catch (prismaErr) {
      console.warn('Prisma get order by id fallback:', prismaErr.message);
    }

    const db = readDb();
    const order = (db.orders || []).find((o) => o.id === id);
    if (order) return res.json({ order });

    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const {
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
      fittingType,
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

    const orderData = {
      id: orderId,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@example.com',
      customerPhone: customerPhone || '+44 7700 900000',
      postcode: postcode || 'W8 4EP',
      garmentId: garmentId || 'trousers',
      garmentName: garmentName || 'Trousers & Jeans',
      serviceId: serviceId || 'trouser-hem',
      serviceName: serviceName || 'Standard Hemming',
      storeId: storeId || null,
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
      retailValue: null,
      retailCategory: null,
      intakePhotoUrl: imageUrl || null,
      status: status || 'Allocated',
      price: parsedPrice,
      otp,
    };

    try {
      const created = await prisma.order.create({
        data: orderData,
      });

      const db = readDb();
      if (!db.orders) db.orders = [];
      const existingIdx = db.orders.findIndex((o) => o.id === orderId);
      if (existingIdx >= 0) {
        db.orders[existingIdx] = created;
      } else {
        db.orders.unshift(created);
      }
      writeDb(db);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: created,
      });
    } catch (prismaErr) {
      console.warn('Prisma create order fallback:', prismaErr.message);
      const newOrder = {
        ...orderData,
        measurements: measurements || undefined,
        fittingType: fittingType || undefined,
        createdAt: new Date().toISOString(),
      };
      const db = readDb();
      if (!db.orders) db.orders = [];
      const existingIdx = db.orders.findIndex((o) => o.id === orderId);
      if (existingIdx >= 0) {
        db.orders[existingIdx] = newOrder;
      } else {
        db.orders.unshift(newOrder);
      }
      writeDb(db);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: newOrder,
      });
    }
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
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
    if (storeId !== undefined) updateData.storeId = storeId;
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

    let updated = null;
    try {
      if (storeId) {
        try {
          const storeExists = await prisma.partnerStore.findUnique({ where: { id: storeId } });
          if (!storeExists) {
            await prisma.partnerStore.create({
              data: {
                id: storeId,
                name: storeName || 'Partner Atelier',
                area: 'Neighborhood Atelier',
                address: '18 Kensington Church St',
                postcode: 'W8 4EP',
                leadTailor: 'Master Tailor',
                specialties: ['Custom Alterations', 'Precision Hemming'],
                lat: 51.5033,
                lng: -0.1925,
              },
            });
          }
        } catch (storeCheckErr) {
          console.warn('Store check in order update warning:', storeCheckErr.message);
        }
      }

      updated = await prisma.order.update({
        where: { id },
        data: updateData,
      });
    } catch (prismaErr) {
      console.warn('Prisma update order fallback:', prismaErr.message);
      // If foreign key constraint failed on storeId, retry without storeId
      try {
        const { storeId: _ignored, ...safeData } = updateData;
        updated = await prisma.order.update({
          where: { id },
          data: safeData,
        });
      } catch (retryErr) {
        console.warn('Prisma safe update retry failed:', retryErr.message);
      }
    }

    const db = readDb();
    if (!db.orders) db.orders = [];
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex !== -1) {
      db.orders[orderIndex] = {
        ...db.orders[orderIndex],
        ...updateData,
      };
      writeDb(db);
      return res.json({
        success: true,
        order: db.orders[orderIndex],
      });
    } else if (updated) {
      db.orders.unshift(updated);
      writeDb(db);
      return res.json({
        success: true,
        order: updated,
      });
    }

    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    console.error('Update order error:', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
