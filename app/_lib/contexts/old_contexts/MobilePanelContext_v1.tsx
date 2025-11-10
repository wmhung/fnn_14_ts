'use client';

import { createContext, useContext, useState } from 'react';

const MobilePanelContext = createContext();

export function MobilePanelProvider({ children }) {
  const [view, setView] = useState(null); // 'list' | 'bookmarks' | null

  return (
    <MobilePanelContext.Provider value={{ view, setView }}>
      {children}
    </MobilePanelContext.Provider>
  );
}

export function useMobilePanel() {
  const context = useContext(MobilePanelContext);
  if (!context) {
    throw new Error('useMobilePanel must be used within a MobilePanelProvider');
  }
  return context;
}
