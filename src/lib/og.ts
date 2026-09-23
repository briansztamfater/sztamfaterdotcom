/**
 * Social preview images (Open Graph), drawn at build time.
 *
 * Text is converted to vector paths from font files in node_modules, so the
 * result doesn't depend on whatever fonts the build machine has installed.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import opentype, { type Font } from 'opentype.js';
import sharp, { type OverlayOptions } from 'sharp';
import { SITE } from '../site.config';
import { SPRITES } from './sprites';

import { OG_WIDTH, OG_HEIGHT } from './seo';

const root = process.cwd();

function loadFont(path: string): Font {
  const buf = readFileSync(join(root, 'node_modules', path));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
}

const fonts = {
  bold: loadFont('@fontsource/dejavu-sans/files/dejavu-sans-latin-700-normal.woff'),
  regular: loadFont('@fontsource/dejavu-sans/files/dejavu-sans-latin-400-normal.woff'),
  pixel: loadFont('@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff'),
};

/** Lay out a single line glyph by glyph (with kerning) and return its SVG path + width. */
function textPath(font: Font, text: string, x: number, y: number, size: number, tracking = 0) {
  const scale = size / font.unitsPerEm;
  let cx = x;
  let d = '';
  let prev: ReturnType<Font['charToGlyph']> | null = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) cx += font.getKerningValue(prev, g) * scale;
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * scale + tracking;
    prev = g;
  }
  return { d, width: cx - x - tracking };
}

const measure = (font: Font, text: string, size: number, tracking = 0) => textPath(font, text, 0, 0, size, tracking).width;

