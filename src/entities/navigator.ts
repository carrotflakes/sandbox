import { Field } from '../field';
import { Player } from './player';

export class Navigator {
    field: Field;
    player: Player;
    destination: [number, number] | null;
    digging: boolean;

    constructor(field: Field, player: Player) {
        this.field = field;
        this.player = player;
        this.destination = null;
        this.digging = false;
    }

    setDestination(destination: [number, number]) {
        this.destination = destination;
        this.digging = false;
    }

    update() {
        if (this.destination && this.player.moveCounter === 0) {
            const [x, y] = this.destination;
            if (x === this.player.cx && y === this.player.cy) {
                this.destination = null;
            }
            if (this.player.cx < x && this.player.moveCounter === 0) {
                this.player.dir = 'right';
                this.player.move(false, this.digging);
            }
            if (x < this.player.cx && this.player.moveCounter === 0) {
                this.player.dir = 'left';
                this.player.move(false, this.digging);
            }
            if (this.player.cy < y && this.player.moveCounter === 0) {
                this.player.dir = 'down';
                this.player.move(false, this.digging);
            }
            if (y < this.player.cy && this.player.moveCounter === 0) {
                this.player.dir = 'up';
                this.player.move(false, this.digging);
            }
            if (this.player.moveCounter === 0) {
                this.digging = true;
            }
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, [cx, cy]: [number, number]) {
        if (this.destination) {
            const s = 600 / 15;
            ctx.save();
            ctx.globalAlpha = 0.95 - Math.abs(Date.now() % 2000 / 1000 - 1) ** 2 * 0.8
            ctx.fillStyle = '#FFF';
            const [x, y] = this.destination;
            ctx.fillRect((x + cx) * s, (y + cy) * s, s, s);
            ctx.restore();
        }
    }
}
