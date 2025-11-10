'use client';

import { createContext, useContext, ReactNode } from 'react';

// Define types
export type Park = {
  id: number;
  parkName: string;
  notes: string;
  starRating: number;
  userName: string;
  date: string; // string or Date
};

export type Bookmark = {
  id: number;
  parkId: number; // use number to match DB/API
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

// Create typed context
const ParkDataContext = createContext<ParkDataType | undefined>(undefined);

// Provider
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

// Custom hook
export function useParkData(): ParkDataType {
  const context = useContext(ParkDataContext);
  if (!context)
    throw new Error('useParkData must be used within a ParkDataProvider');
  return context;
}
