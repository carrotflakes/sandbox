import MersenneTwister from 'mersenne-twister';
export const size = 100;

class Room {
    x: number;
    y: number;
    w: number;
    h: number;
    pathTo: Room[];

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.pathTo = [];
    }

    get right(): number {
        return this.x + this.w;
    }

    get bottom(): number {
        return this.y + this.h;
    }

    hit(other: Room): boolean {
        return (Math.max(this.x, other.x) <= Math.min(this.x + this.w, other.x + other.w)) && (Math.max(this.y, other.y) <= Math.min(this.y + this.h, other.y + other.h));
    }

    hitPos(pos: Pos): boolean {
        return this.x <= pos[0] && pos[0] < this.right && this.y <= pos[1] && pos[1] < this.bottom;
    }
}

type Pos = [number, number];
type Dir = "up" | "down" | "left" | "right";
const dirs: Dir[] = ['up', 'right', 'down', 'left'];

function roomEntrance(mt: MersenneTwister, room: Room): [Pos, Pos, Dir] {
    const dir = mt.random_int() % 4;
    let x, y;
    switch (dir) {
        case 0:
            x = room.x + mt.random_int() % (room.w - 2) + 1;
            return [[x, room.y], [x, room.y - 1], "up"];
        case 1:
            x = room.x + mt.random_int() % (room.w - 2) + 1;
            return [[x, room.y + room.h - 1], [x, room.y + room.h], "down"];
        case 2:
            y = room.y + mt.random_int() % (room.h - 2) + 1;
            return [[room.x, y], [room.x - 1, y], "left"];
        case 3:
            y = room.y + mt.random_int() % (room.h - 2) + 1;
            return [[room.x + room.w - 1, y], [room.x + room.w, y], "right"];
    }
    throw null;
}

function move(pos: Pos, dir: Dir, i: number): Pos {
    return [
        pos[0] + {'up': 0, 'down': 0, 'left': -1, 'right': 1}[dir] * i,
        pos[1] + {'up': -1, 'down': 1, 'left': 0, 'right': 0}[dir] * i,
    ]
}

function turnLeft(dir: Dir): Dir {
    return dirs[(dirs.indexOf(dir) + 3) % dirs.length];
}

function turnRight(dir: Dir): Dir {
    return dirs[(dirs.indexOf(dir) + 5) % dirs.length];
}

function connect(pos1: Pos, dir1: Dir, pos2: Pos, dir2: Dir): Pos[] {
    const p1 = move(pos1, dir1, 1);
    const p2 = move(pos2, dir2, 1);
    return [p1, [p1[0], p2[1]], p2];
}

function linePoss(pos1: Pos, pos2: Pos): Pos[] {
    const poss: Pos[] = [];
    if (pos1[0] === pos2[0]) {
        if (pos1[1] < pos2[1]) {
            for (let j = pos1[1]; j <= pos2[1]; ++j) {
                poss.push([pos1[0], j]);
            }
        } else {
            for (let j = pos2[1]; j <= pos1[1]; ++j) {
                poss.push([pos1[0], j]);
            }
        }
    } else {
        if (pos1[0] < pos2[0]) {
            for (let j = pos1[0]; j <= pos2[0]; ++j) {
                poss.push([j, pos1[1]]);
            }
        } else {
            for (let j = pos2[0]; j <= pos1[0]; ++j) {
                poss.push([j, pos1[1]]);
            }
        }
    }
    return poss;
}

function pathHitPos(path: Pos[], pos: Pos): boolean {
    for (let i = 0; i < path.length - 1; ++i) {
        const pos1 = path[i];
        const pos2 = path[i+1];
        if (pos1[0] === pos2[0]) {
            if (pos1[0] === pos[0] && Math.min(pos1[1], pos2[1]) <= pos[1] && pos[1] <= Math.max(pos1[1], pos2[1])) {
                return true;
            }
        } else {
            if (pos1[1] === pos[1] && Math.min(pos1[0], pos2[0]) <= pos[0] && pos[0] <= Math.max(pos1[0], pos2[0])) {
                return true;
            }
        }
    }
    return false;
}

