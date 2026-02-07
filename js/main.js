import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
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
});
