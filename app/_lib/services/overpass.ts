import type { LatLng } from '../utils/distance';
import type { Poi, NearbyPoisResponse } from '@/types/place';
import { POI_DEFAULT_RADIUS_M } from '../utils/constants';

export type NearbyErrorCode =
  | 'BUSY' // Overpass rate-limited / unavailable — retry shortly
  | 'BAD_REQUEST' // 400 — we sent invalid coordinates
  | 'UNREACHABLE' // network failure reaching our own proxy
  | 'UNKNOWN';

export class NearbyError extends Error {
  code: NearbyErrorCode;
  constructor(code: NearbyErrorCode, message: string) {
    super(message);
    this.name = 'NearbyError';
    this.code = code;
  }
}

// ----------------- client-side cache -----------------
const PRECISION = 3;
const round = (n: number) => Number(n.toFixed(PRECISION));
const keyOf = (at: LatLng, radius: number) =>
  `${round(at.lat)},${round(at.lng)}::${radius}`;

const cache = new Map<string, Poi[]>();

export function clearNearbyCache(): void {
  cache.clear();
}

// ----------------- main API -----------------

interface FetchNearbyArgs {
  at: LatLng;
  radius?: number;
}

/**
 * Fetch nearby parks/playgrounds via the /api/overpass/nearby proxy.
 * Returns Poi[] (nearest first). Throws NearbyError on failure so the caller
 * can show a soft "couldn't load nearby parks" message.
 */
export async function fetchNearbyPois({
  at,
  radius = POI_DEFAULT_RADIUS_M,
}: FetchNearbyArgs): Promise<Poi[]> {
  const key = keyOf(at, radius);
  const cached = cache.get(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch('/api/overpass/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: at.lat, lng: at.lng, radius }),
    });
  } catch (err) {
    throw new NearbyError(
      'UNREACHABLE',
      err instanceof Error ? err.message : 'Network error',
    );
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message: string =
      (payload && typeof payload.error === 'string' && payload.error) ||
      `Request failed with status ${res.status}`;
    throw new NearbyError(
      res.status === 400 ? 'BAD_REQUEST' : 'UNKNOWN',
      `[${res.status}] ${message}`,
    );
  }

  // Guard the success-path parse too: a proxy 200 that isn't JSON (e.g. an
  // auth redirect served as HTML) would otherwise throw an opaque SyntaxError.
  let data: NearbyPoisResponse;
  try {
    data = (await res.json()) as NearbyPoisResponse;
  } catch {
    throw new NearbyError(
      'UNKNOWN',
      'Parks proxy returned a non-JSON response',
    );
  }

  // The proxy returns 200 with { pois: [], error: 'busy' } when Overpass is
  // unavailable — surface it as a retryable error rather than "no parks here".
  if (data.error === 'busy') {
    throw new NearbyError('BUSY', 'Overpass is busy — please try again.');
  }

  const pois = data.pois ?? [];
  cache.set(key, pois);
  return pois;
}
