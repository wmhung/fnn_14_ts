'use client';

import { createContext, useContext, useState } from 'react';

type MobilePanelView = 'list' | 'bookmarks' | 'distance' | null;

type MobilePanelContextType = {
  view: MobilePanelView;
  setView: React.Dispatch<React.SetStateAction<MobilePanelView>>;
};

const MobilePanelContext = createContext<MobilePanelContextType | undefined>(
  undefined,
);

export function MobilePanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [view, setView] = useState<MobilePanelView>(null);

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
