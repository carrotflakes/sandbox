import { sharing } from 'webpack';
import { Field } from '../field';
import { Player } from './player';

export class Minimap {
    field: Field;
    player: Player;
    show: boolean;
    discovered: Bits2d;

    constructor(field: Field, player: Player) {
        this.field = field;
        this.player = player;
        this.show = false;
        this.discovered = new Bits2d();
    }

    setShow(s: boolean) {
        this.show = s;
    }

    getShow(): boolean {
        return this.show;
    }

    update() {
        const px = this.player.cx;
        const py = this.player.cy;
        for (let y = -7; y < 7; ++y) {
            for (let x = -7; x < 7; ++x) {
                this.discovered.setBit(px + x, py + y, true);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.show) return;

        const cells = 100;
        const s = 600 / cells;
        const px = this.player.cx;
        const py = this.player.cy;
        ctx.save();
        ctx.globalAlpha = 0.8;
        for (let y = 0; y < cells + 1; ++y) {
            for (let x = 0; x < cells + 1; ++x) {
                const fx = x + px - (cells / 2 | 0);
                const fy = y + py - (cells / 2 | 0);
                if (!this.discovered.getBit(fx, fy)) continue;
                const c = this.field.getCell(fx, fy);
                switch (c) {
                    case 0:
                        ctx.fillStyle = 'rgba(220, 220, 220, 0.5)';
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
                if (fx === px && fy === py && (Date.now() / 250 | 0) % 2) {
                    ctx.fillStyle = '#fff';
                }
                ctx.fillRect(x * s, y * s, s, s);
            }
        }
        ctx.restore();
    }
}

class Bits2d {
    static readonly size: number = 32;

    chunks: {cx: number, cy: number, buf: Uint8Array}[];

    constructor() {
        this.chunks = [];
    }

    setBit(x: number, y: number, bit: boolean) {
        const cx = Math.floor(x / Bits2d.size);
        const cy = Math.floor(y / Bits2d.size);
        const dx = x - cx * Bits2d.size;
        const dy = y - cy * Bits2d.size;
        let chunk = this.chunks.find(chunk => chunk.cx === cx && chunk.cy === cy);
        if (!chunk) {
            chunk = {cx, cy, buf: new Uint8Array(Bits2d.size ** 2 / 8)};
            this.chunks.push(chunk);
        }
        const i = (dy * Bits2d.size + dx) & 0b111;
        if (bit) {
            chunk.buf[(dy * Bits2d.size + dx) >> 3] |= 1 << i;
        } else {
            chunk.buf[(dy * Bits2d.size + dx) >> 3] &= ~(1 << i);
        }
    }

    getBit(x: number, y: number): boolean {
        const cx = Math.floor(x / Bits2d.size);
        const cy = Math.floor(y / Bits2d.size);
        const dx = x - cx * Bits2d.size;
        const dy = y - cy * Bits2d.size;
        let chunk = this.chunks.find(chunk => chunk.cx === cx && chunk.cy === cy);
        if (!chunk) {
            chunk = {cx, cy, buf: new Uint8Array(Bits2d.size ** 2 / 8)};
            this.chunks.push(chunk);
        }
        const i = (dy * Bits2d.size + dx) & 0b111;
        return !!((chunk.buf[(dy * Bits2d.size + dx) >> 3] >> i) & 1);
    }
}
