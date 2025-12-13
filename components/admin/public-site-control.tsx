"use client"

import { useEffect, useState } from "react"
import { getPublicSiteStatus, setPublicSiteStatus } from "@/lib/public-site-status"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PublicSiteControlProps {
  userId: string
  userRole: string
}

export default function PublicSiteControl({ userId, userRole }: PublicSiteControlProps) {
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  // Solo mostrar si es superusuario (aceptar "super" o "superuser")
  if (userRole !== "superuser" && userRole !== "super") {
    return null
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      setLoading(true)
      const status = await getPublicSiteStatus()
      setIsPublic(status.isPublic)
    } catch (error) {
      console.error("Error loading public site status:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el estado de la página pública",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    try {
      setUpdating(true)
      await setPublicSiteStatus(!isPublic, userId)
      setIsPublic(!isPublic)
      toast({
        title: "Éxito",
        description: !isPublic
          ? "Página pública habilitada"
          : "Página pública deshabilitada - En mantenimiento",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating public site status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la página pública",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">🔐 Control de Página Pública</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-2 shadow-xl transition-all duration-300 ${
      isPublic 
        ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50" 
        : "border-red-400 bg-gradient-to-br from-red-50 to-orange-50"
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              {isPublic ? "🌐" : "🚧"} Control de Página Pública
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isPublic ? "✅ Página pública habilitada" : "⚠️ Página en modo mantenimiento"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-gray-200">
          <div className="flex-1">
            <p className="text-base font-bold block mb-2">
              Estado de la tienda
            </p>
            <p className="text-sm text-gray-700">
              {isPublic
                ? "🏪 La tienda está disponible para los clientes"
                : "🔒 La tienda está en mantenimiento. Los clientes verán una página de mantenimiento"}
            </p>
          </div>
          
          {/* Custom Toggle Button - Estilo iOS/Android */}
          <button
            onClick={handleToggle}
            disabled={updating}
            className={`ml-4 flex-shrink-0 relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
              isPublic
                ? "bg-green-500 focus:ring-green-500"
                : "bg-red-500 focus:ring-red-500"
            } ${updating ? "opacity-75 cursor-not-allowed" : "hover:shadow-lg"}`}
            title={isPublic ? "Click para deshabilitar" : "Click para habilitar"}
          >
            {/* Círculo blanco que se mueve */}
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${
                isPublic ? "translate-x-1" : "translate-x-10"
              }`}
            />
            
            {/* Texto dentro del botón */}
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pointer-events-none">
              {isPublic ? (
                <span className="mr-3">ON</span>
              ) : (
                <span className="ml-3">OFF</span>
              )}
            </span>
          </button>
        </div>

        {/* Estado Indicador */}
        <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
          isPublic
            ? "bg-green-100 border-green-400"
            : "bg-red-100 border-red-400"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isPublic ? "bg-green-500" : "bg-red-500"}`} />
            <p className={`text-base font-semibold ${
              isPublic ? "text-green-700" : "text-red-700"
            }`}>
              {isPublic ? "✓ Página pública activa" : "✗ Página en mantenimiento"}
            </p>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-600 font-medium mb-1">Estado Actual</p>
            <p className={`text-lg font-bold ${
              isPublic ? "text-green-600" : "text-red-600"
            }`}>
              {isPublic ? "ACTIVO ✅" : "INACTIVO ❌"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-600 font-medium mb-1">Ver Clientes</p>
            <p className="text-lg font-bold text-gray-800">
              {isPublic ? "Tienda 🏪" : "Mantenimiento 🚧"}
            </p>
          </div>
        </div>

        {/* Botones de Ayuda */}
        <div className="pt-3 border-t-2 border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            💡 Usa este control para habilitar o deshabilitar la tienda de forma inmediata
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
