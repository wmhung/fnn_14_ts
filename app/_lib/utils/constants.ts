export const PAGE_SIZE = 8;

// ---------------- Overpass "parks near me" ----------------
// Primary endpoint + mirror fallback. GET (not POST) so Next's Data Cache can
// key on the URL. No API key required — the reason Overpass fits FNN.
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Which OSM `leisure` tags count as a "park" for FNN.
export const LEISURE_TAGS = ['park', 'playground'];

// Radius band (metres). Client sends one of these; server clamps to [MIN, MAX].
// Default 500m (~6-min walk) — tight, walkable-now, minimal map clutter.
export const POI_DEFAULT_RADIUS_M = 500;
export const POI_MIN_RADIUS_M = 100;
export const POI_MAX_RADIUS_M = 5000;

// Cache the upstream Overpass result for a day — parks are near-static.
export const OVERPASS_REVALIDATE_SECONDS = 86_400;

// A candidate within this many metres of an already-saved place is treated as a
// duplicate and hidden. Uses real haversine distance (not coordinate rounding,
// which fails at grid boundaries — two points ~5m apart can round to different
// cells). Tune up if saved pins sit far from the OSM park centroid.
export const POI_DEDUPE_RADIUS_M = 80;

// Overpass etiquette: identify the app (blank/generic User-Agents get rejected).
export const OVERPASS_USER_AGENT = `FNN/1.0 (Finding Next Neverland; ${process.env.OVERPASS_CONTACT ?? 'contact@example.com'})`;

// Marker colour for POI candidates — distinct from blue (saved), gold
// (bookmarked), red (active), cyan (you-are-here) used in Map.tsx.
export const POI_MARKER_COLOR = '#16a34a';
