const keyPressed: {[key:string]: number} = {
};

const Codes = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyX', 'KeyZ', 'KeyM', 'ShiftLeft'];

window.addEventListener('keydown', (e) => {
    if (Codes.includes(e.code)) {
        keyPressed[e.code] = 1;
    }
});
window.addEventListener('keyup', (e) => {
    if (Codes.includes(e.code)) {
        keyPressed[e.code] = 0;
    }
});

export function getKeys() {
    return keyPressed;
}
