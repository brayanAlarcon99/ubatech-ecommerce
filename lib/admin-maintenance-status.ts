"use client"

import { getDb } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

export interface AdminMaintenanceStatus {
  isEnabled: boolean
  enabledAt?: string
  enabledBy?: string
  message?: string
  estimatedTime?: string
  updatedAt?: string
}

/**
 * Obtiene el estado actual del modo mantenimiento del panel administrativo
 * @returns Estado del mantenimiento (isEnabled indica si está activo)
 */
export async function getAdminMaintenanceStatus(): Promise<AdminMaintenanceStatus> {
  try {
    const db = getDb()
    const maintenanceRef = doc(db, "admin_settings", "maintenance")
    const maintenanceSnap = await getDoc(maintenanceRef)

    if (maintenanceSnap.exists()) {
      const data = maintenanceSnap.data()
      return {
        isEnabled: data.isEnabled || false,
        enabledAt: data.enabledAt,
        enabledBy: data.enabledBy,
        message: data.message,
        estimatedTime: data.estimatedTime,
        updatedAt: data.updatedAt,
      }
    }

    // Si el documento no existe, retorna estado deshabilitado por defecto
    return { isEnabled: false }
  } catch (error) {
    console.error("Error getting admin maintenance status:", error)
    // En caso de error, asumir que no está en mantenimiento para no bloquear acceso
    return { isEnabled: false }
  }
}

/**
 * Establece el estado del modo mantenimiento del panel administrativo
 * @param enabled - true para activar, false para desactivar
 * @param userId - UID del super usuario que realiza el cambio
 * @param options - Opciones adicionales (mensaje, tiempo estimado)
 */
export async function setAdminMaintenanceStatus(
  enabled: boolean,
  userId: string,
  options?: {
    message?: string
    estimatedTime?: string
  }
): Promise<void> {
  try {
    const db = getDb()
    const maintenanceRef = doc(db, "admin_settings", "maintenance")

    const data: any = {
      isEnabled: enabled,
      updatedAt: new Date().toISOString(),
    }

    if (enabled) {
      // Cuando se activa, guardar información adicional
      data.enabledAt = new Date().toISOString()
      data.enabledBy = userId
      data.message = options?.message || "Panel administrativo en mantenimiento"
      data.estimatedTime = options?.estimatedTime || "15 minutos"
    } else {
      // Cuando se desactiva, limpiar información de activación
      data.enabledAt = null
      data.enabledBy = null
      data.message = null
      data.estimatedTime = null
    }

    await setDoc(maintenanceRef, data, { merge: true })
  } catch (error) {
    console.error("Error setting admin maintenance status:", error)
    throw error
  }
}

/**
 * Hook para verificar si un usuario debe ser redirigido a mantenimiento
 * Retorna true si está en mantenimiento y el usuario NO es super usuario
 */
export async function shouldRedirectToMaintenance(userRole?: string | null): Promise<boolean> {
  try {
    // Si es super usuario, nunca redirigir
    if (userRole === "super" || userRole === "superuser") {
      return false
    }

    const status = await getAdminMaintenanceStatus()
    return status.isEnabled
  } catch (error) {
    console.error("Error checking maintenance redirect:", error)
    return false
  }
}
