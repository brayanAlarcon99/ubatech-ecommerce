import { getDb } from "./firebase"
import { collection, getDocs } from "firebase/firestore"
import type { Product } from "@/types"

/**
 * Script para validar y diagnosticar problemas con imágenes de productos en Firestore
 * Uso:
 * import { validateProductImages } from "@/lib/validate-product-images"
 * await validateProductImages()
 */
export async function validateProductImages() {
  try {
    const db = getDb()
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    const report = {
      totalProducts: 0,
      productsWithImages: 0,
      productsWithoutImages: 0,
      productsWithEmptyImageArray: 0,
      productsWithInvalidImages: 0,
      productsWithLargeBase64: 0,
      detailedIssues: [] as any[],
    }

    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data() as Product
      report.totalProducts++

      // Verificar si tiene imágenes
      if (!product.images && !product.image) {
        report.productsWithoutImages++
        report.detailedIssues.push({
          productId: product.id,
          productName: product.name,
          issue: "No tiene campo 'images' ni 'image'",
        })
        continue
      }

      // Verificar array de imágenes
      if (product.images) {
        if (Array.isArray(product.images)) {
          if (product.images.length === 0) {
            report.productsWithEmptyImageArray++
            report.detailedIssues.push({
              productId: product.id,
              productName: product.name,
              issue: "Array de imágenes vacío",
            })
          } else {
            report.productsWithImages++
            
            // Verificar cada imagen
            for (let i = 0; i < product.images.length; i++) {
              const img = product.images[i]
              
              // Verificar si es string válido
              if (typeof img !== "string" || img.length === 0) {
                report.productsWithInvalidImages++
                report.detailedIssues.push({
                  productId: product.id,
                  productName: product.name,
                  issue: `Imagen ${i + 1} inválida o vacía`,
                })
                continue
              }

              // Verificar si es base64 demasiado grande
              if (img.startsWith("data:") && img.length > 1000000) {
                report.productsWithLargeBase64++
                report.detailedIssues.push({
                  productId: product.id,
                  productName: product.name,
                  issue: `Imagen ${i + 1} en base64 es muy grande (${(img.length / 1024 / 1024).toFixed(2)}MB)`,
                })
              }
            }
          }
        }
      } else if (product.image) {
        report.productsWithImages++
        if (typeof product.image !== "string" || product.image.length === 0) {
          report.productsWithInvalidImages++
          report.detailedIssues.push({
            productId: product.id,
            productName: product.name,
            issue: "Campo 'image' inválido o vacío",
          })
        }
      }
    }

    console.log("📊 REPORTE DE VALIDACIÓN DE IMÁGENES")
    console.log("=" .repeat(60))
    console.log(`Total de productos: ${report.totalProducts}`)
    console.log(`Productos con imágenes: ${report.productsWithImages}`)
    console.log(`Productos sin imágenes: ${report.productsWithoutImages}`)
    console.log(`Arrays de imágenes vacíos: ${report.productsWithEmptyImageArray}`)
    console.log(`Imágenes inválidas encontradas: ${report.productsWithInvalidImages}`)
    console.log(`Base64 muy grandes: ${report.productsWithLargeBase64}`)
    console.log("")
    
    if (report.detailedIssues.length > 0) {
      console.log("⚠️ PROBLEMAS DETECTADOS:")
      report.detailedIssues.forEach((issue) => {
        console.log(`  - [${issue.productId}] ${issue.productName}: ${issue.issue}`)
      })
    } else {
      console.log("✅ No se detectaron problemas con las imágenes")
    }

    return report
  } catch (error) {
    console.error("❌ Error durante la validación:", error)
    throw error
  }
}
