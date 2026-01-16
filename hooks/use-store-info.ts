import { useFirestoreDoc } from './useFirestoreDoc'
import { STORES_CONFIG, getStoreConfig } from '@/lib/config/constants'
import { setDocByPath } from '@/lib/firestore-utils'
import { useCallback } from 'react'

export interface StoreInfo {
  id: string
  name: string
  email: string
  /**
   * ☎️ Teléfono / WhatsApp - Un único número para toda la tienda
   * Se usa en:
   * - Footer (contacto, llamadas)
   * - Página de Contacto (llamadas y WhatsApp)
   * - Carrito (enlace para editar)
   * - Checkout (WhatsApp para enviar orden)
   * - Cualquier otra página que necesite el número
   */
  phone: string
  address: string
  businessHours: string
  mapsUrl: string
  logo: string
  primaryColor: string
  secondaryColor: string
  description: string
  aboutUs: string
  instagram?: string
  facebook?: string
  tiktok?: string
}

export function useStoreInfo(storeId: string) {
  const defaultStore = getStoreConfig(storeId) as StoreInfo
  const result = useFirestoreDoc<StoreInfo>('stores', storeId, {
    defaultValue: defaultStore,
    cache: true,
    cacheKey: `store_${storeId}`,
  })

  const updateStoreInfo = useCallback(async (updates: Partial<StoreInfo>) => {
    try {
      const firebaseResult = await setDocByPath('stores', storeId, updates)
      if (firebaseResult.success) {
        await result.reload()
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating store info:', err)
      return false
    }
  }, [storeId, result])

  // Retorna con propiedades compatibles con el código existente y garantiza que nunca es null
  return {
    storeInfo: result.data || defaultStore,
    loading: result.loading,
    error: result.error,
    reload: result.reload,
    updateStoreInfo,
  }
}
