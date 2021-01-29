import MersenneTwister from 'mersenne-twister';
import {size, Chunks, Chunk} from './core';

type Item = {
    x: number,
    y: number
};

export class Field {
    chunks: Chunks;
    // cachedChunks: [number, number, Chunk][];
    items: Item[];
    seed: number;

    constructor(seed: number) {
        this.chunks = new Chunks(seed);
        this.items = [];
        this.seed = seed + 1;
    }

    getChunk(cx: number, cy: number): Chunk {
        const chunk = this.chunks.ensureChunk(cx, cy);
        if (!chunk.completed) {
            this.items.push(...arrangeItems(this.seed, chunk, cx * size, cy * size));
        }
        return this.chunks.getChunk(cx, cy);
    }

    getCell(x: number, y: number): number {
        const cx = Math.floor(x / size);
        const cy = Math.floor(y / size);
        const chunk = this.getChunk(cx, cy);
        return chunk.getCell(x - cx * size, y - cy * size);
    }

    setCell(x: number, y: number, cell: number) {
        const cx = Math.floor(x / size);
        const cy = Math.floor(y / size);
        const chunk = this.getChunk(cx, cy);
        chunk.setCell(x - cx * size, y - cy * size, cell);
    }

    dig(x: number, y: number) {
        this.setCell(x, y, 3);
    }
}

function arrangeItems(seed: number, chunk: Chunk, offsetX: number, offsetY: number): Item[] {
    const mt = new MersenneTwister(seed);
    const items: Item[] = [];
    for (let i = 0; i < 10; ++i) {
        const room = chunk.rooms[mt.random_int() % chunk.rooms.length];
        const rx = mt.random_int() % room.w;
        const ry = mt.random_int() % room.h;
        items.push({
            x: room.x + rx + offsetX,
            y: room.y + ry + offsetY,
        });
    }
    // console.log(items);
    return items;
}
