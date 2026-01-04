import { useFirestoreDoc } from './useFirestoreDoc'
import { getStoreSettingsDefault } from '@/lib/config/constants'

export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeHours: string
  description: string
  updatedAt?: string
  error?: string
}

export function useStoreSettings(storeId?: string) {
  const defaultSettings = getStoreSettingsDefault(storeId)
  const result = useFirestoreDoc<StoreSettings>('store_settings', 'store_settings', {
    defaultValue: defaultSettings,
    realtime: true,
    cache: true,
    cacheKey: `store_settings_${storeId || 'default'}`,
  })

  // Retorna con propiedades compatibles y garantiza que nunca es null
  return {
    settings: result.data || defaultSettings,
    loading: result.loading,
    error: result.error,
    reload: result.reload,
  }
}
