self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}

    try {
      await self.registration.unregister();
    } catch {}

    try {
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      await Promise.all(clients.map((c) => c.navigate(c.url)));
    } catch {}
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

