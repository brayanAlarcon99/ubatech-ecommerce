import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para cargar y convertir imágenes a base64
 * POST /api/convert-image
 * Body: { url: string }
 * Response: { base64: string } o { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      console.error('[API] Invalid URL: not provided or not a string')
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Validar formato de URL
    try {
      new URL(url)
    } catch (e) {
      console.error('[API] Invalid URL format:', url)
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validar que sea de Firebase Storage
    if (!url.includes('firebasestorage.googleapis.com') && !url.includes('firebaseapp.com')) {
      console.warn('[API] URL from external domain (not Firebase):', url.substring(0, 100))
      // Permitir pero registrar - algunos casos pueden ser válidos
    }

    // Agregar cache busting
    const urlWithCacheBusting = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`

    console.log(`[API] 📥 Fetching image: ${urlWithCacheBusting.substring(0, 100)}...`)

    // Fetch de la imagen con timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos timeout (aumentado)

    let response: Response | null = null
    try {
      console.log(`[API] 🌐 Fetching from: ${urlWithCacheBusting.substring(0, 80)}...`)
      
      response = await fetch(urlWithCacheBusting, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'http://localhost:3000',
        },
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`[API] 📊 Response status: ${response.status} ${response.statusText}`)
      console.log(`[API] 📋 Response headers:`, {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'cache-control': response.headers.get('cache-control'),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '(no body)')
        console.error(`[API] 🔴 HTTP Error ${response.status}: ${response.statusText}`)
        console.error(`[API] 📝 Response body: ${errorText.substring(0, 200)}`)
        return NextResponse.json(
          { 
            error: `HTTP ${response.status} ${response.statusText}`,
            details: `Failed to fetch: ${errorText.substring(0, 100)}`
          },
          { status: response.status }
        )
      }

      // Validar que sea una imagen
      const contentType = response.headers.get('content-type')
      console.log(`[API] 🎨 Validating content type: ${contentType}`)
      
      if (!contentType || !contentType.startsWith('image/')) {
        console.error(`[API] ❌ Not an image. Content-Type: ${contentType}`)
        return NextResponse.json(
          { 
            error: `Invalid content type: ${contentType}. Expected image/*`,
            debug: `URL was: ${urlWithCacheBusting.substring(0, 100)}`
          },
          { status: 400 }
        )
      }

      // Validar tamaño (máximo 10MB para PDFs)
      const contentLength = response.headers.get('content-length')
      const sizeBytes = contentLength ? parseInt(contentLength) : null
      console.log(`[API] 📏 Image size: ${sizeBytes ? (sizeBytes / 1024).toFixed(2) + ' KB' : 'unknown'}`)
      
      if (sizeBytes && sizeBytes > 10 * 1024 * 1024) {
        console.error(`[API] ❌ Image too large: ${sizeBytes} bytes`)
        return NextResponse.json(
          { error: `Image too large (${(sizeBytes / 1024 / 1024).toFixed(2)}MB, max 10MB)` },
          { status: 413 }
        )
      }

      // Convertir a buffer
      console.log(`[API] 🔄 Converting to buffer...`)
      const buffer = await response.arrayBuffer()
      
      if (buffer.byteLength === 0) {
        console.error('[API] ❌ Empty image buffer received')
        return NextResponse.json(
          { error: 'Empty image buffer', debug: `URL: ${urlWithCacheBusting.substring(0, 100)}` },
          { status: 400 }
        )
      }

      console.log(`[API] ✅ Buffer size: ${(buffer.byteLength / 1024).toFixed(2)} KB`)
      
      const base64 = Buffer.from(buffer).toString('base64')
      
      // Validar base64
      if (!base64 || base64.length === 0) {
        console.error('[API] ❌ Failed to convert buffer to base64')
        return NextResponse.json(
          { error: 'Base64 conversion failed' },
          { status: 500 }
        )
      }
      
      const dataUrl = `data:${contentType};base64,${base64}`
      console.log(`[API] ✅ Image converted successfully`)
      console.log(`[API] 📦 Data URL size: ${(dataUrl.length / 1024).toFixed(2)} KB`)
      
      return NextResponse.json({ base64: dataUrl })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[API] ❌ Fetch timeout (15s exceeded)')
        return NextResponse.json(
          { error: 'Image fetch timeout (15 seconds exceeded)' },
          { status: 504 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('[API] ❌ Error converting image:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

