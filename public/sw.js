// Service Worker para cache de recursos estáticos
const CACHE_NAME = 'linkspace-v2';
const STATIC_CACHE = 'linkspace-static-v2';
const DYNAMIC_CACHE = 'linkspace-dynamic-v2';

const staticAssets = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2'
];

const dynamicAssets = [
  '/login',
  '/register',
  '/admin',
  '/usuario'
];

// Instalação do service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        return cache.addAll(staticAssets);
      })
  );
  self.skipWaiting();
});

// Interceptar requisições com estratégias diferentes
self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: Cache First para recursos estáticos
  if (staticAssets.includes(request.url) || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
    return;
  }

  // Strategy: Network First para navegação
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Strategy: Stale While Revalidate para outros recursos
  event.respondWith(
    caches.match(request)
      .then(response => {
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, networkResponse.clone()));
            return networkResponse;
          });
        return response || fetchPromise;
      })
  );
});

// Limpeza de caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
