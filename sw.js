const V = 'aeffy-v19';
const SHELL = ['/', '/index.html', '/a.css?v=19', '/a.js?v=19', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.pathname.startsWith('/__native/')) return;
  if (u.hostname.endsWith('supabase.co') || u.hostname.includes('paypal') || u.hostname.includes('lrclib') || u.hostname.includes('musicbrainz') || u.hostname.includes('coverartarchive')) return;
  if (e.request.mode === 'navigate') { e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('/index.html', c)); return r }).catch(() => caches.match('/index.html'))); return }
  e.respondWith(caches.match(e.request).then(hit => { const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)) } return r }).catch(() => hit); return hit || net }));
});
