/**
 * The GIF collection at /gifs.
 *
 * To add one: drop the file in public/gifs/ and add a line below.
 * Found it somewhere? Add `credit` (and `creditUrl`) so people know where it came from.
 * The ones marked `original` were drawn for this site by scripts/make-gifs.mjs.
 */

export type GifCategory = 'computers' | 'consoles' | 'games' | 'web';

export interface Gif {
  file: string;
  title: string;
  alt: string;
  category: GifCategory;
  note?: string;
  credit?: string;
  creditUrl?: string;
  original?: boolean;
}

export const GIF_CATEGORIES: { id: GifCategory; label: string }[] = [
  { id: 'computers', label: 'Computers & Software' },
  { id: 'consoles', label: 'Consoles' },
  { id: 'games', label: 'Games' },
  { id: 'web', label: 'The Old Web' },
];

export const GIFS: Gif[] = [
  // computers
  { file: 'vb6.gif', title: 'Visual Basic 6', note: 'Form1, a dot grid, and a freshly drawn Command1.', alt: 'A Visual Basic 6 form in design mode: a crosshair drags out a new CommandButton labeled COMMAND1.', category: 'computers', original: true },
  { file: 'computer.gif', title: 'Beige PC', note: 'C:\\> RUN', alt: 'A beige computer with a green-text monitor typing RUN at a DOS prompt, then saying HI!!!', category: 'computers', original: true },
  { file: 'floppy.gif', title: '3½" floppy', note: '1.44 MB of storage.', alt: 'A blue 3.5 inch floppy disk whose metal shutter slides open and closed.', category: 'computers', original: true },
  { file: 'cd.gif', title: 'CD-ROM', note: 'Spinning at 52x.', alt: 'A spinning compact disc with a rainbow shine.', category: 'computers', original: true },
  { file: 'hourglass.gif', title: 'Please wait...', alt: 'An hourglass cursor with sand running down, then flipping over.', category: 'computers', original: true },

  // consoles
  { file: 'gamepad.gif', title: '8-bit gamepad', note: 'For Nintendo.', alt: 'A gray rectangular gamepad with a d-pad and two red buttons being pressed.', category: 'consoles', original: true },
  { file: 'dualpad.gif', title: 'Four-button pad', note: 'For PlayStation.', alt: 'A gray gamepad with two grips; four colored face buttons light up one after another.', category: 'consoles', original: true },
  { file: 'cartridge.gif', title: '16-bit cartridge', note: 'For Sega. Blow on it first.', alt: 'A black 16-bit game cartridge with puffs of air blowing on its connector.', category: 'consoles', original: true },

  // games
  { file: 'black-mage.gif', title: 'Little black mage', note: 'For Vivi Ornitier.', alt: 'A small black mage in a big pointy straw hat with glowing yellow eyes, casting a tiny fire spell from his staff.', category: 'games', original: true },
  { file: 'mushroom.gif', title: 'Mushroom', note: 'For Mario.', alt: 'A red mushroom with white spots and little eyes, bouncing.', category: 'games', original: true },
  { file: 'coin.gif', title: 'Coin', note: 'Also for Mario.', alt: 'A spinning gold coin.', category: 'games', original: true },
  { file: 'heart.gif', title: 'Heart', note: 'For Zelda.', alt: 'A red pixel heart pulsing.', category: 'games', original: true },
  { file: 'sword.gif', title: 'Sword in the stone', note: 'Also for Zelda.', alt: 'A sword with a blue hilt stuck in a stone, with a glint running down the blade.', category: 'games', original: true },
  { file: 'barrel.gif', title: 'Barrel', note: 'For Donkey Kong.', alt: 'A wooden barrel rolling.', category: 'games', original: true },
  { file: 'bat.gif', title: 'Bat', note: 'For Castlevania.', alt: 'A purple bat with red eyes flapping its wings.', category: 'games', original: true },
  { file: 'candle.gif', title: 'Wall candle', note: 'Also for Castlevania. Whip it.', alt: 'A candle on a gold holder with a flickering flame.', category: 'games', original: true },

  // the old web
  { file: 'globe.gif', title: 'Spinning globe', note: 'Every homepage had one.', alt: 'A pixel-art Earth spinning.', category: 'web', original: true },
  { file: 'construction.gif', title: 'Under construction', alt: 'A yellow warning sign with a flashing orange light on top.', category: 'web', original: true },
  { file: 'mail.gif', title: "You've got mail", alt: 'An envelope that opens as a letter slides out.', category: 'web', original: true },
  { file: 'fire.gif', title: 'Fire', note: 'The classic.', alt: 'Animated pixel flames.', category: 'web', original: true },
];
