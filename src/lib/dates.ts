const pad = (n: number) => String(n).padStart(2, '0');

/** 09.23.26 — the little stamp used in lists. */
export function stamp(date: Date): string {
  return `${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}.${String(date.getUTCFullYear()).slice(-2)}`;
}

/** 23 September 2026 */
export function longDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** September 2026 */
export function monthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Sep 17, 2026 */
export function shortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
