"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import { app } from "@/lib/firebase"

export default function MaintenancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Actualizar la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Verificar si el usuario es super usuario
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      const role = localStorage.getItem("adminRole")
      if (role === "super" || role === "superuser") {
        // Si es super usuario, redirige al dashboard
        router.push("/admin/dashboard")
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      unsubscribe()
      clearInterval(timer)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      const auth = getAuth(app)
      await signOut(auth)
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminRole")
      localStorage.removeItem("adminUserId")
      router.push("/admin/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-orange-900 font-medium">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">🚧</div>
          <h1 className="text-3xl font-bold text-white">Mantenimiento</h1>
        </div>

        {/* Contenido Principal */}
        <div className="p-8 text-center space-y-6">
          {/* Título */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Panel Administrativo en Mantenimiento
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              El panel administrativo se encuentra temporalmente fuera de servicio debido a trabajos de mantenimiento y
              mejoras.
            </p>
          </div>

          {/* Hora actual */}
          <div className="text-xs text-gray-500">
            Hora actual: <span className="font-mono">{currentTime.toLocaleTimeString("es-ES")}</span>
          </div>

          {/* Tiempo Estimado */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900">⏱️ Tiempo Estimado</p>
            <p className="text-2xl font-bold text-blue-600">15 minutos</p>
            <p className="text-xs text-blue-700">Volveremos pronto con mejoras</p>
          </div>

          {/* Información */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 space-y-3">
            <p className="text-sm font-semibold text-purple-900">📋 Información Importante</p>
            <ul className="text-xs text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">→</span>
                <span>La página pública NO es afectada por el mantenimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">→</span>
                <span>Los clientes pueden continuar comprando normalmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">→</span>
                <span>Intenta acceder más tarde o contacta al super usuario</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
            <p className="text-sm font-semibold text-gray-700">💬 Necesitas Ayuda?</p>
            <p className="text-xs text-gray-600 mb-3">Contacta con el super usuario o el equipo de soporte:</p>
            <a
              href="mailto:support@ubatech.com"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
            >
              📧 support@ubatech.com
            </a>
          </div>

          {/* Separador */}
          <hr className="border-gray-200" />

          {/* Botones de Acción */}
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
            >
              🔄 Reintentar
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 space-y-1 pt-2">
            <p>UbaTech © 2026 - Plataforma de E-commerce</p>
            <p>Gracias por tu paciencia</p>
          </div>
        </div>
      </div>
    </div>
  )
}
