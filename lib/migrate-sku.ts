import { getDb } from "./firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

/**
 * Script para migrar productos existentes y agregar el campo SKU
 * Ejecutar este script una sola vez para actualizar todos los productos
 */
export async function migrateSKU() {
  try {
    const db = getDb()
    const productsCollection = collection(db, "products")
    const snapshot = await getDocs(productsCollection)

    console.log(`[SKU Migration] Encontrados ${snapshot.size} productos para migrar`)

    let updatedCount = 0

    for (const docSnap of snapshot.docs) {
      const productData = docSnap.data()

      // Si el producto no tiene SKU, agregar un SKU por defecto basado en el ID
      if (!productData.sku) {
        const skuValue = `SKU-${docSnap.id.substring(0, 8).toUpperCase()}`
        
        try {
          await updateDoc(doc(db, "products", docSnap.id), {
            sku: skuValue,
          })
          updatedCount++
          console.log(`[SKU Migration] Actualizado: ${productData.name} -> SKU: ${skuValue}`)
        } catch (error) {
          console.error(`[SKU Migration] Error actualizando ${productData.name}:`, error)
        }
      } else {
        console.log(`[SKU Migration] ${productData.name} ya tiene SKU: ${productData.sku}`)
      }
    }

    console.log(`[SKU Migration] Migración completada: ${updatedCount} productos actualizados`)
    return {
      success: true,
      totalProducts: snapshot.size,
      updatedProducts: updatedCount,
    }
  } catch (error) {
    console.error("[SKU Migration] Error durante la migración:", error)
    throw error
  }
}
