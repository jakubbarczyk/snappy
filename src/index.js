import { fromEvent, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MouseButton } from './mouse-button';

/**
 * Snappy JS
 */
const playground = document.querySelector('.playground');

const contextMenu = fromEvent(playground, 'contextmenu').pipe(
    tap(event => event.preventDefault())
);

const mouseDown = fromEvent(playground, 'mousedown').pipe(
    tap(event => {
        console.dir('click', event);
        console.warn(`Shift key: ${event.shiftKey}`);
        console.warn(`Left mouse button: ${event.buttons === MouseButton.Primary}`);
        console.warn(`Right mouse button: ${event.buttons === MouseButton.Secondary}`);
    })
);

merge(contextMenu, mouseDown).subscribe();
