"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { app, getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Image from "next/image"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Registro deshabilitado, solo login
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Por favor completa email y contraseña")
      setLoading(false)
      return
    }

    const auth = getAuth(app)
    try {
      // Solo login de admin
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Validar que el usuario exista en Firestore como administrador
      // Esperar un momento para permitir sincronización de datos
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const db = getDb()
        const userDoc = await getDoc(doc(db, "adminUsers", userCredential.user.uid))
        
        if (!userDoc.exists()) {
          // Usuario no existe en adminUsers después de esperar
          // Reintentar una vez más antes de hacer logout
          await new Promise(resolve => setTimeout(resolve, 500))
          const retryDoc = await getDoc(doc(db, "adminUsers", userCredential.user.uid))
          
          if (!retryDoc.exists()) {
            // Realmente no existe, eliminar de Firebase Auth
            await userCredential.user.delete()
            setError("Usuario no encontrado en la base de datos de administradores")
            setEmail("")
            setPassword("")
            setLoading(false)
            return
          }
          
          // Ahora existe, obtener rol
          const userData = retryDoc.data()
          const role = userData.role
          
          if (typeof window !== "undefined") {
            localStorage.setItem("adminRole", role)
          }
          
          router.push("/admin/dashboard")
        } else {
          // Usuario existe, obtener rol
          const userData = userDoc.data()
          const role = userData.role
          
          if (typeof window !== "undefined") {
            localStorage.setItem("adminRole", role)
          }
          
          router.push("/admin/dashboard")
        }
      } catch (err) {
        console.error("Error fetching user role:", err)
        setError("Error al validar usuario en la base de datos")
        setEmail("")
        setPassword("")
        setLoading(false)
      }
    } catch (error: any) {
      setError("Email o contraseña incorrectos")
      setEmail("")
      setPassword("")
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--neutral-light)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 relative">
              <Image src="/logo-ubatech.png" alt="Ubatech+Pro" fill className="object-contain" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--primary-dark)" }}>
            Panel Administrativo
          </h1>
          <p className="text-center text-gray-600 mb-8">Ubatech+Pro - Confianza & Seguridad</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary-dark)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ubatech.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 text-black bg-white"
                style={{ "--tw-ring-color": "var(--accent-turquoise)" } as React.CSSProperties}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary-dark)" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 text-black bg-white"
                style={{ "--tw-ring-color": "var(--accent-turquoise)" } as React.CSSProperties}
                disabled={loading}
              />
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--primary-dark)" }}
            >
              {loading ? "Verificando..." : "Acceder"}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}
