# MASTER PLAN — SP01: The 15-Minute City Hex-Grid

> Upload this file at the start of any new chat to restore full project context.

---

## 1. Who I am / how to work with me

- Dada, 25. Strong graphic design + creative direction background. UX/UI student (ASU Online, GIT program, grad Fall 2027).
- Pivoting into **Spatial & Geographic Data Mapping (GIS)**. This is portfolio-grade work, not a toy.
- Code skill: **beginner-to-intermediate**. Design skill: professional.

**Strict collaboration rules (do not violate):**

1. **Instruct, don't do.** Give me exact code to type. Never write files into my repo for me, never dump a full codebase.
2. **One phase at a time.** One file or one coherent feature per response. Then STOP.
3. **Wait for confirmation** before moving to the next phase.
4. Each phase: 2–3 sentences of *why* before the code, and a **"What you should see"** check after.
5. Never dump a whole file when only part changed — show the section and where it goes.
6. Explain new concepts / APIs / TypeScript features the first time they appear.
7. Defend design decisions. Flag real tradeoffs unprompted. Push back on scope creep and park it on a Later list.
8. Concise. No fluff, no personality padding.

---

## 2. The project in one paragraph

A map of **San Francisco** that scores how accessible **groceries, parks, and transit** are from anywhere in the city. Amenity points are aggregated into a **3D hexagonal grid** rendered with deck.gl over a dark MapLibre basemap. Each hex glows by score. Hovering shows a breakdown. The point is to look like a high-end data product — not a municipal portal.

**Portfolio thesis:** most GIS portfolios show competent-but-ugly maps. This one proves I can do the spatial analysis *and* art-direct the result.

---

## 3. Locked decisions

| Decision | Choice | Why |
|---|---|---|
| City | San Francisco | Best OSM coverage, recognizable silhouette, dense enough that hexes vary |
| Basemap | MapTiler (free tier, 100k loads/mo) | Free, better looking than CARTO, custom-styleable later |
| Amenity data | OpenStreetMap via Overpass API | Free, one-time fetch |
| Data delivery | Fetched once → static GeoJSON committed to `/public` | Never hammer Overpass on page load |
| "15 minute" definition | **1200m straight-line buffer**, honestly labeled "walking distance radius" | Real isochrones need a paid routing API |
| Grid | H3-style hexbins via deck.gl `HexagonLayer` | Aggregation is built in |
| Cost ceiling | **$0** | Everything free tier or static |
| Hosting | Vercel or GitHub Pages (free) | Decide at Phase 8 |

**Explicitly out of scope** (the Later list): network-based isochrones, real-time transit, multi-city support, user accounts, mobile-native app.

---

## 4. Tech stack

- **Vite** + **React 19** + **TypeScript**
- **maplibre-gl** v6 — basemap rendering
- **deck.gl** v9 — 3D hexagon aggregation layer, overlaid on MapLibre
- **@turf/turf** — geospatial math (buffers, distance, point-in-polygon)
- **oxlint** — linting (came with the scaffold)

---

## 5. Repo layout

```
C:\Users\jakeb\spatial-data-folio\
├── project-plans\           # idea docs, not part of the app
└── sp01-hex-grid\           # <- THE GIT REPO. All app work happens here.
    ├── MASTER-PLAN.md       # this file
    ├── public\
    │   └── data\            # committed static GeoJSON lives here
    ├── src\
    │   ├── components\      # MapView, HexLayer, Tooltip, Legend, ControlPanel
    │   ├── hooks\           # useHexData, etc.
    │   ├── lib\             # scoring math, data loaders
    │   └── types\           # shared TS types
    └── scripts\             # one-off Node scripts to fetch + process OSM data
```

**Gotcha already hit:** the Vite scaffold was initially run in the parent folder and had to be moved into `sp01-hex-grid`. All commands run from `sp01-hex-grid`.

---

## 6. Design direction

Non-negotiable aesthetic targets:

- **Near-black canvas** (`#08090c`), not gray. Let the data be the only light source.
- **Glow, not saturation.** Hexes emit color; the basemap recedes to near-invisible geometry.
- **One accent ramp.** Low score → deep indigo/violet; high score → hot cyan or amber. No rainbow. No red-green (colorblind failure).
- **Tilted camera by default** (`pitch: 45`) so the 3D extrusion reads immediately on load.
- **Typography:** one modern grotesque, tight tracking, generous whitespace. UI chrome floats over the map — no boxed sidebars.
- **Motion:** every state change eased, 200–400ms. Nothing snaps.
- Legend and score explanation must be visible without clicking. A map that needs a manual has failed.

---

## 7. Phase roadmap

| # | Phase | Status |
|---|---|---|
| 0 | Scaffold Vite + React-TS, install maplibre-gl / deck.gl / turf | ✅ Done |
| 1 | Purge boilerplate, full-screen dark MapLibre basemap w/ MapTiler key in `.env` | ▶ Next |
| 2 | Fetch OSM amenities via Overpass, save static GeoJSON to `/public/data` | ⬜ |
| 3 | Render raw amenity points with a deck.gl ScatterplotLayer (sanity check the data) | ⬜ |
| 4 | Swap to `HexagonLayer` — 3D extruded hex aggregation | ⬜ |
| 5 | Scoring logic — combine grocery/park/transit counts within 1200m into one 0–100 score | ⬜ |
| 6 | Color ramp + elevation driven by score; art-direct the glow | ⬜ |
| 7 | Interaction — hover tooltip, category toggles, legend, radius slider | ⬜ |
| 8 | Polish + performance + deploy free + write the case study | ⬜ |

---

## 8. Scoring model (Phase 5 spec)

For each hex centroid, count amenities within **1200m**, by category:

- **Groceries** — OSM `shop=supermarket`, `shop=grocery`, `shop=convenience`
- **Parks** — OSM `leisure=park`, `leisure=garden`
- **Transit** — OSM `public_transport=station`, `highway=bus_stop`, `railway=tram_stop`

Each category count is normalized against the city's 90th percentile (clamped to 0–1), then averaged with equal weight and scaled to 0–100.

Rationale for the 90th-percentile cap: a handful of downtown hexes with 40 bus stops would otherwise flatten the entire rest of the city to near-zero. Capping preserves visible variation across neighborhoods.

---

## 9. Session handoff

When starting a new chat, paste this file and state the current phase number. Resume from the roadmap table above — do not restart from Phase 0.
