"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function InitDBPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const initializeDatabase = async () => {
    setLoading(true)
    setError("")
    setStatus("Inicializando base de datos...")

    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setStatus("✅ Base de datos inicializada correctamente. Redirigiendo...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(data.message || "Error al inicializar la base de datos")
        setStatus("Error")
      }
    } catch (err) {
      console.error("[INIT_DB] Error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al inicializar la base de datos")
      setStatus("Error al inicializar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Inicializar Base de Datos</CardTitle>
            <CardDescription>Crea las colecciones y datos de ejemplo en Firestore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status && (
              <div
                className={`p-3 rounded-lg text-sm ${success ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
              >
                {status}
              </div>
            )}

            {error && <div className="p-3 rounded-lg text-sm bg-red-100 text-red-800">{error}</div>}

            <Button onClick={initializeDatabase} disabled={loading} className="w-full" size="lg">
              {loading ? "Inicializando..." : "Inicializar Base de Datos"}
            </Button>

            {success && (
              <div className="space-y-2 pt-4">
                <Link href="/admin/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ir al Panel de Admin
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ir a la Tienda
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
