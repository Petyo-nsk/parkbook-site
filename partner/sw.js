// Портал за партньорите — само известия за нови клиенти (20.10.2026). Нищо не се кешира.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'PARKBOOK', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || 'PARKBOOK · нов клиент', {
      body: d.body || '',
      tag: d.tag || 'parkbook',
      icon: '/img/mark-512.png',
      badge: '/img/mark-512.png',
      data: { url: d.url || '/partner/' },
      renotify: true,
    });
    // Ако порталът е отворен — обновява списъка с кодовете
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach((c) => c.postMessage('refresh'));
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = list.find((c) => c.url.includes('/partner/'));
    if (open) { open.postMessage('refresh'); return open.focus(); }
    return self.clients.openWindow(e.notification.data && e.notification.data.url || '/partner/');
  })());
});
