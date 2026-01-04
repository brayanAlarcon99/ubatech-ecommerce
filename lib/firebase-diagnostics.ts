import { getDb } from "@/lib/firebase"
import {
  collection,
  getDocs,
  collectionGroup,
  getDoc,
  doc,
  query,
  limit
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

/**
 * Script de diagnóstico para verificar permisos de Firestore
 * Útil para debuggear errores de PERMISSION_DENIED
 */

export async function diagnoseFirebasePermissions() {
  const db = getDb()
  const auth = getAuth()
  const user = auth.currentUser

  console.log("🔍 DIAGNÓSTICO DE FIRESTORE")
  console.log("=".repeat(50))
  console.log(`Usuario autenticado: ${user ? "✅ SÍ" : "❌ NO"}`)
  if (user) console.log(`UID: ${user.uid}`)
  console.log("")

  const results: Record<string, { success: boolean; error?: string }> = {}

  // Test 1: Leer productos (debe funcionar sin autenticación)
  try {
    console.log("📦 Test 1: Leer productos...")
    const q = query(collection(db, "products"), limit(1))
    const snapshot = await getDocs(q)
    results.readProducts = { success: true }
    console.log(`✅ Lectura de productos: OK (${snapshot.size} documentos)`)
  } catch (error) {
    results.readProducts = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(`❌ Lectura de productos: ${error instanceof Error ? error.message : error}`)
  }

  // Test 2: Leer categorías
  try {
    console.log("📁 Test 2: Leer categorías...")
    const q = query(collection(db, "categories"), limit(1))
    const snapshot = await getDocs(q)
    results.readCategories = { success: true }
    console.log(`✅ Lectura de categorías: OK (${snapshot.size} documentos)`)
  } catch (error) {
    results.readCategories = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(`❌ Lectura de categorías: ${error instanceof Error ? error.message : error}`)
  }

  // Test 3: Leer subcategorías
  try {
    console.log("📂 Test 3: Leer subcategorías...")
    const q = query(collection(db, "subcategories"), limit(1))
    const snapshot = await getDocs(q)
    results.readSubcategories = { success: true }
    console.log(`✅ Lectura de subcategorías: OK (${snapshot.size} documentos)`)
  } catch (error) {
    results.readSubcategories = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(`❌ Lectura de subcategorías: ${error instanceof Error ? error.message : error}`)
  }

  // Test 4: Leer admin users
  try {
    console.log("👤 Test 4: Leer adminUsers...")
    if (user) {
      const adminRef = doc(db, "adminUsers", user.uid)
      const adminDoc = await getDoc(adminRef)
      results.checkAdmin = {
        success: true,
        error: adminDoc.exists() ? "Es admin ✅" : "No es admin ❌"
      }
      console.log(
        `${adminDoc.exists() ? "✅" : "❌"} Estado admin: ${
          adminDoc.exists() ? "ADMIN" : "No es admin"
        }`
      )
    } else {
      results.checkAdmin = {
        success: false,
        error: "No autenticado"
      }
      console.log("❌ No autenticado para verificar admin")
    }
  } catch (error) {
    results.checkAdmin = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(`❌ Error al verificar admin: ${error instanceof Error ? error.message : error}`)
  }

  // Test 5: Leer store_settings
  try {
    console.log("⚙️ Test 5: Leer store_settings...")
    const q = query(collection(db, "store_settings"), limit(1))
    const snapshot = await getDocs(q)
    results.readSettings = { success: true }
    console.log(`✅ Lectura de store_settings: OK (${snapshot.size} documentos)`)
  } catch (error) {
    results.readSettings = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(`❌ Lectura de store_settings: ${error instanceof Error ? error.message : error}`)
  }

  // Test 6: Leer platform_info
  try {
    console.log("ℹ️ Test 6: Leer platform_info...")
    const q = query(collection(db, "platform_info"), limit(1))
    const snapshot = await getDocs(q)
    results.readPlatformInfo = { success: true }
    console.log(`✅ Lectura de platform_info: OK (${snapshot.size} documentos)`)
  } catch (error) {
    results.readPlatformInfo = {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }
    console.log(
      `❌ Lectura de platform_info: ${error instanceof Error ? error.message : error}`
    )
  }

  console.log("")
  console.log("=".repeat(50))
  console.log("RESUMEN:")
  console.log("")

  const passed = Object.values(results).filter((r) => r.success).length
  const total = Object.keys(results).length

  console.log(`✅ Tests pasados: ${passed}/${total}`)

  if (passed === total) {
    console.log("🎉 ¡TODOS LOS TESTS PASARON!")
    console.log("")
    console.log("Las reglas de Firestore están configuradas correctamente.")
  } else {
    console.log("❌ Algunos tests fallaron:")
    console.log("")
    Object.entries(results).forEach(([test, result]) => {
      if (!result.success) {
        console.log(`  • ${test}: ${result.error}`)
      }
    })
    console.log("")
    console.log(
      "💡 Sugerencias:"
    )
    console.log("  1. Verifica que las reglas de Firestore estén publicadas")
    console.log("  2. Espera 5 minutos a que se propaguen los cambios")
    console.log("  3. Recarga la página (Ctrl + F5)")
    console.log("  4. Borra el caché: Ctrl + Shift + Delete")
  }

  return results
}

/**
 * Hook para usar en componentes React
 */
export function useFirebasePermissionsDiagnosis() {
  const diagnose = async () => {
    try {
      const results = await diagnoseFirebasePermissions()
      return results
    } catch (error) {
      console.error("Error en diagnóstico:", error)
      return null
    }
  }

  return { diagnose }
}
