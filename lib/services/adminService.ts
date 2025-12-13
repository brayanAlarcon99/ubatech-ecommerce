import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  Auth,
  User,
} from "firebase/auth"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"
import { getDb } from "@/lib/firebase"
import { app } from "@/lib/firebase"

export interface AdminUser {
  id?: string
  email: string
  role: string
  createdAt: string
  updatedAt?: string
  status?: string
}

/**
 * Servicio para manejar operaciones de administradores
 */
export const adminService = {
  /**
   * Crear un nuevo administrador
   * @param email Email del nuevo administrador
   * @param password Contraseña del nuevo administrador
   * @param currentUserEmail Email del usuario actual (para auditoría)
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
    let superUserCredentials: { email: string; password: string } | null = null

    try {
      // Validar que el email sea válido
      if (!email || !password) {
        return {
          success: false,
          message: "Email y contraseña son requeridos",
        }
      }

      if (password.length < 6) {
        return {
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        }
      }

      // Verificar que el email no exista en adminUsers
      const db = getDb()
      const existingQuery = query(
        collection(db, "adminUsers"),
        where("email", "==", email)
      )
      const existingDocs = await getDocs(existingQuery)

      if (existingDocs.size > 0) {
        return {
          success: false,
          message: "Este email ya existe como administrador",
        }
      }

      // Obtener usuario actual (super usuario)
      const auth = getAuth(app)
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        return {
          success: false,
          message: "No hay usuario autenticado. Por favor inicia sesión nuevamente.",
        }
      }

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      userUid = userCredential.user.uid
      userCreated = true

      console.log("✅ Usuario creado en Firebase Auth:", userUid)

      // Esperar un momento para asegurar que el usuario esté completamente creado
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Guardar información del admin en Firestore
      const adminRef = doc(db, "adminUsers", userUid)
      const adminData: AdminUser = {
        id: userUid,
        email: email,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      }

      await setDoc(adminRef, adminData)

      console.log("✅ Administrador guardado en Firestore:", userUid)

      // Verificar que se guardó correctamente
      const verifyDoc = await getDoc(adminRef)
      if (!verifyDoc.exists()) {
        throw new Error("Error de verificación: documento no se guardó")
      }

      // IMPORTANTE: No cerrar sesión. El usuario recién creado será reemplazado
      // por el super usuario cuando se recarga la página, ya que su sesión se mantiene
      // en localStorage y será restaurada automáticamente por el middleware de autenticación.
      
      console.log("✅ Nuevo administrador creado exitosamente. La sesión será restaurada automáticamente.")

      return {
        success: true,
        message: "Administrador creado correctamente",
        uid: userUid,
      }
    } catch (error) {
      const authError = error as AuthError

      // Si el usuario fue creado pero Firestore falló, eliminarlo de Auth
      if (userCreated && userUid) {
        try {
          const auth = getAuth(app)
          // Obtener una referencia al usuario creado
          const currentUser = auth.currentUser
          if (currentUser && currentUser.uid === userUid) {
            // Solo eliminarlo si está actualmente autenticado
            await currentUser.delete()
            console.log("🗑️ Usuario eliminado de Firebase Auth por error en Firestore")
          }
        } catch (deleteError) {
          console.error("Error al eliminar usuario de Auth:", deleteError)
        }
      }

      let message = "Error desconocido"

      if (authError.code === "auth/email-already-in-use") {
        message = "Este email ya está registrado en Firebase Authentication"
      } else if (authError.code === "auth/weak-password") {
        message = "La contraseña es muy débil (mínimo 6 caracteres)"
      } else if (authError.code === "auth/invalid-email") {
        message = "El email ingresado es inválido"
      } else if (authError.code === "permission-denied") {
        message = "Permiso denegado: verifica las reglas de Firestore"
      } else {
        message = authError.message || "Error al crear administrador"
      }

      console.error("❌ Error en adminService.createAdmin:", authError)

      return {
        success: false,
        message: message,
      }
    }
  },

  /**
   * Obtener todos los administradores
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const db = getDb()
      const snapshot = await getDocs(collection(db, "adminUsers"))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AdminUser))
    } catch (error) {
      console.error("Error obteniendo administradores:", error)
      return []
    }
  },

  /**
   * Obtener administrador por email
   */
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const db = getDb()
      const q = query(collection(db, "adminUsers"), where("email", "==", email))
      const snapshot = await getDocs(q)

      if (snapshot.docs.length > 0) {
        const doc = snapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data(),
        } as AdminUser
      }

      return null
    } catch (error) {
      console.error("Error buscando admin:", error)
      return null
    }
  },

  /**
   * Eliminar administrador
   */
  async deleteAdmin(userId: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const db = getDb()
      const adminRef = doc(db, "adminUsers", userId)

      // Verificar que existe
      const adminDoc = await getDoc(adminRef)
      if (!adminDoc.exists()) {
        return {
          success: false,
          message: "Administrador no encontrado",
        }
      }

      // Eliminar documento
      await deleteDoc(adminRef)

      console.log("✅ Administrador eliminado:", userId)

      return {
        success: true,
        message: "Administrador eliminado correctamente",
      }
    } catch (error) {
      console.error("Error eliminando admin:", error)
      return {
        success: false,
        message: "Error al eliminar administrador",
      }
    }
  },

  /**
   * Actualizar rol de administrador
   */
  async updateAdminRole(
    userId: string,
    newRole: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const db = getDb()
      const adminRef = doc(db, "adminUsers", userId)

      await setDoc(
        adminRef,
        {
          role: newRole,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      return {
        success: true,
        message: "Rol actualizado correctamente",
      }
    } catch (error) {
      console.error("Error actualizando rol:", error)
      return {
        success: false,
        message: "Error al actualizar rol",
      }
    }
  },
}
