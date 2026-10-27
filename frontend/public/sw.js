// Raffu Customer App — Service Worker for Web Push & Real-Time Order Alerts
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Receive background push notifications from Raffu Backend
self.addEventListener('push', (event) => {
  let payload = {
    title: '🧵 Raffu Order Update',
    body: 'New update on your clothing alteration.',
    url: '/orders',
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body || 'Order status has been updated.',
    icon: payload.icon || '/android-chrome-192x192.png',
    badge: payload.badge || '/favicon-32x32.png',
    tag: payload.tag || 'raffu-order-alert',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.url || '/orders',
      ...(payload.data || {}),
    },
    actions: [
      { action: 'view_order', title: 'Open Order ↗' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// 2. Handle notification click & navigate directly to order details
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/orders';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, navigate it to the order and focus
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullTargetUrl);
      }
    })
  );
});
