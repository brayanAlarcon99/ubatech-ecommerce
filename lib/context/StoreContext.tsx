'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { STORES, DEFAULT_STORE, StoreId, StoreConfig } from '../config/stores';
import { getThemeConfig, ThemeConfig } from '../themes/themeConfig';

interface StoreContextType {
  currentStore: StoreId;
  storeConfig: StoreConfig;
  theme: ThemeConfig;
  allStores: typeof STORES;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<StoreId>(DEFAULT_STORE);
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig(DEFAULT_STORE));
  const pathname = usePathname();

  useEffect(() => {
    let storeId: StoreId = DEFAULT_STORE;

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
    storeConfig: STORES[currentStore],
    theme,
    allStores: STORES,
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
