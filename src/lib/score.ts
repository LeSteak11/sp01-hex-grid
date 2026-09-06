import type { Amenity, Category } from '../types';

const SATURATION: Record<Category, number> = {
  grocery: 3,
  park: 4,
  transit: 12,
};

export function scoreBin(points: Amenity[]): number {
  const counts: Record<Category, number> = { grocery: 0, park: 0, transit: 0 };

  for (const p of points) {
    counts[p.category]++;
  }

  const categories = Object.keys(SATURATION) as Category[];

  let total = 0;
  for (const category of categories) {
    total += Math.min(counts[category] / SATURATION[category], 1);
  }

  return (total / categories.length) * 100;
}