const CACHE = "training-logboek-v2";
const BESTANDEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Bij installatie: alle app-bestanden in de cache zetten
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(BESTANDEN))
  );
  self.skipWaiting();
});

// Bij activatie: oude caches opruimen (handig bij updates)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: probeer online (voor updates), val terug op cache (offline)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const kopie = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
