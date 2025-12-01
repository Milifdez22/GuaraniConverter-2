// service-worker.js

// Nombre de la caché. Cambiar el número de versión (v2 a v3, etc.) forzará 
// al navegador a descargar un nuevo Service Worker y refrescar todos los archivos.
const CACHE_NAME = 'guarani-converter-v2';

// Lista de URLs de los recursos que forman el "App Shell". 
// Estos archivos se cachearán para el modo sin conexión.
const urlsToCache = [
  './', // Ruta principal (necesaria para el modo sin conexión)
  './guaranic.html', // Tu archivo HTML principal
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap', // Fuentes
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', // Iconos
  'https://cdn.jsdelivr.net/npm/chart.js', // Biblioteca Chart.js
];

// --- FASE DE INSTALACIÓN ---
// Cacha todos los recursos estáticos.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierta.');
        return cache.addAll(urlsToCache);
      })
      // Saltar la fase de espera para activar el nuevo SW inmediatamente
      .then(() => self.skipWaiting()) 
  );
});

// --- FASE DE ACTIVACIÓN ---
// Limpia cachés antiguas.
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
  // Reclamar clientes inmediatamente para que el SW tome el control
  event.waitUntil(self.clients.claim());
});


// --- FASE DE FETCH (Estrategia Cache-First para el App Shell) ---
// Intercepta todas las peticiones para servir desde caché primero, si es posible.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna el recurso de la caché si existe (ej. HTML, CSS, JS)
        if (response) {
          return response;
        }
        // Si no está en caché, va a la red (esto incluye las peticiones a la API)
        return fetch(event.request);
      }
    )
  );
});
