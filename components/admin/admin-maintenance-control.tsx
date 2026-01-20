"use client"

import { useEffect, useState } from "react"
import { getAdminMaintenanceStatus, setAdminMaintenanceStatus } from "@/lib/admin-maintenance-status"
import { useToast } from "@/hooks/use-toast"

interface AdminMaintenanceControlProps {
  userId: string
  userRole: string | null
}

export default function AdminMaintenanceControl({ userId, userRole }: AdminMaintenanceControlProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("Panel administrativo en mantenimiento")
  const [estimatedTime, setEstimatedTime] = useState("15 minutos")
  const { toast } = useToast()

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      setLoading(true)
      const status = await getAdminMaintenanceStatus()
      setIsEnabled(status.isEnabled)
      if (status.message) setMessage(status.message)
      if (status.estimatedTime) setEstimatedTime(status.estimatedTime)
    } catch (error) {
      console.error("Error loading maintenance status:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el estado del mantenimiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    try {
      setUpdating(true)
      await setAdminMaintenanceStatus(!isEnabled, userId, {
        message,
        estimatedTime,
      })
      setIsEnabled(!isEnabled)
      toast({
        title: "Éxito",
        description: !isEnabled
          ? "🚧 Panel administrativo en modo mantenimiento"
          : "✅ Panel administrativo normalizado",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating maintenance status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del mantenimiento",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Solo mostrar si es superusuario (después de los hooks)
  if (userRole !== "superuser" && userRole !== "super") {
    return null
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 border-l-4 transition-all duration-300 ${
        isEnabled ? "border-orange-500 bg-orange-50" : "border-green-500 bg-green-50"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--primary-dark)" }}>
        {isEnabled ? "🚧" : "✅"} Modo Mantenimiento del Panel Admin
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        {isEnabled
          ? "El panel administrativo está en modo mantenimiento. Solo tú podrás acceder a él. Los administradores regulares verán una página de mantenimiento."
          : "El panel administrativo funciona normalmente. Todos los administradores autorizados pueden acceder."}
      </p>

      <div className="space-y-4">
        {isEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje para administradores</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={updating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                style={{ borderColor: "var(--accent-turquoise)" }}
              />
              <p className="text-xs text-gray-500 mt-1">Este mensaje se mostrará a los administradores regulares</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo estimado</label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                disabled={updating}
                placeholder="Ej: 15 minutos, 1 hora"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                style={{ borderColor: "var(--accent-turquoise)" }}
              />
              <p className="text-xs text-gray-500 mt-1">Tiempo estimado de duración del mantenimiento</p>
            </div>
          </>
        )}

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 ${
            isEnabled ? "bg-red-500 hover:bg-red-600 hover:shadow-lg" : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {updating
            ? isEnabled
              ? "Desactivando..."
              : "Activando..."
            : isEnabled
              ? "🚫 Desactivar Mantenimiento"
              : "🚧 Activar Mantenimiento"}
        </button>

        {isEnabled && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold text-yellow-900">⚠️ Estado Actual</p>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside text-xs">
              <li>✅ Tú tienes acceso completo al panel</li>
              <li>🚫 Los administradores regulares verán página de mantenimiento</li>
              <li>🌐 La página pública NO es afectada</li>
              <li>📧 Pueden contactarte para reportar problemas</li>
            </ul>
          </div>
        )}

        {!isEnabled && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold text-blue-900">ℹ️ Información</p>
            <p className="text-blue-800 text-xs">
              El modo mantenimiento permite aislar al panel administrativo sin afectar a los clientes. Ideal para
              actualizaciones, investigaciones de seguridad o resolución de problemas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