/** Greedy word wrap. Adds an ellipsis if it runs past maxLines. */
function wrap(font: Font, text: string, size: number, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (measure(font, next, size) <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(font, `${last}…`, size) > maxWidth) last = last.replace(/\s*\S+$/, '');
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function spriteRects(rows: string[], ox: number, oy: number, s: number) {
  const colors: Record<string, string> = { '#': '#000000', o: '#cc0000', k: '#000000', y: '#ffcc00', r: '#cc0000', w: '#ffffff' };
  return rows
    .flatMap((row, y) =>
      [...row].map((c, x) =>
        colors[c] ? `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${colors[c]}"/>` : '',
      ),
    )
    .join('');
}

export interface OgInput {
  /** Small red label above the title, e.g. "THOUGHTS · 09.23.26". */
  kicker?: string;
  title: string;
  /** One or two lines under the title. */
  subtitle?: string;
  /** Tags or similar, bottom right. */
  footnote?: string;
  /** Which nav button looks "pressed". */
  section?: 'home' | 'thoughts' | 'now' | 'gifs' | 'about';
  /** A GIF from public/gifs to use as decoration (its first frame). */
  sprite?: string;
  titleColor?: string;
}

export async function renderOg(input: OgInput): Promise<Buffer> {
  const W = OG_WIDTH;
  const H = OG_HEIGHT;
  const X = 64;
  const parts: string[] = [];

  // --- header band -------------------------------------------------------
  parts.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  parts.push(`<defs><pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
    <path d="M12 0H0V12" fill="none" stroke="#bbbb99" stroke-opacity="0.35" stroke-width="1"/></pattern></defs>`);
  parts.push(`<rect width="${W}" height="176" fill="#eeeecc"/><rect width="${W}" height="176" fill="url(#grid)"/>`);
  parts.push(spriteRects(SPRITES.computer, X, 36, 8));

  const logo = textPath(fonts.pixel, SITE.domain.toUpperCase(), 186, 104, 62, 2);
  for (let k = 6; k >= 1; k--)
    parts.push(`<path d="${textPath(fonts.pixel, SITE.domain.toUpperCase(), 186 + k, 104 + k, 62, 2).d}" fill="${k === 6 ? '#000000' : '#cc0000'}"/>`);
  parts.push(`<path d="${logo.d}" fill="#ffcc00" stroke="#000000" stroke-width="5" paint-order="stroke" stroke-linejoin="miter"/>`);
  parts.push(`<path d="${textPath(fonts.bold, "the internet's #1 source of brian sztamfater since 1991", 188, 146, 19).d}" fill="#555577"/>`);

  // --- nav buttons -------------------------------------------------------
  parts.push(`<rect y="176" width="${W}" height="50" fill="#bbbb99"/>`);
  let bx = X - 8;
  for (const label of ['home', 'thoughts', 'now', 'gifs', 'about'] as const) {
    const text = label.toUpperCase();
    const tw = measure(fonts.bold, text, 15, 1);
    const bw = tw + 32;
    const on = input.section === label;
    const [light, dark] = on ? ['#808080', '#ffffff'] : ['#ffffff', '#808080'];
    parts.push(`<rect x="${bx}" y="186" width="${bw}" height="30" fill="${on ? '#d4d4d4' : '#e8e8e8'}"/>`);
    parts.push(`<path d="M${bx} ${216}V186H${bx + bw}" fill="none" stroke="${light}" stroke-width="3"/>`);
    parts.push(`<path d="M${bx + bw} 186V216H${bx}" fill="none" stroke="${dark}" stroke-width="3"/>`);
    parts.push(`<path d="${textPath(fonts.bold, text, bx + 16, 207, 15, 1).d}" fill="${on ? '#cc0000' : '#000000'}"/>`);
    bx += bw + 10;
  }

  // --- content -----------------------------------------------------------
  const spriteBox = input.sprite ? 190 : 0;
  const maxW = W - X * 2 - spriteBox;
  let y = 290;

  if (input.kicker) {
    parts.push(`<path d="${textPath(fonts.bold, input.kicker.toUpperCase(), X, y, 22, 2).d}" fill="#cc0000"/>`);
    y += 26;
  }

  let size = input.subtitle ? 56 : 62;
  let lines = wrap(fonts.bold, input.title, size, maxW, 3);
  while (size > 40 && (lines.length > (input.subtitle ? 2 : 3) || lines.some((l) => measure(fonts.bold, l, size) > maxW))) {
    size -= 4;
    lines = wrap(fonts.bold, input.title, size, maxW, 3);
  }
  const lh = Math.round(size * 1.18);
  y += lh - 8;
  for (const line of lines) {
    parts.push(`<path d="${textPath(fonts.bold, line, X, y, size).d}" fill="${input.titleColor ?? '#000000'}"/>`);
    y += lh;
  }

  if (input.subtitle) {
    y += 4;
    // only as many lines as fit above the footer rule
    const room = Math.max(1, Math.min(2, Math.floor((556 - y) / 38) + 1));
    for (const line of wrap(fonts.regular, input.subtitle, 26, maxW, room)) {
      parts.push(`<path d="${textPath(fonts.regular, line, X, y, 26).d}" fill="#444444"/>`);
      y += 38;
    }
  }

  // --- footer ------------------------------------------------------------
  parts.push(`<line x1="${X}" y1="570" x2="${W - X}" y2="570" stroke="#999999" stroke-width="2" stroke-dasharray="2 5"/>`);
  parts.push(`<path d="${textPath(fonts.bold, `${SITE.name} · ${SITE.basedIn}`, X, 604, 20).d}" fill="#000090"/>`);
  if (input.footnote) {
    const fw = measure(fonts.regular, input.footnote, 20);
    parts.push(`<path d="${textPath(fonts.regular, input.footnote, W - X - fw, 604, 20).d}" fill="#266666"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="geometricPrecision"><title>${esc(input.title)}</title>${parts.join('')}</svg>`;

  const composites: OverlayOptions[] = [];
  if (input.sprite) {
    const file = join(root, 'public', 'gifs', input.sprite);
    const meta = await sharp(file, { animated: true }).metadata();
    const w = meta.width ?? 32;
    const h = meta.pageHeight ?? meta.height ?? 32;
    const scale = Math.max(2, Math.floor(Math.min(170 / w, 250 / h)));
    const frame = await sharp(file, { page: 0 }).resize(w * scale, h * scale, { kernel: 'nearest' }).png().toBuffer();
    composites.push({ input: frame, left: W - X - w * scale, top: Math.max(250, 548 - h * scale) });
  }

  return sharp(Buffer.from(svg)).composite(composites).png({ compressionLevel: 9, palette: true }).toBuffer();
}
