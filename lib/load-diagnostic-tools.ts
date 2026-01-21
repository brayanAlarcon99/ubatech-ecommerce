'use client'

/**
 * Script inyectado en el admin panel para cargar herramientas de diagnóstico
 * Este archivo se ejecuta automáticamente y hace disponibles las funciones en window
 */

export function loadDiagnosticTools() {
  // ============ PARTE 1: Test Básico de API ============
  async function testImageAPI() {
    console.log('🔍 [TEST-API] Testing image conversion API...\n')

    try {
      // Usar una imagen de prueba
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

  // ============ PARTE 2: Test Específico de URL ============
  async function testImageURL(url: string) {
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
    console.log('\n[TEST-URL] 2. Attempting fetch...')
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'image/*' },
      })
      console.log(`  ✅ Response status: ${response.status} ${response.statusText}`)
      console.log(`  📋 Content-Type: ${response.headers.get('content-type')}`)
      console.log(`  📏 Content-Length: ${response.headers.get('content-length')} bytes`)
    } catch (error) {
      console.error('  ❌ Fetch failed:', error instanceof Error ? error.message : String(error))
    }

    // Test 3: API conversion
    console.log('\n[TEST-URL] 3. Testing API conversion...')
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
  }

  // Hacer las funciones globales
  if (typeof window !== 'undefined') {
    ;(window as any).testImageAPI = testImageAPI
    ;(window as any).testImageURL = testImageURL

    console.log('✅ [DIAGNOSTIC-TOOLS] Loaded successfully')
    console.log('Available commands:')
    console.log('  • testImageAPI() - Test if API endpoint works')
    console.log('  • testImageURL("https://...") - Test a specific image URL')
  }
}

// Auto-load
if (typeof window !== 'undefined') {
  loadDiagnosticTools()
}
