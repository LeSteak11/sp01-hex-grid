export const COLOR_RANGE: [number, number, number][] = [
  [38, 22, 74],
  [68, 40, 130],
  [104, 62, 178],
  [126, 106, 218],
  [110, 176, 232],
  [103, 232, 249],
];

export function colorForScore(score: number): [number, number, number] {
  const i = Math.min(
    COLOR_RANGE.length - 1,
    Math.floor((score / 100) * COLOR_RANGE.length)
  );
  return COLOR_RANGE[i];
}

export function toCss(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}