const CACHE_NAME = 'mapa-estudiantil-v18'; 

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

// 1. INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // Fuerza al Service Worker a instalarse de inmediato sin esperar
  self.skipWaiting(); 
});

// 2. ACTIVACIÓN (NUEVO: El destructor de basura)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre del caché guardado no coincide con la versión actual, lo borra
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Borrando versión antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma el control de la aplicación de inmediato
  self.clients.claim();
});

// 3. INTERCEPTOR DE RED
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la versión en caché si existe, si no, va a internet
        return response || fetch(event.request);
      })
  );
});