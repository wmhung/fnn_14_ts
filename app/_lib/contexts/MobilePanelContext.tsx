'use client';

import { createContext, useContext, useState } from 'react';

type MobilePanelContextType = {
  view: 'list' | 'bookmarks' | null;
  setView: React.Dispatch<React.SetStateAction<'list' | 'bookmarks' | null>>;
};

const MobilePanelContext = createContext<MobilePanelContextType | undefined>(
  undefined
);

export function MobilePanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
