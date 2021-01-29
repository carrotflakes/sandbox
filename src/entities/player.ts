import {getKeys} from '../keyboard';
import { Field } from '../field';

type Dir = 'up' | 'down' | 'left' | 'right';

export class Player {
    cx: number;
    cy: number;
    dir: Dir;
    moveCounter: number;
    moveCounterMax: number;
    field: Field;

    constructor(field: Field) {
        this.cx = 0;
        this.cy = 0;
        this.dir = 'down';
        this.moveCounter = 0;
        this.moveCounterMax = 3;
        this.field = field;
    }

    update() {
        const keys = getKeys();
        if (this.moveCounter === 0) {
            this.moveCounterMax = keys.Shift ? 1 : 3;
            const ok = (dx: number, dy: number) => {
                if (this.field.getCell(this.cx + dx, this.cy + dy) >= 2) {
                    this.cx += dx;
                    this.cy += dy;
                    this.moveCounter = this.moveCounterMax;
                }
            };
            if (keys.ArrowUp) {
                this.dir = 'up';
                ok(0, -1);
            } else if (keys.ArrowDown) {
                this.dir = 'down';
                ok(0, 1);
            } else if (keys.ArrowLeft) {
                this.dir = 'left';
                ok(-1, 0);
            } else if (keys.ArrowRight) {
                this.dir = 'right';
                ok(1, 0);
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
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 0, 0.3, Math.PI * 0.2, Math.PI * 1.8);
        ctx.lineCap = 'round';
        ctx.lineWidth = 0.2;
        ctx.stroke();
    }
}
