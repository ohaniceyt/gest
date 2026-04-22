const CACHE_NAME = 'stockflow-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  // Network first, fallback to cache for UI assets
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});