
/**
 * Service Worker básico para permitir la instalación PWA.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through simple para permitir el funcionamiento offline básico si el navegador lo soporta
});
