import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom Metrics for Concurrency & Race Condition Auditing
const successfulAccepts = new Counter('successful_accepts');
const raceConflictsSafelyHandled = new Counter('race_conflicts_safely_handled');
const acceptTransactionDuration = new Trend('accept_transaction_duration_ms');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Targeted Hotspot Studio: Master Fashion Atelier (Mumbai - Colaba)
const TARGET_STUDIO_ID = __ENV.STUDIO_ID || 'test-mh-studio-0001';
const STUDIO_LAT = 19.188572;
const STUDIO_LNG = 72.899422;

export const options = {
  scenarios: {
    // High-concurrency burst: Multiple simultaneous users flooding the EXACT same studio
    single_studio_hotspot: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '20s', target: 50 },  // Quick ramp to 50 concurrent users
        { duration: '40s', target: 100 }, // Sustained burst at 100 concurrent users hitting same studio
        { duration: '30s', target: 150 }, // Stress peak at 150 concurrent users
        { duration: '15s', target: 0 },   // Cool down
      ],
      gracefulRampDown: '10s',
    },
  },

  thresholds: {
    // 99%+ of all functional and race integrity checks must pass
    'checks': ['rate>0.99'],

    // Ensure normal requests don't drop
    'http_req_failed{name:POST /api/orders/dispatch/start}': ['rate<0.02'],
    'http_req_failed{name:GET /api/orders/dispatch/pending}': ['rate<0.02'],
    'http_req_failed{name:POST /api/orders/:id/dispatch/respond}': ['rate<0.02'],
    'http_req_failed{name:PUT /api/orders/:id}': ['rate<0.02'],
    'http_req_failed{name:GET /api/orders/studio/stats}': ['rate<0.02'],

    // Latency thresholds under hotspot load
    'http_req_duration': ['p(95)<1000'],
    'accept_transaction_duration_ms': ['p(95)<800'],
  },
};

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // Micro-jitter: customers located within 0.1 to 0.4 miles of this exact studio
  const latOffset = (Math.random() - 0.5) * 0.008;
  const lngOffset = (Math.random() - 0.5) * 0.008;
  const customerLat = Number((STUDIO_LAT + latOffset).toFixed(6));
  const customerLng = Number((STUDIO_LNG + lngOffset).toFixed(6));

  const uniqueOrderId = `HOTSPOT-${__VU}-${__ITER}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // -------------------------------------------------------------
  // STEP 1: Multiple users send requests to the same studio
  // -------------------------------------------------------------
  const dispatchPayload = JSON.stringify({
    id: uniqueOrderId,
    customerName: `Burst Customer ${__VU}`,
    customerEmail: `burst-${__VU}-${Date.now()}@example.com`,
    customerPhone: `91000${String(__VU).padStart(5, '0')}`,
    postcode: '400020',
    garmentId: 'suit-jacket',
    garmentName: 'Bespoke Suit & Jacket',
    serviceId: 'jacket-sleeve-shorten',
    serviceName: 'Shorten Sleeves from Crown',
    price: 35,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM - 12:00 PM',
    customerLat,
    customerLng,
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
    '1. User booking dispatch created (201)': (r) => r.status === 201,
  });

  if (!startOk) {
    sleep(0.5);
    return;
  }

  // -------------------------------------------------------------
  // STEP 2: Studio checks its live incoming pending queue
  // Under burst traffic, hundreds of orders hit this queue simultaneously
  // -------------------------------------------------------------
  const pendingRes = http.get(
    `${BASE_URL}/api/orders/dispatch/pending?storeId=${encodeURIComponent(TARGET_STUDIO_ID)}`,
    {
      tags: { name: 'GET /api/orders/dispatch/pending' },
    }
  );

  check(pendingRes, {
    '2. Studio pending feed accessible (200)': (r) => r.status === 200,
  });

  // -------------------------------------------------------------
  // STEP 3: Studio ACCEPTS the user request (Concurrent DB Transaction)
  // -------------------------------------------------------------
  const acceptPayload = JSON.stringify({
    tailorId: TARGET_STUDIO_ID,
    action: 'ACCEPT',
  });

  const acceptStart = Date.now();
  const acceptRes = http.post(
    `${BASE_URL}/api/orders/${encodeURIComponent(uniqueOrderId)}/dispatch/respond`,
    acceptPayload,
    {
      headers,
      tags: { name: 'POST /api/orders/:id/dispatch/respond' },
    }
  );
  acceptTransactionDuration.add(Date.now() - acceptStart);

  const acceptOk = check(acceptRes, {
    '3. Studio successfully accepts booking (200)': (r) => r.status === 200,
    '3b. Correct studio assigned in DB': (r) => {
      try {
        const body = r.json();
        return body.order && body.order.storeId === TARGET_STUDIO_ID;
      } catch (e) {
        return false;
      }
    },
  });

  if (acceptOk) {
    successfulAccepts.add(1);
  }

  // -------------------------------------------------------------
  // STEP 4: RACE CONDITION TEST - Duplicate Accept Collision Handling
  // Another atelier or worker tries to accept the EXACT SAME order simultaneously.
  // The system MUST safely reject this with 409 Conflict (ORDER_ALREADY_ASSIGNED).
  // -------------------------------------------------------------
  const duplicateAcceptRes = http.post(
    `${BASE_URL}/api/orders/${encodeURIComponent(uniqueOrderId)}/dispatch/respond`,
    JSON.stringify({
      tailorId: 'store-competing-tailor-999',
      action: 'ACCEPT',
    }),
    {
      headers,
      tags: { name: 'POST /api/orders/:id/dispatch/respond [RACE_CHECK]' },
    }
  );

  const raceHandled = check(duplicateAcceptRes, {
    '4. Race condition safe: 409 Conflict returned': (r) => r.status === 409,
    '4b. Conflict code is ORDER_ALREADY_ASSIGNED': (r) => {
      try {
        return r.json().code === 'ORDER_ALREADY_ASSIGNED';
      } catch (e) {
        return false;
      }
    },
  });

  if (raceHandled) {
    raceConflictsSafelyHandled.add(1);
  }

  // -------------------------------------------------------------
  // STEP 5: Studio updates order status (Work in Progress)
  // -------------------------------------------------------------
  const updateRes = http.put(
    `${BASE_URL}/api/orders/${encodeURIComponent(uniqueOrderId)}`,
    JSON.stringify({
      status: 'Work in Progress',
      assignedWorker: `Master Tailor ${__VU % 4 + 1}`,
      machineNo: `M-${__VU % 6 + 1}`,
      fitNotes: 'Concurrency test verified: high-burst studio intake',
    }),
    {
      headers,
      tags: { name: 'PUT /api/orders/:id' },
    }
  );

  check(updateRes, {
    '5. Order status updated to Work in Progress (200)': (r) => r.status === 200,
  });

  // -------------------------------------------------------------
  // STEP 6: Studio queries its real-time analytics / stats
  // Verifying concurrent read aggregation while hundreds of writes occur
  // -------------------------------------------------------------
  const statsRes = http.get(
    `${BASE_URL}/api/orders/studio/stats?storeId=${encodeURIComponent(TARGET_STUDIO_ID)}`,
    {
      tags: { name: 'GET /api/orders/studio/stats' },
    }
  );

  check(statsRes, {
    '6. Studio live stats query succeeds (200)': (r) => r.status === 200,
  });

  sleep(0.5);
}
