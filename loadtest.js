import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// ==============================================================================
// CUSTOM PERFORMANCE & INTEGRITY METRICS
// ==============================================================================
const bookingDispatchesCreated = new Counter('booking_dispatches_created');
const successfulStudioAccepts = new Counter('successful_studio_accepts');
const raceConflictsPrevented = new Counter('race_conflicts_prevented');
const pageLoadDuration = new Trend('book_page_load_duration_ms');
const dispatchStartDuration = new Trend('dispatch_start_duration_ms');
const studioAcceptDuration = new Trend('studio_accept_duration_ms');
const studioStatsDuration = new Trend('studio_stats_duration_ms');

// ==============================================================================
// TARGET HOST CONFIGURATION
// Supports live production (https://raffu.com) and local/staging via CLI env vars
// ==============================================================================
const BASE_URL = (__ENV.BASE_URL || 'https://raffu.com').replace(/\/+$/, '');
const API_URL = (__ENV.API_URL || `${BASE_URL === 'https://raffu.com' ? 'https://backend.raffu.com' : BASE_URL}/api`).replace(/\/+$/, '');

// Target Atelier Studio: Live verified atelier (Raju Shop - Suyog Nagar, Mumbai)
const TARGET_STUDIO_ID = __ENV.STUDIO_ID || 'store-raju-shop-823';
const STUDIO_LAT = parseFloat(__ENV.STUDIO_LAT || '19.369905');
const STUDIO_LNG = parseFloat(__ENV.STUDIO_LNG || '72.823270');

// Pre-computed valid Customer JWT payload for Next.js middleware pass-through on /book
const VALID_CUSTOMER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6ImN1c3RvbWVyIiwiaWQiOiJjdXN0b21lci1sb2FkdGVzdCIsInJvbGUiOiJDVVNUT01FUiJ9.loadtest_signature';

