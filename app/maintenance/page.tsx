"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getPublicSiteStatus } from "@/lib/public-site-status"
import { useRouter } from "next/navigation"
import { usePlatformInfo } from "@/hooks/use-platform-info"

export default function MaintenancePage() {
  const [showMaintenance, setShowMaintenance] = useState<boolean | null>(null)
  const [lastChecked, setLastChecked] = useState<number>(0)
  const router = useRouter()
  const { platformInfo } = usePlatformInfo()
  const CHECK_INTERVAL = 5000 // Verificar cada 5 segundos

  useEffect(() => {
    checkSiteStatus()
    const interval = setInterval(checkSiteStatus, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  async function checkSiteStatus() {
    try {
      const status = await getPublicSiteStatus()
      setLastChecked(Date.now())

      if (status.isPublic) {
        // La página está disponible, redirigir a la página principal
        router.push("/")
      } else {
        // Mantener en mantenimiento
        setShowMaintenance(true)
      }
    } catch (error) {
      console.error("Error checking site status:", error)
      // En caso de error, mostrar mantenimiento para ser seguro
      setShowMaintenance(true)
    }
  }

  // Si aún está verificando, mostrar algo temporal
  if (showMaintenance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando estado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Icono */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            En Mantenimiento
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-6">
            Estamos realizando tareas de mantenimiento en nuestro sitio. 
            Volveremos pronto con nuevas mejoras.
          </p>

          {/* Mensaje adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Nos disculpamos por las molestias. 
              <br />
              El sitio estará disponible nuevamente pronto.
            </p>
          </div>

          {/* Información de contacto (opcional) */}
          <div className="border-t pt-6">
            <p className="text-xs text-gray-500 mb-2">¿Preguntas?</p>
            <p className="text-sm text-gray-700">
              Contáctanos en:{" "}
              <a href={`mailto:${platformInfo.supportEmail}`} className="text-blue-600 hover:text-blue-700 font-medium">
                {platformInfo.supportEmail}
              </a>
            </p>
          </div>

          {/* Indicador de verificación automática */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Verificando estado automáticamente...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
