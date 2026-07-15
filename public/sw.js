// Service Worker para TEACompaña
const CACHE_NAME = 'teacompaña-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Estrategia Network-First para archivos de audio
  if (request.url.endsWith('.mp3')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Estrategia Stale-While-Revalidate para el resto
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});