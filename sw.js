const CACHE_NAME = 'nenek-scooter-v2';
const STATIC_CACHE = 'nenek-static-v2';

// All assets to cache for offline play
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/main.js',
    '/js/game.js',
    '/js/entities.js',
    '/js/assets.js',
    '/js/config.js',
    '/js/preloader.js',
    '/js/audio-manager.js',
    '/assets/img/nenek1.webp',
    '/assets/img/nenek2.webp',
    '/assets/img/hydrant.webp',
    '/assets/img/kucing1.webp',
    '/assets/img/kucing2.webp',
    '/assets/img/apple.webp',
    '/assets/img/jeruk.webp',
    '/assets/img/cherry.webp',
    '/assets/img/banana.webp',
    '/assets/img/kulit-pisang.webp',
    '/assets/img/background-toko.webp',
    '/assets/img/background-gedung.jpg',
    '/assets/img/pedestrian1.webp',
    '/assets/img/pedestrian2.webp',
    '/assets/img/pedestrian3.webp',
    '/assets/img/cursor.webp',
    '/assets/audio/backsound1.mp3',
    '/assets/audio/backsounde2.mp3',
    '/assets/audio/items.wav',
    '/assets/audio/aduh1.wav',
    '/assets/audio/aduh2.wav',
    '/assets/audio/aduh3.wav',
    '/assets/audio/aduh4.wav',
    '/assets/audio/pisang.wav',
    '/assets/audio/gameover.wav',
    '/assets/audio/loncat1.mp3',
    '/assets/audio/loncat2.mp3',
    '/assets/audio/loncat3.mp3',
    '/assets/audio/cat.mp3'
];

// Install: Cache all static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker v2...');

    // Skip waiting to activate immediately
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching all static assets...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] All assets cached successfully!');
            })
            .catch(err => {
                console.error('[SW] Cache failed:', err);
            })
    );
});

// Activate: Clean old caches and take control immediately
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker v2...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

// Fetch: Cache-first strategy with network fallback
// Also implements "stale-while-revalidate" for HTML to get updates
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // For HTML pages: Network first with cache fallback (ensures updates)
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Update cache with new version
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Offline: serve from cache
                    return caches.match(request) || caches.match('/index.html');
                })
        );
        return;
    }

    // For other assets: Cache first with network fallback
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cache, but also fetch update in background
                    fetch(request).then(networkResponse => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, networkResponse);
                            });
                        }
                    }).catch(() => { });

                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request).then(response => {
                    // Cache the new resource
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
    );
});

// Listen for messages from main app (e.g., skip waiting)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
