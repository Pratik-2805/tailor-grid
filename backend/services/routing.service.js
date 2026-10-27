const { calculateDistanceInMiles } = require('./locate.service');

/**
 * Road distance / travel time from a customer to a shortlist of studios.
 *
 * Uses the Google Routes API (computeRouteMatrix) in batches, caches results per
 * (rounded customer location, studio), and falls back to straight-line distance
 * when no key is configured or the API is unavailable, so dispatch never breaks.
 */

const ROUTES_API_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
const METERS_PER_MILE = 1609.344;
const BATCH_SIZE = 100; // destinations per request (1 origin); well under the 625-element limit
const REQUEST_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // road networks rarely change; 6h keeps costs low
const CACHE_MAX_ENTRIES = 20000;
// ~110 m: pins moved within the same block reuse the cached route
const ORIGIN_ROUNDING_DECIMALS = 3;

const roadDistanceCache = new Map();
let warnedMissingKey = false;

function getTravelMode() {
  const mode = String(process.env.ROUTES_TRAVEL_MODE || 'DRIVE').toUpperCase();
  return ['DRIVE', 'TWO_WHEELER', 'WALK', 'BICYCLE'].includes(mode) ? mode : 'DRIVE';
}

function cacheKey(origin, studio, travelMode) {
  const oLat = Number(origin.lat).toFixed(ORIGIN_ROUNDING_DECIMALS);
  const oLng = Number(origin.lng).toFixed(ORIGIN_ROUNDING_DECIMALS);
  return `${travelMode}|${oLat},${oLng}|${studio.id}|${studio.lat},${studio.lng}`;
}

function readCache(key) {
  const hit = roadDistanceCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    roadDistanceCache.delete(key);
    return null;
  }
  return hit.value;
}

function writeCache(key, value) {
  if (roadDistanceCache.size >= CACHE_MAX_ENTRIES) {
    // Map keeps insertion order: drop the oldest entry
    const oldestKey = roadDistanceCache.keys().next().value;
    roadDistanceCache.delete(oldestKey);
  }
  roadDistanceCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function straightLineResult(origin, studio) {
  return {
    roadMiles: calculateDistanceInMiles(origin.lat, origin.lng, studio.lat, studio.lng),
    durationSec: null,
    source: 'straight-line',
  };
}

/**
 * Parse the Routes API "1234s" duration format into seconds
 */
function parseDurationSec(duration) {
  if (typeof duration !== 'string') return null;
  const sec = parseFloat(duration.replace('s', ''));
  return Number.isFinite(sec) ? sec : null;
}

async function fetchMatrixBatch(origin, studios, apiKey, travelMode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(ROUTES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration,condition',
      },
      body: JSON.stringify({
        origins: [{ waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } } }],
        destinations: studios.map((s) => ({
          waypoint: { location: { latLng: { latitude: s.lat, longitude: s.lng } } },
        })),
        travelMode,
        // Basic SKU: no live traffic, cheapest per element
        ...(travelMode === 'DRIVE' || travelMode === 'TWO_WHEELER' ? { routingPreference: 'TRAFFIC_UNAWARE' } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Routes API ${res.status}: ${text.slice(0, 200)}`);
    }

    const elements = await res.json();
    const results = new Map();
    if (Array.isArray(elements)) {
      elements.forEach((el) => {
        const studio = studios[el.destinationIndex];
        if (!studio) return;
        if (el.condition === 'ROUTE_EXISTS' && typeof el.distanceMeters === 'number') {
          results.set(studio.id, {
            roadMiles: el.distanceMeters / METERS_PER_MILE,
            durationSec: parseDurationSec(el.duration),
            source: 'road',
          });
        } else if (el.condition === 'ROUTE_NOT_FOUND') {
          results.set(studio.id, { roadMiles: Infinity, durationSec: null, source: 'road' });
        }
      });
    }
    return results;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get road distances from origin to each studio.
 * @param {{lat:number,lng:number}} origin
 * @param {Array<{id:string,lat:number,lng:number}>} studios shortlisted studios only
 * @returns {Promise<Map<string,{roadMiles:number,durationSec:number|null,source:'road'|'straight-line'}>>}
 */
async function getRoadDistances(origin, studios) {
  const travelMode = getTravelMode();
  const results = new Map();
  const uncached = [];

  studios.forEach((studio) => {
    const hit = readCache(cacheKey(origin, studio, travelMode));
    if (hit) results.set(studio.id, hit);
    else uncached.push(studio);
  });

  if (uncached.length === 0) return results;

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.warn('[Routing] GOOGLE_ROUTES_API_KEY not set; using straight-line distance for dispatch.');
      warnedMissingKey = true;
    }
    uncached.forEach((studio) => results.set(studio.id, straightLineResult(origin, studio)));
    return results;
  }

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    try {
      const batchResults = await fetchMatrixBatch(origin, batch, apiKey, travelMode);
      batch.forEach((studio) => {
        const value = batchResults.get(studio.id);
        if (value) {
          results.set(studio.id, value);
          writeCache(cacheKey(origin, studio, travelMode), value);
        } else {
          // Element missing / errored: fall back for this studio only, and don't cache it
          results.set(studio.id, straightLineResult(origin, studio));
        }
      });
    } catch (err) {
      console.warn('[Routing] Routes API failed; falling back to straight-line for this batch:', err.message || err);
      batch.forEach((studio) => results.set(studio.id, straightLineResult(origin, studio)));
    }
  }

  return results;
}

module.exports = {
  getRoadDistances,
};
