import {size, Chunks, Chunk} from './core';
import {getKeys} from './keyboard';

const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

function g() {
    const chunks = new Chunks();
    const s = (600 / size) | 0;

    let cx = 0, cy = 0;
    let drawRequest = true;
    function drawLoop() {
        const keys = getKeys();
        if (keys.ArrowUp) {cy += 4;}
        if (keys.ArrowDown) {cy -= 4;}
        if (keys.ArrowLeft) {cx += 4;}
        if (keys.ArrowRight) {cx -= 4;}
        if (true || drawRequest) {
            ctx.clearRect(0, 0, 600, 600);
            const f = (chunk: Chunk, ox: number, oy: number) => {
                for (let y = 0; y < size; ++y) {
                    for (let x = 0; x < size; ++x) {
                        switch (chunk.field[(y + 1) * (size + 2) + x + 1]) {
                            case 0:
                                ctx.fillStyle = 'rgba(220, 220, 220, 1)';
                                break;
                            case 1:
                                ctx.fillStyle = 'rgba(100, 100, 100, 1)';
                                break;
                            case 2:
                                ctx.fillStyle = 'rgba(200, 50, 50, 1)';
                                break;
                            case 3:
                                ctx.fillStyle = 'rgba(100, 100, 200, 1)';
                                break;
                            case -1:
                                ctx.fillStyle = 'rgba(190, 190, 190, 1)';
                                break;
                        }
                        ctx.fillRect(ox + x * s, oy + y * s, s-1, s-1);
                    }
                }
            };
            const dx = Math.floor(-cx / (size * s));
            const dy = Math.floor(-cy / (size * s));
            f(chunks.getChunk(dx, dy), cx + (0 + dx) * size * s, cy + (0 + dy) * size * s);
            f(chunks.getChunk(dx + 1, dy), cx + (1 + dx) * size * s, cy + (0 + dy) * size * s);
            f(chunks.getChunk(dx, dy + 1), cx + (0 + dx) * size * s, cy + (1 + dy) * size * s);
            f(chunks.getChunk(dx + 1, dy + 1), cx + (1 + dx) * size * s, cy + (1 + dy) * size * s);

            drawText('↑', 0, !!keys.ArrowUp);
            drawText('↓', 1, !!keys.ArrowDown);
            drawText('←', 2, !!keys.ArrowLeft);
            drawText('→', 3, !!keys.ArrowRight);
            drawText('Shift', 4, !!keys.Shift);
            drawText('z', 5, !!keys.z);

            drawRequest = false;
        }
        requestAnimationFrame(drawLoop);
    }
    drawLoop();

    // setInterval(() => {
    //     if (mouse) return;
    //     cx -= 4;
    //     drawRequest = true;
    // }, 20);

    let mouse: {x: number, y: number} | null = null;
    window.addEventListener('mousedown', (e) => {
        mouse = {x: e.clientX, y: e.clientY};
        e.preventDefault();
    });
    window.addEventListener('mouseup', (e) => {
        mouse = null;
        e.preventDefault();
    });
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (mouse) {
            cx += e.clientX - mouse.x;
            cy += e.clientY - mouse.y;
            mouse = {x: e.clientX, y: e.clientY};
            drawRequest = true;
        }
    });
}
g();

function drawText(text: string, y: number, color: boolean) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, 11, 21 + y * 20);
    ctx.fillStyle = color ? '#F00' : '#000';
    ctx.fillText(text, 10, 20 + y * 20);
}

    // for (const room of filteredRooms) {
    //     const room2 = filteredRooms[mt.random_int() % filteredRooms.length];
    //     if (room === room2) continue;
    //     const re1 = roomEntrance(mt, room);
    //     const re2 = roomEntrance(mt, room2);

    //     // paths.push([re1[0], re1[1], [re1[1][0], re2[1][1]], re2[1], re2[0]]);
    //     // paths.push([re1[0], re1[1], ...connect(re1[1], re1[2], re2[1], re2[2]), re2[1], re2[0]]);
    //     const p = solve(field, re1[1], re2[1]);
    //     if (p) {
    //         // const path = [re1[0], ...p, re2[0]];
    //         const path = reducePath([re1[0], ...p, re2[0]]);
    //         paths.push(path);

    //         for (let i = 0; i < path.length - 1; ++i) {
    //             const pos1 = path[i];
    //             const pos2 = path[i+1];
    //             for (const pos of linePoss(pos1, pos2)) {
    //                 field[(pos[1] + 1) * (size + 2) + (pos[0] + 1)] = 3;
    //             }
    //         }
    //     }
    // }

    // for (const i in filteredRooms) {
    //     const d = (a: Room, b: Room) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    //     for (const room2 of filteredRooms.slice(+i+1).sort((a, b) => d(filteredRooms[i], a) - d(filteredRooms[i], b))) {
    //         const re1 = roomEntrance(mt, filteredRooms[i]);
    //         const re2 = roomEntrance(mt, room2);
    //         const q1 = move(re1[1], re1[2], 1);
    //         const q2 = move(re2[1], re2[2], 1);

    //         const p = solve(field, q1, q2);
    //         if (p) {
    //             const path = reducePath([re1[0], q1, ...p, q2, re2[0]]);
    //             paths.push(path);
    //             console.log(pathValid(field, p));

    //             for (let i = 0; i < path.length - 1; ++i) {
    //                 const pos1 = path[i];
    //                 const pos2 = path[i+1];
    //                 for (const pos of linePoss(pos1, pos2)) {
    //                     field[(pos[1] + 1) * (size + 2) + (pos[0] + 1)] = 3;
    //                 }
    //             }
    //             fieldWrap(field);
    //             break;
    //         }
    //     }
    // }
