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

    setCell(x: number, y: number, cell: number) {
        const cx = Math.floor(x / size);
        const cy = Math.floor(y / size);
        const chunk = this.chunks.getChunk(cx, cy);
        chunk.setCell(x - cx * size, y - cy * size, cell);
    }

    dig(x: number, y: number) {
        this.setCell(x, y, 3);
    }
}
