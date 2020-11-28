import { MouseButton } from './mouse-button';

/**
 * Snappy JS
 */
const playground = document.querySelector('.playground');

playground.addEventListener('contextmenu', event => {
    event.preventDefault();
});

playground.addEventListener('mousedown', event => {
    console.dir('click', event);
    console.warn(`Shift key: ${event.shiftKey}`);
    console.warn(`Left mouse button: ${event.buttons === MouseButton.Primary}`);
    console.warn(`Right mouse button: ${event.buttons === MouseButton.Secondary}`);
});
