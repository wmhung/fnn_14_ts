'use client';

import { createContext, useContext } from 'react';

// Create the context
const ParkDataContext = createContext();

// Provider component
export function ParkDataProvider({ value, children }) {
  return (
    <ParkDataContext.Provider value={value}>
      {children}
    </ParkDataContext.Provider>
  );
}

// Custom hook to use context
export function useParkData() {
  const context = useContext(ParkDataContext);
  if (!context) {
    throw new Error('useParkData must be used within a ParkDataProvider');
  }
  return context;
}
