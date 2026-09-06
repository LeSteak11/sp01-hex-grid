import { writeFile, mkdir } from 'node:fs/promises';

const BBOX = '37.70,-122.52,37.84,-122.35';
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

const CATEGORIES = {
  grocery: '"shop"~"^(supermarket|grocery|convenience)$"',
  park: '"leisure"~"^(park|garden)$"',
  transit: '"highway"="bus_stop"',
};

async function fetchCategory(name, filter) {
  const query = `[out:json][timeout:90];nwr[${filter}](${BBOX});out center;`;

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
    const lon = el.lon ?? el.center?.lon;
    const lat = el.lat ?? el.center?.lat;
    if (lon === undefined || lat === undefined) continue;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        id: el.id,
        category,
        name: el.tags?.name ?? null,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

async function main() {
  await mkdir('public/data', { recursive: true });

  for (const [name, filter] of Object.entries(CATEGORIES)) {
    const elements = await fetchCategory(name, filter);
    const geojson = toGeoJSON(elements, name);

    await writeFile(
      `public/data/${name}.geojson`,
      JSON.stringify(geojson)
    );

    console.log(`  ${name}: ${geojson.features.length} features`);
    await new Promise((r) => setTimeout(r, 10000));
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});