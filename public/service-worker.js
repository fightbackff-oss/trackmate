const CACHE_NAME = 'trackmate-v1';
const OFFLINE_URL = '/offline.html';

// Assets to precache immediately
const ASSETS_TO_PRECACHE = [
  OFFLINE_URL,
  '/icon-192.png', 
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Navigation Requests (HTML) - Network First, fall back to offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2. API Requests (Supabase) - Network Only
  // We do not cache API calls to ensure real-time location data is always fresh
  if (requestUrl.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
           // For location apps, stale data is worse than no data.
           // However, if you had a specific read-only endpoint to cache, you could do it here.
           return caches.match(event.request); 
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Images, Fonts) - Cache First
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default - Network First
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});