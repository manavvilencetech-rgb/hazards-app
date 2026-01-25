const CACHE_NAME = "hira-shell-v1";
const BASE = "/hazards-app/";

const SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // ❌ Never cache JS or JSON logic
  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".json")) {
    return;
  }

  // ✅ Shell-first for HTML
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(BASE))
    );
    return;
  }

  // Default: network → cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
