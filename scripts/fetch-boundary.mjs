import { writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://overpass-api.de/api/interpreter';

const QUERY = `[out:json][timeout:90];
rel(111968);
out geom;`;

function stitch(ways) {
  const rings = [];
  const pool = ways.map((w) => [...w]);

  while (pool.length) {
    let ring = pool.shift();

    let joined = true;
    while (joined) {
      joined = false;

      for (let i = 0; i < pool.length; i++) {
        const head = ring[0];
        const tail = ring[ring.length - 1];
        const cand = pool[i];
        const cHead = cand[0];
        const cTail = cand[cand.length - 1];

        const same = (a, b) => a[0] === b[0] && a[1] === b[1];

        if (same(tail, cHead)) ring = ring.concat(cand.slice(1));
        else if (same(tail, cTail)) ring = ring.concat([...cand].reverse().slice(1));
        else if (same(head, cTail)) ring = cand.slice(0, -1).concat(ring);
        else if (same(head, cHead)) ring = [...cand].reverse().slice(0, -1).concat(ring);
        else continue;

        pool.splice(i, 1);
        joined = true;
        break;
      }
    }

    if (ring.length > 3) rings.push(ring);
  }

  return rings;
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'sp01-hex-grid/1.0 (portfolio project)',
    Accept: 'application/json',
  },
  body: 'data=' + encodeURIComponent(QUERY),
});

if (!res.ok) {
  console.error((await res.text()).slice(0, 400));
  process.exit(1);
}

const json = await res.json();

const rel = json.elements.find((e) => e.type === 'relation');
if (!rel) throw new Error('no relation found');

const outerWays = rel.members
  .filter((m) => m.type === 'way' && m.role === 'outer' && m.geometry)
  .map((m) => m.geometry.map((p) => [p.lon, p.lat]));

const rings = stitch(outerWays);
rings.sort((a, b) => b.length - a.length);

const closed = rings.map((r) => {
  const first = r[0];
  const last = r[r.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? r : [...r, first];
});

const geojson = {
  type: 'Feature',
  properties: { name: 'San Francisco' },
  geometry: {
    type: 'MultiPolygon',
    coordinates: closed.map((r) => [r]),
  },
};

await writeFile('public/data/boundary.geojson', JSON.stringify(geojson));
console.log(`rings: ${closed.length} | points: ${closed.map((r) => r.length).join(', ')}`);