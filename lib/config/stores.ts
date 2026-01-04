export const STORES = {
  ubatech: {
    id: 'ubatech',
    name: 'UbaTech',
    slug: 'ubatech',
    color: '#000000',
    description: 'Tu tienda de tecnología',
    logo: '/logo-ubatech.png',
  },
  djcelutecnico: {
    id: 'djcelutecnico',
    name: 'DJ Celutecnico',
    slug: 'djcelutecnico',
    color: '#a00009',
    description: 'Tu tienda DJ',
    logo: '/logo-djcelutecnico.png',
  },
};

export const DEFAULT_STORE = 'ubatech';

export type StoreId = keyof typeof STORES;
export type StoreConfig = (typeof STORES)[StoreId];
