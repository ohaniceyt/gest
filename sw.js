/* StockFlow Service Worker — v1 */
var CACHE = "stockflow-v1";
var ASSETS = [
  "./index.html",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS.filter(function(a) { return !a.startsWith("http"); }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  /* Ne pas intercepter les appels JSONP Google Apps Script */
  if (e.request.url.includes("script.google.com")) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        /* Mettre en cache les ressources statiques */
        if (res.ok && (e.request.url.includes("fonts.g") || e.request.url.endsWith(".html"))) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        /* Fallback hors ligne : retourner index.html */
        return caches.match("./index.html");
      });
    })
  );
});
