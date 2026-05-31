--- pak-map-app/sw.js (原始)


+++ pak-map-app/sw.js (修改后)
// Service Worker for PAK MAP - Offline Support and Caching
const CACHE_NAME = 'pakmap-v1';
const OFFLINE_CACHE = 'pakmap-offline-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PAK MAP: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('PAK MAP: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests or known CDNs
  if (
    url.origin !== location.origin &&
    !url.origin.includes('unpkg.com') &&
    !url.origin.includes('arcgisonline.com') &&
    !url.origin.includes('openstreetmap.org')
  ) {
    return;
  }

  // Handle tile requests specially for offline support
  if (request.url.includes('tile')) {
    event.respondWith(handleTileRequest(request));
    return;
  }

  // Standard cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Handle tile requests with offline support
function handleTileRequest(request) {
  return caches.open(OFFLINE_CACHE).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          cache.put(request, responseClone);
        }
        return networkResponse;
      }).catch(() => {
        // Return a placeholder tile for offline mode
        return createPlaceholderTile();
      });
    });
  });
}

// Create a placeholder tile for offline mode
function createPlaceholderTile() {
  const canvas = new OffscreenCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Draw a simple gray tile
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#999';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Offline Area', 128, 128);

  return canvas.convertToBlob().then((blob) => {
    return new Response(blob, {
      headers: { 'Content-Type': 'image/png' }
    });
  });
}

// Background sync for downloaded areas
self.addEventListener('sync', (event) => {
  if (event.tag === 'download-area') {
    event.waitUntil(downloadAreaInBackground());
  }
});

// Download area in background
async function downloadAreaInBackground() {
  // This would handle actual tile downloads in the background
  console.log('PAK MAP: Background sync for area download');
}

// Push notifications for navigation updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('PAK MAP Service Worker loaded');
