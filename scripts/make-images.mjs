/**
 * Regenerates the favicons (svg, ico, touch + manifest icons) and the cursors in public/cursors/.
 * Run with: node scripts/make-images.mjs
 *
 * (Social preview images are generated at build time by src/pages/og/.)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const KHAKI = '#eeeecc';
const INK = '#000000';
const RED = '#cc0000';

// same little computer as src/lib/sprites.ts
const computer = [
  '.##########.',
  '#..........#',
  '#.########.#',
  '#.#......#.#',
  '#.#.o..o.#.#',
  '#.#......#.#',
  '#.#.o..o.#.#',
  '#.#..oo..#.#',
  '#.########.#',
  '#..........#',
  '.##########.',
  '....####....',
  '..########..',
];

const rects = (sprite, ox, oy, s) =>
  sprite
    .flatMap((row, y) =>
      [...row].map((c, x) =>
        c === '#' || c === 'o'
          ? `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${c === 'o' ? RED : INK}"/>`
          : '',
      ),
    )
    .join('');

// favicon: 16x16 grid, khaki like the site header
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
<rect width="16" height="16" fill="${KHAKI}"/>${rects(computer, 2, 1, 1)}
</svg>
`;
await writeFile('public/favicon.svg', favicon);

// apple touch icon: same thing, 180x180, with a little breathing room
const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" shape-rendering="crispEdges">
<rect width="18" height="18" fill="${KHAKI}"/>${rects(computer, 3, 2, 1)}
</svg>`;
await sharp(Buffer.from(touch), { density: 1200 })
  .resize(180, 180, { kernel: 'nearest' })
  .png()
  .toFile('public/apple-touch-icon.png');

// square pixel icon at any size (whole-pixel scaling, so it stays crisp)
const icon = (size) =>
  sharp(Buffer.from(touch), { density: 72 * Math.ceil(size / 18) * 4 })
    .resize(size, size, { kernel: 'nearest' })
    .png()
    .toBuffer();

// favicon.ico: 16, 32 and 48 px PNGs inside an .ico container (browsers and crawlers still ask for it)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((n) => sharp(Buffer.from(favicon), { density: 72 * 16 }).resize(n, n, { kernel: 'nearest' }).png().toBuffer()));
const dir = Buffer.alloc(6 + 16 * sizes.length);
dir.writeUInt16LE(0, 0);
dir.writeUInt16LE(1, 2);
dir.writeUInt16LE(sizes.length, 4);
let offset = dir.length;
sizes.forEach((n, i) => {
  const e = 6 + i * 16;
  dir.writeUInt8(n, e);
  dir.writeUInt8(n, e + 1);
  dir.writeUInt16LE(1, e + 4);
  dir.writeUInt16LE(32, e + 6);
  dir.writeUInt32LE(pngs[i].length, e + 8);
  dir.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile('public/favicon.ico', Buffer.concat([dir, ...pngs]));

// web app manifest icons
await writeFile('public/icon-192.png', await icon(192));
await writeFile('public/icon-512.png', await icon(512));

// cursors: the classic arrow and the white-glove pointing hand, at 1x and 2x
const CURSORS = {
  arrow: [
    'k..........',
    'kk.........',
    'kwk........',
    'kwwk.......',
    'kwwwk......',
    'kwwwwk.....',
    'kwwwwwk....',
    'kwwwwwwk...',
    'kwwwwwwwk..',
    'kwwwwwwwwk.',
    'kwwwwwkkkkk',
    'kwwkwwk....',
    'kwk.kwwk...',
    'kk..kwwk...',
    'k....kwwk..',
    '.....kwwk..',
    '......kwwk.',
    '......kwwk.',
    '.......kk..',
  ],
  hand: [
    '.....kk..........',
    '....kwwk.........',
    '....kwwk.........',
    '....kwwk.........',
    '....kwwk.........',
    '....kwwkkk.......',
    '....kwwkwwkkk....',
    '....kwwkwwkwwkk..',
    '.kk.kwwkwwkwwkwk.',
    'kwwkkwwwwwwwwkwwk',
    'kwwwkwwwwwwwwwwwk',
    '.kwwkwwwwwwwwwwwk',
    '..kwwwwwwwwwwwwwk',
    '..kwwwwwwwwwwwwk.',
    '...kwwwwwwwwwwwk.',
    '...kwwwwwwwwwwk..',
    '....kwwwwwwwwwk..',
    '....kwwwwwwwwk...',
    '.....kwwwwwwwk...',
    '.....kkkkkkkkk...',
  ],
};
await mkdir('public/cursors', { recursive: true });
for (const [name, rows] of Object.entries(CURSORS)) {
  const w = rows[0].length;
  const h = rows.length;
  const cells = rows
    .flatMap((row, y) =>
      [...row].map((c, x) =>
        c === '.' ? '' : `<rect x="${x}" y="${y}" width="1" height="1" fill="${c === 'k' ? '#000000' : '#ffffff'}"/>`,
      ),
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${cells}</svg>`;
  for (const scale of [1, 2]) {
    await sharp(Buffer.from(svg), { density: 72 * scale * 4 })
      .resize(w * scale, h * scale, { kernel: 'nearest' })
      .png()
      .toFile(`public/cursors/${name}${scale === 2 ? '@2x' : ''}.png`);
  }
}

console.log('wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, cursors/');
