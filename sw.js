const CACHE_NAME = 'nenek-scooter-v1';
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

self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch new
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});
