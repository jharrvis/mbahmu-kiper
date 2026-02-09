import { Game } from './game.js';
import { CONFIG } from './config.js';
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

            // Game Over Controls
            const restartBtn = document.getElementById('restart-btn');
            const menuBtn = document.getElementById('menu-btn');
            const gameOverOverlay = document.getElementById('game-over-overlay');
            const startOverlay = document.getElementById('overlay');

            restartBtn.addEventListener('click', () => {
                gameOverOverlay.style.display = 'none';
                game.start();
            });

            menuBtn.addEventListener('click', () => {
                gameOverOverlay.style.display = 'none';
                startOverlay.style.display = 'flex';
                // Reset game state for background visual
                game.reset();
            });

            // Donate Buttons (Iframe Implementation)
            const donateBtnMenu = document.getElementById('donate-btn-menu');
            const donateBtnOver = document.getElementById('donate-btn-over');
            const donationModal = document.getElementById('donation-modal');
            const saweriaFrame = document.getElementById('saweria-frame');
            const saweriaFallback = document.getElementById('saweria-fallback-btn');

            const openDonationModal = () => {
                donationModal.style.display = 'flex';
                // Only set src when opening to save resources/bandwidth
                if (!saweriaFrame.src || saweriaFrame.src === 'about:blank' || saweriaFrame.src === '') {
                    saweriaFrame.src = CONFIG.SAWERIA_URL;
                }
                saweriaFallback.href = CONFIG.SAWERIA_URL;
            };

            if (donateBtnMenu) donateBtnMenu.addEventListener('click', openDonationModal);
            if (donateBtnOver) donateBtnOver.addEventListener('click', openDonationModal);

            // Event Listeners
            window.addEventListener('keydown', (e) => {
                if (['ArrowUp', 'Space'].includes(e.code)) {
                    // Prevent default scrolling for Space
                    if (e.code === 'Space') e.preventDefault();

                    if (game.isActive && !game.isPaused) {
                        game.handleInput();
                    } else if (gameOverOverlay.style.display === 'flex') {
                        // Space to restart on game over
                        restartBtn.click();
                    } else if (startOverlay.style.display !== 'none' && e.code === 'Space') {
                        // Space to start game from main menu
                        window.startGame();
                    }
                }
            });

            window.addEventListener('touchstart', (e) => {
                if (game.isActive) {
                    e.preventDefault();
                    game.handleInput();
                }
            }, { passive: false });

            window.addEventListener('mousedown', (e) => {
                // Ignore clicks on buttons to prevent jumping when clicking controls
                if (e.target.closest('button') || e.target.closest('.modal') || e.target.closest('.overlay')) return;

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
        leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Loading data...</td></tr>';

        try {
            const scores = await getLeaderboard();
            leaderboardBody.innerHTML = '';

            if (scores.length === 0) {
                leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Belum ada skor. Mainkan sekarang!</td></tr>';
                return;
            }

            scores.forEach((s, index) => {
                const tr = document.createElement('tr');

                let rankContent = index + 1;
                if (index === 0) rankContent = '<span class="rank-badge rank-1">1</span>';
                if (index === 1) rankContent = '<span class="rank-badge rank-2">2</span>';
                if (index === 2) rankContent = '<span class="rank-badge rank-3">3</span>';

                tr.innerHTML = `
                    <td>${rankContent}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${s.photoURL ? `<img src="${s.photoURL}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3);">` : '<div style="width: 24px; height: 24px; border-radius: 50%; background: #bdc3c7;"></div>'}
                            <span style="font-weight: 500; color: white;">${s.displayName || 'Anonymous'}</span>
                        </div>
                    </td>
                    <td style="text-align: right; font-weight: bold; color: #f1c40f;">${s.score}</td>
                `;
                leaderboardBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Gagal memuat leaderboard.</td></tr>';
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
