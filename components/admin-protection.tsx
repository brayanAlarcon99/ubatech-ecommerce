import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app } from "@/lib/firebase"
import { useAdminInactivity } from "@/hooks/use-admin-inactivity"
import { useToast } from "@/hooks/use-toast"

interface AdminProtectionProps {
  children: ReactNode
  inactivityMinutes?: number
}

/**
 * Componente para proteger rutas de administrador
 * Verifica autenticación y maneja inactividad
 */
export function AdminProtection({ children, inactivityMinutes = 5 }: AdminProtectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { handleLogout } = useAdminInactivity({ timeoutMinutes: inactivityMinutes })
  const [showWarning, setShowWarning] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(0)

  // Verificar autenticación al montar usando Firebase
  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push("/admin/login")
      }
      setIsChecking(false)
    })

    return () => unsubscribe()
  }, [router])

  // Escuchar evento de advertencia de inactividad
  useEffect(() => {
    const handleInactivityWarning = () => {
      setShowWarning(true)
      toast({
        title: "Sesión expirando",
        description: `Tu sesión se cerrará en 1 minuto por inactividad`,
        variant: "destructive",
      })

      // Inicia countdown
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

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"
          style={{ borderTopColor: "var(--primary)" }}
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {children}
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
    </>
  )
}
