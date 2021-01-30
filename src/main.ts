import {size, Chunks, Chunk} from './core';
import {getKeys} from './keyboard';
import { FpsManager } from './fpsManager';
import { Field, Item } from './field';
import { Player } from './entities/player';
import { Navigator } from './entities/navigator';
import { TapIndicator } from './entities/tapIndicator';
import { setBoard, close as closeBoard } from './board';
import { Minimap } from './entities/minimap';
import { Particles } from './entities/particles';

export function main(ctx: CanvasRenderingContext2D) {
    const fpsManager = new FpsManager(30);
    const field = new Field(0);
    const player = new Player(field);
    const navigator = new Navigator(field, player);
    const tapIndicator = new TapIndicator();
    const minimap = new Minimap(field, player);
    const particles = new Particles(player);
    const [fpx, fpy] = firstPos(field);
    player.cx = fpx;
    player.cy = fpy;
    player.onDig((x, y) => particles.put(x, y));
    let mouse: {x: number, y: number, timestamp: number} | null = null;
    let itemOn: Item | null = null;
    let boardShowing = false;
    let pressingKeyM = false;

    function loop() {
        if (boardShowing) {
            if (mouse) {
                boardShowing = false;
                closeBoard();
                mouse = null;
            } else {
                setTimeout(loop, 100);
                return;
            }
        }
        if (mouse) {
            tapIndicator.taped(mouse);

            const s = 600 / 15;
            const rp = player.realPos();
            navigator.setDestination([Math.floor(mouse.x / s + rp[0]) - 7, Math.floor(mouse.y / s + rp[1]) - 7]);

            mouse = null;
        }

        if (getKeys().KeyM) {
            if (!pressingKeyM) {
                pressingKeyM = true;
                minimap.setShow(!minimap.getShow());
            }
        } else {
            pressingKeyM = false;
        }

        fpsManager.update();
        player.update();
        navigator.update();
        minimap.update();
        particles.update();

        {
            const i = field.items.findIndex(item => item.x === player.cx && item.y === player.cy);
            if (~i) {
                if (!itemOn) {
                    const item = field.items[i];
                    switch (item.type) {
                        case 'food':
                            player.onaka += 100;
                            field.items.splice(i, 1);
                            break;
                        case 'board':
                            setBoard(item.content, () => {
                                boardShowing = false;
                            });
                            boardShowing = true;
                            itemOn = item;
                            break;
                    }
                }
            } else {
                itemOn = null;
            }
        }

        const rp = player.realPos();

        const drawText = (text: string, y: number, color: boolean) => {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(text, 600 + 11, 21 + y * 20);
            ctx.fillStyle = color ? '#F00' : '#000';
            ctx.fillText(text, 600 + 10, 20 + y * 20);
        };

        ctx.clearRect(0, 0, 800, 600);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(600, 0);
        ctx.lineTo(600, 600);
        ctx.lineTo(0, 600);
        ctx.closePath();
        ctx.clip();
        drawField3(ctx, field, [7-rp[0], 7-rp[1]]);
        particles.draw(ctx, [7-rp[0], 7-rp[1]]);
        navigator.draw(ctx, [7-rp[0], 7-rp[1]]);
        ctx.restore();

        ctx.save();
        const s = 600 / 15;
        ctx.scale(s, s);
        ctx.translate(7, 7);
        player.draw(ctx);
        ctx.restore();

        minimap.draw(ctx);

        tapIndicator.draw(ctx);

        ctx.fillStyle = '#eee';
        ctx.fillRect(600, 0, 200, 600);

        const keys = getKeys();
        drawText([
            'key:',
            keys.ArrowUp && '↑',
            keys.ArrowDown && '↓',
            keys.ArrowLeft && '←',
            keys.ArrowRight && '→',
            keys.ShiftLeft && 'Shift',
            keys.KeyZ && 'z',
            keys.KeyM && 'm',
        ].filter(x => x).join(' '), 0, false);
        drawText(`fps: ${(fpsManager.fps() + '00000').substr(0, 6)}`, 1, false);
        drawText(`pos: ${player.cx}, ${player.cy}`, 8, false);
        drawText(`onaka: ${player.onaka}`, 10, false);
        drawText(`chunks: ${field.chunks.chunks.size}`, 15, false);
        drawText(`items: ${field.items.length}`, 16, false);

        fpsManager.requestAnimationFrame(loop);
    }
    loop();

    ctx.canvas.addEventListener('mousedown', (e) => {
        const bb = ctx.canvas.getBoundingClientRect();
        mouse = {x: e.clientX - bb.left, y: e.clientY - bb.top, timestamp: Date.now()};
    });
}

function firstPos(field: Field): [number, number] {
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < i + 1; ++j) {
            if (field.getCell(j, i - j) === 2) {
                return [j, i - j];
            }
        }
    }
    throw new Error('firstPos not found!!!!');
}

