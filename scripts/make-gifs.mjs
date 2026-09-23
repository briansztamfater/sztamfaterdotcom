/**
 * Draws the original pixel-art GIFs in public/gifs/.
 * Run with: node scripts/make-gifs.mjs
 *
 * Every GIF here is drawn from scratch in code: tributes to things we love,
 * not ripped sprites. To add a GIF you found or made elsewhere, just drop the
 * file in public/gifs/ and add a line to src/data/gifs.ts.
 */
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const OUT = 'public/gifs';
await mkdir(OUT, { recursive: true });

// ---------------------------------------------------------------------------
// a tiny canvas
// ---------------------------------------------------------------------------

const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

function canvas(w, h) {
  return { w, h, px: new Uint8Array(w * h * 4) };
}

function px(c, x, y, col) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  if (col === null) {
    c.px[i + 3] = 0;
    return;
  }
  const [r, g, b] = hex(col);
  c.px.set([r, g, b, 255], i);
}

const get = (c, x, y) => (x < 0 || y < 0 || x >= c.w || y >= c.h ? 0 : c.px[(y * c.w + x) * 4 + 3]);

function rect(c, x, y, w, h, col) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(c, i, j, col);
}

function ellipse(c, cx, cy, rx, ry, col) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / (rx + 0.5);
      const dy = (y - cy) / (ry + 0.5);
      if (dx * dx + dy * dy <= 1) px(c, x, y, col);
    }
}

function poly(c, pts, col) {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = 0; x < c.w; x++) {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y + 0.5 !== yj > y + 0.5 && x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) px(c, x, y, col);
    }
}

function line(c, x0, y0, x1, y1, col) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    px(c, x0, y0, col);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** 1px outline around everything drawn so far. */
function outline(c, col = '#000000') {
  const edge = [];
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++)
      if (!get(c, x, y) && (get(c, x - 1, y) || get(c, x + 1, y) || get(c, x, y - 1) || get(c, x, y + 1)))
        edge.push([x, y]);
  for (const [x, y] of edge) px(c, x, y, col);
}

function sprite(c, rows, ox, oy, pal) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => pal[ch] && px(c, ox + x, oy + y, pal[ch])));
}

// 3x5 pixel font
const FONT = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'], M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
  W: ['#.#', '#.#', '###', '###', '#.#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], 0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'], 6: ['.##', '#..', '###', '#.#', '###'], ':': ['...', '.#.', '...', '.#.', '...'],
  '\\': ['#..', '#..', '.#.', '..#', '..#'], '>': ['#..', '.#.', '..#', '.#.', '#..'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '_': ['...', '...', '...', '...', '###'], ' ': ['...', '...', '...', '...', '...'],
};

function text(c, str, x, y, col) {
  [...str].forEach((ch, i) => sprite(c, FONT[ch] ?? FONT[' '], x + i * 4, y, { '#': col }));
}

function clone(c) {
  return { w: c.w, h: c.h, px: new Uint8Array(c.px) };
}

// deterministic "random"
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

async function save(name, frames, delays) {
  const { w, h } = frames[0];
  const strip = new Uint8Array(w * h * 4 * frames.length);
  frames.forEach((f, i) => strip.set(f.px, i * w * h * 4));
  const delay = Array.isArray(delays) ? delays : frames.map(() => delays);
  await sharp(strip, { raw: { width: w, height: h * frames.length, channels: 4, pageHeight: h } })
    .gif({ delay, loop: 0, dither: 0, effort: 10 })
    .toFile(`${OUT}/${name}.gif`);
  console.log(`  ${name}.gif  ${w}x${h}  ${frames.length} frames`);
}

// ---------------------------------------------------------------------------
// computers
// ---------------------------------------------------------------------------

