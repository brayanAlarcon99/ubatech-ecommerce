import { useEffect, useState, useCallback } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, onSnapshot, query } from "firebase/firestore"

export interface PlatformInfo {
  version: string
  lastUpdate: string
  supportEmail: string
  description: string
}

const defaultPlatformInfo: PlatformInfo = {
  version: "1.0.0",
  lastUpdate: "Diciembre 2025",
  supportEmail: "support@ubatech.com",
  description: "Plataforma de compras online",
}

export function usePlatformInfo() {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(defaultPlatformInfo)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const db = getDb()
      const platformSnapshot = await getDocs(collection(db, "platform_info"))
      
      if (!platformSnapshot.empty) {
        const data = platformSnapshot.docs[0].data() as PlatformInfo
        setPlatformInfo({
          version: data.version || defaultPlatformInfo.version,
          lastUpdate: data.lastUpdate || defaultPlatformInfo.lastUpdate,
          supportEmail: data.supportEmail || defaultPlatformInfo.supportEmail,
          description: data.description || defaultPlatformInfo.description,
        })
        console.log("[Hook Platform] ✅ Platform info cargada desde Firestore")
      } else {
        console.warn("[Hook Platform] Colección platform_info vacía, usando valores por defecto")
        setPlatformInfo(defaultPlatformInfo)
      }
    } catch (error) {
      console.error("[Hook Platform] Error cargando platform info:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setPlatformInfo(defaultPlatformInfo)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Cargar datos iniciales
    reload()

    // Opcional: Intentar configurar listener en tiempo real
    let unsubscribe: (() => void) | null = null
    try {
      const db = getDb()
      const platformQuery = query(collection(db, "platform_info"))
      
      unsubscribe = onSnapshot(
        platformQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as PlatformInfo
            setPlatformInfo({
              version: data.version || defaultPlatformInfo.version,
              lastUpdate: data.lastUpdate || defaultPlatformInfo.lastUpdate,
              supportEmail: data.supportEmail || defaultPlatformInfo.supportEmail,
              description: data.description || defaultPlatformInfo.description,
            })
            console.log("[Hook Platform] ✅ Actualizado en tiempo real")
          }
        },
        (error) => {
          console.warn("[Hook Platform] Error en listener tiempo real:", error)
          // Continuar con valores actuales
        }
      )
    } catch (err) {
      console.warn("[Hook Platform] No se pudo establecer listener:", err)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reload()
      }
    }

    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (typeof window !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [reload])

  return { platformInfo, loading, error, reload }
}
