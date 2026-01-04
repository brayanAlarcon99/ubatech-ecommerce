import { useStore } from '@/lib/context/StoreContext';

export const useStoreTheme = () => {
  const { theme, storeConfig, currentStore } = useStore();

  return {
    theme,
    storeConfig,
    currentStore,
    primaryColor: theme.primary,
    secondaryColor: theme.secondary,
    accentColor: theme.accent,
    backgroundColor: theme.background,
    textColor: theme.text,
    borderColor: theme.border,
  };
};
