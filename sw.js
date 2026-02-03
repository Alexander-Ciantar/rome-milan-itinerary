const BASE = "/rome-milan-itinerary/";
const CACHE_NAME = "rome-milan-v11";

const FILES_TO_CACHE = [
  BASE,
  BASE + "index.html",
  BASE + "favicon.png",
  BASE + "manifest.webmanifest",
  BASE + "Vatican_Tickets.pdf",
  BASE + "Colloseum_tickets.pdf",
  BASE + "XGJVKG-db82ed48-b69c-0a7c-618a-6c23fb9dcead.pdf"
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
  const url = new URL(req.url);

  if (!url.pathname.startsWith(BASE)) return;

  // Navigations: network-first, fallback to cached app shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(BASE, clone))
          );
          return res;
        })
        .catch(() => caches.match(BASE))
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
