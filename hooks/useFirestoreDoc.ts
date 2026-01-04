/**
 * Hook genérico reutilizable para lectura de documentos Firestore
 * Reemplaza useStoreInfo, useStoreSettings, usePlatformInfo, etc.
 * Consolida 150+ líneas de lógica duplicada en 1 hook reutilizable
 */

import { useEffect, useState, useCallback } from 'react'
import { getDb } from '@/lib/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'

export interface UseFirestoreDocOptions<T> {
  defaultValue?: T
  realtime?: boolean // Si true, escucha cambios en tiempo real
  cache?: boolean // Si true, cachea el valor en localStorage
  cacheKey?: string
}

export interface UseFirestoreDocResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * Hook genérico para obtener un documento de Firestore
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @param options Opciones de configuración
 * @returns { data, loading, error, reload }
 *
 * @example
 * // Uso simple
 * const { data: storeInfo } = useFirestoreDoc<StoreInfo>('stores', storeId)
 *
 * @example
 * // Con opciones
 * const { data: settings } = useFirestoreDoc<StoreSettings>(
 *   'store_settings',
 *   'store_settings',
 *   {
 *     defaultValue: DEFAULT_SETTINGS,
 *     realtime: true,
 *     cache: true,
 *     cacheKey: 'store_settings'
 *   }
 * )
 */
export function useFirestoreDoc<T = any>(
  collectionName: string,
  docId: string,
  options: UseFirestoreDocOptions<T> = {}
): UseFirestoreDocResult<T> {
  const {
    defaultValue = null,
    realtime = false,
    cache = false,
    cacheKey = `firestore_${collectionName}_${docId}`,
  } = options

  const [data, setData] = useState<T | null>(() => {
    // Intenta cargar del cache primero
    if (cache && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (err) {
        console.warn(`[useFirestoreDoc] Error reading cache for ${cacheKey}:`, err)
      }
    }
    return defaultValue ?? null
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar datos una sola vez
  const loadOnce = useCallback(async () => {
    try {
      setError(null)
      const db = getDb()
      const docRef = doc(db, collectionName, docId)
      const docSnapshot = await getDoc(docRef)

      if (docSnapshot.exists()) {
        const docData = docSnapshot.data() as T
        setData(docData)

        // Guardar en cache si está habilitado
        if (cache && typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(docData))
          } catch (err) {
            console.warn(`[useFirestoreDoc] Error saving to cache:`, err)
          }
        }

        console.log(
          `[useFirestoreDoc] ✅ Loaded ${collectionName}/${docId} (once)`
        )
      } else {
        console.warn(
          `[useFirestoreDoc] Document ${collectionName}/${docId} not found`
        )
        setData(defaultValue ?? null)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error(
        `[useFirestoreDoc] Error loading ${collectionName}/${docId}:`,
        err
      )
      setError(errorMsg)
      setData(defaultValue ?? null)
    } finally {
      setLoading(false)
    }
  }, [collectionName, docId, defaultValue, cache, cacheKey])

  // Función para escuchar cambios en tiempo real
  const setupRealtime = useCallback(() => {
    try {
      const db = getDb()
      const docRef = doc(db, collectionName, docId)

      const unsubscribe = onSnapshot(
        docRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const docData = docSnapshot.data() as T
            setData(docData)

            // Actualizar cache
            if (cache && typeof window !== 'undefined') {
              try {
                localStorage.setItem(cacheKey, JSON.stringify(docData))
              } catch (err) {
                console.warn(`[useFirestoreDoc] Error saving to cache:`, err)
              }
            }

            console.log(
              `[useFirestoreDoc] ✅ Updated ${collectionName}/${docId} (realtime)`
            )
          } else {
            console.warn(
              `[useFirestoreDoc] Document ${collectionName}/${docId} not found`
            )
            setData(defaultValue ?? null)
          }
          setLoading(false)
        },
        (err) => {
          console.error(
            `[useFirestoreDoc] Realtime error for ${collectionName}/${docId}:`,
            err
          )
          setError(err.message)
          setLoading(false)
        }
      )

      return unsubscribe
    } catch (err) {
      console.error(`[useFirestoreDoc] Error setting up realtime:`, err)
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
      return null
    }
  }, [collectionName, docId, defaultValue, cache, cacheKey])

  // Effect para cargar los datos
  useEffect(() => {
    if (realtime) {
      // Modo realtime
      const unsubscribe = setupRealtime()
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } else {
      // Modo una sola lectura
      loadOnce()
    }
  }, [collectionName, docId, realtime, loadOnce, setupRealtime])

  // Función para recargar manualmente
  const reload = useCallback(async () => {
    setLoading(true)
    await loadOnce()
  }, [loadOnce])

  return { data, loading, error, reload }
}

/**
 * Hook especializado para store info
 * @deprecated Use useFirestoreDoc<StoreInfo>('stores', storeId) instead
 */
export function useStoreInfoOptimized<T = any>(storeId: string) {
  return useFirestoreDoc<T>('stores', storeId, {
    cache: true,
    cacheKey: `store_${storeId}`,
  })
}

/**
 * Hook especializado para store settings
 * @deprecated Use useFirestoreDoc<StoreSettings>('store_settings', 'store_settings') instead
 */
export function useStoreSettingsOptimized<T = any>(storeId?: string) {
  return useFirestoreDoc<T>('store_settings', 'store_settings', {
    realtime: true,
    cache: true,
    cacheKey: `store_settings_${storeId || 'default'}`,
  })
}

/**
 * Hook especializado para platform info
 * @deprecated Use useFirestoreDoc<PlatformInfo>('platform_info', 'platform_info') instead
 */
export function usePlatformInfoOptimized<T = any>() {
  return useFirestoreDoc<T>('platform_info', 'platform_info', {
    realtime: true,
    cache: true,
    cacheKey: 'platform_info',
  })
}
