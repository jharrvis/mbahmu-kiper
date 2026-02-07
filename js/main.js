import { Game } from './game.js';
import { AssetPreloader } from './preloader.js';

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// Collect all asset paths
const imagePaths = [
    'assets/img/nenek1.webp',
    'assets/img/nenek2.webp',
    'assets/img/hydrant.webp',
    'assets/img/kucing1.webp',
    'assets/img/kucing2.webp',
    'assets/img/apple.webp',
    'assets/img/jeruk.webp',
    'assets/img/cherry.webp',
    'assets/img/banana.webp',
    'assets/img/pisang.webp',
    'assets/img/background-toko.webp',
    'assets/img/background-gedung.jpg',
    'assets/img/pedestrian1.webp',
    'assets/img/pedestrian2.webp',
    'assets/img/pedestrian3.webp',
    'assets/img/cursor.webp'
];

const audioPaths = [
    'assets/audio/backsound1.mp3',
    'assets/audio/backsounde2.mp3',
    'assets/audio/items.wav',
    'assets/audio/aduh1.wav',
    'assets/audio/aduh2.wav',
    'assets/audio/aduh3.wav',
    'assets/audio/aduh4.wav',
    'assets/audio/pisang.wav',
    'assets/audio/gameover.wav',
    'assets/audio/loncat1.mp3',
    'assets/audio/loncat2.mp3',
    'assets/audio/loncat3.mp3',
    'assets/audio/cat.mp3'
];

window.addEventListener('DOMContentLoaded', () => {
    // Preload and init
    const preloader = new AssetPreloader();

    preloader.loadAll(imagePaths, audioPaths).then(success => {
        if (success) {
            // Hide loading screen
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';

            // Initialize game
            const game = new Game();

            // Attach start game to global scope for button click
            window.startGame = () => {
                game.start();
            };

            // Event Listeners
            window.addEventListener('keydown', (e) => {
                if (['ArrowUp', 'Space'].includes(e.code)) {
                    e.preventDefault();
                    game.handleInput();
                }
            });

            window.addEventListener('touchstart', (e) => {
                if (game.isActive) {
                    e.preventDefault();
                    game.handleInput();
                }
            }, { passive: false });

            window.addEventListener('mousedown', () => {
                if (game.isActive) {
                    game.handleInput();
                }
            });

            console.log('Game ready! All assets loaded.');
        } else {
            alert('Gagal memuat aset game. Coba refresh halaman.');
        }
    });
});
