const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// GET /api/services - Garment categories & alteration service pricing
router.get('/services', async (req, res) => {
  try {
    const categories = await prisma.garmentCategory.findMany({
      include: {
        services: true,
      },
      orderBy: {
        startingPrice: 'asc',
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      tagline: cat.tagline,
      startingPrice: cat.startingPrice,
      avgTurnaround: cat.avgTurnaround,
      popularServices: cat.services,
    }));

    return res.json({ services: formatted });
  } catch (err) {
    console.error('Error fetching services from Prisma:', err);
    return res.status(500).json({ error: 'Failed to fetch services from database' });
  }
});

// GET /api/stores - Partner studio locations & live capacity
router.get('/stores', async (req, res) => {
  try {
    const { search, area } = req.query;
    const where = {};

    if (area) {
      where.area = { contains: area, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { postcode: { contains: search, mode: 'insensitive' } },
        { leadTailor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const prismaStores = await prisma.partnerStore.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const stores = prismaStores.map((s) => ({
      id: s.id,
      name: s.name,
      area: s.area,
      address: s.address,
      postcode: s.postcode,
      distance: s.distance || `${s.distanceMiles || 0.5} mi away`,
      distanceMiles: s.distanceMiles || 0.5,
      rating: s.rating || 4.95,
      reviewCount: s.reviewCount || 100,
      openingHours: s.openingHours || '09:00 - 19:00',
      dailyCapacity: s.dailyCapacity || 25,
      machines: s.machines || 6,
      workers: s.workers || 4,
      leadTailor: s.leadTailor || 'Master Tailor',
      specialties: Array.isArray(s.specialties) ? s.specialties : ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
      retailSold: s.retailSold ?? true,
      coords: { lat: s.lat || 40.7259, lng: s.lng || -74.0003 },
    }));

    return res.json({ stores, total: stores.length });
  } catch (err) {
    console.error('Error fetching partner stores from Prisma:', err);
    return res.status(500).json({ error: 'Failed to fetch stores from database' });
  }
});

// POST /api/stores - Register a new partner studio directly in PostgreSQL
router.post('/stores', async (req, res) => {
  try {
    const {
      name,
      area,
      address,
      postcode,
      leadTailor,
      machines,
      workers,
      dailyCapacity,
      specialties,
      openingHours,
      lat,
      lng,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const storeSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const storeId = `store-${storeSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newStore = await prisma.partnerStore.create({
      data: {
        id: storeId,
        name,
        area: area || 'Neighborhood Atelier',
        address: address || '18 Kensington Church St',
        postcode: postcode || 'W8 4EP',
        distance: '0.4 mi away',
        distanceMiles: 0.4,
        rating: 5.0,
        reviewCount: 1,
        openingHours: openingHours || 'Mon–Sat: 09:00 – 19:00',
        dailyCapacity: dailyCapacity || 25,
        machines: machines ? parseInt(machines) || 6 : 6,
        workers: workers ? parseInt(workers) || 4 : 4,
        leadTailor: leadTailor || 'Master Tailor',
        specialties: specialties || ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
        retailSold: true,
        lat: lat ? parseFloat(lat) : 40.7259,
        lng: lng ? parseFloat(lng) : -74.0003,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Studio registered successfully',
      store: {
        ...newStore,
        coords: { lat: newStore.lat, lng: newStore.lng },
      },
    });
  } catch (err) {
    console.error('Create store Prisma error:', err);
    return res.status(500).json({ error: 'Failed to create store in database' });
  }
});

module.exports = router;
