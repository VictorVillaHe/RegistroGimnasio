/* Service worker — PWA offline simple para el registro de gimnasio. */
const CACHE = 'registro-gimnasio-v4';
const ARCHIVOS = [
  'index.html',
  'styles.css',
  'app.js',
  'routines.js',
  'photos.js',
  'manifest.json',
  'icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => {
      if (res) return res;
      return fetch(e.request).then((net) => {
        const copia = net.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return net;
      }).catch(() => caches.match('index.html'));
    })
  );
});
