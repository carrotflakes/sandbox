import { setTextRange } from 'typescript';
import {size, Chunks, Chunk} from './core';
import {getKeys} from './keyboard';
import { FpsManager } from './fpsManager';
import { Field } from './field';

type Dir = 'up' | 'down' | 'left' | 'right';

class Player {
    cx: number;
    cy: number;
    dir: Dir;
    moveCounter: number;
    moveCounterMax: number;

    constructor() {
        this.cx = 0;
        this.cy = 0;
        this.dir = 'down';
        this.moveCounter = 0;
        this.moveCounterMax = 3;
    }

    update() {
        const keys = getKeys();
        if (this.moveCounter === 0) {
            this.moveCounterMax = keys.Shift ? 1 : 3;
            if (keys.ArrowUp) {
                this.dir = 'up';
                this.cy -= 1;
                this.moveCounter = this.moveCounterMax;
            } else if (keys.ArrowDown) {
                this.dir = 'down';
                this.cy += 1;
                this.moveCounter = this.moveCounterMax;
            } else if (keys.ArrowLeft) {
                this.dir = 'left';
                this.cx -= 1;
                this.moveCounter = this.moveCounterMax;
            } else if (keys.ArrowRight) {
                this.dir = 'right';
                this.cx += 1;
                this.moveCounter = this.moveCounterMax;
            }
        } else {
            this.moveCounter -= 1;
        }
    }

    realPos(): [number, number] {
        switch (this.dir) {
            case 'up':
                return [this.cx, this.cy + this.moveCounter / this.moveCounterMax];
            case 'down':
                return [this.cx, this.cy - this.moveCounter / this.moveCounterMax];
            case 'left':
                return [this.cx + this.moveCounter / this.moveCounterMax, this.cy];
            case 'right':
                return [this.cx - this.moveCounter / this.moveCounterMax, this.cy];
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.translate(0.5, 0.5);
        ctx.rotate({up: 3, down: 1, left: 2, right: 0}[this.dir] * Math.PI / 2);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, 0.3, Math.PI * 0.2, Math.PI * 1.8);
        ctx.lineCap = 'round';
        ctx.lineWidth = 0.2;
        ctx.stroke();
    }
}

export function main(ctx: CanvasRenderingContext2D) {
    const fpsManager = new FpsManager(30);
    const field = new Field(0);
    const player = new Player();

    const s = 600 / 15;

    function loop() {
        fpsManager.update();
        player.update();
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
        {
            let cells = 15;
            const cx = 7 - rp[0], cy = 7 - rp[1];
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
        ctx.restore();

        // ctx.fillStyle = '#333';
        // ctx.beginPath();
        // ctx.arc(s * 7 + s / 2, s * 7 + s / 2, s * 0.3, 0, Math.PI * 2);
        // ctx.closePath();
        // ctx.lineWidth = s * 0.2;
        // ctx.stroke();
        ctx.save();
        ctx.scale(s, s);
        ctx.translate(7, 7);
        player.draw(ctx);
        ctx.restore();

        const keys = getKeys();
        drawText('↑', 0, !!keys.ArrowUp);
        drawText('↓', 1, !!keys.ArrowDown);
        drawText('←', 2, !!keys.ArrowLeft);
        drawText('→', 3, !!keys.ArrowRight);
        drawText('Shift', 4, !!keys.Shift);
        drawText('z', 5, !!keys.z);
        drawText(`fps: ${(fpsManager.fps() + '00000').substr(0, 6)}`, 7, false);

        fpsManager.requestAnimationFrame(loop);
    }
    loop();
}
