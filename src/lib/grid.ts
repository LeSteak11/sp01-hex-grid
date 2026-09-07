import { hexGrid } from '@turf/turf';
import type { Amenity } from '../types';
import { scoreCounts, type Counts } from './score';

const BBOX: [number, number, number, number] = [-122.52, 37.7, -122.35, 37.84];
const CELL_SIDE_KM = 0.2;
const RADIUS_M = 1200;

const ORIGIN_LAT = 37.77;
const LAT_TO_M = 111320;
const LON_TO_M = Math.cos((ORIGIN_LAT * Math.PI) / 180) * 111320;

export type HexCell = {
  position: [number, number];
  counts: Counts;
  score: number;
};

export function buildGrid(amenities: Amenity[]): HexCell[] {
  const grid = hexGrid(BBOX, CELL_SIDE_KM, { units: 'kilometers' });

  const points = amenities.map((a) => ({
    x: a.position[0] * LON_TO_M,
    y: a.position[1] * LAT_TO_M,
    category: a.category,
  }));

  const radiusSq = RADIUS_M * RADIUS_M;
  const cells: HexCell[] = [];

  for (const feature of grid.features) {
    const ring = feature.geometry.coordinates[0];

    let lon = 0;
    let lat = 0;
    for (let i = 0; i < 6; i++) {
      lon += ring[i][0];
      lat += ring[i][1];
    }
    lon /= 6;
    lat /= 6;

    const cx = lon * LON_TO_M;
    const cy = lat * LAT_TO_M;

    const counts: Counts = { grocery: 0, park: 0, transit: 0 };
    let found = false;

    for (const p of points) {
      const dx = p.x - cx;
      const dy = p.y - cy;

      if (dx * dx + dy * dy <= radiusSq) {
        counts[p.category]++;
        found = true;
      }
    }

    if (!found) continue;

    cells.push({ position: [lon, lat], counts, score: scoreCounts(counts) });
  }

  return cells;
}