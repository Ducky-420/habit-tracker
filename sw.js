const CACHE = 'habits-app-v6';
const ASSETS = [
  '', 'index.html', 'manifest.json', 'icon.svg', 'css/glass-tokens.css',
  'js/app.js', 'js/storage.js',
  'js/components/Header.js', 'js/components/HabitCard.js', 'js/components/HabitModal.js', 'js/components/Settings.js', 'js/components/Stats.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
