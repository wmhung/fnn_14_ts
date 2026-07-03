'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Place } from '@/types/place';

export type Bookmark = {
  id: number;
  place_id: number;
  place_name: string;
  date: string;
  star_rating: number;
  position?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
};

export type PlaceDataType = {
  places?: Place[];
  bookmarks?: Bookmark[];
  sort: 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';
  query?: string;
  page?: number;
  count?: number;
};

const PlaceDataContext = createContext<PlaceDataType | undefined>(undefined);

export function PlaceDataProvider({
  value,
  children,
}: {
  value: PlaceDataType;
  children: ReactNode;
}) {
  return (
    <PlaceDataContext.Provider value={value}>
      {children}
    </PlaceDataContext.Provider>
  );
}

export function usePlaceData(): PlaceDataType {
  const context = useContext(PlaceDataContext);
  if (!context)
    throw new Error('usePlaceData must be used within a PlaceDataProvider');
  return context;
}
