'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Park } from '@/types/park';

export type Bookmark = {
  id: number;
  parkId: number;
  parkName: string;
  date: string;
  starRating: number;
  position?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
};

export type ParkDataType = {
  parks?: Park[];
  bookmarks?: Bookmark[];
  sort: 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';
  query?: string;
  page?: number;
  count?: number;
};

const ParkDataContext = createContext<ParkDataType | undefined>(undefined);

export function ParkDataProvider({
  value,
  children,
}: {
  value: ParkDataType;
  children: ReactNode;
}) {
  return (
    <ParkDataContext.Provider value={value}>
      {children}
    </ParkDataContext.Provider>
  );
}

export function useParkData(): ParkDataType {
  const context = useContext(ParkDataContext);
  if (!context)
    throw new Error('useParkData must be used within a ParkDataProvider');
  return context;
}
