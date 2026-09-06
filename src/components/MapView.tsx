import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import { MapLibreOverlay, ScatterplotLayer } from 'deck.gl';
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

const COLORS: Record<Category, [number, number, number]> = {
  grocery: [255, 184, 76],
  park: [80, 250, 180],
  transit: [120, 160, 255],
};

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
      antialias: true,
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
        new ScatterplotLayer<Amenity>({
          id: 'amenities',
          data: amenities,
          getPosition: (d) => d.position,
          getFillColor: (d) => COLORS[d.category],
          getRadius: 40,
          radiusMinPixels: 1.5,
          radiusMaxPixels: 6,
          opacity: 0.85,
        }),
      ],
    });
  }, [amenities]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}