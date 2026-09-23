/**
 * The /now page. Update this by hand whenever life changes.
 *
 * - Set `value` to null for things you haven't decided to share yet;
 *   they render as a quiet "…".
 * - `onHome: true` also shows the row in the homepage's NOW box.
 * - Bump `updated` every time you edit this file.
 */

export interface NowItem {
  label: string;
  value: string | null;
  /** Optional longer line, shown on /now only. */
  note?: string;
  href?: string;
  onHome?: boolean;
}

export const NOW: { updated: Date; items: NowItem[] } = {
  updated: new Date('2026-09-23'),
  items: [
    {
      label: 'Building',
      value: 'Moby',
      note: 'A trading app that tracks smart money on Solana, Robinhood Chain, Base and BNB Chain.',
      onHome: true,
    },
    {
      label: 'Thinking about',
      value: 'AI-native software',
      note: 'and what happens when building becomes cheap.',
      onHome: true,
    },
    { label: 'Playing', value: 'Final Fantasy IX', note: 'Whenever I have spare time, lol.', onHome: true },
    { label: 'Reading', value: 'Crónicas del Ángel Gris', note: 'by Alejandro Dolina.', onHome: true },
    {
      label: 'Experimenting with',
      value: 'Autonomous software companies',
      note: 'fully managed by AI agents.',
    },
    { label: 'Based in', value: 'Buenos Aires, Argentina', onHome: true },
  ],
};
