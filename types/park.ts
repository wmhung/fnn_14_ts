export type Position = {
  lat: number;
  lng: number;
};

export interface Park {
  id: number;
  parkName: string;
  date: string | Date;
  starRating?: number;
  notes?: string;
  city?: string;
  dist?: string;
  recreation?: string;
  position?: Position | null;
  image?: string;
  email?: string;
  userName?: string;
}

export type Bookmark = {
  id: number;
  parkId: number;
  parkName: string;
  date: string | Date;
  starRating: number;
  position?: Position;
  email?: string;
  userName?: string;
  [key: string]: any;
};

// ✅ Add these two for pagination and sorting
export type PaginationQuery = {
  email?: string;
  page?: number;
  query?: string;
  sortBy?: 'date' | 'starRating'; // more fields can be added if needed
  sortOrder?: 'asc' | 'desc';
};
