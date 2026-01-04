"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getAuth } from "firebase/auth"
import { app, getDb } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { getInactivityTimeout, setInactivityTimeout } from "@/lib/admin-auth"
import PublicSiteControl from "./public-site-control"

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [inactivityTimeout, setInactivityTimeoutValue] = useState(5)
  const [isSecuritySuper, setIsSecuritySuper] = useState(false)
  const [user, setUser] = useState<import("firebase/auth").User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: "Plataforma de compras online",
  })
  const [platformData, setPlatformData] = useState({
    version: "1.0.0",
    lastUpdate: "Diciembre 2025",
    supportEmail: "support@ubatech.com",
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Cargar configuración desde Firestore
  useEffect(() => {
    loadSettings()
    
    // Obtener usuario autenticado para PublicSiteControl
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Cargar rol desde localStorage
        const role = localStorage.getItem("adminRole")
        setUserRole(role)
      }
    })
    
    return () => unsubscribe()
  }, [])

  const loadSettings = async () => {
    try {
      const db = getDb()
      
      // Cargar información de la plataforma
      const platformSnapshot = await getDocs(collection(db, "platform_info"))
      if (!platformSnapshot.empty) {
        const platform = platformSnapshot.docs[0].data()
        setPlatformData({
          version: platform.version || "1.0.0",
          lastUpdate: platform.lastUpdate || "Diciembre 2025",
          supportEmail: platform.supportEmail || "support@ubatech.com",
        })
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error("Error loading settings:", error)
      setIsInitialized(true)
    }
  }

  // Cargar tiempo de inactividad al montar
  useEffect(() => {
    const timeout = getInactivityTimeout()
    setInactivityTimeoutValue(timeout)
    
    // Verificar si es super usuario
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("adminRole")
      setIsSecuritySuper(role === "super")
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPlatformData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInactivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      setInactivityTimeoutValue(value)
    }
  }

  const handleSaveInactivity = async () => {
    if (inactivityTimeout < 1 || inactivityTimeout > 120) {
      setMessage("El tiempo debe estar entre 1 y 120 minutos")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    if (setInactivityTimeout(inactivityTimeout)) {
      setMessage("Tiempo de inactividad actualizado correctamente")
      setMessageType("success")
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage("Error al guardar el tiempo de inactividad")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleSavePlatform = async () => {
    setLoading(true)
    try {
      const db = getDb()
      const platformRef = doc(db, "platform_info", "platform_info")
      
      await setDoc(
        platformRef,
        {
          ...platformData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      setMessage("✓ Información de la plataforma guardada exitosamente")
      setMessageType("success")
      setTimeout(() => setMessage(""), 4000)
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error al guardar información de plataforma: " + String(error))
      setMessageType("error")
      setTimeout(() => setMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
        Configuración
      </h1>

      {isSecuritySuper && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
            Configuración de Seguridad
          </h2>
          <p className="text-sm text-gray-600 mb-4">Administra la configuración de seguridad y sesiones</p>
          
          {message && (
            <div className={`mb-4 px-4 py-3 rounded border ${messageType === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}>
              {message}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tiempo de Inactividad de Sesión</h3>
            <p className="text-sm text-blue-800 mb-4">
              Configura el tiempo máximo de inactividad antes de cerrar sesión automáticamente.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="inactivityTimeout" className="block text-sm font-medium text-gray-700">
                  Tiempo de inactividad (minutos)
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="inactivityTimeout"
                    type="number"
                    min="1"
                    max="120"
                    value={inactivityTimeout}
                    onChange={handleInactivityChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                    style={{ borderColor: "var(--accent-turquoise)" }}
                  />
                  <span className="text-sm text-gray-600">minutos</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Rango permitido: 1 a 120 minutos</p>
              </div>

              <button
                onClick={handleSaveInactivity}
                className="w-full px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: "var(--accent-purple)" }}
              >
                Guardar Configuración de Inactividad
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
          Información de la Plataforma
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {isSecuritySuper 
            ? "Administra los datos de versión, soporte de la plataforma. La descripción y configuración de tiendas se manejan en la sección 'Tiendas'" 
            : "Información de versión y soporte de la plataforma"}
        </p>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded border ${messageType === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
              Versión de la Plataforma
            </label>
            <input
              id="version"
              name="version"
              value={platformData.version}
              onChange={handlePlatformChange}
              placeholder="Ej: 1.0.0"
              disabled={!isSecuritySuper}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white ${!isSecuritySuper ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ borderColor: "var(--accent-turquoise)" }}
            />
          </div>

          <div>
            <label htmlFor="lastUpdate" className="block text-sm font-medium text-gray-700 mb-2">
              Última Actualización
            </label>
            <input
              id="lastUpdate"
              name="lastUpdate"
              value={platformData.lastUpdate}
              onChange={handlePlatformChange}
              placeholder="Ej: Diciembre 2025"
              disabled={!isSecuritySuper}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white ${!isSecuritySuper ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ borderColor: "var(--accent-turquoise)" }}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email de Soporte
            </label>
            <input
              id="supportEmail"
              name="supportEmail"
              type="email"
              value={platformData.supportEmail}
              onChange={handlePlatformChange}
              placeholder="Ej: support@ubatech.com"
              disabled={!isSecuritySuper}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white ${!isSecuritySuper ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ borderColor: "var(--accent-turquoise)" }}
            />
          </div>
        </div>

        {isSecuritySuper && (
          <button
            onClick={handleSavePlatform}
            disabled={loading}
            className="w-full px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
            style={{ backgroundColor: "var(--accent-turquoise)" }}
          >
            {loading ? "Guardando..." : "Guardar Información de Plataforma"}
          </button>
        )}
      </div>

      {/* Control de Página Pública - Solo para Superuser */}
      {(userRole === "super" || userRole === "superuser") && user && (
        <div className="mt-12">
          <PublicSiteControl userId={user.uid} userRole={userRole} />
        </div>
      )}
    </div>
  )
}
