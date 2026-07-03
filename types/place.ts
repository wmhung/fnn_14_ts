export type Position = {
  lat: number;
  lng: number;
};

export interface Place {
  id: number;
  place_name: string;
  date: string | Date;
  star_rating?: number;
  notes?: string;
  city?: string;
  dist?: string;
  recreation?: string;
  position?: Position | null;
  image?: string;
  email?: string;
  user_name?: string;
  // [NEW] denormalized repeat-visit counters (kept in sync by log_visit RPC)
  visit_count?: number;
  last_visited_at?: string | null;
}

// [NEW] one repeat-visit record (visits table)
export interface Visit {
  id: number;
  place_id: number;
  visited_at: string | Date;
  visit_rating?: number; // 1–5, required at write time
  note?: string;
  email?: string;
  created_at?: string;
}

// CREATE input for logVisit
export type VisitInput = {
  placeId: number;
  email: string;
  rating: number; // required
  note?: string;
  visitedAt?: string; // ISO; defaults to now
};

// [NEW] moved here from PlaceContext.tsx
// CREATE input — image must be provided (File on first upload, or URL string)
export type PlaceInput = Omit<Place, 'id' | 'image'> & { image: File | string };

// [NEW] UPDATE input — id required, every other field optional
export type PlaceUpdateInput = Partial<Omit<Place, 'id' | 'image'>> & {
  id: number;
  image?: File | string;
};

export type Bookmark = {
  id: number;
  place_id: number;
  place_name: string;
  date: string | Date;
  star_rating: number;
  position?: Position;
  email?: string;
  user_name?: string;
  [key: string]: any;
};

// [NEW] Overpass "parks near me" candidate.
// Ephemeral — a Poi is NOT a Place. It only becomes a `placelist` row when the
// user taps "Add" and saves. Kept deliberately separate so external OSM data
// can never pollute user-owned rows.
export interface Poi {
  osmId: string; // e.g. "way/123456" — OSM element type + id
  name: string | null; // many playgrounds are unnamed in OSM
  kind: string; // "park" | "playground" (the leisure tag)
  lat: number;
  lng: number;
  distanceM: number; // straight-line distance from the query point
}

// Response shape of POST /api/overpass/nearby
export interface NearbyPoisResponse {
  pois: Poi[];
  error?: 'busy'; // Overpass unavailable — client shows a soft message
}

export type PaginationQuery = {
  email?: string;
  page?: number;
  query?: string;
  sort?: string; // e.g. "date-desc"
  sortBy?: 'date' | 'star_rating';
  sortOrder?: 'asc' | 'desc';
};
