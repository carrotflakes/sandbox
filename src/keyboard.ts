const keyPressed: {[key:string]: number} = {
};

const keyNames = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'x', 'z', 'Shift'];

window.addEventListener('keydown', (e) => {
    if (keyNames.includes(e.key)) {
        keyPressed[e.key] = 1;
    }
});
window.addEventListener('keyup', (e) => {
    if (keyNames.includes(e.key)) {
        keyPressed[e.key] = 0;
    }
});

export function getKeys() {
    return keyPressed;
}
