import http from 'k6/http';
import { check, sleep } from 'k6';

// TailorGrid Backend API Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Maharashtra Cities Distribution for Realistic Multi-City Load Testing
const MH_TEST_CITIES = [
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777, postcode: '400070' },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, postcode: '411001' },
  { city: 'Nagpur', lat: 21.1458, lng: 79.0882, postcode: '440001' },
  { city: 'Nashik', lat: 19.9975, lng: 73.7898, postcode: '422001' },
  { city: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433, postcode: '431001' },
  { city: 'Kolhapur', lat: 16.7050, lng: 74.2433, postcode: '416001' },
  { city: 'Solapur', lat: 17.6599, lng: 75.9064, postcode: '413001' },
  { city: 'Amravati', lat: 20.9374, lng: 77.7796, postcode: '444601' },
  { city: 'Jalgaon', lat: 21.0077, lng: 75.5626, postcode: '425001' },
  { city: 'Nanded', lat: 19.1383, lng: 77.3210, postcode: '431601' },
  { city: 'Akola', lat: 20.7002, lng: 77.0082, postcode: '444001' },
  { city: 'Latur', lat: 18.4088, lng: 76.5604, postcode: '413512' },
  { city: 'Ahmednagar', lat: 19.0952, lng: 74.7496, postcode: '414001' },
  { city: 'Sangli', lat: 16.8524, lng: 74.5815, postcode: '416416' },
  { city: 'Satara', lat: 17.6805, lng: 73.9997, postcode: '415001' },
];

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Warm up to 50 users
    { duration: '45s', target: 150 },  // Ramp to 150 users
    { duration: '1m', target: 300 },   // Scale to 300 users
    { duration: '1m30s', target: 500 },// Peak stress at 500 concurrent users
    { duration: '30s', target: 0 },    // Cool down
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],    // Failure rate under 1%
    http_req_duration: ['p(95)<1200'], // 95% of requests under 1200ms at 500 VU scale
  },
};

export default function () {
  // ------------------------------------------------
  // 1. RANDOM CITY SELECTION & JITTER (Maharashtra)
  // Simulate users from different cities and streets
  // ------------------------------------------------
  const targetCity = MH_TEST_CITIES[Math.floor(Math.random() * MH_TEST_CITIES.length)];

  // Slight jitter (+/- 0.02 deg ~ 1.3 miles) around the city center
  const latJitter = (Math.random() - 0.5) * 0.04;
  const lngJitter = (Math.random() - 0.5) * 0.04;
  const LAT = Number((targetCity.lat + latJitter).toFixed(5));
  const LNG = Number((targetCity.lng + lngJitter).toFixed(5));

  const headers = { 'Content-Type': 'application/json' };

  // ------------------------------------------------
  // 2. GET NEARBY TAILORS (5-mile radius query)
  // Route: GET /api/tailors/nearby?lat=...&lng=...&radiusMiles=5
  // Uses URL tag to prevent k6 high-cardinality warnings
  // ------------------------------------------------
  const nearbyRes = http.get(
    `${BASE_URL}/api/tailors/nearby?lat=${LAT}&lng=${LNG}&radiusMiles=5`,
    {
      tags: { name: 'GET /api/tailors/nearby' },
    }
  );

  const nearbyOk = check(nearbyRes, {
    'GET /api/tailors/nearby status is 200': (r) => r.status === 200,
  });

  if (!nearbyOk) {
    sleep(1);
    return;
  }

  let tailors = [];
  try {
    const nearbyData = nearbyRes.json();
    tailors = nearbyData.tailors || [];
  } catch (e) {
    sleep(1);
    return;
  }

  // ------------------------------------------------
  // 3. EXPANSION SIMULATION: 1 mi -> 3 mi -> 5 mi
  // ------------------------------------------------
  const within1Mile = tailors.filter((t) => Number(t.distanceMiles || 999) <= 1.0);
  const within3Miles = tailors.filter((t) => Number(t.distanceMiles || 999) <= 3.0);
  const within5Miles = tailors.filter((t) => Number(t.distanceMiles || 999) <= 5.0);

  // ------------------------------------------------
  // 4. CREATE BOOKING / INITIATE DISPATCH
  // Route: POST /api/orders/dispatch/start
  // ------------------------------------------------
  const orderId = `LOAD-${__VU}-${__ITER}-${Date.now()}`;
  const dispatchPayload = JSON.stringify({
    id: orderId,
    customerName: `LoadTest User ${__VU}`,
    customerEmail: `loadtest-${__VU}@example.com`,
    customerPhone: `90000${String(__VU).padStart(5, '0')}`,
    postcode: targetCity.postcode,
    garmentId: 'trousers',
    garmentName: 'Trousers & Jeans',
    serviceId: 'trouser-hem-plain',
    serviceName: 'Shorten Hem (Plain)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '03:30 PM',
    measurements: { waist: '32', length: '40' },
    price: 25,
    customerLat: LAT,
    customerLng: LNG,
  });

  const startRes = http.post(
    `${BASE_URL}/api/orders/dispatch/start`,
    dispatchPayload,
    {
      headers,
      tags: { name: 'POST /api/orders/dispatch/start' },
    }
  );

  const startOk = check(startRes, {
    'POST /api/orders/dispatch/start status is 201': (r) => r.status === 201,
  });

  if (!startOk) {
    sleep(1);
    return;
  }

  // ------------------------------------------------
  // 5. CHECK DISPATCH STATUS
  // Route: GET /api/orders/:id/dispatch/status
  // ------------------------------------------------
  const statusRes = http.get(
    `${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/dispatch/status`,
    {
      tags: { name: 'GET /api/orders/:id/dispatch/status' },
    }
  );

  check(statusRes, {
    'GET /api/orders/:id/dispatch/status status is 200': (r) => r.status === 200,
  });

  // Pick nearest candidate tailor in that city
  const candidateTailor = within5Miles[0] || tailors[0];
  if (!candidateTailor) {
    // If no tailor within 5 miles for this jittered spot, complete cleanly
    sleep(1);
    return;
  }

  // ------------------------------------------------
  // 6. TAILOR ACCEPTS BOOKING
  // Route: POST /api/orders/:id/dispatch/respond
  // Atomically creates and locks order in PostgreSQL
  // ------------------------------------------------
  const acceptPayload = JSON.stringify({
    tailorId: candidateTailor.id,
    action: 'ACCEPT',
  });

  const acceptRes = http.post(
    `${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/dispatch/respond`,
    acceptPayload,
    {
      headers,
      tags: { name: 'POST /api/orders/:id/dispatch/respond' },
    }
  );

  check(acceptRes, {
    'POST /api/orders/:id/dispatch/respond status is 200': (r) => r.status === 200,
  });

  // ------------------------------------------------
  // 7. UPDATE BOOKING
  // Route: PUT /api/orders/:id
  // ------------------------------------------------
  const updatePayload = JSON.stringify({
    status: 'Work in Progress',
    fitNotes: `Load test verified at ${targetCity.city} studio - garment pinned and ready`,
  });

  const updateRes = http.put(
    `${BASE_URL}/api/orders/${encodeURIComponent(orderId)}`,
    updatePayload,
    {
      headers,
      tags: { name: 'PUT /api/orders/:id' },
    }
  );

  check(updateRes, {
    'PUT /api/orders/:id status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
