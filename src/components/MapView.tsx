import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import { MapLibreOverlay, HexagonLayer } from 'deck.gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const KEY = import.meta.env.VITE_MAPTILER_KEY;
const STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`;

type Category = 'grocery' | 'park' | 'transit';

type Amenity = {
  position: [number, number];
  category: Category;
  name: string | null;
};

const CATEGORIES: Category[] = ['grocery', 'park', 'transit'];

const COLOR_RANGE: [number, number, number][] = [
  [38, 22, 74],
  [68, 40, 130],
  [104, 62, 178],
  [126, 106, 218],
  [110, 176, 232],
  [103, 232, 249],
];

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

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE,
      center: [-122.4194, 37.7749],
      zoom: 11.5,
      pitch: 45,
      bearing: -17.6,
      canvasContextAttributes: { antialias: true },
    });

    const overlay = new MapLibreOverlay({ layers: [] });
    map.addControl(overlay);

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
    if (!overlayRef.current || amenities.length === 0) return;

    overlayRef.current.setProps({
      layers: [
        new HexagonLayer<Amenity>({
          id: 'hexes',
          data: amenities,
          getPosition: (d) => d.position,
          radius: 200,
          coverage: 0.88,
          extruded: true,
          elevationScale: 1,
          elevationRange: [0, 900],
          colorRange: COLOR_RANGE,
          colorScaleType: 'quantile',
          upperPercentile: 99,
          elevationUpperPercentile: 99,
          opacity: 0.75,
          material: false,
          pickable: true,
        }),
      ],
    });
  }, [amenities]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}