function drawField(ctx: CanvasRenderingContext2D, field: Field, [cx, cy]: [number, number], cells: number = 15) {
    const s = 600 / cells;
    const dx = Math.floor(-cx);
    const dy = Math.floor(-cy);
    const ox = cx + dx, oy = cy + dy;
    for (let y = 0; y < cells + 1; ++y) {
        for (let x = 0; x < cells + 1; ++x) {
            const c = field.getCell(dx + x, dy + y);
            switch (c) {
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
            ctx.fillRect((ox + x) * s, (oy + y) * s, s-1, s-1);
        }
    }
}

function drawField2(ctx: CanvasRenderingContext2D, field: Field, [cx, cy]: [number, number], cells: number = 15) {
    const s = 600 / cells;
    const dx = Math.floor(-cx);
    const dy = Math.floor(-cy);
    const ox = cx + dx, oy = cy + dy;
    for (let y = 0; y < cells + 1; ++y) {
        for (let x = 0; x < cells + 1; ++x) {
            const c = field.getCell(dx + x, dy + y);
            switch (c) {
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
            ctx.fillRect((ox + x) * s, (oy + y) * s, s + 1, s + 1);
        }
    }
    for (const item of field.items) {
        ctx.save();
        ctx.fillStyle = 'rgba(200, 180, 20, 1)';
        ctx.strokeStyle = '#ddd';
        ctx.scale(s, s);
        ctx.translate(cx + item.x, cy + item.y);
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 0.3, Math.PI * 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 0.04;
        // ctx.stroke();
        ctx.restore();
    }
}

function drawField3(ctx: CanvasRenderingContext2D, field: Field, [cx, cy]: [number, number], cells: number = 15) {
    const s = 600 / cells;
    const dx = Math.floor(-cx);
    const dy = Math.floor(-cy);
    const ox = cx + dx, oy = cy + dy;
    const f = (x: number , y: number) => field.getCell(x + dx, y + dy) < 1;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    for (let y = -1; y < cells + 1; ++y) {
        for (let x = -1; x < cells + 1; ++x) {
            const d = (+f(x, y) << 3) | (+f(x+1, y) << 2) | (+f(x+1, y+1) << 1) | (+f(x, y+1) << 0);
            for (let i = 0; i < 4; ++i) {
                let line: [number, number, number, number] | null = null;
                ctx.beginPath();
                const t = [0, 1, 0, -1];
                switch (((d << i) | (d >> (4-i))) & 0b1111) {
                    case 0b1000:
                    case 0b1010:
                        line = [0.2, 0.5, 0.5, 0.2];
                        ctx.moveTo((ox + x + 1 - line[0] * t[(i+1) % 4] + line[1] * t[i % 4]) * s, (oy + y + 1 - line[0] * t[i % 4] - line[1] * t[(i+1) % 4]) * s);
                        ctx.arc((ox + x + 1 - 0.4 * t[(i+1) % 4] + 0.4 * t[i % 4]) * s, (oy + y + 1 - 0.4 * t[i % 4] - 0.4 * t[(i+1) % 4]) * s, 0.2 * s, (i + 0) * 0.5 * Math.PI, (i + 1) * 0.5 * Math.PI);
                        ctx.lineTo((ox + x + 1 - line[2] * t[(i+1) % 4] + line[3] * t[i % 4]) * s, (oy + y + 1 - line[2] * t[i % 4] - line[3] * t[(i+1) % 4]) * s);
                        // ctx.arc((ox + x + 1 - 0.5 * t[(i+1) % 4] + 0.5 * t[i % 4]) * s, (oy + y + 1 - 0.5 * t[i % 4] - 0.5 * t[(i+1) % 4]) * s, 0.3 * s, (i + 0) * 0.5 * Math.PI, (i + 1) * 0.5 * Math.PI);
                        break;
                    case 0b1100:
                    case 0b1110:
                        line = [0.5, 0.2, 0.0, 0.2];
                        ctx.moveTo((ox + x + 1 - line[0] * t[(i+1) % 4] + line[1] * t[i % 4]) * s, (oy + y + 1 - line[0] * t[i % 4] - line[1] * t[(i+1) % 4]) * s);
                        ctx.lineTo((ox + x + 1 - line[2] * t[(i+1) % 4] + line[3] * t[i % 4]) * s, (oy + y + 1 - line[2] * t[i % 4] - line[3] * t[(i+1) % 4]) * s);
                        break;
                    case 0b1001:
                    case 0b1011:
                        line = [0.2, 0.5, 0.2, 0.0];
                        ctx.moveTo((ox + x + 1 - line[0] * t[(i+1) % 4] + line[1] * t[i % 4]) * s, (oy + y + 1 - line[0] * t[i % 4] - line[1] * t[(i+1) % 4]) * s);
                        ctx.lineTo((ox + x + 1 - line[2] * t[(i+1) % 4] + line[3] * t[i % 4]) * s, (oy + y + 1 - line[2] * t[i % 4] - line[3] * t[(i+1) % 4]) * s);
                        break;
                    case 0b1101:
                        line = [0.2, 0.0, 0.0, 0.2];
                        // ctx.moveTo((ox + x + 1 - line[0] * t[(i+1) % 4] + line[1] * t[i % 4]) * s, (oy + y + 1 - line[0] * t[i % 4] - line[1] * t[(i+1) % 4]) * s);
                        // ctx.lineTo((ox + x + 1 - line[2] * t[(i+1) % 4] + line[3] * t[i % 4]) * s, (oy + y + 1 - line[2] * t[i % 4] - line[3] * t[(i+1) % 4]) * s);
                        ctx.arc((ox + x + 1) * s, (oy + y + 1) * s, 0.2 * s, (i + 2) * 0.5 * Math.PI, (i + 3) * 0.5 * Math.PI);
                        break;
                }
                ctx.stroke();
            }
        }
    }
    for (const item of field.items) {
        ctx.save();
        switch (item.type) {
            case 'food':
                ctx.fillStyle = 'rgba(200, 180, 20, 1)';
                break;
            case 'board':
                ctx.fillStyle = 'rgba(100, 200, 20, 1)';
                break;
        }
        ctx.strokeStyle = '#ddd';
        ctx.scale(s, s);
        ctx.translate(cx + item.x, cy + item.y);
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 0.3, Math.PI * 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 0.04;
        // ctx.stroke();
        ctx.restore();
    }
}
