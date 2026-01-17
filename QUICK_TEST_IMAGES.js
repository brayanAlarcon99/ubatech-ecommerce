/**
 * QUICK TEST: Script para verificar el estado de imágenes
 * Ejecutar en la consola del navegador (en cualquier página)
 */

// Copiar y pegar en la consola del navegador:

async function testProductImages() {
  console.clear()
  console.log("🔍 INICIANDO PRUEBA DE IMÁGENES...")
  console.log("=" .repeat(60))

  try {
    // Importar función de validación
    const { validateProductImages } = await import("/lib/validate-product-images.ts")
    
    // Ejecutar validación
    console.log("📊 Validando productos en Firestore...")
    const report = await validateProductImages()
    
    console.log("")
    console.log("✅ REPORTE COMPLETADO")
    console.log("=" .repeat(60))
    console.log(`Total de productos: ${report.totalProducts}`)
    console.log(`Con imágenes: ${report.productsWithImages}`)
    console.log(`Sin imágenes: ${report.productsWithoutImages}`)
    
    if (report.productsWithLargeBase64 > 0) {
      console.warn(`⚠️ ${report.productsWithLargeBase64} imágenes en base64 muy grandes`)
    }
    
    if (report.detailedIssues.length > 0) {
      console.warn(`⚠️ Se encontraron ${report.detailedIssues.length} problemas`)
      console.table(report.detailedIssues)
    } else {
      console.log("✅ No se detectaron problemas")
    }
    
    return report
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

// Ejecutar
testProductImages()

// ===================================================
// ALTERNATIVA: Si el import no funciona, usar esto:
// ===================================================

async function testProductImagesAlt() {
  console.clear()
  console.log("🔍 VERIFICACIÓN RÁPIDA DE IMÁGENES")
  console.log("=" .repeat(60))

  try {
    const { getDb } = await import("/lib/firebase.ts")
    const { collection, getDocs } = await import("firebase/firestore")
    
    const db = getDb()
    const snapshot = await getDocs(collection(db, "products"))
    
    let hasImages = 0
    let noImages = 0
    let problems = []
    
    snapshot.forEach((doc) => {
      const product = doc.data()
      
      if (product.images?.length > 0 || product.image) {
        hasImages++
      } else {
        noImages++
        problems.push({
          id: doc.id,
          name: product.name,
          issue: "Sin imágenes"
        })
      }
      
      // Verificar tamaño de base64
      if (product.images?.length > 0) {
        product.images.forEach((img, idx) => {
          if (img?.length > 1000000) {
            problems.push({
              id: doc.id,
              name: product.name,
              issue: `Imagen ${idx + 1} muy grande: ${(img.length / 1024 / 1024).toFixed(2)}MB`
            })
          }
        })
      }
    })
    
    console.log(`Total de productos: ${snapshot.size}`)
    console.log(`Con imágenes: ${hasImages}`)
    console.log(`Sin imágenes: ${noImages}`)
    
    if (problems.length > 0) {
      console.warn(`⚠️ Problemas encontrados: ${problems.length}`)
      console.table(problems)
    } else {
      console.log("✅ Todas las imágenes parecen estar bien")
    }
    
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

// ===================================================
// PARA DEPURAR UN PRODUCTO ESPECÍFICO:
// ===================================================

async function debugProduct(productId) {
  console.clear()
  console.log(`🔍 DEPURANDO PRODUCTO: ${productId}`)
  console.log("=" .repeat(60))
  
  try {
    const { getDb } = await import("/lib/firebase.ts")
    const { doc, getDoc } = await import("firebase/firestore")
    
    const db = getDb()
    const productDoc = await getDoc(doc(db, "products", productId))
    
    if (!productDoc.exists()) {
      console.error("❌ Producto no encontrado")
      return
    }
    
    const product = productDoc.data()
    
    console.log("📦 Datos del producto:")
    console.log(`Nombre: ${product.name}`)
    console.log(`ID: ${productDoc.id}`)
    console.log("")
    
    console.log("🖼️ Imágenes:")
    if (product.images?.length > 0) {
      console.log(`Array 'images': ${product.images.length} imagen(es)`)
      product.images.forEach((img, idx) => {
        const size = (img.length / 1024 / 1024).toFixed(2)
        console.log(`  [${idx + 1}] ${size}MB - ${img.substring(0, 50)}...`)
      })
    } else {
      console.log("Array 'images': vacío o no existe")
    }
    
    if (product.image) {
      const size = (product.image.length / 1024 / 1024).toFixed(2)
      console.log(`Campo 'image' (legacy): ${size}MB`)
    }
    
    console.log("")
    console.log("✅ Objeto completo del producto:")
    console.log(product)
    
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

// Uso: debugProduct("nombre-del-producto")
