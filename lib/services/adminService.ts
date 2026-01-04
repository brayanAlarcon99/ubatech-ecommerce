import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
} from "firebase/auth"
import { getDb } from "@/lib/firebase"
import { app } from "@/lib/firebase"
import { 
  getDocumentsByQuery,
  setDocByPath,
  deleteDocByPath,
  getCollectionDocs 
} from "@/lib/firestore-utils"
import { 
  validateEmailWithMessage,
  validatePasswordWithMessage 
} from "@/lib/validation"
import { COLLECTIONS, ERROR_MESSAGES } from "@/lib/config/constants"

export interface AdminUser {
  id?: string
  email: string
  role: string
  createdAt: string
  updatedAt?: string
  status?: string
}

/**
 * Servicio para manejar operaciones de administradores (OPTIMIZADO)
 */
export const adminService = {
  /**
   * Crear un nuevo administrador (OPTIMIZADO)
   */
  async createAdmin(
    email: string,
    password: string,
    currentUserEmail: string
  ): Promise<{
    success: boolean
    message: string
    uid?: string
  }> {
    let userCreated = false
    let userUid = ""
    const auth = getAuth(app)
    const db = getDb()

    try {
      // Validaciones centralizadas
      const emailValidation = validateEmailWithMessage(email)
      if (!emailValidation.valid) {
        return { success: false, message: emailValidation.error! }
      }

      const passwordValidation = validatePasswordWithMessage(password)
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.error! }
      }

      // Verificar que el email no exista
      const existingAdmins = await getDocumentsByQuery(
        COLLECTIONS.ADMIN_USERS,
        "email",
        "==",
        email
      )

      if (existingAdmins.length > 0) {
        return { success: false, message: "Este email ya existe como administrador" }
      }

      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, message: "No hay usuario autenticado" }
      }

      // PASO 1: Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      userUid = userCredential.user.uid
      userCreated = true

      // PASO 2: Esperar para asegurar sincronización
      await new Promise((resolve) => setTimeout(resolve, 300))

      // PASO 3: Guardar en Firestore
      const adminData: AdminUser = {
        id: userUid,
        email,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      }

      const result = await setDocByPath(COLLECTIONS.ADMIN_USERS, userUid, adminData)

      if (!result.success) {
        throw new Error(result.error || "Error guardando en Firestore")
      }

      return {
        success: true,
        message: "Administrador creado correctamente",
        uid: userUid,
      }
    } catch (error) {
      const authError = error as AuthError

      // Limpiar si falló
      if (userCreated && userUid) {
        try {
          const currentUser = auth.currentUser
          if (currentUser?.uid === userUid) {
            await currentUser.delete()
          }
        } catch (deleteError) {
          console.error("Error al eliminar usuario de Auth:", deleteError)
        }
      }

      let message = authError.message || ERROR_MESSAGES.UNKNOWN_ERROR

      if (authError.code === "auth/email-already-in-use") {
        message = ERROR_MESSAGES.EMAIL_ALREADY_IN_USE
      } else if (authError.code === "auth/weak-password") {
        message = ERROR_MESSAGES.WEAK_PASSWORD
      } else if (authError.code === "auth/invalid-email") {
        message = ERROR_MESSAGES.INVALID_EMAIL
      }

      return { success: false, message }
    }
  },

  /**
   * Obtener todos los administradores (OPTIMIZADO)
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const admins = await getCollectionDocs(COLLECTIONS.ADMIN_USERS)
      return admins.map(doc => doc as AdminUser)
    } catch (error) {
      console.error("Error obteniendo administradores:", error)
      return []
    }
  },

  /**
   * Obtener administrador por email (OPTIMIZADO)
   */
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const results = await getDocumentsByQuery(
        COLLECTIONS.ADMIN_USERS,
        "email",
        "==",
        email
      )
      return results.length > 0 ? (results[0] as AdminUser) : null
    } catch (error) {
      console.error("Error buscando admin:", error)
      return null
    }
  },

  /**
   * Eliminar administrador (OPTIMIZADO)
   */
  async deleteAdmin(userId: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const result = await deleteDocByPath(COLLECTIONS.ADMIN_USERS, userId)
      
      if (result.success) {
        console.log("✅ Administrador eliminado:", userId)
        return { success: true, message: "Administrador eliminado correctamente" }
      }
      
      return { success: false, message: result.error || "Error desconocido" }
    } catch (error) {
      console.error("Error eliminando admin:", error)
      return { success: false, message: "Error al eliminar administrador" }
    }
  },

  /**
   * Actualizar rol de administrador (OPTIMIZADO)
   */
  async updateAdminRole(
    userId: string,
    newRole: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await setDocByPath(
      COLLECTIONS.ADMIN_USERS,
      userId,
      { role: newRole }
    )
    
    if (result.success) {
      return { success: true, message: "Rol actualizado correctamente" }
    }
    
    return { success: false, message: result.error || "Error al actualizar rol" }
  },
}
