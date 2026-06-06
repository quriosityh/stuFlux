/**
 * area-search.ts
 * Zero-dependency, isomorphic utility for searching and discovering
 * Lahore areas from the lahore-areas.json dataset.
 *
 * Works in both Next.js client bundles and the Express API.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LahoreArea {
  id: string;
  name: string;
  featureCode: string;
  latitude: number;
  longitude: number;
  geonameId: string;
  aliases: string[];
}

// ---------------------------------------------------------------------------
// Internal scoring helpers
// ---------------------------------------------------------------------------

/** Lower = closer match */
function scoreMatch(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (t === q) return 0;            // exact
  if (t.startsWith(q)) return 1;   // prefix
  if (t.includes(q)) return 2;     // substring
  return Infinity;
}

/**
 * Best score across all searchable tokens of an area.
 * We search: name + every alias.
 */
function bestScore(query: string, area: LahoreArea): number {
  const tokens = [area.name, ...area.aliases];
  let best = Infinity;
  for (const token of tokens) {
    const s = scoreMatch(query, token);
    if (s < best) best = s;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fuzzy-ranked search over area names + aliases.
 *
 * @param query   Raw user input string
 * @param areas   Full area dataset
 * @param limit   Max results returned (default 8)
 * @returns Areas sorted by match quality, capped at `limit`
 */
export function searchAreas(
  query: string,
  areas: LahoreArea[],
  limit = 8
): LahoreArea[] {
  const q = query.trim();
  if (!q) return [];

  const scored: { area: LahoreArea; score: number }[] = [];

  for (const area of areas) {
    const score = bestScore(q, area);
    if (score < Infinity) {
      scored.push({ area, score });
    }
  }

  // Sort by score (lower = better), then alpha for ties
  scored.sort((a, b) =>
    a.score !== b.score
      ? a.score - b.score
      : a.area.name.localeCompare(b.area.name)
  );

  return scored.slice(0, limit).map((s) => s.area);
}

/**
 * Returns areas within `radiusKm` of the given area id, sorted by distance.
 * The source area itself is excluded from results.
 *
 * @param areaId    The id of the selected area (e.g. "johar-town")
 * @param areas     Full area dataset
 * @param radiusKm  Distance threshold in km (default 3)
 * @param limit     Max results (default 10)
 */
export function getNearbyAreas(
  areaId: string,
  areas: LahoreArea[],
  radiusKm = 3,
  limit = 10
): LahoreArea[] {
  const source = areas.find((a) => a.id === areaId);
  if (!source) return [];

  const nearby: { area: LahoreArea; dist: number }[] = [];

  for (const area of areas) {
    if (area.id === areaId) continue;
    const dist = haversineKm(
      source.latitude, source.longitude,
      area.latitude, area.longitude
    );
    if (dist <= radiusKm) {
      nearby.push({ area, dist });
    }
  }

  nearby.sort((a, b) => a.dist - b.dist);
  return nearby.slice(0, limit).map((n) => n.area);
}

/**
 * Simple lookup by id (slug).
 * Returns undefined when not found.
 */
export function getAreaById(
  id: string,
  areas: LahoreArea[]
): LahoreArea | undefined {
  return areas.find((a) => a.id === id);
}

/**
 * Returns the display name for an area id, falling back to the raw id.
 */
export function getAreaName(id: string, areas: LahoreArea[]): string {
  return getAreaById(id, areas)?.name ?? id;
}

// ---------------------------------------------------------------------------
// Curated popular areas for empty-state suggestions
// (ordered by student / general relevance in Lahore)
// ---------------------------------------------------------------------------

export const POPULAR_AREA_IDS: string[] = [
  'johar-town',
  'dha-phase-1',
  'gulberg',
  'model-town',
  'bahria-town',
  'wapda-town',
  'iqbal-town',
  'garden-town',
  'township',
  'cantt',
];
