export const COLOR_RANGE: [number, number, number][] = [
  [38, 22, 74],
  [68, 40, 130],
  [104, 62, 178],
  [126, 106, 218],
  [110, 176, 232],
  [103, 232, 249],
];

export function colorForScore(score: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, score / 100));
  const scaled = t * (COLOR_RANGE.length - 1);
  const i = Math.min(COLOR_RANGE.length - 2, Math.floor(scaled));
  const f = scaled - i;

  const a = COLOR_RANGE[i];
  const b = COLOR_RANGE[i + 1];

  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export function toCss(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export const RAMP_CSS = `linear-gradient(90deg, ${COLOR_RANGE.map(toCss).join(', ')})`;
