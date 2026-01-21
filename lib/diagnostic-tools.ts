/**
 * Script de diagnóstico para ejecutar en la consola (F12)
 * Copia y pega esto en la consola del navegador para diagnosticar problemas de imágenes
 */

// ============ PARTE 1: Test Básico de API ============
async function testImageAPI() {
  console.log('🔍 [TEST-API] Testing image conversion API...\n')

  try {
    // Usar una imagen de prueba de Firebase
    const testUrl = 'https://via.placeholder.com/100x100?text=Test'

    console.log('[TEST-API] Calling /api/convert-image with test URL...')
    const response = await fetch('/api/convert-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ [TEST-API] API is working!')
      console.log('[TEST-API] Response:', {
        status: response.status,
        base64Length: data.base64?.length || 0,
        isValidDataUrl: data.base64?.startsWith('data:image/'),
      })
    } else {
      console.error('❌ [TEST-API] API returned error:', data)
    }
  } catch (error) {
    console.error('❌ [TEST-API] Error:', error instanceof Error ? error.message : String(error))
  }
}

// ============ PARTE 2: Test de URLs en Firestore ============
async function testProductImages() {
  console.log('\n🔍 [TEST-FIRESTORE] Testing product images from Firestore...\n')

  try {
    // Esto requiere que Firestore esté inicializado en la página
    if (typeof db === 'undefined') {
      console.error('❌ [TEST-FIRESTORE] Firestore not available in window')
      console.log('[TEST-FIRESTORE] Make sure you are on a page that loads Firestore')
      return
    }

    const { collection, getDocs, limit, query } = await import('firebase/firestore')

    // Obtener 3 primeros productos
    const productsRef = collection(db, 'products')
    const q = query(productsRef, limit(3))
    const snap = await getDocs(q)

    console.log(`[TEST-FIRESTORE] Found ${snap.size} products (showing first 3):\n`)

    let productIndex = 0
    for (const doc of snap.docs) {
      productIndex++
      const product = doc.data()

      console.log(`📦 Product ${productIndex}: "${product.name || 'Unknown'}"`)

      // Verificar imágenes
      const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0
      const hasImage = product.image && typeof product.image === 'string'

      if (!hasImages && !hasImage) {
        console.warn('  ⚠️ NO IMAGES FOUND')
      } else {
        if (hasImage) {
          console.log(`  📷 Legacy image field: ${product.image.substring(0, 80)}...`)
        }
        if (hasImages) {
          console.log(`  📷 Images array (${product.images.length} total):`)
          product.images.slice(0, 2).forEach((img, idx) => {
            if (img && typeof img === 'string') {
              console.log(`     [${idx}]: ${img.substring(0, 70)}...`)
            } else {
              console.warn(`     [${idx}]: INVALID (${typeof img})`)
            }
          })
        }
      }
      console.log('')
    }
  } catch (error) {
    console.error('❌ [TEST-FIRESTORE] Error:', error instanceof Error ? error.message : String(error))
    console.error('[TEST-FIRESTORE] Make sure you are logged in and have access to Firestore')
  }
}

// ============ PARTE 3: Test Específico de URL ============
async function testImageURL(url) {
  if (!url) {
    console.error('❌ [TEST-URL] URL required as parameter: testImageURL("https://...")')
    return
  }

  console.log(`\n🔍 [TEST-URL] Testing URL: ${url}\n`)

  // Test 1: URL válida
  console.log('[TEST-URL] 1. Checking if URL is valid...')
  try {
    new URL(url)
    console.log('  ✅ URL format is valid')
  } catch (e) {
    console.error('  ❌ URL format is invalid:', e instanceof Error ? e.message : String(e))
    return
  }

  // Test 2: Fetch directo
  console.log('\n[TEST-URL] 2. Attempting HEAD request...')
  try {
    const response = await fetch(url, { method: 'HEAD' })
    console.log(`  ✅ Response status: ${response.status} ${response.statusText}`)
    console.log(`  📋 Content-Type: ${response.headers.get('content-type')}`)
    console.log(`  📏 Content-Length: ${response.headers.get('content-length')} bytes`)
  } catch (error) {
    console.error('  ❌ HEAD request failed:', error instanceof Error ? error.message : String(error))

    // Test 3: Fetch GET (si HEAD falla)
    console.log('\n[TEST-URL] 3. Attempting GET request as fallback...')
    try {
      const response = await fetch(url, { method: 'GET' })
      console.log(`  ✅ Response status: ${response.status} ${response.statusText}`)
      console.log(`  📋 Content-Type: ${response.headers.get('content-type')}`)
    } catch (getError) {
      console.error('  ❌ GET request also failed:', getError instanceof Error ? getError.message : String(getError))
    }
  }

  // Test 4: API conversion
  console.log('\n[TEST-URL] 4. Testing API conversion...')
  try {
    const response = await fetch('/api/convert-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (response.ok && data.base64) {
      console.log(`  ✅ API conversion successful`)
      console.log(`  📦 Base64 length: ${data.base64.length} chars`)
      console.log(`  📏 Data size: ${(data.base64.length / 1024).toFixed(2)} KB`)
    } else {
      console.error('  ❌ API conversion failed:', data.error || 'Unknown error')
      if (data.details) {
        console.error('  📝 Details:', data.details)
      }
    }
  } catch (error) {
    console.error('  ❌ API call failed:', error instanceof Error ? error.message : String(error))
  }

  // Test 5: Canvas load
  console.log('\n[TEST-URL] 5. Testing browser image load (Canvas)...')
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const loadPromise = new Promise<void>((resolve) => {
      img.onload = () => {
        console.log(`  ✅ Image loaded by browser`)
        console.log(`  📐 Dimensions: ${img.width}x${img.height}px`)

        // Intentar canvas
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')

          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
            console.log(`  ✅ Canvas conversion successful`)
            console.log(`  📏 Data URL size: ${(dataUrl.length / 1024).toFixed(2)} KB`)
          }
        } catch (canvasError) {
          console.error('  ❌ Canvas error:', canvasError instanceof Error ? canvasError.message : String(canvasError))
        }

        resolve()
      }

      img.onerror = () => {
        console.error('  ❌ Browser failed to load image (CORS, 404, or invalid format)')
        resolve()
      }

      img.onabort = () => {
        console.error('  ❌ Image load was aborted')
        resolve()
      }

      // Timeout
      const timeoutId = setTimeout(() => {
        console.error('  ⏱️ Image load timeout (10 seconds)')
        img.src = ''
        resolve()
      }, 10000)

      img.src = url
    })

    await loadPromise
  } catch (error) {
    console.error('  ❌ Canvas test error:', error instanceof Error ? error.message : String(error))
  }
}

// ============ EXPORTAR FUNCIONES ============
console.log('🎯 Diagnostic tools loaded! Available commands:\n')
console.log('1. testImageAPI() - Test if API endpoint works')
console.log('2. testProductImages() - Get first 3 products from Firestore')
console.log('3. testImageURL("https://...") - Test a specific image URL\n')
console.log('Example:')
console.log('  testImageURL("https://firebasestorage.googleapis.com/...")\n')

// Auto-export to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    testImageAPI,
    testProductImages,
    testImageURL,
  })
}
