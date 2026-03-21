'use client';
import { createContext, useContext, useState } from 'react';

type UIContextType = {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
};

const UIContext = createContext<UIContextType>({
  isSidebarOpen: false,
  setSidebarOpen: () => {},
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <UIContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
