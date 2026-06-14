export type Rgb = [number, number, number];

/** Parse a #rgb / #rrggbb (with or without leading #) into [r,g,b], or null. */
export function parseHex(hex: string): Rgb | null {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance of an sRGB color. */
function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Choose 'black' or 'white' text for the best contrast on the given background. */
export function pickTextColor(bgHex: string): 'black' | 'white' {
  const rgb = parseHex(bgHex);
  if (!rgb) return 'black';
  const L = relativeLuminance(rgb);
  const contrastWithWhite = 1.05 / (L + 0.05);
  const contrastWithBlack = (L + 0.05) / 0.05;
  return contrastWithBlack >= contrastWithWhite ? 'black' : 'white';
}

/**
 * Resolve a case's background + text color.
 * - bg defaults to white when unset.
 * - fg, when omitted, is auto-computed from the background for best contrast;
 *   an explicit 'black' | 'white' overrides the auto pick.
 */
export function resolveCaseColors(
  bg?: string,
  fg?: 'black' | 'white',
): { bg: string; fg: string } {
  const background = bg ?? '#ffffff';
  const choice = fg ?? pickTextColor(background);
  return { bg: background, fg: choice === 'white' ? '#ffffff' : '#000000' };
}
