/**
 * Tiny pixel sprites. Rendered as SVG rects by <Pixel />, so they stay crisp at any size.
 * Each character is one pixel; see PALETTE for colors. '.' = empty.
 */
export const PALETTE: Record<string, string> = {
  '#': 'currentColor',
  o: 'var(--accent)',
  k: '#000000',
  y: '#ffcc00',
  w: '#ffffff',
  r: '#cc0000',
};

export const SPRITES = {
  computer: [
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
  ],
  sparkle: [
    '...o...',
    '...o...',
    '..ooo..',
    'ooooooo',
    '..ooo..',
    '...o...',
    '...o...',
  ],
  hand: [
    '....##......',
    '...#..#.....',
    '...#..######',
    '.###..#....#',
    '#..#..#.####',
    '#......#...#',
    '#.......####',
    '#.........#.',
    '.#......##..',
    '..######....',
  ],
  heart: [
    '.oo.oo.',
    'ooooooo',
    'ooooooo',
    '.ooooo.',
    '..ooo..',
    '...o...',
  ],
  construction: [
    '.....k.....',
    '....kyk....',
    '...kyyyk...',
    '..kyykyyk..',
    '.kyyykyyyk.',
    'kyyyykyyyyk',
    '.kyyyyyyyk.',
    '..kyykyyk..',
    '...kyyyk...',
    '....kyk....',
    '.....k.....',
  ],
} satisfies Record<string, string[]>;

export type SpriteName = keyof typeof SPRITES;
