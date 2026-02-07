// Game Configuration
export const CONFIG = {
    GRAVITY: 0.065,          // Smooth, floaty jump
    JUMP_VELOCITY: 1.7,      // Comfortable height - clears obstacles & fruits
    DOUBLE_JUMP_VELOCITY_MULTIPLIER: 0.5, // Second jump ~50% of first - good for extra height
    INITIAL_SPEED: 7,
    GROUND_Y: 22, // Adjusted to matched sidewalk in new background
    LIVES: 5,
    SPEED_INCREMENT: 0.3,
    SCORE_INCREMENT_THRESHOLD: 25,
    INVINCIBILITY_DURATION: 2000, // ms
    MIN_OBSTACLE_SPAWN_TIME: 850,
    MAX_OBSTACLE_SPAWN_TIME_BASE: 1300,
    ITEM_SPAWN_MIN: 1500,
    ITEM_SPAWN_MAX: 2000,
    PLAYER_HITBOX: {
        width: 54,
        height: 150, // Resized to 1.5x
        offsetX: 0,
        offsetY: 0
    },
    // Background Images
    BG_SHOPS_IMAGE: 'assets/img/background-toko.webp',
    BGM_VOLUME: 0.5
};

export const STORE_NAMES = ["WARUNG NASI", "TOKO MADURA", "LAUNDRY", "FOTOCOPY", "PANGKAS RAMBUT"];
export const STORE_COLORS = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe'];
