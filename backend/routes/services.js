const express = require('express');
const { prisma } = require('../lib/prisma');
const { readDb } = require('../db');

const router = express.Router();

// GET /api/services
router.get('/services', async (req, res) => {
  try {
    // Try querying PostgreSQL via Prisma
    const categories = await prisma.garmentCategory.findMany({
      include: {
        services: true,
      },
      orderBy: {
        startingPrice: 'asc',
      },
    });

    if (categories && categories.length > 0) {
      // Map Prisma relation to the expected API shape
      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        tagline: cat.tagline,
        startingPrice: cat.startingPrice,
        avgTurnaround: cat.avgTurnaround,
        popularServices: cat.services,
      }));
      return res.json({ services: formatted });
    }

    // Fallback to local store if DB is empty
    const db = readDb();
    return res.json({ services: db.services || [] });
  } catch (err) {
    console.warn('Prisma services query fallback:', err.message);
    const db = readDb();
    return res.json({ services: db.services || [] });
  }
});

// GET /api/stores
router.get('/stores', async (req, res) => {
  try {
    const db = readDb();
    let stores = [];

    // 1. Try querying PostgreSQL via Prisma
    try {
      const prismaStores = await prisma.partnerStore.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (prismaStores && prismaStores.length > 0) {
        stores = prismaStores.map((s) => ({
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
          specialties: Array.isArray(s.specialties) ? s.specialties : ['Precision Hemming', 'Suit Tailoring', 'Express Alterations'],
          retailSold: s.retailSold ?? true,
          coords: { lat: s.lat || 51.5033, lng: s.lng || -0.1925 },
        }));
      }
    } catch (prismaErr) {
      console.warn('Prisma stores query fallback:', prismaErr.message);
    }

    // 2. Merge with local file stores in db.stores
    if (db.stores && Array.isArray(db.stores)) {
      for (const localStore of db.stores) {
        if (!stores.some((s) => s.id === localStore.id || s.name.toLowerCase() === localStore.name?.toLowerCase())) {
          stores.push(localStore);
        }
      }
    }

    // 3. Also check for any signed up studio users in db.users or registered partners
    if (db.users && Array.isArray(db.users)) {
      for (const u of db.users) {
        if (u.role === 'STUDIO' && u.studioName) {
          const storeExists = stores.some(
            (s) => s.id === u.studioId || s.name.toLowerCase() === u.studioName.toLowerCase()
          );
          if (!storeExists) {
            stores.push({
              id: u.studioId || `store-${u.id}`,
              name: u.studioName,
              area: u.postcode ? `Area ${u.postcode}` : 'Neighborhood Atelier',
              address: u.address || '18 Kensington Church St',
              postcode: u.postcode || 'W8 4EP',
              distance: '0.4 mi away',
              distanceMiles: 0.4,
              rating: 5.0,
              reviewCount: 1,
              openingHours: 'Mon–Sat: 09:00 – 19:00',
              dailyCapacity: 25,
              machines: 6,
              workers: 4,
              leadTailor: u.name || 'Master Tailor',
              specialties: ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
              retailSold: true,
              coords: { lat: 51.5033, lng: -0.1925 }
            });
          }
        }
      }
    }

    // Optional query filtering by search query / area
    const { search, area } = req.query;
    let filteredStores = stores;
    if (search) {
      const q = search.toLowerCase();
      filteredStores = filteredStores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.postcode?.toLowerCase().includes(q) ||
          s.leadTailor?.toLowerCase().includes(q) ||
          s.specialties?.some((spec) => spec.toLowerCase().includes(q))
      );
    }
    if (area) {
      filteredStores = filteredStores.filter((s) => s.area?.toLowerCase().includes(area.toLowerCase()));
    }

    return res.json({ stores: filteredStores, total: filteredStores.length });
  } catch (err) {
    console.error('Fetch stores error:', err);
    const db = readDb();
    return res.json({ stores: db.stores || [], total: (db.stores || []).length });
  }
});

// POST /api/stores - Register a new partner studio directly
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
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const storeSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const storeId = `store-${storeSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newStore = {
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
      workers: workers || 4,
      leadTailor: leadTailor || 'Master Tailor',
      specialties: specialties || ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
      retailSold: true,
      lat: 51.5033,
      lng: -0.1925,
    };

    try {
      await prisma.partnerStore.create({
        data: newStore,
      });
    } catch (prismaErr) {
      console.warn('Prisma create store fallback:', prismaErr.message);
    }

    const db = readDb();
    if (!db.stores) db.stores = [];
    const storeEntry = {
      ...newStore,
      coords: { lat: newStore.lat, lng: newStore.lng },
    };
    db.stores.unshift(storeEntry);
    writeDb(db);

    return res.status(201).json({
      success: true,
      message: 'Studio registered successfully',
      store: storeEntry,
    });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ error: 'Failed to create store' });
  }
});

module.exports = router;
