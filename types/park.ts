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