async function vb6() {
  const W = 60;
  const H = 44;
  const base = canvas(W, H);
  rect(base, 0, 0, W, H, '#c0c0c0');
  rect(base, 0, 0, W, 1, '#ffffff');
  rect(base, 0, 0, 1, H, '#ffffff');
  rect(base, 0, H - 1, W, 1, '#000000');
  rect(base, W - 1, 0, 1, H, '#000000');
  rect(base, 1, H - 2, W - 2, 1, '#808080');
  rect(base, W - 2, 1, 1, H - 2, '#808080');
  // title bar gradient
  const a = hex('#000080');
  const b = hex('#1084d0');
  for (let x = 2; x < W - 2; x++) {
    const t = (x - 2) / (W - 5);
    const col = '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
    rect(base, x, 2, 1, 9, col);
  }
  text(base, 'FORM1', 4, 4, '#ffffff');
  // close + maximize buttons
  for (const bx of [42, 50]) {
    rect(base, bx, 3, 7, 7, '#c0c0c0');
    rect(base, bx, 3, 7, 1, '#ffffff');
    rect(base, bx, 3, 1, 7, '#ffffff');
    rect(base, bx, 9, 7, 1, '#000000');
    rect(base, bx + 6, 3, 1, 7, '#000000');
  }
  line(base, 52, 5, 54, 7, '#000000');
  line(base, 54, 5, 52, 7, '#000000');
  rect(base, 44, 5, 3, 3, null);
  rect(base, 44, 5, 3, 3, '#c0c0c0');
  rect(base, 44, 5, 3, 1, '#000000');
  rect(base, 44, 5, 1, 3, '#000000');
  rect(base, 46, 5, 1, 3, '#000000');
  rect(base, 44, 7, 3, 1, '#000000');
  // design-time dot grid
  for (let y = 14; y < H - 3; y += 3) for (let x = 4; x < W - 3; x += 3) px(base, x, y, '#606060');

  const X = 11;
  const Y = 22;
  const crosshair = (c, x, y) => {
    line(c, x - 2, y, x + 2, y, '#000000');
    line(c, x, y - 2, x, y + 2, '#000000');
  };
  const band = (c, w, h) => {
    for (let i = 0; i <= w; i += 2) {
      px(c, X + i, Y, '#000000');
      px(c, X + i, Y + h, '#000000');
    }
    for (let j = 0; j <= h; j += 2) {
      px(c, X, Y + j, '#000000');
      px(c, X + w, Y + j, '#000000');
    }
  };
  const button = (c, handles) => {
    const bw = 37;
    const bh = 12;
    rect(c, X, Y, bw, bh, '#c0c0c0');
    rect(c, X, Y, bw, 1, '#ffffff');
    rect(c, X, Y, 1, bh, '#ffffff');
    rect(c, X, Y + bh - 1, bw, 1, '#000000');
    rect(c, X + bw - 1, Y, 1, bh, '#000000');
    rect(c, X + 1, Y + bh - 2, bw - 2, 1, '#808080');
    rect(c, X + bw - 2, Y + 1, 1, bh - 2, '#808080');
    text(c, 'COMMAND1', X + 3, Y + 4, '#000000');
    if (handles)
      for (const [hx, hy] of [
        [0, 0], [bw / 2, 0], [bw, 0], [0, bh / 2], [bw, bh / 2], [0, bh], [bw / 2, bh], [bw, bh],
      ])
        rect(c, Math.round(X + hx - 1), Math.round(Y + hy - 1), 2, 2, '#000080');
  };

  const frames = [];
  const f0 = clone(base);
  crosshair(f0, X, Y);
  frames.push(f0);
  for (const [w, h] of [[8, 3], [18, 6], [28, 9], [36, 11]]) {
    const f = clone(base);
    band(f, w, h);
    crosshair(f, X + w, Y + h);
    frames.push(f);
  }
  const f5 = clone(base);
  button(f5, true);
  frames.push(f5);
  const f6 = clone(base);
  button(f6, false);
  frames.push(f6);
  await save('vb6', frames, [600, 150, 150, 150, 300, 1400, 900]);
}

