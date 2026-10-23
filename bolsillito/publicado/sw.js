const C = 'bolsillito-v7';
const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
const CORE = ['/', '/offline.js', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', CDN].concat([0, 1, 2, 3, 4, 5].map(i => '/p' + i + '.bin?v=1'));
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // Internet primero, pero si tarda más de 3 s (o no hay) se abre lo guardado en el celular.
  const key = e.request.mode === 'navigate' ? '/' : e.request;
  e.respondWith((async () => {
    const cache = await caches.open(C);
    const cached = await cache.match(key);
    const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); cache.put(key, cp); } return r; });
    if (!cached) return net.catch(() => caches.match('/'));
    net.catch(() => {});
    const r = await Promise.race([net.catch(() => null), new Promise(res => setTimeout(() => res(null), 3000))]);
    return r || cached;
  })());
});
