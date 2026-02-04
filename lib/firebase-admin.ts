import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Singleton para la app
const getApp = (() => {
  let app: admin.app.App | null = null

  return (): admin.app.App => {
    if (app) {
      return app
    }

    // Verificar si ya hay una app inicializada
    if (admin.apps.length > 0 && admin.apps[0]) {
      app = admin.apps[0]
      console.log('[Firebase Admin] Reusing existing app')
      return app
    }

    // Leer credenciales
    const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json')
    
    if (!existsSync(serviceAccountPath)) {
      throw new Error(`serviceAccountKey.json not found at ${serviceAccountPath}`)
    }

    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

    console.log('[Firebase Admin] App initialized successfully')
    return app
  }
})()

// Exportar funciones
export function initializeAdminApp(): admin.app.App {
  return getApp()
}

export function getAdminAuth(): admin.auth.Auth {
  return getApp().auth()
}

export function getAdminDb(): admin.firestore.Firestore {
  return getApp().firestore()
}

export function getAdminApp(): admin.app.App {
  return getApp()
}