function solve(field: number[], start: Pos, end: Pos): Pos[] | null {
    const opens: [Pos, number, any, number][] = [[start, 1, null, 0]];
    const closeds: Pos[] = [];
    function open(x: number, y: number, parent: any) {
        if (field[(y + 1) * (size + 2) + (x + 1)] !== 0) return;
        if (closeds.find(closed => closed[0] === x && closed[1] === y))
            return;
        const s = Math.abs(end[0] - x) + Math.abs(end[1] - y);// + parent[3];
        const existed = opens.find(closed => closed[0][0] === x && closed[0][1] === y);
        if (existed) {
            // if (parent[3] < existed[2][3]) {
            //     existed[1] = s;
            //     existed[2] = parent;
            //     existed[3] = parent[3] + 1;
            // }
            return;
        }
        const node: [Pos, number, any, number] = [[x, y], s, parent, parent[3] + 1];
        for (let i = 0; i < opens.length; ++i) {
            if (s < opens[i][1]) {
                opens.splice(i, 0, node);
                return;
            }
        }
        opens.push(node);
    }
    while (1) {
        const node = opens.shift();
        if (!node) {
            break;
        }
        if (node[1] === 0) {
            const poss: Pos[] = [];
            const f = (node: any) => {
                if (node) {
                    poss.unshift(node[0]);
                    f(node[2]);
                }
            };
            f(node);
            return poss;
        }
        closeds.push(node[0]);
        const [x, y] = node[0];
        open(x, y-1, node);
        open(x, y+1, node);
        open(x-1, y, node);
        open(x+1, y, node);
    }
    return null;
}

function reducePath(path: Pos[]): Pos[] {
    const poss: Pos[] = [];
    let d = 0;
    for (let i = 0; i < path.length - 1; ++i) {
        const dd = (path[i][0] - path[i+1][0]) + (path[i][1] - path[i+1][1]) * 2;
        if (d !== dd) {
            poss.push(path[i]);
            d = dd;
        }
    }
    poss.push(path[path.length - 1]);
    return poss;
}

// function shortPath(path: Pos[]): Pos[] {
//     for (let i = 0; i < path.length - 1; ++i) {
//     }
// }

function pathValid(field: number[], path: Pos[]): boolean {
    for (let i = 0; i < path.length - 1; ++i) {
        const pos1 = path[i];
        const pos2 = path[i+1];
        for (const pos of linePoss(pos1, pos2)) {
            if (field[(pos[1] + 1) * (size + 2) + (pos[0] + 1)] !== 0) {
                return false;
            }
        }
    }
    return true;
}

function fieldWrap(field: number[]) {
    for (let y = 1; y < size + 1; ++y) {
        for (let x = 1; x < size + 1; ++x) {
            if (field[y * (size + 2) + x] !== 0) {
                continue;
            }
            if (2 <= field[y * (size + 2) + x-1] || 2 <= field[y * (size + 2) + x+1] || 2 <= field[(y-1) * (size + 2) + x] || 2 <= field[(y+1) * (size + 2) + x]) {
                field[y * (size + 2) + x] = -1;
            }
            if (2 <= field[(y-1) * (size + 2) + x-1] || 2 <= field[(y-1) * (size + 2) + x+1] || 2 <= field[(y+1) * (size + 2) + x-1] || 2 <= field[(y+1) * (size + 2) + x+1]) {
                field[y * (size + 2) + x] = -1;
            }
        }
    }
}

function pos2idx(pos: Pos): number {
    return (pos[1] + 1) * (size + 2) + pos[0] + 1
}

export class Chunk {
    x: number;
    y: number;
    seed: number;
    field: number[];
    rooms: Room[];
    completed: boolean;
    pathGenerated: boolean;

    constructor(x: number, y: number, seed: number) {
        this.x = x;
        this.y = y;
        this.seed = seed;
        this.field = Array((size + 2) * (size + 2));
        this.rooms = [];
        this.completed = false;
        this.pathGenerated = false;

        for (let y = 0; y < size + 2; ++y) {
            for (let x = 0; x < size + 2; ++x) {
                let c = (x === 0 || y === 0 || x === size + 1 || y === size + 1) ? 1 : 0;
                this.field[y * (size + 2) + x] = c;
            }
        }
    }

    getCell(x: number, y: number): number {
        return this.field[(y + 1) * (size + 2) + x + 1];
    }

    setCell(x: number, y: number, cell: number) {
        this.field[(y + 1) * (size + 2) + x + 1] = cell;
    }

