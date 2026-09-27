const CACHE_NAME = 'cloud-agent-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './commands.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al SW a activarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Borra las versiones antiguas
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Intenta usar cache, si no, fetch desde internet
        return response || fetch(event.request);
      })
  );
});
