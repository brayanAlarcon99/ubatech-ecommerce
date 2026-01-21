// Script para verificar estructura de productos en Firestore
// Copia y pega esto en la consola del navegador en la página de admin

async function checkProductStructure() {
  console.log('🔍 Verificando estructura de productos en Firestore...\n')
  
  const db = window.db // Si está disponible desde Firebase init
  if (!db) {
    console.error('❌ Firestore DB no disponible')
    return
  }
  
  const { collection, getDocs } = await import('firebase/firestore')
  
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'))
    
    console.log(`📊 Total de productos: ${productsSnapshot.docs.length}\n`)
    
    let productsWithImages = 0
    let productsWithoutImages = 0
    let productsWithImagesArray = 0
    let productsWithImageField = 0
    
    productsSnapshot.docs.slice(0, 5).forEach((doc, index) => {
      const data = doc.data()
      console.log(`\n[Producto ${index + 1}] ${data.name}:`)
      console.log('  - ID:', doc.id)
      console.log('  - Category:', data.category)
      console.log('  - Tiene campo "images":', !!data.images, Array.isArray(data.images) ? `(${data.images.length} items)` : '')
      console.log('  - Tiene campo "image":', !!data.image)
      
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        console.log('  - Primer URL:', data.images[0].substring(0, 80) + '...')
        productsWithImagesArray++
      }
      if (data.image) {
        console.log('  - URL image:', data.image.substring(0, 80) + '...')
        productsWithImageField++
      }
      
      if ((data.images && data.images.length > 0) || data.image) {
        productsWithImages++
      } else {
        productsWithoutImages++
      }
    })
    
    console.log('\n📈 RESUMEN:')
    console.log(`  ✅ Con imágenes: ${productsWithImages}`)
    console.log(`  ❌ Sin imágenes: ${productsWithoutImages}`)
    console.log(`  📦 Con campo "images" array: ${productsWithImagesArray}`)
    console.log(`  📋 Con campo "image" único: ${productsWithImageField}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProductStructure()
