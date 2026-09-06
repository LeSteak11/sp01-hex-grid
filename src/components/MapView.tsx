import { useEffect, useRef } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const KEY = import.meta.env.VITE_MAPTILER_KEY;
const STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`;

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

      mapRef.current = new MapLibreMap({
      container: containerRef.current,
      style: STYLE,
      center: [-122.4194, 37.7749],
      zoom: 11.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}