const CACHE_NAME = "rome-milan-v2";

const FILES_TO_CACHE = [
  "/rome-milan-itinerary/",
  "/rome-milan-itinerary/index.html",
  "/rome-milan-itinerary/favicon.png",
  "/rome-milan-itinerary/manifest.webmanifest",
  "/rome-milan-itinerary/sw.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // For page navigations, serve cached index.html when offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          // Update cache with latest index.html
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("/rome-milan-itinerary/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/rome-milan-itinerary/index.html"))
    );
    return;
  }

  // For everything else: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