    generateRooms() {
        this.rooms = [];
        const mt = new MersenneTwister(this.seed);

        for (let i = 0; i < 100; ++i) {
            const x = mt.random_int() % (size - 5) + 1;
            const y = mt.random_int() % (size - 5) + 1;
            let w = mt.random_int() % 6 + mt.random_int() % 7 + 3;
            let h = mt.random_int() % 6 + mt.random_int() % 7 + 3;
            w = Math.min(w, size - 1 - x);
            h = Math.min(h, size - 1 - y);
            const room = new Room(x, y, w, h);
            if (!this.rooms.find((r) => room.hit(r))) {
                this.rooms.push(room);
            }
        }

        for (const room of this.rooms) {
            for (let y = 0; y < room.h; ++y) {
                for (let x = 0; x < room.w; ++x) {
                    this.field[(room.y + y + 1) * (size + 2) + room.x + x + 1] = 2;
                }
            }
        }

        fieldWrap(this.field);
    }

    generatePaths() {
        const paths: Pos[][] = [];
        const mt = new MersenneTwister(this.seed);

        for (const i in this.rooms) {
            const re1 = roomEntrance(mt, this.rooms[i]);
            let p = move(re1[1], re1[2], 0);
            let d = re1[2];
            const path: Pos[] = [re1[0], p];
            let connected = false;
            const len = mt.random_int() % 4 + mt.random_int() % 4 + 1;
            a: for (let i = 0; i < len; ++i) {
                let dist = (mt.random_int() % 8 + mt.random_int() % 8 + mt.random_int() % 8) + 1;
                let dirs = [[turnLeft, turnRight, (a: Dir) => a], [turnRight, turnLeft, (a: Dir) => a]][mt.random_int() % 2];
                if (i === 0) {
                    dirs.reverse();
                }
                if (i === len - 1) dist = 20;
                for (const dir of dirs) {
                    let d2 = dir(d);
                    let p2 = p;
                    let failed = false;
                    b: for (let j = 0; j < dist; ++j) {
                        p2 = move(p2, d2, 1);
                        if (this.field[pos2idx(p2)] === 2) {
                            path.push(p2);
                            connected = true;
                            break a;
                        } else if (this.field[pos2idx(p2)] === -1) {
                            p2 = move(p2, d2, 1);
                            if (this.field[pos2idx(p2)] === 2) {
                                path.push(p2);
                                connected = true;
                                break a;
                            } else {
                                failed = true;
                                break b;
                            }
                        } else if (this.field[pos2idx(p2)] === 0) {
                            continue;
                        } else {
                            failed = true;
                            break b;
                        }
                    }
                    if (!failed) {
                        path.push(p2);
                        p = p2;
                        d = d2;
                        break;
                    }
                }
            }
            if (!connected) {
                continue;
            }

            for (let i = 0; i < path.length - 1; ++i) {
                const pos1 = path[i];
                const pos2 = path[i+1];
                for (const pos of linePoss(pos1, pos2)) {
                    this.field[(pos[1] + 1) * (size + 2) + (pos[0] + 1)] = 3;
                }
            }
            fieldWrap(this.field);
        }
    }

    getRoomByPos(pos: Pos): Room | null {
        return this.rooms.find(room => room.hitPos(pos)) || null
    }
}

export class Chunks {
    seed: number;
    chunks: Map<String, Chunk>;

    constructor(seed: number) {
        this.seed = seed;
        this.chunks = new Map();
    }

    ensureChunk(x: number, y: number): Chunk {
        const key = x + ',' + y;
        let chunk = this.chunks.get(key);
        if (chunk) {
            return chunk;
        }
        chunk = new Chunk(x, y, (x + y * 100000 + this.seed * 321) ^ this.seed);
        this.chunks.set(key, chunk);
        chunk.generateRooms();
        return chunk;
    }

