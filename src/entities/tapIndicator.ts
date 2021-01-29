type Mouse = {x: number, y: number, timestamp: number};

export class TapIndicator {
    mouse: Mouse | null = null;

    constructor() {
        this.mouse = null;
    }

    taped(mouse: Mouse) {
        this.mouse = mouse;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.mouse) return;
        const t = (Date.now() - this.mouse.timestamp) / 500;
        if (t < 1.0) {
            ctx.save();
            ctx.fillStyle = '#000';
            ctx.globalAlpha = Math.max(0.0, 1.0 - t);
            ctx.translate(this.mouse.x, this.mouse.y);
            ctx.rotate(Math.PI * 0.25);
            for (let i = 0; i < 4; ++i) {
            ctx.fillRect(-5 + (t * 5 + t ** 2) * 20, -1, Math.max(0.0, 10 + (t - t ** 2 * 1.5) * 160), 2);
            ctx.rotate(Math.PI * 0.5);
            }
            ctx.restore();
        }
    }
}
