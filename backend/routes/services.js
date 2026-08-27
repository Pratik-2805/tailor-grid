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
    // Try querying PostgreSQL via Prisma
    const stores = await prisma.partnerStore.findMany({
      orderBy: {
        rating: 'desc',
      },
    });

    if (stores && stores.length > 0) {
      const formatted = stores.map((s) => ({
        ...s,
        coords: { lat: s.lat, lng: s.lng },
      }));
      return res.json({ stores: formatted });
    }

    // Fallback to local store if DB is empty
    const db = readDb();
    return res.json({ stores: db.stores || [] });
  } catch (err) {
    console.warn('Prisma stores query fallback:', err.message);
    const db = readDb();
    return res.json({ stores: db.stores || [] });
  }
});

module.exports = router;
