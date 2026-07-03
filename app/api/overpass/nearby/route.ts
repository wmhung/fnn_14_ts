// POST /api/overpass/nearby
// Server-side proxy to the Overpass API (OpenStreetMap) for "parks near me".
// Mirrors the shape of app/api/openai/Coordinates/route.ts.
//
// Body:  { lat: number, lng: number, radius?: number }   // radius in metres
// 200:   { pois: Poi[] }
// 400:   { error: string }                                // bad input
// 200:   { pois: [], error: 'busy' }                      // Overpass unavailable (graceful)

import type { Poi } from '@/types/place';
import {
  OVERPASS_ENDPOINTS,
  LEISURE_TAGS,
  POI_DEFAULT_RADIUS_M,
  POI_MIN_RADIUS_M,
  POI_MAX_RADIUS_M,
  OVERPASS_REVALIDATE_SECONDS,
  OVERPASS_USER_AGENT,
} from '@/app/_lib/utils/constants';

// ---------------- Types ----------------
type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

// ---------------- Helpers ----------------
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Haversine distance in metres.
function distanceMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Build the Overpass QL. Rounding the coords keeps the URL — and therefore
// the Next Data Cache key — stable for nearby requests.
function buildQuery(lat: number, lng: number, radius: number): string {
  const filter = LEISURE_TAGS.join('|');
  return [
    '[out:json][timeout:25];',
    '(',
    `  nwr["leisure"~"^(${filter})$"](around:${radius},${lat},${lng});`,
    ');',
    'out center tags;',
  ].join('\n');
}

// Fetch Overpass with backoff + mirror fallback. Returns raw elements or null.
async function fetchOverpass(query: string): Promise<OverpassElement[] | null> {
  const encoded = encodeURIComponent(query);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${endpoint}?data=${encoded}`, {
          method: 'GET',
          headers: { 'User-Agent': OVERPASS_USER_AGENT },
          next: { revalidate: OVERPASS_REVALIDATE_SECONDS },
        });

        // 429 (rate limited) / 504 (query timeout) clear quickly — back off.
        if (res.status === 429 || res.status === 504) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        if (!res.ok) break; // other errors: try the next mirror

        const data = (await res.json()) as { elements?: OverpassElement[] };
        return data.elements ?? [];
      } catch {
        await sleep(500 * (attempt + 1)); // network hiccup — retry
      }
    }
  }
  return null; // every endpoint + retry exhausted
}

// Overpass elements → clean, deduped, distance-sorted Poi[].
function normalize(
  elements: OverpassElement[],
  lat: number,
  lng: number,
): Poi[] {
  const byId = new Map<string, Poi>();

  for (const el of elements) {
    const coordLat = el.type === 'node' ? el.lat : el.center?.lat;
    const coordLng = el.type === 'node' ? el.lon : el.center?.lon;
    if (coordLat == null || coordLng == null) continue; // no resolvable point

    const osmId = `${el.type}/${el.id}`;
    if (byId.has(osmId)) continue; // dedupe

    byId.set(osmId, {
      osmId,
      name: el.tags?.name ?? el.tags?.['name:en'] ?? null,
      kind: el.tags?.leisure ?? 'park',
      lat: coordLat,
      lng: coordLng,
      distanceM: distanceMetres(lat, lng, coordLat, coordLng),
    });
  }

  return [...byId.values()].sort((a, b) => a.distanceM - b.distanceM);
}

// ---------------- Handler ----------------
export async function POST(request: Request) {
  let body: { lat?: unknown; lng?: unknown; radius?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return json({ error: 'lat must be a number between -90 and 90' }, 400);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return json({ error: 'lng must be a number between -180 and 180' }, 400);
  }

  // Clamp radius into a sane band; default when absent/invalid.
  let radius = Number(body.radius);
  if (!Number.isFinite(radius)) radius = POI_DEFAULT_RADIUS_M;
  radius = Math.min(
    POI_MAX_RADIUS_M,
    Math.max(POI_MIN_RADIUS_M, Math.round(radius)),
  );

  // Round to ~110m so jittery GPS fixes share one cache key.
  const qLat = Number(lat.toFixed(3));
  const qLng = Number(lng.toFixed(3));

  const elements = await fetchOverpass(buildQuery(qLat, qLng, radius));
  if (elements === null) {
    // Graceful: don't surface a 5xx to the UI — let the client show a message.
    return json({ pois: [], error: 'busy' });
  }

  return json({ pois: normalize(elements, lat, lng) });
}
