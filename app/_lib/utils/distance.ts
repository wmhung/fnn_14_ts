const EARTH_RADIUS_KM = 6371;

export interface LatLng {
  lat: number;
  lng: number;
}

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Returns the great-circle distance between two points in kilometres.
 */
export function haversineDistance(from: LatLng, to: LatLng): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Formats a distance in kilometres into a short human string.
 * - < 1 km → "850 m"
 * - >= 1 km → "3.2 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
