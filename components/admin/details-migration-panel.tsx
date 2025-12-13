"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface MigrationResult {
  success: boolean
  message: string
  data?: {
    success: boolean
    totalProducts: number
    updatedProducts: number
  }
  error?: string
}

export default function DetailsMigrationPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [executed, setExecuted] = useState(false)
  const { toast } = useToast()

  async function handleMigration() {
    setLoading(true)
    try {
      const response = await fetch("/api/migrate/details", {
        method: "POST",
      })

      const data: MigrationResult = await response.json()
      setResult(data)
      setExecuted(true)

      if (data.success) {
        toast({
          title: "Migración completada",
          description: `Se actualizaron ${data.data?.updatedProducts} de ${data.data?.totalProducts} productos`,
        })
      } else {
        toast({
          title: "Error en migración",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setResult({
        success: false,
        message: "Error al ejecutar migración",
        error: errorMessage,
      })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--primary-dark)" }}>
        Migración de Detalles
      </h2>

      <p className="text-gray-600 mb-6">
        Este proceso agregará el campo de detalles a todos los productos existentes que no lo tengan.
        Los productos que ya tengan detalles no serán modificados.
      </p>

      {!executed && (
        <button
          onClick={handleMigration}
          disabled={loading}
          className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ backgroundColor: "var(--accent-green)" }}
        >
          {loading ? "Ejecutando migración..." : "Ejecutar Migración de Detalles"}
        </button>
      )}

      {result && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <h3 className="font-semibold mb-2">{result.message}</h3>
          {result.data && (
            <div className="space-y-1 text-sm">
              <p>Total de productos: {result.data.totalProducts}</p>
              <p>Productos actualizados: {result.data.updatedProducts}</p>
            </div>
          )}
          {result.error && <p className="text-sm mt-2">Error: {result.error}</p>}

          <button
            onClick={() => {
              setResult(null)
              setExecuted(false)
            }}
            className="mt-4 px-4 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