async function crt() {
  const base = canvas(32, 32);
  rect(base, 3, 1, 26, 21, '#d8d0b8');
  rect(base, 3, 20, 26, 2, '#a89f84');
  rect(base, 6, 4, 20, 14, '#101010');
  rect(base, 6, 4, 20, 1, '#303030');
  px(base, 24, 19, '#33cc33');
  rect(base, 12, 22, 8, 2, '#a89f84');
  rect(base, 8, 24, 16, 1, '#d8d0b8');
  // keyboard
  rect(base, 2, 26, 28, 5, '#d8d0b8');
  rect(base, 2, 30, 28, 1, '#a89f84');
  for (let y = 27; y < 30; y++) for (let x = 4; x < 28; x += 2) px(base, x, y, '#8a826a');
  outline(base);

  const G = '#33ff33';
  const screens = [
    ['C:\\>', true], ['C:\\>', false], ['C:\\>R', true], ['C:\\>RU', true], ['C:\\>RUN', true], ['C:\\>RUN', false],
  ];
  const frames = screens.map(([s, cur]) => {
    const f = clone(base);
    text(f, s.slice(0, 4), 8, 6, G);
    text(f, s.slice(4), 8, 12, G);
    if (cur) rect(f, 8 + s.slice(4).length * 4, 12, 3, 5, G);
    return f;
  });
  const hi = clone(base);
  text(hi, 'HI', 8, 6, G);
  text(hi, '!!!', 8, 12, G);
  frames.push(hi, hi);
  await save('computer', frames, [400, 400, 220, 220, 220, 300, 700, 700]);
}

async function floppy() {
  const frames = [0, 1, 3, 5, 5, 3, 1, 0].map((s) => {
    const c = canvas(24, 24);
    rect(c, 1, 1, 22, 22, '#2a4f9a');
    px(c, 22, 1, null);
    rect(c, 7, 2, 10, 6, '#5a3a22');
    rect(c, 6 + s, 1, 11, 8, '#c8c8c8');
    rect(c, 6 + s, 1, 11, 1, '#e8e8e8');
    rect(c, 12 + s, 2, 2, 6, '#555555');
    rect(c, 4, 12, 16, 10, '#f4f4f4');
    rect(c, 4, 12, 16, 2, '#cc3333');
    rect(c, 6, 16, 10, 1, '#8888aa');
    rect(c, 6, 19, 7, 1, '#8888aa');
    rect(c, 2, 20, 1, 2, '#15305f');
    outline(c);
    return c;
  });
  await save('floppy', frames, 140);
}

async function cd() {
  const frames = [];
  const N = 10;
  for (let f = 0; f < N; f++) {
    const c = canvas(28, 28);
    const cx = 13.5;
    const cy = 13.5;
    const rainbow = ['#ff6b6b', '#ffd36b', '#8bff6b', '#6bd8ff', '#b06bff'];
    for (let y = 0; y < 28; y++)
      for (let x = 0; x < 28; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.hypot(dx, dy);
        if (r > 13 || r < 2) continue;
        if (r < 4.5) {
          px(c, x, y, r < 3.2 ? '#e8e8e8' : '#b8b8b8');
          continue;
        }
        const ang = (Math.atan2(dy, dx) + Math.PI * 2 - (f / N) * Math.PI) % Math.PI;
        const band = Math.floor((ang / Math.PI) * 10);
        let col = '#d6d6de';
        if (band === 2 || band === 7) col = rainbow[Math.floor(r) % rainbow.length];
        else if (band === 3 || band === 8) col = '#f2f2f8';
        else if (band === 1 || band === 6) col = '#c2c2cc';
        px(c, x, y, col);
      }
    outline(c, '#333333');
    frames.push(c);
  }
  await save('cd', frames, 70);
}

