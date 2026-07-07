const CACHE_NAME = 'mapa-estudiantil-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/estilos.css',
  './js/main.js',
  './js/api.js',
  './js/ubicacion.js',
  './js/mapa.js',
  './js/datos.js',
  './js/transporte.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la versión en caché si existe, si no, va a internet
        return response || fetch(event.request);
      })
  );
});