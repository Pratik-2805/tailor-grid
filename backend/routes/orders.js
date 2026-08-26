const express = require('express');
const { readDb, writeDb } = require('../db');

const router = express.Router();

// GET /api/orders
router.get('/', (req, res) => {
  try {
    const { email } = req.query;
    const db = readDb();
    let orders = db.orders || [];

    if (email) {
      orders = orders.filter(
        (o) => o.customerEmail?.toLowerCase() === email.toLowerCase()
      );
    }

    return res.json({ orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders
router.post('/', (req, res) => {
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
      price
    } = req.body;

    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ error: 'Customer email or phone is required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `TG-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@example.com',
      customerPhone: customerPhone || '+44 7700 900000',
      postcode: postcode || 'W8 4EP',
      garmentId: garmentId || 'trousers',
      garmentName: garmentName || 'Trousers & Jeans',
      serviceId: serviceId || 'trouser-hem',
      serviceName: serviceName || 'Standard Hemming',
      storeId: storeId || 'store-1',
      storeName: storeName || 'Kensington Bespoke Atelier',
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '14:00 - 15:00',
      garmentBrand: garmentBrand || '',
      fitNotes: fitNotes || '',
      status: 'Allocated',
      price: price || 25,
      otp,
      createdAt: new Date().toISOString()
    };

    const db = readDb();
    db.orders.unshift(newOrder);
    writeDb(db);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, fitNotes } = req.body;

    const db = readDb();
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) db.orders[orderIndex].status = status;
    if (fitNotes !== undefined) db.orders[orderIndex].fitNotes = fitNotes;

    writeDb(db);

    return res.json({
      success: true,
      order: db.orders[orderIndex]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