async function hourglass() {
  const draw = (top, bottom, falling) => {
    const c = canvas(24, 24);
    rect(c, 5, 2, 14, 2, '#8b5a2b');
    rect(c, 5, 20, 14, 2, '#8b5a2b');
    // glass
    poly(c, [[6, 4], [18, 4], [13, 12], [18, 20], [6, 20], [11, 12]], '#dff2ff');
    // sand top: a triangle shrinking towards the neck
    if (top > 0) poly(c, [[12 - top, 12 - top], [12 + top, 12 - top], [12, 12]], '#e8b830');
    if (bottom > 0) poly(c, [[12, 20 - bottom], [12 + bottom + 1, 20], [12 - bottom - 1, 20]], '#e8b830');
    if (falling) rect(c, 12, 12, 1, 7, '#e8b830');
    outline(c);
    return c;
  };
  const frames = [draw(6, 0, false), draw(5, 2, true), draw(4, 3, true), draw(2, 4, true), draw(0, 5, false)];
  // flip: rotate the last frame 90 degrees
  const last = frames[frames.length - 1];
  const rot = canvas(24, 24);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) if (get(last, x, y)) rot.px.set(last.px.subarray((y * 24 + x) * 4, (y * 24 + x) * 4 + 4), ((x) * 24 + (23 - y)) * 4);
  frames.push(rot);
  await save('hourglass', frames, [400, 300, 300, 300, 400, 200]);
}

async function mail() {
  const draw = (flap, letter) => {
    const c = canvas(26, 24);
    // an open flap sits behind the letter; a closed one folds over the front
    if (flap === 'half') poly(c, [[2, 10], [24, 10], [13, 7]], '#e8e0c8');
    if (flap === 'open') poly(c, [[2, 10], [24, 10], [13, 2]], '#e8e0c8');
    if (letter > 0) {
      rect(c, 6, 12 - letter, 14, 10, '#ffffff');
      rect(c, 8, 14 - letter, 9, 1, '#6a8ac8');
      rect(c, 8, 16 - letter, 7, 1, '#6a8ac8');
    }
    rect(c, 2, 10, 22, 13, '#f4f0e0');
    line(c, 2, 22, 12, 15, '#c8c0a8');
    line(c, 23, 22, 13, 15, '#c8c0a8');
    if (flap === 'closed') poly(c, [[2, 10], [24, 10], [13, 18]], '#e8e0c8');
    rect(c, 18, 13, 4, 5, '#cc2222');
    outline(c);
    return c;
  };
  const frames = [draw('closed', 0), draw('half', 0), draw('open', 0), draw('open', 3), draw('open', 8), draw('open', 8), draw('open', 4), draw('half', 0)];
  await save('mail', frames, [700, 120, 120, 150, 150, 700, 150, 120]);
}

// ---------------------------------------------------------------------------
// consoles
// ---------------------------------------------------------------------------

async function gamepad() {
  const draw = (press) => {
    const c = canvas(38, 18);
    rect(c, 1, 2, 36, 14, '#d0d0d0');
    rect(c, 1, 2, 36, 1, '#e8e8e8');
    rect(c, 3, 5, 32, 9, '#222222');
    // d-pad
    const dp = press === 'right' ? '#8a8a8a' : '#555555';
    rect(c, 7, 6, 3, 7, '#555555');
    rect(c, 5, 8, 7, 3, '#555555');
    if (press === 'right') rect(c, 10, 8, 2, 3, dp);
    if (press === 'up') rect(c, 7, 6, 3, 2, '#8a8a8a');
    // select / start
    rect(c, 15, 10, 3, 1, '#888888');
    rect(c, 20, 10, 3, 1, '#888888');
    // B, A
    rect(c, 25, 7, 5, 5, '#b8b8b8');
    rect(c, 30, 7, 5, 5, '#b8b8b8');
    ellipse(c, 27, 9, 1.5, 1.5, press === 'b' || press === 'ab' ? '#7a1010' : '#cc2020');
    ellipse(c, 32, 9, 1.5, 1.5, press === 'a' || press === 'ab' ? '#7a1010' : '#cc2020');
    outline(c);
    return c;
  };
  const seq = ['none', 'right', 'right', 'none', 'up', 'none', 'b', 'a', 'none', 'ab'];
  await save('gamepad', seq.map(draw), 180);
}

