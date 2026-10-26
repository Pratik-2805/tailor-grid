const webpush = require("web-push");
const { prisma } = require("../lib/prisma");

// Initialize Web Push with VAPID configuration
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@raffu.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn("⚠️ [Push Service] VAPID keys not configured. Web push will be inactive.");
}

/**
 * Returns the public VAPID key for the client to subscribe.
 */
function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

/**
 * Save or update a push subscription in PostgreSQL.
 */
async function saveSubscription({ endpoint, p256dh, auth, storeId, userId, userAgent }) {
  if (!endpoint || !p256dh || !auth) {
    throw new Error("Invalid subscription parameters (endpoint, p256dh, auth required)");
  }

  return await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh,
      auth,
      storeId: storeId || undefined,
      userId: userId || undefined,
      userAgent: userAgent || undefined,
      updatedAt: new Date(),
    },
    create: {
      endpoint,
      p256dh,
      auth,
      storeId: storeId || undefined,
      userId: userId || undefined,
      userAgent: userAgent || undefined,
    },
  });
}

/**
 * Remove an invalid or uninstalled subscription.
 */
async function removeSubscription(endpoint) {
  try {
    await prisma.pushSubscription.delete({ where: { endpoint } });
  } catch (err) {
    // If already deleted, ignore
  }
}

/**
 * Dispatch a notification to a specific push subscription.
 * Automatically cleans up expired subscriptions (HTTP 404 or 410 Gone).
 */
async function dispatchToSubscription(sub, payload) {
  const pushConfig = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const stringPayload = typeof payload === "string" ? payload : JSON.stringify(payload);

  try {
    await webpush.sendNotification(pushConfig, stringPayload);
    return { success: true, endpoint: sub.endpoint };
  } catch (err) {
    // 404 Not Found or 410 Gone means the user unsubscribed or revoked permission
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log(`ℹ️ [Push Service] Cleaning up expired subscription: ${sub.endpoint.slice(0, 30)}...`);
      await removeSubscription(sub.endpoint);
    } else {
      console.error(`❌ [Push Service] Error sending push:`, err.message);
    }
    return { success: false, error: err.message, statusCode: err.statusCode };
  }
}

/**
 * Send notification to all active studio devices associated with a storeId.
 */
async function sendNotificationToStore(storeId, payload) {
  if (!storeId) return { count: 0, results: [] };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { storeId },
  });

  if (subscriptions.length === 0) {
    return { count: 0, results: [] };
  }

  const results = await Promise.all(
    subscriptions.map((sub) => dispatchToSubscription(sub, payload))
  );

  return {
    count: subscriptions.length,
    successCount: results.filter((r) => r.success).length,
    results,
  };
}

/**
 * Send notification to all devices belonging to a specific user.
 */
async function sendNotificationToUser(userId, payload) {
  if (!userId) return { count: 0, results: [] };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { count: 0, results: [] };
  }

  const results = await Promise.all(
    subscriptions.map((sub) => dispatchToSubscription(sub, payload))
  );

  return {
    count: subscriptions.length,
    successCount: results.filter((r) => r.success).length,
    results,
  };
}

/**
 * Send an immediate test notification to verify client receiver.
 */
async function sendTestNotification(subscriptionData) {
  const payload = {
    title: "🧵 Atelier Alerts Connected",
    body: "Raffu Studio OS is now linked to receive real-time order alerts on this device.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "raffu-test-alert",
    url: "/?alert=test-success",
    timestamp: Date.now(),
    data: {
      type: "TEST_NOTIFICATION",
      url: "/",
    },
  };

  return await dispatchToSubscription(subscriptionData, payload);
}

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  sendNotificationToStore,
  sendNotificationToUser,
  sendTestNotification,
};
