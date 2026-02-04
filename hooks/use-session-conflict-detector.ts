import { useEffect, useRef } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { getOrCreateDeviceId } from '@/lib/admin-session-manager'
import { useToast } from '@/hooks/use-toast'

interface UseSessionConflictDetectorProps {
  userId: string | null
  token: string | null
  enabled?: boolean
}

/**
 * Hook que detecta si la sesión del usuario ha sido cerrada remotamente
 * (por ejemplo, si se cerró manualmente desde otro dispositivo)
 */
export function useSessionConflictDetector({
  userId,
  token,
  enabled = true
}: UseSessionConflictDetectorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    if (!enabled || !userId || !token) {
      return
    }

    const deviceId = getOrCreateDeviceId()

    // Función para validar la sesión
    async function validateSession() {
      if (isCheckingRef.current) return

      try {
        isCheckingRef.current = true

        const response = await fetch('/api/admin/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Device-ID': deviceId
          },
          body: JSON.stringify({
            action: 'validate',
            deviceId
          })
        })

        // Manejar errores de red o servidor
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn('[Session Validator] API returned status:', response.status, errorData)
          
          // Si es 401 (token inválido) o 500 persistente, considerar sesión inválida
          if (response.status === 401) {
            throw new Error('Session validation failed: Unauthorized')
          }
          
          // Para otros errores (500, 502, etc), solo registra y reintenta
          console.warn('[Session Validator] Will retry session validation next cycle')
          return
        }

        const data = await response.json()

        if (!data.valid) {
          // La sesión fue cerrada remotamente
          if (data.reason === 'closed_remotely') {
            console.info('[Session Validator] Session closed remotely')
            toast({
              title: 'Sesión cerrada',
              description: 'Tu sesión fue cerrada desde otro dispositivo. Por favor, inicia sesión nuevamente.',
              variant: 'destructive'
            })
          } else {
            console.info('[Session Validator] Session invalid')
            toast({
              title: 'Sesión inválida',
              description: 'Tu sesión no es válida. Por favor, inicia sesión nuevamente.',
              variant: 'destructive'
            })
          }

          // Cerrar sesión y redirigir al login
          const auth = getAuth()
          await signOut(auth)
          
          // Limpiar localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminRole')
          }

          // Redirigir al login con parámetro
          setTimeout(() => {
            router.push('/admin/login?session_closed=true')
          }, 1000)
        }
      } catch (error: any) {
        console.error('[Session Validator] Error validating session:', error.message || error)
        // No hacer nada en caso de error, reintentar la próxima vez
        // Excepto si es un error de autenticación (401)
        if (error.message?.includes('Unauthorized')) {
          const auth = getAuth()
          signOut(auth).catch(() => {})
          router.push('/admin/login?session_invalid=true')
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    // Validar la sesión cada 60 segundos
    checkIntervalRef.current = setInterval(validateSession, 60000)

    // Validar inmediatamente al montar
    validateSession()

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [userId, token, enabled, router, toast])
}

/**
 * Hook para detectar intentos de acceso simultáneo en múltiples dispositivos
 * Cierra automáticamente sesiones anteriores cuando se detecta login en otro dispositivo
 */
export function useMultiDeviceSessionControl({
  userId,
  token,
  enabled = true
}: UseSessionConflictDetectorProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    const deviceId = getOrCreateDeviceId()

    // Escuchar cambios en el almacenamiento local (cuando se abre la sesión en otro dispositivo)
    function handleStorageChange(event: StorageEvent) {
      if (event.key === 'admin_session_login_timestamp') {
        // Alguien inició sesión en otro dispositivo
        const newTimestamp = parseInt(event.newValue || '0', 10)
        const currentTimestamp = parseInt(localStorage.getItem('admin_session_login_timestamp') || '0', 10)

        if (newTimestamp > currentTimestamp) {
          // Fue un login más reciente en otro dispositivo
          toast({
            title: 'Sesión cerrada',
            description: 'Se ha iniciado sesión en otro dispositivo. Tu sesión actual ha sido cerrada.',
            variant: 'destructive'
          })

          const auth = getAuth()
          signOut(auth)

          setTimeout(() => {
            window.location.href = '/admin/login?conflict=true'
          }, 2000)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userId, enabled, toast])
}
