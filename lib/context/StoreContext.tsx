'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { STORES_CONFIG, DEFAULT_STORE_ID, StoreConfig } from '../config/constants';
import { getThemeConfig, ThemeConfig } from '../themes/themeConfig';

interface StoreContextType {
  currentStore: string;
  storeConfig: StoreConfig;
  theme: ThemeConfig;
  allStores: typeof STORES_CONFIG;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<string>(DEFAULT_STORE_ID);
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig(DEFAULT_STORE_ID));
  const pathname = usePathname();

  useEffect(() => {
    let storeId: string = DEFAULT_STORE_ID;

    if (pathname?.includes('/ubatech')) {
      storeId = 'ubatech';
    } else if (pathname?.includes('/djcelutecnico')) {
      storeId = 'djcelutecnico';
    }

    setCurrentStore(storeId);
    setTheme(getThemeConfig(storeId));
  }, [pathname]);

  const value: StoreContextType = {
    currentStore,
    storeConfig: STORES_CONFIG[currentStore],
    theme,
    allStores: STORES_CONFIG,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return context;
};
