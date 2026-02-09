import { Game } from './game.js';
import { AssetPreloader } from './preloader.js';
import { initAuth, currentUser } from './auth.js';
import { getLeaderboard } from './leaderboard.js';
import { submitFeedback } from './feedback.js';

// Service Worker Registration for PWA with auto-update
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Service Worker registered:', reg);

                // Check for updates periodically
                setInterval(() => {
                    reg.update();
                }, 60000); // Check every minute

                // Listen for new service worker
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    console.log('New Service Worker found, installing...');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, show update notification
                            console.log('New version available! Refreshing...');
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => console.error('Service Worker registration failed:', err));

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New Service Worker activated, reloading page...');
            window.location.reload();
        });
    });
}

// Show update notification to user
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
        <p>🎉 Update tersedia!</p>
        <button onclick="window.location.reload()">Refresh Sekarang</button>
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        gap: 10px;
        align-items: center;
        font-family: sans-serif;
    `;
    document.body.appendChild(notification);
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
    'assets/img/kulit-pisang.webp',
    'assets/img/background-toko.webp',
    'assets/img/background-gedung.jpg',
    'assets/img/pedestrian1.webp',
    'assets/img/pedestrian2.webp',
    'assets/img/pedestrian3.webp',
    'assets/img/cursor.webp',
    'assets/img/batu.webp',
    'assets/img/lubang.webp'
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
    // Initialize Auth UI
    initAuth('login-btn', 'user-profile', 'user-name', 'user-avatar');

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

    // === UI Handlers for Leaderboard & Feedback ===

    // Config Modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'none';
        });
    });

    // Leaderboard
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardBody = document.getElementById('leaderboard-body');

    leaderboardBtn.addEventListener('click', async () => {
        leaderboardModal.style.display = 'flex';
        leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading...</td></tr>';

        try {
            const scores = await getLeaderboard();
            leaderboardBody.innerHTML = '';

            if (scores.length === 0) {
                leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Belum ada skor. Mainkan sekarang!</td></tr>';
                return;
            }

            scores.forEach((s, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${s.photoURL ? `<img src="${s.photoURL}" style="width: 20px; height: 20px; border-radius: 50%;">` : ''}
                            ${s.displayName || 'Anonymous'}
                        </div>
                    </td>
                    <td>${s.score}</td>
                `;
                leaderboardBody.appendChild(tr);
            });
        } catch (error) {
            leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Error loading leaderboard.</td></tr>';
        }
    });

    // Feedback
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');

    feedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
    });

    submitFeedbackBtn.addEventListener('click', async () => {
        const category = document.getElementById('feedback-category').value;
        const message = document.getElementById('feedback-message').value;

        if (!message.trim()) {
            alert("Pesan tidak boleh kosong!");
            return;
        }

        if (confirm("Kirim masukan ini?")) {
            const success = await submitFeedback(currentUser, message, category);
            if (success) {
                alert("Terima kasih! Masukan Anda telah terkirim.");
                feedbackModal.style.display = 'none';
                document.getElementById('feedback-message').value = '';
            } else {
                alert("Gagal mengirim masukan. Silakan coba lagi nanti.");
            }
        }
    });
});