async function dualpad() {
  const draw = (lit) => {
    const c = canvas(40, 26);
    ellipse(c, 9, 16, 7, 8, '#c4c4c8');
    ellipse(c, 30, 16, 7, 8, '#c4c4c8');
    rect(c, 7, 5, 26, 12, '#c4c4c8');
    rect(c, 7, 5, 26, 1, '#dcdce0');
    // d-pad
    rect(c, 8, 8, 3, 9, '#6a6a70');
    rect(c, 5, 11, 9, 3, '#6a6a70');
    // start/select
    rect(c, 16, 11, 3, 1, '#555558');
    rect(c, 21, 11, 3, 1, '#555558');
    // four face buttons
    const btn = [
      [30, 8, '#1a9a4a', '#5cff8f'],
      [34, 12, '#b02030', '#ff6070'],
      [30, 16, '#2040b0', '#6a90ff'],
      [26, 12, '#b04090', '#ff90dd'],
    ];
    btn.forEach(([x, y, dim, bright], i) => {
      ellipse(c, x, y, 1.5, 1.5, lit === i ? bright : dim);
      if (lit === i) px(c, x - 1, y - 1, '#ffffff');
    });
    outline(c);
    return c;
  };
  await save('dualpad', [-1, 0, 1, 2, 3, -1, 3, 2, 1, 0].map(draw), 170);
}

async function cartridge() {
  const draw = (puff) => {
    const c = canvas(30, 36);
    const oy = 10;
    rect(c, 7, oy, 16, 3, '#d4a017');
    for (let x = 8; x < 22; x += 2) px(c, x, oy + 1, '#9a7410');
    rect(c, 3, oy + 3, 24, 22, '#1c1c1c');
    rect(c, 3, oy + 3, 24, 1, '#3a3a3a');
    for (let y = oy + 20; y < oy + 24; y += 2) rect(c, 5, y, 20, 1, '#333333');
    rect(c, 5, oy + 6, 20, 11, '#f4f4f4');
    rect(c, 5, oy + 6, 20, 4, '#cc0000');
    text(c, '16BIT', 6, oy + 11, '#1c1c1c');
    outline(c);
    const cloud = (x, y, r, col) => ellipse(c, x, y, r, r, col);
    if (puff >= 1) cloud(15, 7, 2, '#e6e6e6');
    if (puff >= 2) {
      cloud(12, 4, 3, '#f2f2f2');
      cloud(18, 5, 2, '#dddddd');
    }
    if (puff >= 3) {
      cloud(9, 2, 2, '#f7f7f7');
      cloud(20, 2, 2, '#eeeeee');
    }
    return c;
  };
  await save('cartridge', [0, 1, 2, 3, 3, 0, 0].map(draw), [500, 120, 120, 250, 250, 500, 600]);
}

// ---------------------------------------------------------------------------
// games (tributes)
// ---------------------------------------------------------------------------

async function blackMage() {
  const draw = (bob, blink, spark) => {
    const c = canvas(30, 36);
    const o = bob;
    // staff
    rect(c, 24, 11 + o, 1, 22, '#7a5230');
    // robe
    poly(c, [[9, 22 + o], [19, 22 + o], [22, 31 + o], [6, 31 + o]], '#3a5fb0');
    rect(c, 13, 22 + o, 2, 9, '#2c4a8c');
    // legs and shoes
    rect(c, 9, 32 + o, 3, 2, '#e8dcc0');
    rect(c, 16, 32 + o, 3, 2, '#e8dcc0');
    rect(c, 8, 34, 5, 2, '#6b4a2a');
    rect(c, 15, 34, 5, 2, '#6b4a2a');
    // hand on the staff
    rect(c, 22, 23 + o, 2, 2, '#f0f0f0');
    // face in the shadow of the hat
    ellipse(c, 14, 19 + o, 5, 4, '#141418');
    // hat: brim, cone, a floppy tip
    ellipse(c, 14, 16 + o, 11, 2, '#c8a060');
    poly(c, [[7, 16 + o], [21, 16 + o], [17, 5 + o], [12, 6 + o]], '#c8a060');
    poly(c, [[12, 6 + o], [17, 5 + o], [20, 1 + o], [15, 3 + o]], '#b89050');
    rect(c, 9, 13 + o, 11, 2, '#6b4a2a');
    // eyes
    const eye = '#ffdd33';
    if (blink) {
      px(c, 12, 20 + o, eye);
      px(c, 16, 20 + o, eye);
    } else {
      rect(c, 12, 19 + o, 1, 2, eye);
      rect(c, 16, 19 + o, 1, 2, eye);
    }
    outline(c);
    // a little fire spell on top of the staff (drawn after the outline so it glows)
    if (spark === 1) {
      px(c, 24, 9 + o, '#ffcc00');
      px(c, 24, 8 + o, '#ff8800');
    } else if (spark === 2) {
      ellipse(c, 24, 8 + o, 1, 2, '#ff6600');
      px(c, 24, 8 + o, '#ffee66');
    } else if (spark === 3) {
      ellipse(c, 24, 7 + o, 2, 3, '#ff4400');
      ellipse(c, 24, 8 + o, 1, 1, '#ffcc00');
      px(c, 21, 5 + o, '#ffaa00');
      px(c, 27, 6 + o, '#ffaa00');
    }
    return c;
  };
  const frames = [
    draw(0, false, 0), draw(0, false, 0), draw(1, false, 0), draw(1, true, 0), draw(0, false, 0),
    draw(0, false, 1), draw(0, false, 2), draw(0, false, 3), draw(1, false, 2), draw(1, false, 1),
  ];
  await save('black-mage', frames, [300, 300, 300, 150, 300, 120, 120, 250, 120, 300]);
}

