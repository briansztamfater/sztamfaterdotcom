/**
 * Regenerates public/favicon.svg and public/apple-touch-icon.png.
 * Run with: node scripts/make-images.mjs
 *
 * (Social preview images are generated at build time by src/pages/og/.)
 */
import { writeFile } from 'node:fs/promises';
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

console.log('wrote favicon.svg, apple-touch-icon.png');
