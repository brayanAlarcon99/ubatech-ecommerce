import { useEffect, useState, useCallback } from "react"
import { getDb } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

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

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ubatech+Pro",
  storeEmail: "info@ubatech.com",
  storePhone: "+57 3134588107",
  storeAddress: "ubaté, colombia",
  storeHours: "Lunes - Viernes: 8am - 6pm",
  description: "Plataforma de compras online",
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setError(null)
      
      const db = getDb()
      
      // Usar onSnapshot para escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(
        doc(db, "store_settings", "store_settings"),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
            const newSettings: StoreSettings = {
              storeName: data.storeName || DEFAULT_SETTINGS.storeName,
              storeEmail: data.storeEmail || DEFAULT_SETTINGS.storeEmail,
              storePhone: data.storePhone || DEFAULT_SETTINGS.storePhone,
              storeAddress: data.storeAddress || DEFAULT_SETTINGS.storeAddress,
              storeHours: data.storeHours || DEFAULT_SETTINGS.storeHours,
              description: data.description || DEFAULT_SETTINGS.description,
              updatedAt: data.updatedAt,
            }
            setSettings(newSettings)
            console.log("[Hook] ✅ Store settings cargados desde Firestore en tiempo real")
          } else {
            console.warn("[Hook] store_settings document no existe")
            setSettings(DEFAULT_SETTINGS)
          }
          setLoading(false)
        },
        (docError) => {
          console.error("[Hook] Error escuchando store_settings:", docError)
          setError(docError.message)
          setSettings(DEFAULT_SETTINGS)
          setLoading(false)
        }
      )

      // Retornar función para dejar de escuchar cuando el componente se desmonta
      return unsubscribe
    } catch (err) {
      console.error("[Hook] Error en loadSettings:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setSettings(DEFAULT_SETTINGS)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    loadSettings().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [loadSettings])

  const reload = useCallback(async () => {
    setLoading(true)
    await loadSettings()
  }, [loadSettings])

  return { settings, loading, error, reload }
}
