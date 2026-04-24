/* StockFlow — Service Worker v2 */
var CACHE_NAME = 'stockflow-v2';
var STATIC = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* INSTALL — précharge les assets statiques */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ACTIVATE — supprime les anciens caches */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* FETCH — Cache-first pour assets statiques, network-first pour API */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* Ne jamais intercepter les appels JSONP Google Apps Script */
  if (url.includes('script.google.com')) return;
  /* Ne pas intercepter les fonts Google (elles ont leurs propres headers de cache) */
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) {
        /* Asset en cache trouvé — le retourner immédiatement */
        return cached;
      }
      /* Pas en cache — essayer le réseau */
      return fetch(e.request).then(function(response) {
        /* Mettre en cache les réponses OK des assets statiques */
        if (response && response.ok && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        /* Hors ligne : retourner index.html pour les navigations */
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        /* Pour les autres requêtes, retourner une réponse vide */
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
