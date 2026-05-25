// ============================================================
//  FinanceTracker LK — Service Worker (sw.js)
//  Caches core app shell for offline support
// ============================================================

const CACHE_NAME = 'financetracker-lk-v1';

// App Shell: all resources needed to load the app offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Google Fonts (cached on first load)
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ── Install: cache app shell ─────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing FinanceTracker LK Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell...');
      // Cache local files strictly; external fonts best-effort
      const localFiles = APP_SHELL.filter(url => !url.startsWith('http'));
      const externalFiles = APP_SHELL.filter(url => url.startsWith('http'));

      return cache.addAll(localFiles).then(() => {
        // Cache external resources individually (don't fail install if unavailable)
        return Promise.allSettled(
          externalFiles.map(url =>
            fetch(url, { mode: 'no-cors' })
              .then(res => cache.put(url, res))
              .catch(() => console.warn('[SW] Could not cache:', url))
          )
        );
      });
    }).then(() => {
      console.log('[SW] App shell cached successfully!');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// ── Activate: clean up old caches ───────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated!');
      return self.clients.claim(); // Take control of all open tabs
    })
  );
});

// ── Fetch: Cache-First for shell, Network-First for API ─────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network-First strategy for API calls (always fresh data)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-First strategy for app shell & static assets
  event.respondWith(cacheFirst(request));
});

// ── Strategy: Cache First (static assets) ───────────────────
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/index.html');
    }
    throw error;
  }
}

// ── Strategy: Network First (API calls) ─────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
