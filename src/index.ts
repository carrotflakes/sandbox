import {main} from './main';

const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

main(ctx);
