const { prisma } = require('../lib/prisma');

/**
 * Calculate accurate distance in miles between two coordinates using Haversine formula
 */
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
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

/**
 * Locate registered tailor studios from our database within a specified radius (in miles) of the customer
 * @param {Object} params
 * @param {number} params.lat - Latitude of customer location
 * @param {number} params.lng - Longitude of customer location
 * @param {number} [params.radiusMiles=4.0] - Radius in miles (default 4.0 miles = 8.0 miles diameter)
 * @param {string} [params.query=''] - Optional city / locality query
 * @returns {Promise<Array>} Array of registered partner studio objects within range
 */
async function locateTailorsWithinRange({ lat, lng, radiusMiles = 4.0, query = '' }) {
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const maxRadius = parseFloat(radiusMiles) || 4.0;

  if (isNaN(centerLat) || isNaN(centerLng)) {
    throw new Error('Valid latitude and longitude coordinates are required');
  }

  const results = [];

  // Fetch all registered partner studios stored in database with their latitude and longitude
  try {
    const dbStores = await prisma.partnerStore.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (Array.isArray(dbStores) && dbStores.length > 0) {
      dbStores.forEach((store) => {
        if (typeof store.lat === 'number' && typeof store.lng === 'number') {
          const dist = calculateDistanceInMiles(centerLat, centerLng, store.lat, store.lng);

          // Check if the studio is within the customer's radius
          if (dist <= maxRadius) {
            results.push({
              id: store.id,
              name: store.name || 'Darzi Partner Atelier',
              area: store.area || query || 'Neighborhood Studio',
              address: store.address || 'Partner Workshop',
              postcode: store.postcode || '',
              rating: store.rating || 4.96,
              reviewCount: store.reviewCount || 120,
              openingHours: store.openingHours || '09:00 - 19:00',
              dailyCapacity: store.dailyCapacity || 25,
              machines: store.machines || 6,
              workers: store.workers || 4,
              leadTailor: store.leadTailor || 'Master Tailor',
              specialties: Array.isArray(store.specialties)
                ? store.specialties
                : ['Custom Alterations', 'Precision Hemming'],
              retailSold: store.retailSold ?? true,
              coords: { lat: store.lat, lng: store.lng },
              distanceMiles: dist,
              distance: `${dist} mi away`,
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn('Error fetching registered partner studios:', err.message || err);
  }

  // Sort studios by distance (closest to customer first)
  results.sort((a, b) => a.distanceMiles - b.distanceMiles);

  return results;
}

module.exports = {
  calculateDistanceInMiles,
  locateTailorsWithinRange,
};
