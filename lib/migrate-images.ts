import { getDb } from "./firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

/**
 * Script para migrar productos existentes
 * Convierte el campo 'image' en 'images' array
 * Ejecutar este script UNA SOLA VEZ para actualizar todos los productos
 * 
 * Uso:
 * import { migrateImagesToArray } from "@/lib/migrate-images"
 * await migrateImagesToArray()
 */
export async function migrateImagesToArray() {
  try {
    const db = getDb()
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    let migratedCount = 0
    let skippedCount = 0

    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data()

      // Si ya tiene 'images', saltarlo
      if (product.images && Array.isArray(product.images)) {
        skippedCount++
        continue
      }

      // Si tiene 'image' pero no 'images', migrar
      if (product.image && typeof product.image === "string") {
        await updateDoc(doc(db, "products", productDoc.id), {
          images: [product.image], // Convertir image a array de imágenes
          // Nota: Dejar 'image' tal como está para compatibilidad retroactiva
        })
        migratedCount++
        console.log(`✅ Migrado: ${product.name}`)
      }

      // Si no tiene ni 'image' ni 'images', crear array vacío
      if (!product.image && !product.images) {
        await updateDoc(doc(db, "products", productDoc.id), {
          images: [],
        })
        console.log(`✅ Inicializado array vacío: ${product.name}`)
      }
    }

    console.log(`
    ✅ MIGRACIÓN COMPLETADA
    📊 Total de productos migrados: ${migratedCount}
    ⏭️  Productos ya migrados (omitidos): ${skippedCount}
    📈 Total procesado: ${migratedCount + skippedCount}
    `)

    return {
      success: true,
      migratedCount,
      skippedCount,
    }
  } catch (error) {
    console.error("❌ Error durante la migración:", error)
    throw error
  }
}
