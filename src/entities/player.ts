import {getKeys} from '../keyboard';
import { Field } from '../field';

type Dir = 'up' | 'down' | 'left' | 'right';

function dir2dpos(dir: Dir): [number, number] {
    switch (dir) {
        case 'up':
            return [0, -1];
        case 'down':
            return [0, 1];
        case 'left':
            return [-1, 0];
        case 'right':
            return [1, 0];
    }
}

export class Player {
    onaka: number;
    onakaMax: number;
    cx: number;
    cy: number;
    dir: Dir;
    moveCounter: number;
    moveCounterMax: number;
    field: Field;
    moveCoolTime: number;
    _onDig: ((x: number, y: number) => void) | null;

    constructor(field: Field) {
        this.onaka = 1000;
        this.onakaMax = 1000;
        this.cx = 0;
        this.cy = 0;
        this.dir = 'down';
        this.moveCounter = 0;
        this.moveCounterMax = 3;
        this.field = field;
        this.moveCoolTime = 0;
        this._onDig = null;
    }

    move(fast: boolean, dig: boolean) {
        const [dx, dy] = dir2dpos(this.dir);
        if (dig && this.blocked(this.cx + dx, this.cy + dy)) {
            this.field.dig(this.cx + dx, this.cy + dy);
            this.onaka -= 10;
            if (this._onDig) this._onDig(this.cx + dx, this.cy + dy);
        }
        if (!this.blocked(this.cx + dx, this.cy + dy)) {
            if (fast && !this.blocked(this.cx + dx * 2, this.cy + dy * 2) &&
                (this.blocked(this.cx + dy, this.cy + dx) && !this.blocked(this.cx + dx + dy, this.cy + dy + dx)) ||
                (this.blocked(this.cx - dy, this.cy - dx) && !this.blocked(this.cx + dx - dy, this.cy + dy - dx))) {
                    this.moveCoolTime = 5;
            }
            this.cx += dx;
            this.cy += dy;
            this.moveCounterMax = fast ? 1 : 3;
            this.moveCounter = this.moveCounterMax;
            this.onaka -= 1;
        }
    }

    update() {
        const keys = getKeys();
        if (this.moveCounter === 0) {
            if (this.moveCoolTime > 0) {
                this.moveCoolTime -= 1;
                return;
            }
            const fast = !!keys.ShiftLeft;
            if (keys.ArrowUp) {
                this.dir = 'up';
                this.move(fast, !!keys.KeyZ);
            } else if (keys.ArrowDown) {
                this.dir = 'down';
                this.move(fast, !!keys.KeyZ);
            } else if (keys.ArrowLeft) {
                this.dir = 'left';
                this.move(fast, !!keys.KeyZ);
            } else if (keys.ArrowRight) {
                this.dir = 'right';
                this.move(fast, !!keys.KeyZ);
            }
        } else {
            this.moveCounter -= 1;
        }
    }

    blocked(x: number, y: number): boolean {
        return this.field.getCell(x, y) < 2;
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
        ctx.strokeStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 0, 0.3, Math.PI * 0.2, Math.PI * 1.8);
        ctx.lineCap = 'round';
        ctx.lineWidth = 0.2;
        ctx.stroke();
    }

    onDig(_onDig: (x: number, y: number) => void) {
        this._onDig = _onDig;
    }
}
