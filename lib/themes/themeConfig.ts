import { StoreId } from '../config/stores';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

const baseThemes: Record<StoreId, ThemeConfig> = {
  ubatech: {
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#3B82F6',
    background: '#F9FAFB',
    text: '#1F2937',
    border: '#E5E7EB',
  },
  djcelutecnico: {
    primary: '#a00009',
    secondary: '#FFFFFF',
    accent: '#FF1744',
    background: '#F9FAFB',
    text: '#1F2937',
    border: '#E5E7EB',
  },
};

export const getThemeConfig = (storeId: StoreId): ThemeConfig => {
  return baseThemes[storeId] || baseThemes.ubatech;
};