async function mushroom() {
  const draw = (dy, squash) => {
    const c = canvas(22, 24);
    const y = 6 + dy;
    const rx = squash ? 10 : 9;
    const ry = squash ? 6 : 7;
    rect(c, 6, y + 5, 10, squash ? 6 : 7, '#f5e6c8');
    ellipse(c, 11, y + 4, rx, ry, '#d82020');
    rect(c, 1, y + 5, 21, 8, null);
    rect(c, 6, y + 5, 10, squash ? 6 : 7, '#f5e6c8');
    ellipse(c, 11, y, 3, 2, '#ffffff');
    ellipse(c, 4, y + 3, 1.5, 1.5, '#ffffff');
    ellipse(c, 18, y + 3, 1.5, 1.5, '#ffffff');
    rect(c, 9, y + 7, 1, 2, '#000000');
    rect(c, 13, y + 7, 1, 2, '#000000');
    outline(c);
    return c;
  };
  const frames = [draw(3, true), draw(1, false), draw(-2, false), draw(-4, false), draw(-2, false), draw(1, false)];
  await save('mushroom', frames, [180, 90, 90, 140, 90, 90]);
}

async function coin() {
  const frames = [7, 5, 3, 1, 3, 5].map((rx) => {
    const c = canvas(18, 20);
    ellipse(c, 9, 10, rx, 8, '#ffcc33');
    if (rx >= 3) ellipse(c, 9, 10, rx - 2, 6, '#e8a800');
    if (rx >= 3) rect(c, 9, 6, 1, 8, '#ffe98a');
    outline(c, '#6b4a00');
    return c;
  });
  await save('coin', frames, 90);
}

async function heart() {
  const draw = (big) => {
    const c = canvas(20, 18);
    const s = big ? 1 : 0;
    ellipse(c, 6, 6, 4 + s, 4 + s, '#e02030');
    ellipse(c, 13, 6, 4 + s, 4 + s, '#e02030');
    poly(c, [[1 - s, 7], [18 + s, 7], [9.5, 16 + s]], '#e02030');
    px(c, 5, 4, '#ffffff');
    px(c, 4, 5, '#ffffff');
    outline(c);
    return c;
  };
  await save('heart', [draw(false), draw(true), draw(false), draw(true), draw(false)], [500, 100, 120, 100, 700]);
}

