import { CONFIG } from './config.js';
import { ASSETS, createPedestrianSVG, createGerobakSVG } from './assets.js';
import { Player, Obstacle, Item } from './entities.js';
import { AudioManager } from './audio-manager.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scoreBoard = document.getElementById('score-board');
        this.heartsDisplay = document.getElementById('hearts-display');
        this.pauseBtn = document.getElementById('pause-btn'); // Add reference
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

        this.lastTime = 0;
        this.obstacleTimer = 0;
        this.itemTimer = 0;
        this.nextObstacleTime = 0;
        this.nextItemTime = 0;

        this.audioManager = new AudioManager();
        this.initBackgrounds();
        this.initSettings();

        // Event Listener for Pause
        this.pauseBtn.addEventListener('click', () => this.togglePause());
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

        // Load saved settings
        toggleBGM.checked = this.audioManager.bgmEnabled;
        toggleSFX.checked = this.audioManager.sfxEnabled;

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
            if (this.isActive) this.togglePause();
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });

        toggleBGM.addEventListener('change', () => {
            this.audioManager.toggleBGM();
        });

        toggleSFX.addEventListener('change', () => {
            this.audioManager.toggleSFX();
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
        this.isInvincible = false;
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
        this.pauseBtn.innerText = "⏸️";
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
                    this.takeDamage();
                } else if (item.config.type !== 'bad') {
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
        this.score += amount;
        this.updateUI();
        if (this.score % CONFIG.SCORE_INCREMENT_THRESHOLD === 0) {
            this.speed += CONFIG.SPEED_INCREMENT;
        }
    }

    updateUI() {
        this.scoreBoard.innerText = `Skor: ${this.score}`;

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
    }

    handleInput() {
        if (this.isActive && !this.isPaused && this.player) {
            const jumped = this.player.jump();
            if (jumped) {
                this.playSFX('jump');
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

            if (this.bgm) this.bgm.play();
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

        // Handle autoplay policy promises
        const playPromise = this.bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play was prevented. Please interact with the document first.");
            });
        }
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