    generatePaths(x: number, y: number) {
        const chunks = [
            this.ensureChunk(x-1, y-1),
            this.ensureChunk(x, y-1),
            this.ensureChunk(x+1, y-1),
            this.ensureChunk(x-1, y),
            this.ensureChunk(x, y),
            this.ensureChunk(x+1, y),
            this.ensureChunk(x-1, y+1),
            this.ensureChunk(x, y+1),
            this.ensureChunk(x+1, y+1),
        ];
        const chunk = chunks[4];
        if (chunk.pathGenerated) return;
        chunk.pathGenerated = true;

        const paths: Pos[][] = [];
        const mt = new MersenneTwister(chunk.seed);

        function pos2idx(pos: Pos): number {
            return (pos[1] + 1) * (size + 2) + pos[0] + 1
        }
        const getCell = (pos: Pos): number => {
            const cx = Math.floor(pos[0] / size);
            const cy = Math.floor(pos[1] / size);
            return chunks[(cy + 1) * 3 + cx + 1].field[pos2idx([pos[0] - cx * size, pos[1] - cy * size])];
        };
        const setCell = (pos: Pos, cell: number) => {
            const cx = Math.floor(pos[0] / size);
            const cy = Math.floor(pos[1] / size);
            chunks[(cy + 1) * 3 + cx + 1].field[pos2idx([pos[0] - cx * size, pos[1] - cy * size])] = cell;
        };
        const makePath = (room: Room) => {
            const re1 = roomEntrance(mt, room);
            let p = move(re1[1], re1[2], 0);
            let d = re1[2];
            const path: Pos[] = [re1[0], p];
            let connected = false;
            const len = mt.random_int() % 4 + mt.random_int() % 4 + 1;
            a: for (let i = 0; i < len; ++i) {
                let dist = (mt.random_int() % 8 + mt.random_int() % 8 + mt.random_int() % 8) + 1;
                let dirs = [[turnLeft, turnRight, (a: Dir) => a], [turnRight, turnLeft, (a: Dir) => a]][mt.random_int() % 2];
                if (i === 0) {
                    dirs.reverse();
                }
                if (i === len - 1) dist = 20;
                for (const dir of dirs) {
                    let d2 = dir(d);
                    let p2 = p;
                    let failed = false;
                    b: for (let j = 0; j < dist; ++j) {
                        p2 = move(p2, d2, 1);
                        if (getCell(p2) === 2) {
                            path.push(p2);
                            connected = true;
                            break a;
                        } else if (getCell(p2) === -1) {
                            p2 = move(p2, d2, 1);
                            if (getCell(p2) === 2) {
                                path.push(p2);
                                connected = true;
                                break a;
                            } else {
                                failed = true;
                                break b;
                            }
                        } else if (getCell(p2) === 0) {
                            continue;
                        } else {
                            failed = true;
                            break b;
                        }
                    }
                    if (!failed) {
                        path.push(p2);
                        p = p2;
                        d = d2;
                        break;
                    }
                }
            }
            if (!connected) {
                return;
            }

            let room2: Room | null = null;
            const pos: Pos = [(path[path.length - 1][0] + size* 2 - 1) % size + 1, (path[path.length - 1][1] + size * 2 - 1) % size + 1];
            // console.log(path[path.length - 1], pos);
            for (const chunk of chunks) {
                room2 = chunk.getRoomByPos(pos);
                if (room2) break;
            }
            if (!room2)
                throw new Error('room not found');
            room.pathTo.push(room2);
            room2.pathTo.push(room);

            for (let i = 0; i < path.length - 1; ++i) {
                const pos1 = path[i];
                const pos2 = path[i+1];
                for (const pos of linePoss(pos1, pos2)) {
                    setCell(pos, 3);
                }
            }
            for (const c of chunks) {
                fieldWrap(c.field);
            }
        }

        for (const i in chunk.rooms) {
            makePath(chunk.rooms[i]);
        }
    }

    connectAll(chunk: Chunk) {
        const connectedRooms: Room[][] = [];
        for (const room of chunk.rooms) {
            if (!connectedRooms.find(cr => cr.includes(room))) {
                const opens: Room[] = [room];
                const closed: Room[] = [];
                while (opens.length) {
                    const open = opens.pop() as Room;
                    if (closed.includes(open)) continue;
                    closed.push(open);
                    opens.push(...open.pathTo);
                }
                connectedRooms.push(closed);
            }
        }
        // console.log(connectedRooms);
        // TODO...
    }

    getChunk(x: number, y: number): Chunk {
        const chunk = this.ensureChunk(x, y);
        if (!chunk.completed) {
            chunk.completed = true;
            console.log('create chunk');

            this.generatePaths(x, y);
            this.generatePaths(x-1, y-1);
            this.generatePaths(x, y-1);
            this.generatePaths(x+1, y-1);
            this.generatePaths(x-1, y);
            this.generatePaths(x+1, y);
            this.generatePaths(x-1, y+1);
            this.generatePaths(x, y+1);
            this.generatePaths(x+1, y+1);
            this.connectAll(chunk);
        }
        return chunk;
    }
}
