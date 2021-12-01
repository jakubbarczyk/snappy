import { fromEvent, merge } from 'rxjs';
import { filter, map, startWith, tap, throttleTime } from 'rxjs/operators';
import { MouseButton } from './mouse-button';

/**
 * SnappyJS
 */
const playground = document.querySelector('.playground');
const playgroundBoundingClientRect = playground.getBoundingClientRect();
const playgroundOffsetTop = playgroundBoundingClientRect.top;
const playgroundOffsetLeft = playgroundBoundingClientRect.left;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

context.canvas.height = playgroundBoundingClientRect.height;
context.canvas.width = playgroundBoundingClientRect.width;

const contextMenu = fromEvent(playground, 'contextmenu').pipe(
    tap(event => event.preventDefault())
);

const mouseDown = fromEvent(playground, 'mousedown').pipe(
    filter(({ buttons }) => buttons === MouseButton.Primary),
    map(event => ({
        mousedownX: event.clientX - playgroundOffsetLeft,
        mousedownY: event.clientY - playgroundOffsetTop
    })),
    tap(({ mousedownX, mousedownY }) => {
        context.beginPath();
        context.moveTo(mousedownX, mousedownY);
    })
);

const mouseMove = fromEvent(playground, 'mousemove').pipe(
    throttleTime(128),
    map(event => ({
        mousemoveX: event.clientX - playgroundOffsetLeft,
        mousemoveY: event.clientY - playgroundOffsetTop
    }))
);

const mouseUp = fromEvent(playground, 'mouseup').pipe(
    map(event => ({
        mouseupX: event.clientX - playgroundOffsetLeft,
        mouseupY: event.clientY - playgroundOffsetTop
    })),
    tap(({ mouseupX, mouseupY }) => {
        context.lineTo(mouseupX, mouseupY);
        context.stroke();
    })
);

const mouseMoveWithShift = initialEvent => mouseMove.pipe(
    startWith(initialEvent),
    // takeUntil(mouseUp)
);

const mouseMoveWithoutShift = initialEvent => mouseMove.pipe(
    startWith(initialEvent),
    // takeUntil(mouseUp)
);

// Blocks context menu
contextMenu.subscribe();

/* ORIGINAL
    mouseDown.pipe(
        switchMap(event => iif(
            () => event.shiftKey,
            mouseMoveWithShift(event),
            mouseMoveWithoutShift(event)
        ))
    ).subscribe(); 
 */

merge(mouseDown, mouseUp).subscribe();
