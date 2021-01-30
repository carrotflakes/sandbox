export class FpsManager {
    idealFps: number;
    history: number[];

    constructor(fps: number) {
        this.idealFps = fps;
        this.history = [Date.now(), Date.now() + 1];
    }

    update() {
        this.history.push(Date.now());
        if (this.history.length > 30) {
            this.history.shift();
        }
    }

    fps(): number {
        return 1000 * this.history.length / (this.history[this.history.length - 1] - this.history[0]);
    }

    wait() {
        const len = this.history.length;
        const next = this.history[0] + 1000 * len / this.idealFps;
        return next - Date.now();

    }

    requestAnimationFrame(f: () => void) {
        const wait = this.wait();
        if (0 < wait) {
            requestAnimationFrame(() => this.requestAnimationFrame(f));
        } else {
            requestAnimationFrame(f);
        }
    }
}
