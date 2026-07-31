// Service Worker — Antrian Gudang PWA
// Ganti versi ini setiap ada update agar cache otomatis refresh
const CACHE   = 'LOADFLOW-v1.0.3';
const ASSETS  = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
  // Jangan skip waiting otomatis — tunggu perintah dari app
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Terima perintah skipWaiting dari index.html
self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', function(e) {
  // Jangan cache request ke GAS / Cloudflare Worker
  if (e.request.url.includes('workers.dev') ||
      e.request.url.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
