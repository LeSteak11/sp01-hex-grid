# PLAN V2 — SP01: The 15-Minute City Hex-Grid

> Supersedes the roadmap in `MASTER-PLAN.md` from Phase 8 onward.
> `MASTER-PLAN.md` remains authoritative for: working rules, locked decisions, tech stack, design direction, and the scoring model spec.
> Upload BOTH files when starting a new chat.

---

## 1. Where the project actually stands

**Working end-to-end.** Two Node scripts pull SF amenities and the city boundary from OSM into static GeoJSON. The app loads them, generates a 200m hex grid over the city, counts amenities within 1200m of each hex centroid, scores each 0–100 against calibrated saturation caps, and renders the result as extruded hexagonal columns colored and heighted by score, over a dimmed dark basemap, clipped to SF's real silhouette.

| | |
|---|---|
| Amenity points | 5,895 (476 grocery / 2,044 park / 3,375 transit) |
| Hex cells rendered | ~1,100 after boundary clip |
| Score distribution | mean ~45, spread ~2–97 |
| Grid build time | well under 1s |
| Commits | 10, through Phase 7 |
| Cost to date | $0 |

**The analysis is real.** Equirectangular projection to local meters, squared-distance radius tests, overlapping neighborhoods, OSM relation ring-stitching for the boundary, point-in-polygon clipping. That is the defensible core.

**Nothing about it is usable by another human.** No legend, no tooltip, no title, no explanation of what a color means or what the method is. A visitor sees a pretty object with no way in. Every item in the `MASTER-PLAN.md` design-direction section beyond the color ramp is still unbuilt.

---

## 2. The end goal, restated

> **A stranger opens the URL on a laptop or a phone, understands within ten seconds what they are looking at, explores their own neighborhood, and comes away believing the person who built it can do both the spatial analysis and the design.**

Three audiences, all of whom must be served by the same page:

1. **A hiring manager skimming for 30 seconds.** Needs: instant visual impact, an obvious one-line explanation, no confusion about what the colors mean.
2. **A GIS or data person who will poke at it.** Needs: a stated method, honest limitations, and numbers that hold up when they check their own block.
3. **A design lead.** Needs: typography, motion, restraint, and evidence of art direction rather than library defaults.

**Ship definition — the project is done when all of these are true:**

- Live at a public URL, loading in under 3 seconds on a normal connection
- Legible on a phone
- Hovering or tapping any hex gives its score and per-category counts
- A legend states the color scale and the method, without being asked
- Limitations are disclosed on the page, not hidden
- A written case study exists explaining the problem, method, decisions, and tradeoffs
- The repo README lets someone else run it in two commands

---

## 3. Honest gap analysis

### Blocking (must fix before ship)

| Gap | Why it matters |
|---|---|
| No tooltip | The core interaction promise of the whole project |
| No legend | Colors are meaningless to anyone who did not build it |
| No title / framing | Visitors do not know what city, what metric, or what question |
| Not deployed | An undeployed portfolio piece is not a portfolio piece |
| Untested on mobile | Recruiters open links on phones |
| No loading state | White or black flash while data loads reads as broken |

### Methodological weaknesses (must fix or disclose)

| Weakness | Assessment |
|---|---|
| **Park scoring counts features, not area** | The worst flaw in the project. Golden Gate Park counts as **1**; a block of tiny community garden plots counts as **dozens**. This actively misrepresents the west side. **Fix, do not disclose.** |
| Transit is bus stops only | No BART, Muni Metro, tram, or ferry. A Mission BART hex is undercounted. **Fix — it is one line in the Overpass query.** |
| Straight-line, not network distance | Hills and freeways are invisible. SF is the worst possible city for this assumption. **Disclose prominently.** |
| County boundary includes water | Some offshore cells persist. **Low priority, disclose or ignore.** |
| Saturation caps are judgment calls | Defensible, but must be stated as a choice. **Disclose in the case study.** |

### Design debt

- No typography system — everything is browser default
- No motion; hexes appear instantly with no entrance
- No UI chrome at all: no panel, no framing, nothing floating over the map
- Extrusion still reads flat at default zoom on some displays
- No considered initial camera position — currently a hardcoded guess

---

## 4. Revised roadmap

### Phase 8 — Data quality fixes
Before building UI on top of numbers, correct the numbers.

- Rewrite the park category: measure park **area** within 1200m instead of feature count. Use `leisure=park` polygons, compute area with Turf, cap on square meters rather than count.
- Expand transit: add `railway=station`, `railway=tram_stop`, `station=subway`, ferry terminals.
- Re-run both fetch scripts, recalibrate saturation caps against the new distribution.

**Done when:** west-side park scores drop to something believable, Mission/Embarcadero transit scores rise, mean stays in the 40–55 band.

---

### Phase 9 — Hover tooltip
- `onHover` on the `ColumnLayer`, hovered cell held in state.
- Floating card: score as the headline number, then grocery / park / transit counts as a small breakdown.
- Positioned near cursor, never clipped at viewport edges.
- Fades in; does not snap.

**Done when:** hovering any hex reads its numbers without the console open.

---

### Phase 10 — Legend, title, and method disclosure
- Title block, top left: project name, one-sentence description, city.
- Color scale legend with actual score values — not just "low → high".
- A method line, always visible: *"Score = groceries, park area, and transit within a 1200m straight-line radius. Straight-line, not walking-route — SF's hills are not accounted for."*
- Collapsible "About the data" for sources, saturation caps, and remaining limitations.

**Done when:** a stranger understands the map without asking a question.

---

### Phase 11 — Design pass
This is the phase where the graphic-design background has to show.

- Typography: one grotesque, real hierarchy, tight tracking.
- UI floats over the map — no boxed sidebars, per the design direction.
- Entrance animation: hexes rise from zero elevation on load, staggered, eased.
- Tuned initial camera: a chosen composition, not a default.
- Hover state on the hex itself, not only the tooltip.
- Loading state that looks intentional.

**Done when:** it could plausibly be a product screenshot.

---

### Phase 12 — Responsive and performance
- Verify and fix on phone widths; touch replaces hover (tap to inspect).
- Move `buildGrid` off the initial render path so first paint is not blocked.
- Consider precomputing the grid to a static JSON at build time — the inputs never change at runtime.
- Check bundle size; lazy-load what can be deferred.

**Done when:** usable one-handed on a phone, first meaningful paint under 3s.

---

### Phase 13 — Ship
- Deploy to Vercel (free). Restrict the MapTiler key to the deployed domain.
- README: what it is, how to run it, where the data comes from, one screenshot.
- Case study write-up covering: the question, the data pipeline, why saturation caps over percentiles, why straight-line over isochrones, why area over count for parks, and what is still wrong.
- Confirm the deployed site works from a device that has never opened it.

**Done when:** the link can be sent to a stranger with no explanation attached.

---

## 5. Sequencing rules

- **Data before UI.** Phase 8 first — building a legend around wrong park numbers means building it twice.
- **One phase per response**, per the working rules in `MASTER-PLAN.md`. No skipping ahead.
- **Commit at every phase boundary**, with the phase number in the message.
- Anything not on this roadmap goes on the Later list. Multi-city, isochrones, and real-time transit stay out of scope.

---

## 6. Later list (explicitly not shipping in v1)

- Network-based walking isochrones (needs a routing API)
- Land-only clipping via a coastline dataset
- Adjustable radius or category weights in the UI
- Multi-city comparison
- Elevation/hill penalty — the honest fix for the straight-line problem
