'use client';

import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
