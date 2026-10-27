// Raffu Studio OS — Service Worker for Web Push & Deep-link Navigation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Receive background push notifications from Raffu Backend
self.addEventListener('push', (event) => {
  let payload = {
    title: '🧵 Raffu Studio Alert',
    body: 'New update received on your atelier workbench.',
    url: '/',
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
    body: payload.body || 'New order activity detected.',
    icon: payload.icon || '/android-chrome-192x192.png',
    badge: payload.badge || '/favicon-32x32.png',
    tag: payload.tag || 'raffu-studio-alert',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.url || '/',
      ...(payload.data || {}),
    },
    actions: [
      { action: 'view_order', title: 'Open Ticket ↗' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// 2. Handle notification click & navigate directly to the order in Studio
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a Studio tab is already open, navigate it to the order and bring it to focus
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }
      // If Studio is closed, open a new window directly to the order ticket
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullTargetUrl);
      }
    })
  );
});
