import { statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { GIFS, type Gif } from '../data/gifs';

export interface GifWithMeta extends Gif {
  src: string;
  w: number;
  h: number;
  /** Integer upscale for crisp pixel art; big GIFs stay at 1x. */
  scale: number;
  frames: number;
  kb: string;
}

const dir = join(process.cwd(), 'public', 'gifs');

/** Every GIF in src/data/gifs.ts, with its real size and dimensions read at build time. */
export async function getGifs(): Promise<GifWithMeta[]> {
  return Promise.all(
    GIFS.map(async (g) => {
      const path = join(dir, g.file);
      const meta = await sharp(path, { animated: true }).metadata();
      const w = meta.width ?? 32;
      const h = meta.pageHeight ?? meta.height ?? 32;
      return {
        ...g,
        src: `/gifs/${g.file}`,
        w,
        h,
        scale: Math.max(1, Math.min(4, Math.round(110 / Math.max(w, h)))),
        frames: meta.pages ?? 1,
        kb: (statSync(path).size / 1024).toFixed(1),
      };
    }),
  );
}