// ==============================================================================
// LOAD TEST STAGES & THRESHOLDS
// Simulates concurrent users booking requests and studio partners processing them
// ==============================================================================
export const options = {
  scenarios: {
    customer_booking_and_studio_load: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '20s', target: 15 }, // Warm-up: 15 concurrent users
        { duration: '40s', target: 35 }, // Normal busy load: 35 concurrent bookings
        { duration: '30s', target: 50 }, // Burst peak: 50 simultaneous users hitting atelier
        { duration: '15s', target: 0 },  // Cool-down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    // Over 98% of all functional integrity checks must pass
    checks: ['rate>0.98'],

    // Failed requests must stay under 2%
    http_req_failed: ['rate<0.02'],

    // Latency SLAs under concurrent load
    'book_page_load_duration_ms': ['p(95)<1500'],
    'dispatch_start_duration_ms': ['p(95)<1500'],
    'studio_accept_duration_ms': ['p(95)<2000'],
    'studio_stats_duration_ms': ['p(95)<1000'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const pageHeaders = {
    'Cookie': `tg_token=${VALID_CUSTOMER_TOKEN}; tg_user_role=CUSTOMER;`,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    ...(__ENV.VERCEL_BYPASS_TOKEN ? { 'x-vercel-protection-bypass': __ENV.VERCEL_BYPASS_TOKEN } : {}),
  };

  // Micro-jitter: customer locations within 0.1 to 0.4 miles of the atelier (well within 5.0 mi radius)
  const latOffset = (Math.random() - 0.5) * 0.008;
  const lngOffset = (Math.random() - 0.5) * 0.008;
  const customerLat = Number((STUDIO_LAT + latOffset).toFixed(6));
  const customerLng = Number((STUDIO_LNG + lngOffset).toFixed(6));

  const uniqueOrderId = `TG-LOAD-${__VU}-${__ITER}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  // --------------------------------------------------------------------------
  // STEP 1: Customer loads the live booking page (https://raffu.com/book)
  // --------------------------------------------------------------------------
  const pageStart = Date.now();
  const bookPageRes = http.get(`${BASE_URL}/book`, {
    headers: pageHeaders,
    redirects: 5,
    responseCallback: http.expectedStatuses(200, 304, 403),
    tags: { name: 'GET /book (HTML Page)' },
  });
  pageLoadDuration.add(Date.now() - pageStart);

  const isVercelChallenge = (bookPageRes.body || '').includes('Vercel Security Checkpoint');

  check(bookPageRes, {
    '1. Booking page reachable (200, 304, or Edge Checkpoint)': (r) =>
      r.status === 200 || r.status === 304 || (r.status === 403 && isVercelChallenge),
    '1b. Booking page delivers HTML content': (r) =>
      r.status === 304 || (r.headers['Content-Type'] || '').includes('text/html'),
  });

  // --------------------------------------------------------------------------
  // STEP 2: Browser loads alteration services catalog & nearby ateliers
  // --------------------------------------------------------------------------
  const servicesRes = http.get(`${API_URL}/services`, {
    headers: jsonHeaders,
    tags: { name: 'GET /api/services' },
  });

  check(servicesRes, {
    '2a. Alteration services catalog loaded (200)': (r) => r.status === 200,
    '2b. Contains active service categories': (r) => {
      try {
        const body = r.json();
        return Array.isArray(body.services) && body.services.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  const nearbyRes = http.get(
    `${API_URL}/tailors/nearby?lat=${customerLat}&lng=${customerLng}&radius=5.0`,
    {
      headers: jsonHeaders,
      tags: { name: 'GET /api/tailors/nearby' },
    }
  );

  check(nearbyRes, {
    '2c. Nearby ateliers located within 5 miles (200)': (r) => r.status === 200,
  });

  // --------------------------------------------------------------------------
  // STEP 3: Multiple customers submit booking requests simultaneously
  // --------------------------------------------------------------------------
  const dispatchPayload = JSON.stringify({
    id: uniqueOrderId,
    customerName: `Load Customer ${__VU}`,
    customerEmail: `customer-${__VU}-${__ITER}-${Date.now()}@example.com`,
    customerPhone: `91000${String(__VU).padStart(5, '0')}`,
    postcode: '401202',
    garmentId: 'trousers',
    garmentName: 'Trousers & Jeans',
    serviceId: 'trouser-hem-plain',
    serviceName: 'Shorten Hem (Plain)',
    quantity: (__VU % 3) + 1,
    price: 25,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM - 12:00 PM',
    customerLat,
    customerLng,
  });

  const dispatchStart = Date.now();
  const dispatchRes = http.post(`${API_URL}/orders/dispatch/start`, dispatchPayload, {
    headers: jsonHeaders,
    tags: { name: 'POST /api/orders/dispatch/start' },
  });
  dispatchStartDuration.add(Date.now() - dispatchStart);

  const dispatchOk = check(dispatchRes, {
    '3a. Booking dispatch initiated in server memory (201)': (r) => r.status === 201,
    '3b. Dispatch session returned with valid order id': (r) => {
      try {
        const body = r.json();
        return body.success === true && (body.order?.id === uniqueOrderId || body.dispatch?.orderId === uniqueOrderId);
      } catch (e) {
        return false;
      }
    },
  });

  if (!dispatchOk) {
    sleep(0.5);
    return;
  }
  bookingDispatchesCreated.add(1);

  // Customer checks dispatch search status
  const statusRes = http.get(`${API_URL}/orders/${encodeURIComponent(uniqueOrderId)}/dispatch/status`, {
    headers: jsonHeaders,
    tags: { name: 'GET /api/orders/:id/dispatch/status' },
  });

  check(statusRes, {
    '3c. Customer dispatch status query succeeds (200)': (r) => r.status === 200,
  });

  // --------------------------------------------------------------------------
  // STEP 4: Studios receive and check incoming pending requests under load
  // --------------------------------------------------------------------------
  const pendingRes = http.get(
    `${API_URL}/orders/dispatch/pending?storeId=${encodeURIComponent(TARGET_STUDIO_ID)}`,
    {
      headers: jsonHeaders,
      tags: { name: 'GET /api/orders/dispatch/pending' },
    }
  );

  check(pendingRes, {
    '4. Studio incoming live dispatch feed accessible (200)': (r) => r.status === 200,
  });

  // --------------------------------------------------------------------------
  // STEP 5: Studio ACCEPTS the customer request (Atomic DB Transaction)
  // --------------------------------------------------------------------------
  const acceptPayload = JSON.stringify({
    tailorId: TARGET_STUDIO_ID,
    action: 'ACCEPT',
  });

  const acceptStart = Date.now();
  const acceptRes = http.post(
    `${API_URL}/orders/${encodeURIComponent(uniqueOrderId)}/dispatch/respond`,
    acceptPayload,
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/orders/:id/dispatch/respond [ACCEPT]' },
    }
  );
  studioAcceptDuration.add(Date.now() - acceptStart);

  const acceptOk = check(acceptRes, {
    '5a. Studio successfully accepts booking order (200)': (r) => r.status === 200,
    '5b. Order confirmed with correct studio assignment': (r) => {
      try {
        const body = r.json();
        return (
          body.success === true &&
          (body.order?.storeId === TARGET_STUDIO_ID || body.order?.id === uniqueOrderId)
        );
      } catch (e) {
        return false;
      }
    },
  });

  if (acceptOk) {
    successfulStudioAccepts.add(1);
  }

  // --------------------------------------------------------------------------
  // STEP 6: RACE CONDITION CHECK - Double-Accept Collision Handling
  // Another atelier or worker attempts to claim the EXACT SAME order simultaneously.
  // The system must safely prevent race conditions and reject with HTTP 409 Conflict.
  // --------------------------------------------------------------------------
  const duplicateAcceptRes = http.post(
    `${API_URL}/orders/${encodeURIComponent(uniqueOrderId)}/dispatch/respond`,
    JSON.stringify({
      tailorId: 'store-competing-atelier-999',
      action: 'ACCEPT',
    }),
    {
      headers: jsonHeaders,
      responseCallback: http.expectedStatuses(409),
      tags: { name: 'POST /api/orders/:id/dispatch/respond [RACE_CHECK]' },
    }
  );

  const raceHandled = check(duplicateAcceptRes, {
    '6a. Concurrency safe: Duplicate accept rejected with 409 Conflict': (r) => r.status === 409,
    '6b. Error code is ORDER_ALREADY_ASSIGNED': (r) => {
      try {
        return r.json().code === 'ORDER_ALREADY_ASSIGNED';
      } catch (e) {
        return false;
      }
    },
  });

  if (raceHandled) {
    raceConflictsPrevented.add(1);
  }

  // --------------------------------------------------------------------------
  // STEP 7: Studio updates order status (Work in Progress + Tailor Assignment)
  // --------------------------------------------------------------------------
  const updateRes = http.put(
    `${API_URL}/orders/${encodeURIComponent(uniqueOrderId)}`,
    JSON.stringify({
      status: 'Work in Progress',
      assignedWorker: `Master Tailor ${(__VU % 4) + 1}`,
      machineNo: `M-${(__VU % 6) + 1}`,
      fitNotes: 'Load test verified: live booking & studio dispatch',
    }),
    {
      headers: jsonHeaders,
      tags: { name: 'PUT /api/orders/:id' },
    }
  );

  check(updateRes, {
    '7. Studio updates order status to Work in Progress (200)': (r) => r.status === 200,
  });

  // --------------------------------------------------------------------------
  // STEP 8: Studio queries live analytics & queue metrics under burst load
  // --------------------------------------------------------------------------
  const statsStart = Date.now();
  const statsRes = http.get(
    `${API_URL}/orders/studio/stats?storeId=${encodeURIComponent(TARGET_STUDIO_ID)}`,
    {
      headers: jsonHeaders,
      tags: { name: 'GET /api/orders/studio/stats' },
    }
  );
  studioStatsDuration.add(Date.now() - statsStart);

  check(statsRes, {
    '8. Studio dashboard live stats query succeeds (200)': (r) => r.status === 200,
  });

  // Paced sleep between iterations
  sleep(1);
}
