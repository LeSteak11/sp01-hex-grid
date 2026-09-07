import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import { MapLibreOverlay, ColumnLayer } from 'deck.gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, MultiPolygon } from 'geojson';
import type { Amenity, Category } from '../types';
import { buildGrid, type HexCell } from '../lib/grid';

const KEY = import.meta.env.VITE_MAPTILER_KEY;
const STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`;

const CATEGORIES: Category[] = ['grocery', 'park', 'transit'];

const COLOR_RANGE: [number, number, number][] = [
  [38, 22, 74],
  [68, 40, 130],
  [104, 62, 178],
  [126, 106, 218],
  [110, 176, 232],
  [103, 232, 249],
];

function colorForScore(score: number): [number, number, number] {
  const i = Math.min(
    COLOR_RANGE.length - 1,
    Math.floor((score / 100) * COLOR_RANGE.length)
  );
  return COLOR_RANGE[i];
}

async function loadAmenities(): Promise<Amenity[]> {
  const groups = await Promise.all(
    CATEGORIES.map(async (category) => {
      const res = await fetch(`/data/${category}.geojson`);
      const json = await res.json();

      return json.features.map((f: any) => ({
        position: f.geometry.coordinates as [number, number],
        category,
        name: f.properties.name,
      }));
    })
  );

  return groups.flat();
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapLibreOverlay | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [boundary, setBoundary] = useState<Feature<MultiPolygon> | null>(null);
  const [cells, setCells] = useState<HexCell[]>([]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE,
      center: [-122.4194, 37.7749],
      zoom: 11.5,
      pitch: 52,
      bearing: -17.6,
      canvasContextAttributes: { antialias: true },
    });

    const overlay = new MapLibreOverlay({ layers: [] });
    map.addControl(overlay);

    map.on('load', () => {
      for (const layer of map.getStyle().layers) {
        if (layer.type !== 'symbol') continue;
        try {
          map.setPaintProperty(layer.id, 'text-opacity', 0.32);
          map.setPaintProperty(layer.id, 'icon-opacity', 0.2);
        } catch {
          // layer has no text/icon paint props
        }
      }
    });

    mapRef.current = map;
    overlayRef.current = overlay;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    loadAmenities().then(setAmenities).catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/data/boundary.geojson')
      .then((r) => r.json())
      .then(setBoundary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (amenities.length === 0 || !boundary) return;

    const t = performance.now();
    const built = buildGrid(amenities, boundary);
    const scores = built.map((c) => c.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    console.log(
      `cells: ${built.length}`,
      `| ${Math.round(performance.now() - t)}ms`,
      `| min ${Math.min(...scores).toFixed(1)}`,
      `| max ${Math.max(...scores).toFixed(1)}`,
      `| mean ${mean.toFixed(1)}`
    );

    setCells(built);
  }, [amenities, boundary]);

  useEffect(() => {
    if (!overlayRef.current || cells.length === 0) return;

    overlayRef.current.setProps({
      layers: [
        new ColumnLayer<HexCell>({
          id: 'hexes',
          data: cells,
          diskResolution: 6,
          radius: 200,
          angle: 90,
          coverage: 0.82,
          extruded: true,
          getPosition: (d) => d.position,
          getFillColor: (d) => colorForScore(d.score),
          getElevation: (d) => d.score * 22,
          opacity: 0.92,
          material: false,
          pickable: true,
        }),
      ],
    });
  }, [cells]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}