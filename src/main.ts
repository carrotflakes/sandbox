import {size, Chunks, Chunk} from './core';
import {getKeys} from './keyboard';
import { FpsManager } from './fpsManager';
import { Field } from './field';
import { Player } from './entities/player';
import { Navigator } from './entities/navigator';
import { TapIndicator } from './entities/tapIndicator';

export function main(ctx: CanvasRenderingContext2D) {
    const fpsManager = new FpsManager(30);
    const field = new Field(0);
    const player = new Player(field);
    const navigator = new Navigator(field, player);
    const tapIndicator = new TapIndicator();
    const [fpx, fpy] = firstPos(field);
    player.cx = fpx;
    player.cy = fpy;
    let mouse: {x: number, y: number, timestamp: number} | null = null;

    function loop() {
        if (mouse) {
            tapIndicator.taped(mouse);

            const s = 600 / 15;
            const rp = player.realPos();
            navigator.setDestination([Math.floor(mouse.x / s + rp[0]) - 7, Math.floor(mouse.y / s + rp[1]) - 7]);

            mouse = null;
        }

        fpsManager.update();
        player.update();
        navigator.update();
        {
            const i = field.items.findIndex(item => item.x === player.cx && item.y === player.cy);
            if (~i) {
                field.items.splice(i, 1);
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
        drawField2(ctx, field, [7-rp[0], 7-rp[1]]);
        navigator.draw(ctx, [7-rp[0], 7-rp[1]]);
        ctx.restore();

        ctx.save();
        const s = 600 / 15;
        ctx.scale(s, s);
        ctx.translate(7, 7);
        player.draw(ctx);
        ctx.restore();

        tapIndicator.draw(ctx);

        const keys = getKeys();
        drawText('↑', 0, !!keys.ArrowUp);
        drawText('↓', 1, !!keys.ArrowDown);
        drawText('←', 2, !!keys.ArrowLeft);
        drawText('→', 3, !!keys.ArrowRight);
        drawText('Shift', 4, !!keys.ShiftLeft);
        drawText('z', 5, !!keys.KeyZ);
        drawText(`fps: ${(fpsManager.fps() + '00000').substr(0, 6)}`, 7, false);
        drawText(`${player.cx}, ${player.cy}`, 8, false);

        fpsManager.requestAnimationFrame(loop);
    }
    loop();

    ctx.canvas.addEventListener('mousedown', (e) => {
        const bb = ctx.canvas.getBoundingClientRect();
        mouse = {x: e.clientX - bb.left, y: e.clientY - bb.top, timestamp: Date.now()};
        navigator.setDestination([0, 0]);
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
