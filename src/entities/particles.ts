import { Field } from '../field';
import { Player } from './player';

type Particle = {
    x: number,
    y: number,
    dx: number,
    dy: number,
    a: number,
    da: number,
    type: number,
    birthTime: number,
};

export class Particles {
    player: Player;
    particles: Particle[];

    constructor(player: Player) {
        this.player = player;
        this.particles = [];
    }

    put(x: number, y: number) {
        this.particles.push({
            x: x + 0.5,
            y: y + 0.5,
            dx: (Math.random() - 0.5) * 0.08,
            dy: (Math.random() - 0.5) * 0.08,
            a: Math.random(),
            da: (Math.random() - 0.5) * 0.2,
            type: 0,
            birthTime: Date.now(),
        });
    }

    update() {
        const now = Date.now();
        this.particles = this.particles.filter(p => now < p.birthTime + 500);
        for (const particle of this.particles) {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.a += particle.da;
        }
    }

    draw(ctx: CanvasRenderingContext2D, [cx, cy]: [number, number]) {
        const s = 600 / 15;
        for (const particle of this.particles) {
            ctx.fillStyle = '#666';
            const {x, y, a} = particle;
            ctx.save();
            ctx.translate((x + cx) * s, (y + cy) * s);
            ctx.scale(s, s);
            ctx.rotate(a);

            // ctx.scale(0.2, 0.2);
            // ctx.beginPath();
            // ctx.moveTo(Math.cos(Math.PI * 2 / 3), Math.sin(Math.PI * 2 / 3));
            // ctx.lineTo(Math.cos(Math.PI * 4 / 3), Math.sin(Math.PI * 4 / 3));
            // ctx.lineTo(Math.cos(Math.PI * 6 / 3), Math.sin(Math.PI * 6 / 3));
            // ctx.closePath();
            // ctx.fill();

            // ctx.fillRect(-0.05, -0.2, 0.1, 0.4);
            // ctx.fillRect(-0.2, -0.05, 0.4, 0.1);

            ctx.fillRect(-0.1, -0.1, 0.2, 0.2);

            ctx.restore();
        }
    }
}
