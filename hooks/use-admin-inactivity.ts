import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { logoutAdmin } from "@/lib/admin-auth"

interface InactivityConfig {
  timeoutMinutes?: number
  warningMinutes?: number
}

/**
 * Hook para manejar la inactividad del administrador
 * Cierra sesión automáticamente después del tiempo de inactividad configurado
 */
export function useAdminInactivity(config?: InactivityConfig) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityMinutes = config?.timeoutMinutes ?? 5
  const warningMinutes = config?.warningMinutes ?? 1

  const getInactivityTimeout = useCallback(() => {
    if (typeof window === "undefined") return inactivityMinutes * 60 * 1000
    
    const customTimeout = localStorage.getItem("adminInactivityTimeout")
    if (customTimeout) {
      const minutes = parseInt(customTimeout, 10)
      return minutes * 60 * 1000
    }
    return inactivityMinutes * 60 * 1000
  }, [inactivityMinutes])

  const getWarningTimeout = useCallback(() => {
    const timeout = getInactivityTimeout()
    return timeout - warningMinutes * 60 * 1000
  }, [getInactivityTimeout, warningMinutes])

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("adminInactivityWarning")
    await logoutAdmin()
    router.push("/admin/login")
  }, [router])

  const resetInactivityTimer = useCallback(() => {
    // Limpiar timers previos
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)

    // Establecer timer de advertencia
    warningTimeoutRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("adminInactivityWarning", "true")
        // Emitir evento para mostrar notificación
        window.dispatchEvent(new CustomEvent("adminInactivityWarning"))
      }
    }, getWarningTimeout())

    // Establecer timer de cierre de sesión
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, getInactivityTimeout())

    // Limpiar la advertencia
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminInactivityWarning")
    }
  }, [getInactivityTimeout, getWarningTimeout, handleLogout])

  useEffect(() => {
    // Resetear timer cuando el usuario interactúa
    const events = ["mousedown", "keydown", "touchstart", "click"]

    const handleActivity = () => {
      resetInactivityTimer()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    // Iniciar timer al montar
    resetInactivityTimer()

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    }
  }, [resetInactivityTimer])

  return { handleLogout }
}
