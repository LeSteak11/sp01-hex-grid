import type { Category } from '../types';

export type Counts = Record<Category, number>;

const SATURATION = {
  grocery: 20,
  parkArea: 400_000,
  transit: 145,
};

export function scoreCounts(counts: Counts, parkArea: number): number {
  const parts = [
    Math.min(counts.grocery / SATURATION.grocery, 1),
    Math.min(parkArea / SATURATION.parkArea, 1),
    Math.min(counts.transit / SATURATION.transit, 1),
  ];

  return (parts.reduce((a, b) => a + b, 0) / parts.length) * 100;
}