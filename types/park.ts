export type Position = {
  lat: number;
  lng: number;
};

export interface Park {
  id: number;
  park_name: string;
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
}

export type Bookmark = {
  id: number;
  park_id: number;
  park_name: string;
  date: string | Date;
  star_rating: number;
  position?: Position;
  email?: string;
  user_name?: string;
  [key: string]: any;
};

export type PaginationQuery = {
  email?: string;
  page?: number;
  query?: string;
  sort?: string; // e.g. "date-desc"
  sortBy?: 'date' | 'star_rating';
  sortOrder?: 'asc' | 'desc';
};
