import type { LatLng } from '../utils/distance';

export type RoutingMode = 'walking' | 'cycling' | 'driving';

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [[lat, lng], ...] for direct Leaflet use
}

export type RoutingErrorCode =
  | 'NO_ROUTE' // 404 — ORS could not find a path
  | 'BAD_REQUEST' // 400 — we sent something invalid
  | 'UNREACHABLE' // 502 — ORS or network failed
  | 'NOT_CONFIGURED' // 500 — proxy is missing the API key
  | 'UNKNOWN';

export class RoutingError extends Error {
  code: RoutingErrorCode;
  status: number;
  constructor(code: RoutingErrorCode, status: number, message: string) {
    super(message);
    this.name = 'RoutingError';
    this.code = code;
    this.status = status;
  }
}

// ----------------- cache -----------------
//
// Coordinates are floating-point; if we use the raw numbers as a cache key,
// 25.045700000001 misses against 25.0457. Round to 5 decimal places
// (~1 metre at the equator) — more than precise enough for routing.

const PRECISION = 5;
const round = (n: number) => Number(n.toFixed(PRECISION));
const keyOf = (from: LatLng, to: LatLng, mode: RoutingMode) =>
  `${round(from.lat)},${round(from.lng)}->${round(to.lat)},${round(
    to.lng,
  )}::${mode}`;

const cache = new Map<string, RouteResult>();

/** Exposed for tests / debugging; usually you don't need to call this. */
export function clearRouteCache(): void {
  cache.clear();
}

// ----------------- main API -----------------

interface GetRouteArgs {
  from: LatLng;
  to: LatLng;
  mode?: RoutingMode;
}

/**
 * Fetch a real travel route via the /api/routing proxy.
 * Throws RoutingError on failure; caller can fall back to Haversine.
 */
export async function getRoute({
  from,
  to,
  mode = 'walking',
}: GetRouteArgs): Promise<RouteResult> {
  const key = keyOf(from, to, mode);
  const cached = cache.get(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch('/api/routing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, mode }),
    });
  } catch (err) {
    throw new RoutingError(
      'UNREACHABLE',
      0,
      err instanceof Error ? err.message : 'Network error',
    );
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message: string =
      (payload && typeof payload.error === 'string' && payload.error) ||
      `Request failed with status ${res.status}`;

    const code: RoutingErrorCode =
      res.status === 404
        ? 'NO_ROUTE'
        : res.status === 400
          ? 'BAD_REQUEST'
          : res.status === 500
            ? 'NOT_CONFIGURED'
            : res.status === 502
              ? 'UNREACHABLE'
              : 'UNKNOWN';

    throw new RoutingError(code, res.status, message);
  }

  const data = (await res.json()) as RouteResult;
  cache.set(key, data);
  return data;
}
