import { getDb } from "./firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

/**
 * Script para migrar productos existentes y agregar el campo details
 * Ejecutar este script una sola vez para actualizar todos los productos
 */
export async function migrateDetails() {
  try {
    const db = getDb()
    const productsCollection = collection(db, "products")
    const snapshot = await getDocs(productsCollection)

    console.log(`[Details Migration] Encontrados ${snapshot.size} productos para migrar`)

    let updatedCount = 0

    for (const docSnap of snapshot.docs) {
      const productData = docSnap.data()

      // Si el producto no tiene details, agregar un details vacío
      if (!productData.details) {
        try {
          await updateDoc(doc(db, "products", docSnap.id), {
            details: "",
          })
          updatedCount++
          console.log(`[Details Migration] Actualizado: ${productData.name}`)
        } catch (error) {
          console.error(`[Details Migration] Error actualizando ${productData.name}:`, error)
        }
      } else {
        console.log(`[Details Migration] ${productData.name} ya tiene detalles`)
      }
    }

    console.log(`[Details Migration] Migración completada: ${updatedCount} productos actualizados`)
    return {
      success: true,
      totalProducts: snapshot.size,
      updatedProducts: updatedCount,
    }
  } catch (error) {
    console.error("[Details Migration] Error durante la migración:", error)
    throw error
  }
}
