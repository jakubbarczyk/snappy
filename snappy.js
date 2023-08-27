import { animationFrameScheduler, fromEvent } from 'rxjs';
import { concatMap, filter, map, share, subscribeOn, takeUntil, tap } from 'rxjs/operators';

// PLAYGROUND
const playground = document.querySelector('#snappy');
const playgroundBoundingClientRect = playground.getBoundingClientRect();
const playgroundOffsetTop = playgroundBoundingClientRect.top;
const playgroundOffsetLeft = playgroundBoundingClientRect.left;

// CANVAS
const canvas = playground.firstElementChild;
const context = canvas.getContext('2d');

context.canvas.height = playgroundBoundingClientRect.height;
context.canvas.width = playgroundBoundingClientRect.width;

const clearContext = () => context.clearRect(0, 0, canvas.width, canvas.height);

// CONTEXT MENU
const contextMenu = fromEvent(playground, 'contextmenu').pipe(
    tap(event => event.preventDefault())
);

// MOUSE UP
const toMouseUpPosition = event => ({
    mouseupX: event.clientX - playgroundOffsetLeft,
    mouseupY: event.clientY - playgroundOffsetTop
});

const mouseUp = fromEvent(playground, 'mouseup', { passive: true }).pipe(
    subscribeOn(animationFrameScheduler),
    map(toMouseUpPosition),
    share()
);

// MOUSE MOVE
const toMouseMovePosition = event => ({
    mousemoveX: event.clientX - playgroundOffsetLeft,
    mousemoveY: event.clientY - playgroundOffsetTop,
    shiftdown: event.shiftKey // is Shift depressed?
});

const mouseMove = fromEvent(playground, 'mousemove', { passive: true }).pipe(
    subscribeOn(animationFrameScheduler),
    map(toMouseMovePosition),
    share()
);

// MOUSE DOWN
const toMouseDownPosition = event => ({
    mousedownX: event.clientX - playgroundOffsetLeft,
    mousedownY: event.clientY - playgroundOffsetTop
});

const mouseDown = fromEvent(playground, 'mousedown', { passive: true }).pipe(
    subscribeOn(animationFrameScheduler),
    filter(({ buttons }) => buttons === 1),
    map(toMouseDownPosition),
    share()
);

// SNAPPY
const drawLine = ({ mousedownX, mousedownY }) => mouseMove.pipe(
    tap(({ mousemoveX, mousemoveY, shiftdown }) => {
        clearContext();
        context.beginPath();
        context.moveTo(mousedownX, mousedownY);

        if (shiftdown) {
            const absX = Math.abs(mousemoveX - mousedownX);
            const absY = Math.abs(mousemoveY - mousedownY);
            const sign = Math.sign(mousemoveY - mousedownY) === -1 ? -1 : 1;

            if (absY <= absX / 2) context.lineTo(mousemoveX, mousedownY);
            else if (absY <= absX * 2) context.lineTo(mousemoveX, mousedownY + sign * absX);
            else context.lineTo(mousedownX, mousemoveY);
        } else {
            context.lineTo(mousemoveX, mousemoveY);
        }

        context.stroke();
    }),
    takeUntil(mouseUp)
);

const snappy = mouseDown.pipe(
    concatMap(drawLine)
);

// MAIN
contextMenu.subscribe();
mouseUp.subscribe();
mouseMove.subscribe();
snappy.subscribe();
