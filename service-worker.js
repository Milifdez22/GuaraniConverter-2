// service-worker.js

// 1. Cambiamos la versión para forzar la actualización definitiva
const CACHE_NAME = 'guarani-converter-v5';

// 2. Rutas corregidas para el repositorio 'GuaraniConverter-2'
const urlsToCache = [
  '/GuaraniConverter-2/', // Ruta principal del repositorio
  '/GuaraniConverter-2/index.html', // Ruta del archivo HTML dentro del repo
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap', 
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', 
  'https://cdn.jsdelivr.net/npm/chart.js', 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierta. Intentando cachear App Shell.');
        return cache.addAll(urlsToCache); 
      })
      .then(() => self.skipWaiting()) 
  );
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});


// --- FASE DE FETCH (Estrategia Cache-First) ---
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
