import type { Category } from '../types';

export type Counts = Record<Category, number>;

const SATURATION: Record<Category, number> = {
  grocery: 40,
  park: 20,
  transit: 130,
};

export function scoreCounts(counts: Counts): number {
  const categories = Object.keys(SATURATION) as Category[];

  let total = 0;
  for (const category of categories) {
    total += Math.min(counts[category] / SATURATION[category], 1);
  }

  return (total / categories.length) * 100;
}