const express = require("express");
const router = express.Router();
const pushService = require("../services/push.service");

/**
 * GET /api/push/vapid-key
 * Returns the VAPID Public Key needed by the browser push manager to subscribe.
 */
router.get("/vapid-key", (req, res) => {
  const publicKey = pushService.getVapidPublicKey();
  if (!publicKey) {
    return res.status(500).json({
      success: false,
      message: "VAPID public key not configured on server",
    });
  }
  res.json({
    success: true,
    publicKey,
  });
});

/**
 * POST /api/push/subscribe
 * Register or update a device's push subscription.
 */
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription, storeId, userId, userAgent } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription object",
      });
    }

    const saved = await pushService.saveSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      storeId: storeId || null,
      userId: userId || null,
      userAgent: userAgent || req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Push subscription registered successfully",
      subscriptionId: saved.id,
    });
  } catch (err) {
    console.error("❌ Error registering push subscription:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to register push subscription",
    });
  }
});

/**
 * POST /api/push/unsubscribe
 * Remove a device's push subscription when disabled.
 */
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: "Endpoint required" });
    }

    await pushService.removeSubscription(endpoint);
    res.json({ success: true, message: "Push subscription removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/push/test
 * Send a test notification to a store or specific subscription.
 */
router.post("/test", async (req, res) => {
  try {
    const { storeId, subscription, userId } = req.body;

    if (subscription && subscription.endpoint) {
      const result = await pushService.sendTestNotification({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      });
      return res.json({ success: true, result });
    }

    if (userId) {
      const result = await pushService.sendNotificationToUser(userId, {
        title: "✨ Raffu Order Alerts Active",
        body: "Real-time updates enabled! You will be notified when your studio accepts, starts tailoring, and completes your order.",
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        url: "/orders",
        tag: "customer-test-alert",
        data: { type: "TEST_NOTIFICATION", url: "/orders" },
      });
      return res.json({ success: true, result });
    }

    if (storeId) {
      const result = await pushService.sendNotificationToStore(storeId, {
        title: "🧵 Studio Order Test Alert",
        body: "Test fitting notification dispatched to all active workbench devices.",
        url: "/?test=true",
        tag: "studio-test",
      });
      return res.json({ success: true, result });
    }

    res.status(400).json({
      success: false,
      message: "storeId, userId, or subscription required for test notification",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
