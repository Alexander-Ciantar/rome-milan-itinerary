const CACHE_NAME = "rome-milan-v3";

const FILES_TO_CACHE = [
  "/rome-milan-itinerary/",
  "/rome-milan-itinerary/index.html",
  "/rome-milan-itinerary/favicon.png",
  "/rome-milan-itinerary/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigation requests (opening the app / clicking links)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Keep the app shell fresh
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/rome-milan-itinerary/", copy);
            // also keep index.html fresh (some browsers request this directly)
            cache.put("/rome-milan-itinerary/index.html", copy.clone());
          });
          return res;
        })
        .catch(() =>
          // Offline fallback: app shell
          caches.match("/rome-milan-itinerary/") ||
          caches.match("/rome-milan-itinerary/index.html")
        )
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
