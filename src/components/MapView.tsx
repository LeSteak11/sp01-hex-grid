import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import { MapLibreOverlay, ColumnLayer } from 'deck.gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, MultiPolygon } from 'geojson';
import type { Amenity, Category } from '../types';
import { buildGrid, type HexCell } from '../lib/grid';
import { colorForScore } from '../lib/color';
import Tooltip from './Tooltip';
import Legend from './Legend';
import Header from './Header';
import About from './About';

const KEY = import.meta.env.VITE_MAPTILER_KEY;
const STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`;

const CATEGORIES: Category[] = ['grocery', 'park', 'transit'];

type Cell = HexCell & { wave: number };

const SPREAD = 0.55;

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function reveal(progress: number, wave: number): number {
  const local = progress * (1 + SPREAD) - wave * SPREAD;
  return easeOutCubic(Math.max(0, Math.min(1, local)));
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
        area: f.properties.area ?? 0,
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
  const [cells, setCells] = useState<Cell[]>([]);
  const [progress, setProgress] = useState(0);
  const [hover, setHover] = useState<{ cell: HexCell | null; x: number; y: number }>({
    cell: null,
    x: 0,
    y: 0,
  });

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

    const built = buildGrid(amenities, boundary);

    const lons = built.map((c) => c.position[0]);
    const minLon = Math.min(...lons);
    const span = Math.max(...lons) - minLon;

    setCells(
      built.map((c) => ({ ...c, wave: (c.position[0] - minLon) / span }))
    );
  }, [amenities, boundary]);

  useEffect(() => {
    if (cells.length === 0) return;

    const DURATION = 1600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cells]);

  useEffect(() => {
    if (!overlayRef.current || cells.length === 0) return;

    overlayRef.current.setProps({
      layers: [
        new ColumnLayer<Cell>({
          id: 'hexes',
          data: cells,
          diskResolution: 6,
          radius: 200,
          angle: 90,
          coverage: 0.82,
          extruded: true,
          getPosition: (d) => d.position,
          getFillColor: (d) => colorForScore(d.score),
          getElevation: (d) => d.score * 22 * reveal(progress, d.wave),
          opacity: 0.92,
          material: false,
          pickable: true,
          updateTriggers: { getElevation: progress },
          onHover: (info) => {
            setHover({
              cell: (info.object as HexCell) ?? null,
              x: info.x,
              y: info.y,
            });
          },
        }),
      ],
    });
  }, [cells, progress]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <Header />
      <Legend />
      <About />
      <Tooltip cell={hover.cell} x={hover.x} y={hover.y} />
    </>
  );
}