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

// Helper for GPS distance calculation purely by lat/lng
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// GET /api/stores - Partner studio locations & live capacity (filtered purely by lat/lng or search)
router.get('/stores', async (req, res) => {
  try {
    const { search, area } = req.query;
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusMiles = parseFloat(req.query.radiusMiles || '8.0') || 8.0;

    const where = {};

    // Only apply text filtering if explicit search or area is provided without lat/lng
    if (isNaN(lat) || isNaN(lng)) {
      if (area) {
        const cityKeyword = area.split(',')[0].trim();
        where.OR = [
          { area: { contains: area, mode: 'insensitive' } },
          { area: { contains: cityKeyword, mode: 'insensitive' } },
          { address: { contains: cityKeyword, mode: 'insensitive' } },
          { name: { contains: cityKeyword, mode: 'insensitive' } },
        ];
      }

      if (search) {
        const cleanSearch = search.trim();
        where.OR = [
          { name: { contains: cleanSearch, mode: 'insensitive' } },
          { area: { contains: cleanSearch, mode: 'insensitive' } },
          { address: { contains: cleanSearch, mode: 'insensitive' } },
          { postcode: { contains: cleanSearch, mode: 'insensitive' } },
          { leadTailor: { contains: cleanSearch, mode: 'insensitive' } },
        ];
      }
    }

    const prismaStores = await prisma.partnerStore.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const studioUsers = await prisma.user.findMany({
      where: { role: 'STUDIO' },
      select: {
        id: true,
        name: true,
        studioName: true,
        studioId: true,
        avatar: true,
        address: true,
        postcode: true,
      },
    });

    // Deduplicate stores by slug/name/leadTailor
    const seenKeys = new Set();
    let stores = [];

    for (const s of prismaStores) {
      // Find matching studio user
      const matchingUser = studioUsers.find(
        (u) =>
          (u.studioId && u.studioId === s.id) ||
          (u.studioName && u.studioName.toLowerCase() === s.name.toLowerCase()) ||
          (u.name && u.name.toLowerCase() === s.leadTailor.toLowerCase())
      );

      const storeName = (matchingUser && matchingUser.studioName) ? matchingUser.studioName : s.name;
      const key = (storeName || s.leadTailor || s.id).toLowerCase().trim();

      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);

      const storeLat = s.lat || 19.3568;
      const storeLng = s.lng || 72.8395;

      let calculatedDist = s.distanceMiles || 0.4;
      if (!isNaN(lat) && !isNaN(lng)) {
        calculatedDist = calculateDistanceInMiles(lat, lng, storeLat, storeLng);
        // Purely lat/lng filtering: ignore stores beyond radiusMiles
        if (calculatedDist > radiusMiles) {
          continue;
        }
      }

      stores.push({
        id: s.id,
        name: storeName,
        area: s.area,
        address: (matchingUser && matchingUser.address) ? matchingUser.address : s.address,
        postcode: (matchingUser && matchingUser.postcode) ? matchingUser.postcode : s.postcode,
        distance: `${calculatedDist} mi away`,
        distanceMiles: calculatedDist,
        rating: s.rating || 5.0,
        reviewCount: s.reviewCount || 1,
        openingHours: s.openingHours || 'Mon–Sat: 09:00 – 19:00',
        dailyCapacity: s.dailyCapacity || 25,
        machines: s.machines || 6,
        workers: s.workers || 4,
        leadTailor: (matchingUser && matchingUser.name) ? matchingUser.name : s.leadTailor,
        specialties: Array.isArray(s.specialties) && s.specialties.length > 0
          ? s.specialties
          : ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
        retailSold: s.retailSold ?? true,
        coords: { lat: storeLat, lng: storeLng },
        image: matchingUser?.avatar || null,
      });
    }

    if (!isNaN(lat) && !isNaN(lng)) {
      stores.sort((a, b) => a.distanceMiles - b.distanceMiles);
    }

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

const { locateTailorsWithinRange } = require('../services/locate.service');

// GET /api/tailors/nearby or /api/locate/tailors - Locate all tailors within range
const handleLocateTailors = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusMiles = parseFloat(req.query.radiusMiles) || 4.0;
    const query = req.query.query || '';

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters are required' });
    }

    const tailors = await locateTailorsWithinRange({ lat, lng, radiusMiles, query });

    return res.json({
      success: true,
      tailors,
      count: tailors.length,
      radiusMiles,
      center: { lat, lng },
    });
  } catch (err) {
    console.error('Error in locateTailors service route:', err);
    return res.status(500).json({ error: 'Failed to locate tailors within range' });
  }
};

router.get('/tailors/nearby', handleLocateTailors);
router.get('/locate/tailors', handleLocateTailors);

module.exports = router;
