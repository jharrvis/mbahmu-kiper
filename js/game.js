import { CONFIG } from './config.js';
import { ASSETS, createPedestrianSVG, createGerobakSVG } from './assets.js';
import { Player, Obstacle, Item } from './entities.js';
import { AudioManager } from './audio-manager.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scoreBoard = document.getElementById('score-board');
        this.heartsDisplay = document.getElementById('hearts-display');
        this.overlay = document.getElementById('overlay');
        this.statusTitle = document.getElementById('status-title');
        this.statusMsg = document.getElementById('status-msg');

        // Layers
        this.bgShops = document.getElementById('bg-shops');
        this.bgPedestrians = document.getElementById('bg-pedestrians');
        this.bgDecor = document.getElementById('bg-decor');

        // Background scrolling state
        this.bgShopsX = 0;
        this.bgBuildingsX = 0;

        this.player = null;
        this.obstacles = [];
        this.items = [];
        this.isActive = false;
        this.isPaused = false; // Add state
        this.isInvincible = false;
        this.bgm = null; // Background Music Audio Object
        this.sfx = {
            collect: new Audio(ASSETS.audio.collect),
            hit: ASSETS.audio.hit.map(src => new Audio(src)),
            slip: new Audio(ASSETS.audio.slip),
            gameover: new Audio(ASSETS.audio.gameover),
            jump: ASSETS.audio.jump.map(src => new Audio(src)),
            cat: new Audio(ASSETS.audio.cat)
        };

        this.score = 0;
        this.lives = CONFIG.LIVES;
        this.speed = CONFIG.INITIAL_SPEED;

        // === NEW ENHANCEMENTS ===
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.scoreMultiplier = 1;
        this.survivalTime = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.particleContainer = null;

        this.lastTime = 0;
        this.obstacleTimer = 0;
        this.itemTimer = 0;
        this.nextObstacleTime = 0;
        this.nextItemTime = 0;

        this.audioManager = new AudioManager();
        this.initBackgrounds();
        this.initSettings();
        this.initParticleContainer();
    }

    // Create particle container for effects
    initParticleContainer() {
        this.particleContainer = document.createElement('div');
        this.particleContainer.id = 'particle-container';
        this.particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            overflow: hidden;
        `;
        this.container.appendChild(this.particleContainer);
    }

    initBackgrounds() {
        this.bgBuildings = document.getElementById('bg-buildings');
        this.bgShops = document.getElementById('bg-shops');
        this.bgPedestrians = document.getElementById('bg-pedestrians');
        this.bgDecor = document.getElementById('bg-decor');

        // Shops now handled via CSS background-image
        this.createPedestrians();
        // this.createDecor(); // Temporarily disabled
    }

    initSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');
        const toggleBGM = document.getElementById('toggle-bgm');
        const toggleSFX = document.getElementById('toggle-sfx');
        const startBtn = document.getElementById('start-btn');

        // Load saved settings
        toggleBGM.checked = this.audioManager.bgmEnabled;
        toggleSFX.checked = this.audioManager.sfxEnabled;

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
            // Pause game when opening settings (during gameplay)
            if (this.isActive && !this.isPaused) {
                this.isPaused = true;
                // Pause BGM
                if (this.bgm) this.bgm.pause();
            }
        });

        // Close settings - show overlay with LANJUT MAIN if game was paused
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');

            // If game is active but paused, show overlay with resume option
            if (this.isActive && this.isPaused) {
                this.overlay.style.display = 'flex';
                this.statusTitle.textContent = '⏸️ PAUSED';
                this.statusMsg.textContent = 'Klik tombol untuk lanjut main';
                startBtn.textContent = '▶️ LANJUT MAIN';
            }
        });

        // Start/Resume button handler
        startBtn.addEventListener('click', () => {
            if (this.isPaused && this.isActive) {
                // Resume game
                this.isPaused = false;
                this.overlay.style.display = 'none';
                startBtn.textContent = '🎮 MAIN SEKARANG';
                this.lastTime = performance.now();
                if (this.bgm && this.audioManager.bgmEnabled) {
                    this.bgm.play();
                }
            } else {
                // Start new game
                this.start();
            }
        });

        toggleBGM.addEventListener('change', (e) => {
            this.audioManager.bgmEnabled = e.target.checked;
            this.audioManager.saveSettings();
            // Apply immediately
            if (!this.audioManager.bgmEnabled && this.bgm) {
                this.bgm.pause();
            } else if (this.audioManager.bgmEnabled && this.bgm && this.isActive && !this.isPaused) {
                this.bgm.play();
            }
        });

        toggleSFX.addEventListener('change', (e) => {
            this.audioManager.sfxEnabled = e.target.checked;
            this.audioManager.saveSettings();
        });
    }

    createPedestrians() {
        this.bgPedestrians.innerHTML = '';
        // Create many pedestrians spread across the full scrolling width
        const pedestrianCount = 25;
        for (let i = 0; i < pedestrianCount; i++) {
            const p = document.createElement('img');
            p.className = 'pedestrian';

            // Random pedestrian image
            const src = ASSETS.pedestrians[Math.floor(Math.random() * ASSETS.pedestrians.length)];
            p.src = src;

            // Spread pedestrians evenly across 500% width with some randomness
            const basePosition = (i / pedestrianCount) * 500;
            const randomOffset = Math.random() * 15 - 7.5; // +/- 7.5% variation
            p.style.left = `${basePosition + randomOffset}%`;

            this.bgPedestrians.appendChild(p);
        }
    }

    createDecor() {
        this.bgDecor.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const d = document.createElement('div');
            d.className = 'gerobak';
            const isBakso = Math.random() > 0.5;
            d.innerHTML = createGerobakSVG(isBakso);
            this.bgDecor.appendChild(d);
        }
    }

    start() {
        this.reset();
        this.isActive = true;
        this.overlay.style.display = 'none';

        if (!this.player) {
            this.player = new Player(this.container);
        }

        this.player.onInvincibilityEnd = () => { this.isInvincible = false; };

        this.lastTime = performance.now();
        this.scheduleNextObstacle();
        this.scheduleNextItem();

        this.scheduleNextItem();

        this.playRandomBGM();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    reset() {
        this.score = 0;
        this.lives = CONFIG.LIVES;
        this.speed = CONFIG.INITIAL_SPEED;
        this.isInvincible = false;

        // Reset enhancements
        this.scoreMultiplier = 1;
        this.survivalTime = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        this.bgShopsX = 0;
        this.bgBuildingsX = 0;
        this.updateUI();

        // Clean up entities
        this.obstacles.forEach(o => o.remove());
        this.items.forEach(i => i.remove());
        this.obstacles = [];
        this.items = [];
        if (this.player) {
            this.player.element.remove();
            this.player = null;
        }

        // Reset backgrounds
        this.bgBuildings.style.backgroundPosition = '0px 0px';
        this.bgShops.style.backgroundPosition = '0px 0px';
        this.bgPedestrians.style.transform = 'translateX(0px)';
        this.bgDecor.style.transform = 'translateX(0px)';
        this.isPaused = false;
        this.overlay.style.display = 'none';
    }

    gameLoop(timestamp) {
        if (!this.isActive) return;

        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.isPaused) {
            // Keep requesting frames to allow resume, but don't update logic
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        // Normalizing to 60fps
        const timeScale = deltaTime / 16.67;
        const cappedTimeScale = Math.min(timeScale, 4);

        this.update(deltaTime, cappedTimeScale);
        this.render(cappedTimeScale);

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime, timeScale) {
        // Update score multiplier based on survival time
        this.updateMultiplier(deltaTime);

        this.player.update(timeScale);

        // Spawning
        this.obstacleTimer += deltaTime;
        if (this.obstacleTimer >= this.nextObstacleTime) {
            this.spawnObstacle();
            this.scheduleNextObstacle();
        }

        this.itemTimer += deltaTime;
        if (this.itemTimer >= this.nextItemTime) {
            this.spawnItem();
            this.scheduleNextItem();
        }

        // Entities update & collision
        const playerHitbox = this.player.getHitbox();

        // Obstacles
        this.obstacles.forEach((obs, index) => {
            obs.update(this.speed, timeScale);

            const obsHitbox = obs.getHitbox();
            if (this.checkCollision(playerHitbox, obsHitbox) && !this.isInvincible) {
                obs.setHit();
                // Play cat sound + aduh for cat obstacle
                if (obs.id === 'cat') {
                    this.playSFX('cat');
                }
                this.playSFX('hit');
                this.screenShake(15, 300);
                this.vibrate(100);
                this.takeDamage();
            }

            if (obs.markedForDeletion) {
                obs.remove();
                this.obstacles.splice(index, 1);
                this.increaseScore(1);
            }
        });

        // Items
        this.items.forEach((item, index) => {
            item.update(this.speed, timeScale);

            const itemHitbox = item.getHitbox();
            if (this.checkCollision(playerHitbox, itemHitbox)) {
                if (item.config.type === 'bad' && !this.isInvincible) {
                    this.playSFX('slip');
                    this.playSFX('hit');
                    this.screenShake(12, 250);
                    this.vibrate(80);
                    this.takeDamage();
                } else if (item.config.type !== 'bad') {
                    // Spawn particles at item position
                    const rect = item.element.getBoundingClientRect();
                    const containerRect = this.container.getBoundingClientRect();
                    this.spawnParticles(
                        rect.left - containerRect.left + rect.width / 2,
                        rect.top - containerRect.top + rect.height / 2,
                        10
                    );
                    this.vibrate(30);
                    this.increaseScore(item.config.points);
                    this.playSFX('collect');
                }
                item.remove();
                this.items.splice(index, 1);
            } else if (item.markedForDeletion) {
                item.remove();
                this.items.splice(index, 1);
            }
        });
    }

    render(timeScale) {
        // Parallax updates
        // For Image Background (Shops), we scroll background-position
        this.moveBgImage(this.bgBuildings, 0.1, timeScale); // Very slow for far background
        this.moveBgImage(this.bgShops, 0.3, timeScale);

        // For DOM Element Layers (Pedestrians, Decor), we move transform
        // Pedestrians sync with shops - use same bgShopsX value
        this.bgPedestrians.style.transform = `translateX(${this.bgShopsX}px)`;
        this.moveBgLayer(this.bgDecor, 0.7, timeScale);
    }

    // Move background image (infinite scroll)
    moveBgImage(el, speedMult, timeScale) {
        this.bgShopsX -= (this.speed * speedMult * timeScale);
        el.style.backgroundPosition = `${this.bgShopsX}px 0px`;
    }

    // Move DOM layer (transform)
    moveBgLayer(el, speedMult, timeScale) {
        const curr = parseFloat(el.style.transform.replace('translateX(', '').replace('px)', '') || 0);
        let next = curr - (this.speed * speedMult * timeScale);

        // Reset if moved too far to prevent float overflow (optional, but good practice)
        if (next < -5000) next += 5000;

        el.style.transform = `translateX(${next}px)`;
    }

    scheduleNextObstacle() {
        this.obstacleTimer = 0;
        this.nextObstacleTime = Math.max(
            CONFIG.MIN_OBSTACLE_SPAWN_TIME,
            Math.random() * 1000 + (CONFIG.MAX_OBSTACLE_SPAWN_TIME_BASE - (this.score * 0.5))
        );
    }

    scheduleNextItem() {
        this.itemTimer = 0;
        this.nextItemTime = Math.random() * (CONFIG.ITEM_SPAWN_MAX - CONFIG.ITEM_SPAWN_MIN) + CONFIG.ITEM_SPAWN_MIN;
    }

    spawnObstacle() {
        this.obstacles.push(new Obstacle(this.container, window.innerWidth));
    }

    spawnItem() {
        this.items.push(new Item(this.container, window.innerWidth));
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.right > rect2.left &&
            rect1.left < rect2.right &&
            rect1.bottom > rect2.top &&
            rect1.top < rect2.bottom
        );
    }

    takeDamage() {
        if (this.isInvincible) return;

        this.lives--;
        this.updateUI();
        // SFX handled by caller (hit vs slip)

        if (this.lives <= 0) {
            this.gameOver("HABIS NYAWA! NENEK HARUS ISTIRAHAT.");
        } else {
            this.isInvincible = true;
            this.player.setInvincible(true);
        }
    }

    increaseScore(amount) {
        // Apply score multiplier based on survival time
        const actualScore = Math.floor(amount * this.scoreMultiplier);
        this.score += actualScore;
        this.updateUI();

        if (this.score % CONFIG.SCORE_INCREMENT_THRESHOLD === 0) {
            this.speed += CONFIG.SPEED_INCREMENT;
        }
    }

    // === VISUAL EFFECTS ===

    // Spawn sparkle particles at position
    spawnParticles(x, y, count = 8) {
        const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#9b59b6', '#3498db'];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (Math.PI * 2 / count) * i;
            const velocity = 3 + Math.random() * 3;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 8 + Math.random() * 8;

            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 ${size}px ${color};
            `;

            this.particleContainer.appendChild(particle);

            // Animate particle
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            let posX = x, posY = y, opacity = 1;

            const animate = () => {
                posX += vx;
                posY += vy - 0.5; // slight upward drift
                opacity -= 0.03;

                particle.style.left = posX + 'px';
                particle.style.top = posY + 'px';
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    }

    // Screen shake effect
    screenShake(intensity = 10, duration = 200) {
        const container = this.container;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                container.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                container.style.transform = '';
            }
        };
        shake();
    }

    // Vibrate on mobile (haptic feedback)
    vibrate(pattern = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Show high score celebration
    showHighScoreCelebration() {
        const celebration = document.createElement('div');
        celebration.id = 'high-score-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <span class="trophy">🏆</span>
                <h2>NEW HIGH SCORE!</h2>
                <p class="score-value">${this.score}</p>
            </div>
        `;
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            animation: fadeIn 0.5s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes bounceIn { 
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            @keyframes pulse { 
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            #high-score-celebration .celebration-content {
                text-align: center;
                color: white;
                animation: bounceIn 0.5s ease;
            }
            #high-score-celebration .trophy {
                font-size: 80px;
                display: block;
                animation: pulse 1s infinite;
            }
            #high-score-celebration h2 {
                font-size: 36px;
                color: #f1c40f;
                text-shadow: 0 0 20px #f1c40f;
                margin: 20px 0;
            }
            #high-score-celebration .score-value {
                font-size: 48px;
                font-weight: bold;
                color: #2ecc71;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(celebration);

        // Vibrate pattern for celebration
        this.vibrate([100, 50, 100, 50, 200]);

        // === CONFETTI RAIN EFFECT ===
        const confettiColors = ['#f1c40f', '#e74c3c', '#2ecc71', '#9b59b6', '#3498db', '#e67e22', '#1abc9c'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1001;
            overflow: hidden;
        `;
        document.body.appendChild(confettiContainer);

        // Spawn confetti pieces
        const spawnConfetti = () => {
            for (let i = 0; i < 8; i++) {
                const confetti = document.createElement('div');
                const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                const size = 8 + Math.random() * 12;
                const startX = Math.random() * window.innerWidth;
                const rotation = Math.random() * 360;
                const duration = 2 + Math.random() * 2;

                confetti.style.cssText = `
                    position: absolute;
                    left: ${startX}px;
                    top: -20px;
                    width: ${size}px;
                    height: ${size * 0.6}px;
                    background: ${color};
                    border-radius: 2px;
                    transform: rotate(${rotation}deg);
                    animation: confettiFall ${duration}s linear forwards;
                `;
                confettiContainer.appendChild(confetti);

                // Remove after animation
                setTimeout(() => confetti.remove(), duration * 1000);
            }
        };

        // Add confetti animation style
        const confettiStyle = document.createElement('style');
        confettiStyle.textContent = `
            @keyframes confettiFall {
                0% { 
                    transform: translateY(0) rotate(0deg); 
                    opacity: 1;
                }
                100% { 
                    transform: translateY(${window.innerHeight + 50}px) rotate(720deg); 
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(confettiStyle);

        // Spawn confetti waves
        spawnConfetti();
        const confettiInterval = setInterval(spawnConfetti, 300);

        // Also spawn sparkle particles around celebration
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.spawnParticles(
                    window.innerWidth / 2 + (Math.random() - 0.5) * 300,
                    window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                    12
                );
            }, i * 150);
        }

        // Auto remove after 3 seconds
        setTimeout(() => {
            celebration.remove();
            style.remove();
            confettiContainer.remove();
            confettiStyle.remove();
            clearInterval(confettiInterval);
        }, 3000);
    }

    // Update score multiplier based on survival time
    updateMultiplier(deltaTime) {
        this.survivalTime += deltaTime;
        // Every 10 seconds, increase multiplier by 0.5 (max 5x)
        this.scoreMultiplier = Math.min(5, 1 + Math.floor(this.survivalTime / 10000) * 0.5);
    }

    updateUI() {
        const multiplierText = this.scoreMultiplier > 1 ? ` (x${this.scoreMultiplier.toFixed(1)})` : '';
        this.scoreBoard.innerText = `Skor: ${this.score}${multiplierText}`;

        let hearts = "";
        for (let i = 0; i < CONFIG.LIVES; i++) {
            hearts += i < this.lives ? "❤️" : "🖤";
        }
        this.heartsDisplay.innerText = hearts;
    }

    gameOver(msg) {
        this.isActive = false;
        this.statusTitle.innerText = 'GAME OVER';
        this.statusMsg.innerText = msg;
        this.playSFX('gameover');
        this.overlay.style.display = 'flex';
        // Reset speed for background visual
        this.speed = 0;

        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }

        // Check for new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            // Show celebration after a short delay
            setTimeout(() => {
                this.showHighScoreCelebration();
            }, 500);
        }

        // Vibrate on game over
        this.vibrate([200, 100, 200]);
    }

    handleInput() {
        if (this.isActive && !this.isPaused && this.player) {
            // Use Player's built-in jump() which handles double jump internally
            const jumped = this.player.jump();
            if (jumped) {
                this.playSFX('jump');

                // Spawn particles on double jump (when in air)
                if (this.player.jumpCount === 2) {
                    const playerRect = this.player.element.getBoundingClientRect();
                    const containerRect = this.container.getBoundingClientRect();
                    this.spawnParticles(
                        playerRect.left - containerRect.left + playerRect.width / 2,
                        playerRect.bottom - containerRect.top,
                        8
                    );
                    this.vibrate(40);
                }
            }
        }
    }

    togglePause() {
        if (!this.isActive) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.pauseBtn.innerText = "▶️";
            this.statusTitle.innerText = "GAME PAUSED";
            this.statusMsg.innerText = "Klik tombol Play atau spasi untuk lanjut";
            this.overlay.style.display = 'flex';

            // Hide Start Button during pause to avoid confusion
            const startBtn = this.overlay.querySelector('.btn');
            if (startBtn) startBtn.style.display = 'none';

        } else {
            this.pauseBtn.innerText = "⏸️";
            this.overlay.style.display = 'none';

            // Restore Start Button visibility (for Game Over state later)
            const startBtn = this.overlay.querySelector('.btn');
            if (startBtn) startBtn.style.display = 'block';

            // Reset update time to prevent huge delta jump
            this.lastTime = performance.now();

            if (this.bgm) this.audioManager.playBGM(this.bgm);
        }
    }

    playRandomBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }

        const tracks = ASSETS.audio.bgm;
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

        this.bgm = new Audio(randomTrack);
        this.bgm.loop = true;
        this.bgm.volume = CONFIG.BGM_VOLUME;

        // Route through AudioManager to respect mute settings
        this.audioManager.playBGM(this.bgm);
    }

    playSFX(key) {
        let sound;

        if (Array.isArray(this.sfx[key])) {
            // Pick random sound from array
            const sounds = this.sfx[key];
            sound = sounds[Math.floor(Math.random() * sounds.length)];
        } else {
            sound = this.sfx[key];
        }

        if (sound) {
            sound.currentTime = 0;
            sound.volume = 0.8;
            this.audioManager.playSFX(sound);
        }
    }
}
