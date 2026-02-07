import { CONFIG } from './config.js';
import { ASSETS } from './assets.js';

export class Player {
    constructor(containerElement) {
        this.element = document.createElement('div');
        this.element.id = 'player';
        this.y = CONFIG.GROUND_Y;
        this.velocity = 0;
        this.isJumping = false;
        this.jumpCount = 0;
        containerElement.appendChild(this.element);
        this.updateAsset();
    }

    jump() {
        if (!this.isJumping) {
            // First Jump
            this.isJumping = true;
            this.jumpCount = 1;
            this.velocity = CONFIG.JUMP_VELOCITY;
            this.updateAsset();
            return true;
        } else if (this.jumpCount < 2) {
            // Double Jump
            this.jumpCount++;
            this.velocity = CONFIG.JUMP_VELOCITY * CONFIG.DOUBLE_JUMP_VELOCITY_MULTIPLIER;
            return true;
        }
        return false;
    }

    update(timeScale = 1) {
        if (!this.isJumping && this.y === CONFIG.GROUND_Y) return;

        // Apply physics with timeScale for smoothness
        this.velocity -= CONFIG.GRAVITY * timeScale;
        this.y += this.velocity * timeScale;

        if (this.y <= CONFIG.GROUND_Y) {
            this.y = CONFIG.GROUND_Y;
            this.isJumping = false;
            this.jumpCount = 0;
            this.velocity = 0;
            this.updateAsset();
        }

        this.render();
    }

    render() {
        this.element.style.bottom = `${this.y}%`;
    }

    updateAsset() {
        this.element.innerHTML = this.isJumping ? ASSETS.nenek.jumping : ASSETS.nenek.standing;
    }

    getHitbox() {
        const rect = this.element.getBoundingClientRect();
        const center = rect.left + (rect.width / 2);
        return {
            left: center - (CONFIG.PLAYER_HITBOX.width / 2),
            right: center + (CONFIG.PLAYER_HITBOX.width / 2),
            bottom: rect.bottom - 8,
            top: rect.top + 25
        };
    }

    setInvincible(active) {
        if (active) {
            this.blinkInterval = setInterval(() => {
                this.element.style.opacity = this.element.style.opacity === '0.3' ? '1' : '0.3';
            }, 100);
            setTimeout(() => {
                clearInterval(this.blinkInterval);
                this.element.style.opacity = '1';
                if (this.onInvincibilityEnd) this.onInvincibilityEnd();
            }, CONFIG.INVINCIBILITY_DURATION);
        } else {
            clearInterval(this.blinkInterval);
            this.element.style.opacity = '1';
        }
    }
}

export class Obstacle {
    constructor(containerElement, startX) {
        this.container = containerElement;
        this.x = startX;
        this.markedForDeletion = false;

        const type = ASSETS.obstacles[Math.floor(Math.random() * ASSETS.obstacles.length)];
        this.id = type.id || null;
        this.width = type.w;
        this.height = type.h;
        this.html = type.html;
        this.hitHtml = type.hitHtml || null;

        this.element = document.createElement('div');
        this.element.className = 'obstacle';
        this.element.innerHTML = this.html;
        this.container.appendChild(this.element);
    }

    setHit() {
        if (this.hitHtml) {
            this.element.innerHTML = this.hitHtml;
        }
    }

    update(speed, timeScale = 1) {
        this.x -= speed * timeScale;
        this.element.style.left = `${this.x}px`;

        if (this.x < -100) {
            this.markedForDeletion = true;
        }
    }

    getHitbox() {
        const rect = this.element.getBoundingClientRect();
        return {
            left: rect.left + 5,
            right: rect.right - 5,
            top: rect.bottom - this.height,
            bottom: rect.bottom
        };
    }

    remove() {
        this.element.remove();
    }
}

export class Item {
    constructor(containerElement, startX) {
        this.container = containerElement;
        this.x = startX;
        this.markedForDeletion = false;

        const type = ASSETS.items[Math.floor(Math.random() * ASSETS.items.length)];
        this.config = type;

        this.element = document.createElement('div');
        this.element.className = 'item';
        this.element.innerHTML = type.html;
        this.element.style.bottom = `${type.y}%`;
        this.container.appendChild(this.element);
    }

    update(speed, timeScale = 1) {
        this.x -= speed * timeScale;
        this.element.style.left = `${this.x}px`;

        if (this.x < -100) {
            this.markedForDeletion = true;
        }
    }

    getHitbox() {
        const rect = this.element.getBoundingClientRect();
        return {
            left: rect.left + 5,
            right: rect.right - 5,
            top: rect.bottom - rect.height + 5, // Simple approximation
            bottom: rect.bottom
        };
    }

    remove() {
        this.element.remove();
    }
}
