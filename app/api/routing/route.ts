type LatLng = { lat: number; lng: number };
type Mode = 'walking' | 'cycling' | 'driving';

interface RouteRequest {
  from: LatLng;
  to: LatLng;
  mode?: Mode;
}

interface RouteResponse {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [[lat, lng], ...] — Leaflet order
}

const ORS_PROFILE: Record<Mode, string> = {
  walking: 'foot-walking',
  cycling: 'cycling-regular',
  driving: 'driving-car',
};

const isValidLatLng = (p: unknown): p is LatLng =>
  !!p &&
  typeof p === 'object' &&
  typeof (p as LatLng).lat === 'number' &&
  typeof (p as LatLng).lng === 'number' &&
  Math.abs((p as LatLng).lat) <= 90 &&
  Math.abs((p as LatLng).lng) <= 180;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    console.error('[routing] ORS_API_KEY is not set');
    return Response.json(
      { error: 'Routing service is not configured' },
      { status: 500 },
    );
  }

  let body: RouteRequest;
  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { from, to, mode = 'walking' } = body;

  if (!isValidLatLng(from) || !isValidLatLng(to)) {
    return Response.json(
      { error: 'from and to must be {lat, lng} with valid ranges' },
      { status: 400 },
    );
  }

  const profile = ORS_PROFILE[mode];
  if (!profile) {
    return Response.json(
      { error: `Unknown mode "${mode}". Use walking | cycling | driving.` },
      { status: 400 },
    );
  }

  // ORS uses [lng, lat] — convert at the boundary, nowhere else.
  const orsUrl = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
  const orsBody = {
    coordinates: [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ],
  };

  let orsRes: globalThis.Response;
  try {
    orsRes = await fetch(orsUrl, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orsBody),
    });
  } catch (err) {
    console.error('[routing] network error', err);
    return Response.json(
      { error: 'Routing service unreachable' },
      { status: 502 },
    );
  }

  if (!orsRes.ok) {
    const text = await orsRes.text().catch(() => '');
    console.error('[routing] ORS error', orsRes.status, text);
    // 404 from ORS means "no route found between these points"
    const status = orsRes.status === 404 ? 404 : 502;
    return Response.json(
      {
        error:
          status === 404
            ? 'No route found between these points'
            : 'Routing service error',
      },
      { status },
    );
  }

  // Parse the GeoJSON FeatureCollection. We only need the first feature.
  let data: any;
  try {
    data = await orsRes.json();
  } catch {
    return Response.json(
      { error: 'Routing service returned malformed data' },
      { status: 502 },
    );
  }

  const feature = data?.features?.[0];
  const summary = feature?.properties?.summary;
  const coords: [number, number][] | undefined = feature?.geometry?.coordinates;

  if (!summary || !coords?.length) {
    return Response.json(
      { error: 'Routing service returned no usable route' },
      { status: 502 },
    );
  }

  // ORS distance is in metres, duration in seconds, coordinates are [lng, lat].
  // Convert all three to the units the rest of the app speaks.
  const response: RouteResponse = {
    distanceKm: summary.distance / 1000,
    durationMin: summary.duration / 60,
    geometry: coords.map(([lng, lat]) => [lat, lng] as [number, number]),
  };

  return Response.json(response, { status: 200 });
}
