import { ADMIN_CONFIG, verifyAdminPassword } from "./admin-config"

const ADMIN_TOKEN_KEY = "adminAuthToken"

function generateAuthToken(): string {
  return btoa(`${Date.now()}:${Math.random()}`)
}

/**
 * Autenticar administrador con email y contraseña
 */
export async function loginAdmin(email: string, password: string): Promise<boolean> {
  try {
    // Validar que el email coincida con el del admin
    if (email !== ADMIN_CONFIG.email) {
      return false
    }

    // Validar que la contraseña coincida con el hash
    if (!verifyAdminPassword(password)) {
      return false
    }

    // Crear sesión en localStorage
    const token = generateAuthToken()
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
      localStorage.setItem("adminEmail", email)
      localStorage.setItem("adminLoginTime", new Date().toISOString())
    }

    return true
  } catch (error) {
    console.error("[Admin Auth] Error en login:", error)
    return false
  }
}

/**
 * Verificar si el usuario está autenticado como administrador
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  const email = localStorage.getItem("adminEmail")

  // Ambos deben existir y el email debe ser válido
  return token !== null && email === ADMIN_CONFIG.email
}

/**
 * Cerrar sesión de administrador
 */
export async function logoutAdmin(): Promise<void> {
  if (typeof window === "undefined") return

  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem("adminEmail")
  localStorage.removeItem("adminLoginTime")
}

/**
 * Obtener información de la sesión del admin
 */
export function getAdminSessionInfo(): {
  email: string | null
  loginTime: string | null
} | null {
  if (!isAdminAuthenticated()) {
    return null
  }

  return {
    email: localStorage.getItem("adminEmail"),
    loginTime: localStorage.getItem("adminLoginTime"),
  }
}

/**
 * Obtener tiempo de inactividad configurado en minutos
 */
export function getInactivityTimeout(): number {
  if (typeof window === "undefined") return 5

  const customTimeout = localStorage.getItem("adminInactivityTimeout")
  if (customTimeout) {
    const minutes = parseInt(customTimeout, 10)
    // Validar que sea un número válido entre 1 y 120 minutos
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 120) {
      return minutes
    }
  }
  return 5 // Default 5 minutos
}

/**
 * Establecer tiempo de inactividad (solo para super usuarios)
 */
export function setInactivityTimeout(minutes: number): boolean {
  if (typeof window === "undefined") return false

  // Validar rango válido
  if (minutes < 1 || minutes > 120) {
    console.error("El tiempo de inactividad debe estar entre 1 y 120 minutos")
    return false
  }

  localStorage.setItem("adminInactivityTimeout", minutes.toString())
  return true
}

/**
 * Obtener tiempo de inactividad configurado en segundos
 */
export function getInactivityTimeoutSeconds(): number {
  return getInactivityTimeout() * 60
}
