import { writeFile, mkdir } from 'node:fs/promises';
import { area as turfArea, polygon as turfPolygon, centroid } from '@turf/turf';

const BBOX = '37.70,-122.52,37.84,-122.35';
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

const CATEGORIES = {
  grocery: { filter: '"shop"~"^(supermarket|grocery|convenience)$"', geom: false },
  park: { filter: '"leisure"~"^(park|garden)$"', geom: true },
  transit: {
    filter: '"highway"="bus_stop"',
    geom: false,
    extra: [
      '"railway"~"^(station|tram_stop|halt)$"',
      '"station"="subway"',
      '"amenity"="ferry_terminal"',
    ],
  },
};

async function fetchCategory(name, config) {
  const filters = [config.filter, ...(config.extra ?? [])];
  const body = filters.map((f) => `nwr[${f}](${BBOX});`).join('');
  const out = config.geom ? 'out geom;' : 'out center;';
  const query = `[out:json][timeout:120];(${body});${out}`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`Fetching ${name} (attempt ${attempt})...`);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'sp01-hex-grid/1.0 (portfolio project)',
        Accept: 'application/json',
      },
      body: 'data=' + encodeURIComponent(query),
    });

    if (res.ok) {
      const json = await res.json();
      return json.elements;
    }

    if (res.status === 429) {
      const wait = attempt * 15000;
      console.log(`  rate limited, waiting ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    const body = await res.text();
    console.error(body.slice(0, 500));
    throw new Error(`${name} failed: ${res.status}`);
  }

  throw new Error(`${name} failed after retries`);
}

function toGeoJSON(elements, category) {
  const features = [];

  for (const el of elements) {
    let lon = el.lon ?? el.center?.lon;
    let lat = el.lat ?? el.center?.lat;
    let areaM2 = 0;

    if (el.geometry && el.geometry.length > 3) {
      const ring = el.geometry.map((p) => [p.lon, p.lat]);
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

      try {
        const poly = turfPolygon([ring]);
        areaM2 = turfArea(poly);
        const c = centroid(poly).geometry.coordinates;
        lon = c[0];
        lat = c[1];
      } catch {
        continue;
      }
    }

    if (lon === undefined || lat === undefined) continue;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        id: el.id,
        category,
        name: el.tags?.name ?? null,
        area: Math.round(areaM2),
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

async function main() {
  await mkdir('public/data', { recursive: true });

  for (const [name, config] of Object.entries(CATEGORIES)) {
    const elements = await fetchCategory(name, config);
    const geojson = toGeoJSON(elements, name);

    await writeFile(
      `public/data/${name}.geojson`,
      JSON.stringify(geojson)
    );

    console.log(`  ${name}: ${geojson.features.length} features`);

    if (name === 'park') {
      const withArea = geojson.features.filter((f) => f.properties.area > 0);
      const total = withArea.reduce((s, f) => s + f.properties.area, 0);
      console.log(`  park polygons: ${withArea.length} | total km²: ${(total / 1e6).toFixed(1)}`);
    }

    await new Promise((r) => setTimeout(r, 10000));
  }
  }

  console.log('Done.');


main().catch((err) => {
  console.error(err);
  process.exit(1);
});