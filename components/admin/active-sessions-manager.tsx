import { useState, useEffect } from 'react'
import { LogOut, Smartphone, AlertTriangle } from 'lucide-react'
import { getAuth } from 'firebase/auth'
import { getOrCreateDeviceId } from '@/lib/admin-session-manager'

interface Session {
  id: string
  deviceId: string
  deviceName: string
  lastActivity: string
  createdAt: string
  isActive: boolean
}

interface ActiveSessionsManagerProps {
  userId: string
  token: string
  onSessionClosed?: () => void
}

export default function ActiveSessionsManager({
  userId,
  token,
  onSessionClosed
}: ActiveSessionsManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [closingDeviceId, setClosingDeviceId] = useState<string | null>(null)
  const currentDeviceId = getOrCreateDeviceId()

  // Cargar sesiones activas
  async function loadSessions() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Diferencia entre errores de autenticación y otros errores
        if (response.status === 401) {
          console.warn('[Sessions Manager] Unauthorized - token may be expired')
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
          return
        }
        
        if (response.status === 500) {
          console.warn('[Sessions Manager] Server error 500 - will retry', errorData)
          // Para errores 500, intenta nuevamente después
          setError('Error temporal. Reintentando...')
          setTimeout(() => {
            loadSessions()
          }, 3000)
          return
        }
        
        console.error('[Sessions Manager] API error:', response.status, errorData)
        throw new Error(`Failed to load sessions: ${response.status} ${errorData.error || ''}`)
      }

      const data = await response.json()
      setSessions(data.sessions || [])
      setError(null)
    } catch (err: any) {
      console.error('[Sessions Manager] Error loading sessions:', err.message || err)
      setError('No se pudieron cargar las sesiones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar sesiones al montar el componente
  useEffect(() => {
    loadSessions()
    // Recargar sesiones cada 30 segundos
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [token, userId])

  // Cerrar una sesión remota
  async function handleCloseRemoteSession(deviceId: string) {
    try {
      setClosingDeviceId(deviceId)
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-ID': currentDeviceId
        },
        body: JSON.stringify({
          action: 'close-remote',
          deviceId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to close session')
      }

      // Recargar sesiones después de cerrar
      await loadSessions()
      onSessionClosed?.()
    } catch (err: any) {
      console.error('Error closing session:', err)
      setError(err.message || 'Error al cerrar la sesión')
    } finally {
      setClosingDeviceId(null)
    }
  }

  const otherActiveSessions = sessions.filter(
    session => session.deviceId !== currentDeviceId && session.isActive
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (otherActiveSessions.length === 0) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">
            Otras sesiones activas ({otherActiveSessions.length})
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            Has iniciado sesión en otros dispositivos. Cierra las sesiones que no estés usando.
          </p>

          <div className="space-y-2">
            {otherActiveSessions.map((session) => (
              <div
                key={session.deviceId}
                className="bg-white border border-amber-100 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">
                      {session.deviceName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Última actividad: {new Date(session.lastActivity).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCloseRemoteSession(session.deviceId)}
                  disabled={closingDeviceId === session.deviceId}
                  className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-700 disabled:text-gray-500 text-sm rounded font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
