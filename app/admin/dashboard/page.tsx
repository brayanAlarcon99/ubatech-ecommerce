"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app, getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
// ...existing code...
import AdminHeader from "@/components/admin-header"
import AdminSidebar from "@/components/admin-sidebar"
import CategoriesManager from "@/components/admin/categories-manager"
import ProductsManager from "@/components/admin/products-manager"
import UsersManager from "@/components/admin/users-manager"
import OrdersManager from "@/components/admin/orders-manager"
import Analytics from "@/components/admin/analytics"
import Settings from "@/components/admin/settings"
import { useAdminInactivity } from "@/hooks/use-admin-inactivity"
import { getInactivityTimeout } from "@/lib/admin-auth"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [user, setUser] = useState<import("firebase/auth").User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showWarning, setShowWarning] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(0)
  
  // Obtener timeout configurado
  const inactivityMinutes = getInactivityTimeout()
  const { handleLogout } = useAdminInactivity({ timeoutMinutes: inactivityMinutes })

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Consultar el rol en Firestore
        try {
          const db = getDb()
          const userDoc = await getDoc(doc(db, "adminUsers", firebaseUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setRole(data.role)
            setLoading(false)
          } else {
            // Usuario no existe en adminUsers
            // Pero antes de logout forzado, esperar un momento para permitir sincronización
            // Esto previene logout accidental durante creación de usuarios
            const checkAgainAfterDelay = async () => {
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Verificar nuevamente
              const retryDoc = await getDoc(doc(db, "adminUsers", firebaseUser.uid))
              if (!retryDoc.exists()) {
                // Realmente no existe, logout forzado
                setRole(null)
                setError("Usuario no autorizado")
                setLoading(false)
                await auth.signOut()
                setTimeout(() => {
                  router.push("/admin/login")
                }, 2000)
              } else {
                // Ahora existe, cargar normalmente
                const data = retryDoc.data()
                setRole(data.role)
                setLoading(false)
              }
            }
            
            checkAgainAfterDelay().catch(err => {
              console.error("Error in retry check:", err)
              setLoading(false)
            })
          }
        } catch (err) {
          console.error("Error fetching user role:", err)
          setRole(null)
          setError("Error al cargar los datos de usuario")
          setLoading(false)
          // No hacer logout en caso de error de conexión, permitir reintentos
        }
      } else {
        setUser(null)
        setRole(null)
        setLoading(false)
        router.push("/admin/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  // Listener para advertencia de inactividad
  useEffect(() => {
    const handleInactivityWarning = () => {
      setShowWarning(true)
      toast({
        title: "Sesión expirando",
        description: "Tu sesión se cerrará en 1 minuto por inactividad",
        variant: "destructive",
      })

      let seconds = 60
      const interval = setInterval(() => {
        seconds -= 1
        setCountdownSeconds(seconds)
        if (seconds <= 0) {
          clearInterval(interval)
          setShowWarning(false)
        }
      }, 1000)

      return () => clearInterval(interval)
    }

    window.addEventListener("adminInactivityWarning", handleInactivityWarning)
    return () => window.removeEventListener("adminInactivityWarning", handleInactivityWarning)
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"
          style={{ borderTopColor: "var(--primary)" }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!user || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No autorizado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} userRole={role} />
        <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "#f8fafc" }}>
          
          {activeTab === "dashboard" && <Analytics />}
          {activeTab === "products" && <ProductsManager />}
          {activeTab === "categories" && <CategoriesManager />}
          {activeTab === "orders" && <OrdersManager />}
          {activeTab === "users" && (
            role === "super" ? (
              <UsersManager />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="text-lg">No tienes permiso para acceder a esta sección</p>
                </div>
              </div>
            )
          )}
          {activeTab === "settings" && <Settings />}
        </main>
      </div>
      {showWarning && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-1">Sesión expirando</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Tu sesión se cerrará por inactividad en {countdownSeconds} segundos
              </p>
              <button
                onClick={() => {
                  setShowWarning(false)
                  setCountdownSeconds(0)
                  toast({
                    title: "Sesión renovada",
                    description: "Tu sesión ha sido renovada",
                  })
                }}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Mantener sesión activa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
