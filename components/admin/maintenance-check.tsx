"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminMaintenanceStatus } from "@/lib/admin-maintenance-status"

interface MaintenanceCheckProps {
  userRole: string | null
  children: React.ReactNode
}

/**
 * Componente que envuelve el contenido del dashboard admin y verifica
 * si está en modo mantenimiento. Si lo está y el usuario no es super usuario,
 * redirige a la página de mantenimiento.
 */
export default function MaintenanceCheck({ userRole, children }: MaintenanceCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMaintenance, setIsMaintenance] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkMaintenance() {
      try {
        // Si es super usuario, nunca aplicar restricción
        if (userRole === "super" || userRole === "superuser") {
          setIsLoading(false)
          return
        }

        const status = await getAdminMaintenanceStatus()
        if (status.isEnabled) {
          setIsMaintenance(true)
          // Redirigir a página de mantenimiento
          setTimeout(() => {
            router.push("/admin/maintenance")
          }, 500)
        }
      } catch (error) {
        console.error("Error checking maintenance status:", error)
        // En caso de error, no bloquear acceso
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenance()
  }, [userRole, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-700 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isMaintenance) {
    return null // La redirección ya está en progreso
  }

  return <>{children}</>
}
