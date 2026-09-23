/**
 * Regenerates public/favicon.svg, public/apple-touch-icon.png and public/og.png.
 * Run with: node scripts/make-images.mjs
 *
 * Text in the OG image uses whatever serif/mono fonts your system has, so
 * results vary a little between machines. That's fine.
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const PAPER = '#ffffff';
const INK = '#000000';
const NAVY = '#cc0000';
const ACCENT = '#cc0000';
const MARK = '#ffff00';

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
          ? `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${c === 'o' ? ACCENT : INK}"/>`
          : '',
      ),
    )
    .join('');

// favicon: 16x16 grid, sprite centred
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
<rect width="16" height="16" fill="${PAPER}"/>${rects(computer, 2, 1.5, 1)}
</svg>
`;
await writeFile('public/favicon.svg', favicon);

await sharp(Buffer.from(favicon), { density: 1200 })
  .resize(180, 180, { kernel: 'nearest' })
  .png()
  .toFile('public/apple-touch-icon.png');

// og image: 1200x630
const dots = `<pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="${INK}" fill-opacity="0"/></pattern>`;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>${dots}</defs>
<rect width="1200" height="630" fill="${PAPER}"/>
<rect width="1200" height="630" fill="url(#p)"/>
<g shape-rendering="crispEdges">${rects(computer, 80, 70, 8)}</g>
<text x="200" y="118" font-family="DejaVu Sans Mono, monospace" font-size="26" letter-spacing="3" fill="${INK}">SZTAMFATER.COM</text>
<text x="80" y="330" font-family="DejaVu Sans, Verdana, sans-serif" font-size="104" font-weight="700" fill="${NAVY}" letter-spacing="-3">Brian</text>
<rect x="150" y="392" width="645" height="34" fill="${MARK}"/>
<text x="150" y="425" font-family="DejaVu Sans, Verdana, sans-serif" font-size="104" font-style="italic" fill="${NAVY}" letter-spacing="-3">Sztamfater</text>
<text x="80" y="520" font-family="DejaVu Sans, Verdana, sans-serif" font-size="27" fill="#57524a">I build things, think about things, and occasionally get obsessed with them.</text>
<line x1="80" y1="560" x2="1120" y2="560" stroke="${INK}" stroke-width="2"/>
<rect x="1106" y="70" width="14" height="28" fill="${ACCENT}"/>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9, palette: true }).toFile('public/og.png');

console.log('wrote favicon.svg, apple-touch-icon.png, og.png');
