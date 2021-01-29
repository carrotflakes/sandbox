import {size, Chunks, Chunk} from './core';

export class Field {
    chunks: Chunks;
    // cachedChunks: [number, number, Chunk][];

    constructor(seed: number) {
        this.chunks = new Chunks(seed);
    }

    getCell(x: number, y: number): number {
        const cx = Math.floor(x / size);
        const cy = Math.floor(y / size);
        const chunk = this.chunks.getChunk(cx, cy);
        return chunk.getCell(x - cx * size, y - cy * size);
    }
}
