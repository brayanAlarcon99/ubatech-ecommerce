import { useFirestoreDoc } from './useFirestoreDoc'
import { DEFAULT_PLATFORM_INFO } from '@/lib/config/constants'

export interface PlatformInfo {
  version: string
  lastUpdate: string
  supportEmail: string
  description: string
}

export function usePlatformInfo() {
  const result = useFirestoreDoc<PlatformInfo>('platform_info', 'platform_info', {
    defaultValue: DEFAULT_PLATFORM_INFO,
    realtime: true,
    cache: true,
    cacheKey: 'platform_info',
  })

  // Retorna con propiedades compatibles y garantiza que nunca es null
  return {
    platformInfo: result.data || DEFAULT_PLATFORM_INFO,
    loading: result.loading,
    error: result.error,
    reload: result.reload,
  }
}