async function sword() {
  const base = canvas(26, 34);
  ellipse(base, 13, 28, 11, 5, '#8a8a8a');
  ellipse(base, 13, 27, 9, 3, '#a4a4a4');
  rect(base, 12, 10, 3, 16, '#dcdcdc');
  rect(base, 13, 10, 1, 15, '#a0a0b0');
  rect(base, 7, 8, 13, 2, '#3050c0');
  px(base, 13, 8, '#ffdd33');
  rect(base, 12, 3, 3, 5, '#6a3a8a');
  ellipse(base, 13, 2, 1.5, 1.5, '#3050c0');
  outline(base);
  const glint = (c, y) => {
    px(c, 13, y, '#ffffff');
    px(c, 12, y, '#ffffff');
    px(c, 14, y, '#ffffff');
    px(c, 13, y - 1, '#ffffff');
    px(c, 13, y + 1, '#ffffff');
  };
  const star = (c, x, y, big) => {
    px(c, x, y, '#ffffaa');
    if (big) {
      px(c, x - 1, y, '#ffffff');
      px(c, x + 1, y, '#ffffff');
      px(c, x, y - 1, '#ffffff');
      px(c, x, y + 1, '#ffffff');
    }
  };
  const frames = [null, 12, 16, 20, 24, null, 's1', 's2'].map((g) => {
    const f = clone(base);
    if (typeof g === 'number') glint(f, g);
    if (g === 's1') star(f, 20, 5, false);
    if (g === 's2') star(f, 20, 5, true);
    return f;
  });
  await save('sword', frames, [700, 80, 80, 80, 80, 400, 150, 300]);
}

async function barrel() {
  const frames = [0, 2, 4, 6].map((shift) => {
    const c = canvas(22, 22);
    rect(c, 4, 2, 14, 18, '#b0703a');
    rect(c, 3, 4, 16, 14, '#b0703a');
    rect(c, 9, 2, 4, 18, '#c88448');
    for (let k = 0; k < 3; k++) {
      const y = 2 + ((k * 8 + shift) % 18);
      rect(c, 3, y, 16, 2, '#5a3818');
    }
    rect(c, 6, 2, 1, 18, '#8a5428');
    rect(c, 15, 2, 1, 18, '#8a5428');
    outline(c);
    return c;
  });
  await save('barrel', frames, 110);
}

async function bat() {
  const wings = {
    up: [[[12, 8], [2, 1], [4, 7], [8, 9]], [[12, 8], [22, 1], [20, 7], [16, 9]]],
    mid: [[[12, 8], [1, 6], [4, 10], [7, 9], [9, 11]], [[12, 8], [23, 6], [20, 10], [17, 9], [15, 11]]],
    down: [[[12, 7], [2, 13], [4, 16], [7, 13], [9, 15], [11, 10]], [[12, 7], [22, 13], [20, 16], [17, 13], [15, 15], [13, 10]]],
  };
  const draw = (pose, dy) => {
    const c = canvas(26, 18);
    const w = wings[pose].map((p) => p.map(([x, y]) => [x + 1, y + dy]));
    w.forEach((p) => poly(c, p, '#5a3a80'));
    ellipse(c, 13, 8 + dy, 3, 3, '#402060');
    px(c, 11, 4 + dy, '#402060');
    px(c, 15, 4 + dy, '#402060');
    outline(c, '#120818');
    px(c, 12, 8 + dy, '#ff2222');
    px(c, 14, 8 + dy, '#ff2222');
    return c;
  };
  await save('bat', [draw('up', 2), draw('mid', 1), draw('down', 0), draw('mid', 1)], 110);
}

async function candle() {
  const flames = [
    [[6, 5, 2, 3], [6, 6, 1, 2]],
    [[5, 4, 2, 4], [6, 6, 1, 2]],
    [[6, 5, 2, 3], [6, 6, 1, 1]],
    [[7, 4, 2, 4], [6, 6, 1, 2]],
  ];
  const frames = flames.map(([outer, inner]) => {
    const c = canvas(13, 28);
    rect(c, 4, 11, 5, 9, '#f2e6c8');
    rect(c, 7, 11, 1, 3, '#ffffff');
    px(c, 6, 10, '#222222');
    rect(c, 2, 20, 9, 2, '#d4a017');
    rect(c, 3, 22, 7, 1, '#b8860b');
    rect(c, 5, 23, 3, 3, '#d4a017');
    rect(c, 2, 26, 9, 2, '#b8860b');
    outline(c);
    ellipse(c, outer[0], outer[1] + 3, outer[2], outer[3], '#ff7a00');
    ellipse(c, inner[0], inner[1] + 3, inner[2], inner[3], '#ffdd44');
    px(c, 6, 9, '#ffffff');
    return c;
  });
  await save('candle', frames, 120);
}

// ---------------------------------------------------------------------------
// the rest of the internet
// ---------------------------------------------------------------------------

async function globe() {
  const MAP = [
    '................................',
    '......####.......#####..........',
    '....#######....#########........',
    '...########...###########.......',
    '....######.....##########.##....',
    '.....####.......#######...###...',
    '......###.......######.....#....',
    '.......##........####...........',
    '........###......####...........',
    '.........####....#####..........',
    '..........###.....###......##...',
    '..........##......##......####..',
    '..........#........#.......##...',
    '...........#....................',
    '................................',
    '................................',
  ];
  const N = 16;
  const frames = [];
  for (let f = 0; f < N; f++) {
    const c = canvas(26, 26);
    const R = 11.5;
    for (let y = 0; y < 26; y++)
      for (let x = 0; x < 26; x++) {
        const nx = (x - 12.5) / R;
        const ny = (y - 12.5) / R;
        const d = nx * nx + ny * ny;
        if (d > 1) continue;
        const nz = Math.sqrt(1 - d);
        const lon = Math.atan2(nx, nz) + (f / N) * Math.PI * 2;
        const lat = Math.asin(-ny);
        const u = Math.floor((((lon / (Math.PI * 2) + 0.5) % 1) + 1) % 1 * 32);
        const v = Math.min(15, Math.floor((0.5 - lat / Math.PI) * 16));
        const land = MAP[v][u] === '#';
        const dark = nz < 0.45;
        px(c, x, y, land ? (dark ? '#1f7a2e' : '#3cb44b') : dark ? '#1a4aa0' : '#2f74d8');
      }
    px(c, 8, 7, '#bfe0ff');
    px(c, 9, 6, '#bfe0ff');
    outline(c, '#0a1a40');
    frames.push(c);
  }
  await save('globe', frames, 110);
}

async function construction() {
  const draw = (on) => {
    const c = canvas(22, 28);
    rect(c, 10, 4, 2, 6, '#555555');
    poly(c, [[11, 8], [21, 18], [11, 28], [1, 18]], '#ffcc00');
    rect(c, 10, 13, 2, 7, '#000000');
    rect(c, 10, 22, 2, 2, '#000000');
    ellipse(c, 11, 3, 2.5, 2.5, on ? '#ff6600' : '#993300');
    outline(c);
    if (on) {
      px(c, 6, 1, '#ffaa00');
      px(c, 16, 1, '#ffaa00');
      px(c, 5, 4, '#ffaa00');
      px(c, 17, 4, '#ffaa00');
      px(c, 11, 3, '#ffee88');
    }
    return c;
  };
  await save('construction', [draw(true), draw(false)], 400);
}

async function fire() {
  const frames = [];
  for (let f = 0; f < 8; f++) {
    const rand = rng(f * 7919 + 13);
    const c = canvas(18, 24);
    for (let x = 1; x < 17; x++) {
      const center = 1 - Math.abs(x - 8.5) / 8.5;
      const h = Math.round(4 + center * 14 + rand() * 5);
      for (let k = 0; k < h; k++) {
        const t = k / h;
        const col = t < 0.35 ? (center > 0.5 ? '#ffffcc' : '#ffdd33') : t < 0.6 ? '#ffaa00' : t < 0.85 ? '#ff5500' : '#cc2200';
        px(c, x, 23 - k, col);
      }
    }
    frames.push(c);
  }
  await save('fire', frames, 90);
}

console.log('drawing gifs...');
await Promise.all([
  vb6(), crt(), floppy(), cd(), hourglass(), mail(),
  gamepad(), dualpad(), cartridge(),
  blackMage(), mushroom(), coin(), heart(), sword(), barrel(), bat(), candle(),
  globe(), construction(), fire(),
]);
