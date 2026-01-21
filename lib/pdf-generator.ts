'use client'

import jsPDF from 'jspdf'
import type { Product } from '@/types'

interface PDFGeneratorOptions {
  fileName?: string
  title?: string
  outOfStockByProduct?: Map<string, { store: string; needed: number }[]>
}

async function loadImage(url: string, retryCount: number = 0, maxRetries: number = 2): Promise<string | null> {
  if (!url || typeof url !== 'string') {
    console.warn('[PDF] ⚠️ Invalid URL provided to loadImage')
    return null
  }

  // Validar que sea una URL válida
  try {
    new URL(url)
  } catch (e) {
    console.error('[PDF] ❌ INVALID URL FORMAT:', url, '- Error:', e instanceof Error ? e.message : 'Unknown')
    return null
  }

  try {
    const attempt = retryCount + 1
    console.log(`[PDF] 📥 Loading URL (Attempt ${attempt}/${maxRetries + 1}):`)
    console.log(`[PDF] 📝 Full URL: ${url.substring(0, 150)}${url.length > 150 ? '...' : ''}`)

    // ============ INTENTO 1: API ENDPOINT (RECOMENDADO) ============
    try {
      console.log(`[PDF] 🔄 Attempt ${attempt}.1: Using API endpoint (server-side fetch)`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const apiResponse = await fetch('/api/convert-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        if (data.base64 && typeof data.base64 === 'string' && data.base64.startsWith('data:')) {
          console.log(`[PDF] ✅ Image loaded successfully via API endpoint (Attempt ${attempt})`)
          return data.base64
        } else {
          console.warn(`[PDF] ⚠️ API returned invalid base64 data`)
        }
      } else {
        console.warn(`[PDF] ⚠️ API returned status: ${apiResponse.status}`)
      }
    } catch (apiError) {
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        console.warn(`[PDF] ⚠️ API endpoint timeout (Attempt ${attempt})`)
      } else {
        console.warn(`[PDF] ⚠️ API endpoint failed (Attempt ${attempt}):`, apiError instanceof Error ? apiError.message : 'Unknown error')
      }
    }

    // ============ INTENTO 2: CANVAS + IMAGE TAG ============
    console.log(`[PDF] 🔄 Attempt ${attempt}.2: Using canvas + image tag fallback`)
    const canvasResult = await new Promise<string | null>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      let timeoutId: NodeJS.Timeout | null = null
      let resolved = false

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (!resolved) {
          resolved = true
          // Prevenir memory leaks
          img.src = ''
          img.onload = null
          img.onerror = null
          img.onabort = null
        }
      }

      img.onload = () => {
        if (resolved) return
        resolved = true
        cleanup()

        console.log(`[PDF] ✅ Image loaded by browser (${img.width}x${img.height}px)`)
        
        // Validar dimensiones
        if (img.width === 0 || img.height === 0) {
          console.warn(`[PDF] ⚠️ Invalid image dimensions: ${img.width}x${img.height} - Attempt ${attempt}`)
          resolve(null)
          return
        }

        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            console.error('[PDF] ❌ Failed to get canvas 2D context')
            resolve(null)
            return
          }

          console.log(`[PDF] 🎨 Canvas created: ${canvas.width}x${canvas.height}px`)
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          
          console.log(`[PDF] 📊 Canvas toDataURL result: ${typeof dataUrl}, length: ${dataUrl?.length || 0}`)
          
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            console.log(`[PDF] ✅ Image converted to data URL successfully (Attempt ${attempt})`)
            resolve(dataUrl)
          } else {
            console.warn(`[PDF] ⚠️ Canvas toDataURL produced invalid result: ${dataUrl?.substring(0, 50)}`)
            resolve(null)
          }
        } catch (canvasError) {
          console.error('[PDF] ❌ Canvas error:', canvasError instanceof Error ? canvasError.message : String(canvasError))
          console.error('[PDF] 📍 Stack:', canvasError instanceof Error ? canvasError.stack : 'no stack')
          resolve(null)
        }
      }

      img.onerror = () => {
        if (resolved) return
        resolved = true
        cleanup()
        console.warn(`[PDF] ⚠️ Image failed to load - possible CORS, 404, or invalid format - Attempt ${attempt}`)
        console.warn(`[PDF] 📍 Attempted URL: ${url.substring(0, 100)}...`)
        resolve(null)
      }

      img.onabort = () => {
        if (resolved) return
        resolved = true
        cleanup()
        console.warn(`[PDF] ⚠️ Image loading aborted - Attempt ${attempt}`)
        resolve(null)
      }

      // Timeout de 12 segundos (más generoso que antes)
      timeoutId = setTimeout(() => {
        if (resolved) return
        resolved = true
        cleanup()
        console.warn(`[PDF] ⏱️ Image loading timeout (12s) - Attempt ${attempt}`)
        console.warn(`[PDF] 📍 URL: ${url.substring(0, 100)}...`)
        resolve(null)
      }, 12000)

      const urlWithCacheBusting = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
      console.log(`[PDF] 🎯 Setting img.src with cache busting...`)
      console.log(`[PDF] 📝 Full src: ${urlWithCacheBusting.substring(0, 150)}...`)
      img.src = urlWithCacheBusting
    })

    // Si obtuvo resultado, retornarlo
    if (canvasResult) {
      return canvasResult
    }

    // ============ INTENTO 3: REINTENTAR SI FALLÓ ============
    if (retryCount < maxRetries) {
      console.log(`[PDF] 🔄 Retrying image load (${retryCount + 1}/${maxRetries})...`)
      // Esperar 500ms antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 500))
      return loadImage(url, retryCount + 1, maxRetries)
    }

    console.warn(`[PDF] ❌ Image load failed after ${maxRetries + 1} attempts: ${url.substring(0, 80)}...`)
    return null
  } catch (error) {
    console.error('[PDF] ❌ Unexpected error in loadImage:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export async function generateOutOfStockPDF(
  products: Product[],
  categoriesMap: Map<string, string>,
  options: PDFGeneratorOptions = {}
) {
  if (!products || products.length === 0) {
    throw new Error('No products provided to generate out-of-stock PDF')
  }

  const { fileName = 'Productos_Fuera_de_Stock.pdf', title = 'Reporte de Productos Fuera de Stock', outOfStockByProduct } = options

  console.log(`[PDF] 📄 Starting out-of-stock PDF generation with ${products.length} products`)

  try {
    // Crear documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pageWidth - 2 * margin
    const imageWidth = 30
    const imageHeight = 30

    let yPosition = margin

    // Título del documento
    doc.setFontSize(16)
    doc.setFont('Helvetica', 'bold')
    doc.text(title, margin, yPosition)
    yPosition += 10

    // Fecha de generación
    doc.setFontSize(10)
    doc.setFont('Helvetica', 'normal')
    const generatedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    doc.text(`Generado: ${generatedDate}`, margin, yPosition)
    yPosition += 8

    // Total de productos
    doc.setFontSize(11)
    doc.setFont('Helvetica', 'bold')
    doc.text(`Total de productos con stock bajo: ${products.length}`, margin, yPosition)
    yPosition += 10

    // Agrupar productos por categoría
    const groupedByCategory = new Map<string, Product[]>()
    products.forEach((product: Product) => {
      const categoryName = categoriesMap.get(product.category) || 'Sin categoría'
      if (!groupedByCategory.has(categoryName)) {
        groupedByCategory.set(categoryName, [])
      }
      groupedByCategory.get(categoryName)!.push(product)
    })

    // Iterar sobre categorías
    const entries = Array.from(groupedByCategory.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  for (const [categoryName, categoryProducts] of entries) {
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - margin - 40) {
      doc.addPage()
      yPosition = margin
    }

    // Encabezado de categoría
    doc.setFontSize(12)
    doc.setFont('Helvetica', 'bold')
    doc.setFillColor(41, 128, 185) // Color azul oscuro
    doc.setTextColor(255, 255, 255) // Texto blanco
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'F')
    doc.text(`${categoryName} (${categoryProducts.length} productos)`, margin + 2, yPosition)
    doc.setTextColor(0, 0, 0) // Volver a texto negro
    yPosition += 12

    // Productos de la categoría
    for (const product of categoryProducts) {
      // Verificar espacio disponible (necesitamos espacio para imagen + info)
      if (yPosition > pageHeight - margin - 45) {
        doc.addPage()
        yPosition = margin
      }

      const startYPosition = yPosition

      // Agregar imagen si existe (priorizar images array, fallback a image)
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : product.image
      if (imageUrl) {
        console.log(`[PDF] 📦 Product: ${product.name} | 🔗 Image URL exists: ${imageUrl.substring(0, 60)}...`)
        const imageData = await loadImage(imageUrl)
        if (imageData) {
          console.log(`[PDF] ✨ Image data ready for ${product.name} - adding to PDF`)
          try {
            doc.addImage(imageData, 'JPEG', margin + 2, yPosition, imageWidth, imageHeight)
          } catch (imgError) {
            console.error('[PDF] ❌ Error adding image to PDF:', imgError)
          }
        } else {
          console.warn(`[PDF] ⚠️ No image data for ${product.name}`)
        }
      } else {
        console.warn(`[PDF] ⚠️ No image URL found for product: ${product.name}`)
      }

      // Información del producto (al lado de la imagen)
      const infoX = margin + imageWidth + 8
      const infoWidth = contentWidth - imageWidth - 6

      // Nombre del producto
      doc.setFontSize(10)
      doc.setFont('Helvetica', 'bold')
      const nameLines = doc.splitTextToSize(`${product.name}`, infoWidth)
      doc.text(nameLines, infoX, yPosition)
      yPosition += nameLines.length * 5 + 2

      // Información del producto
      doc.setFontSize(9)
      doc.setFont('Helvetica', 'normal')

      const infoLines: string[] = []
      infoLines.push(`Categoría: ${categoryName}`)
      const formattedPrice = product.price ? new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(product.price) : 'N/A'
      infoLines.push(`Precio: $${formattedPrice}`)

      // Agregar tiendas con stock bajo y cantidad faltante
      if (outOfStockByProduct && outOfStockByProduct.has(product.id)) {
        const storesWithLowStock = outOfStockByProduct.get(product.id)
        if (storesWithLowStock && storesWithLowStock.length > 0) {
          storesWithLowStock.forEach((item: { store: string; needed: number }) => {
            infoLines.push(`${item.store}: Faltan ${item.needed} unidades`)
          })
        }
      }

      if (product.subcategory) {
        infoLines.push(`Marca: ${product.subcategory}`)
      }

      if (product.sku) {
        infoLines.push(`SKU: ${product.sku}`)
      }

      infoLines.forEach((line: string) => {
        doc.text(line, infoX, yPosition)
        yPosition += 4
      })

      // Asegurar espacio mínimo para la imagen
      yPosition = Math.max(yPosition, startYPosition + imageHeight + 3)
      yPosition += 3

      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(margin + 1, yPosition, margin + contentWidth - 1, yPosition)
      yPosition += 4
    }
  }

  // Descargar el PDF
  try {
    doc.save(fileName)
    console.log(`[PDF] ✅ Out-of-stock PDF saved successfully: ${fileName}`)
  } catch (saveError) {
    console.error(`[PDF] ❌ Error saving out-of-stock PDF:`, saveError instanceof Error ? saveError.message : 'Unknown error')
    throw new Error(`Failed to save PDF: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
  }
  } catch (error) {
    console.error(`[PDF] ❌ Error generating out-of-stock PDF:`, error instanceof Error ? error.message : 'Unknown error')
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateCategoryPDF(
  products: Product[],
  categoryName: string,
  options: { fileName?: string } = {}
) {
  if (!products || products.length === 0) {
    throw new Error('No products provided to generate PDF')
  }

  if (!categoryName || categoryName.trim() === '') {
    throw new Error('Category name is required')
  }

  const { fileName = `Catalogo_${categoryName.replace(/[^\w\s-]/g, '')}_${new Date().getTime()}.pdf` } = options

  console.log(`[PDF] 📄 Starting PDF generation for category: "${categoryName}" with ${products.length} products`)

  try {
    // Crear documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    const contentWidth = pageWidth - 2 * margin

    let yPosition = margin

    // ============ ENCABEZADO PEQUEÑO ============
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, pageWidth, 20, 'F')

    // Títulos en el encabezado pequeño
    doc.setFontSize(8)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('DJCELUTECNICO', margin, 8)
    doc.text('UBATECH', pageWidth - margin, 8, { align: 'right' })

    // Nombre de categoría más pequeño y negro
    yPosition = 28
    doc.setFontSize(16)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(categoryName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // ============ ENCABEZADO TABLA ============
    doc.setFontSize(9)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(41, 128, 185)

    const headerHeight = 10
    const colWidths = {
      image: 28,
      name: 38,
      detail: 65,
      price: 27,
    }

    // Posiciones de columnas
    const colPositions = {
      imageStart: margin,
      imageEnd: margin + colWidths.image,
      nameStart: margin + colWidths.image,
      nameEnd: margin + colWidths.image + colWidths.name,
      detailStart: margin + colWidths.image + colWidths.name,
      detailEnd: margin + colWidths.image + colWidths.name + colWidths.detail,
      priceStart: margin + colWidths.image + colWidths.name + colWidths.detail,
      priceEnd: pageWidth - margin,
    }

    // Dibujar fondo encabezado
    doc.rect(margin, yPosition, contentWidth, headerHeight, 'F')

    // Líneas verticales del encabezado
    doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(colPositions.imageEnd, yPosition, colPositions.imageEnd, yPosition + headerHeight)
  doc.line(colPositions.nameEnd, yPosition, colPositions.nameEnd, yPosition + headerHeight)
  doc.line(colPositions.detailEnd, yPosition, colPositions.detailEnd, yPosition + headerHeight)

  // Textos de encabezado
  let xPos = margin + 2
  doc.text('IMAGEN', xPos, yPosition + 6.5)
  xPos = colPositions.nameStart + 2
  doc.text('PRODUCTO', xPos, yPosition + 6.5)
  xPos = colPositions.detailStart + 2
  doc.text('DESCRIPCION', xPos, yPosition + 6.5)
  xPos = colPositions.priceStart + 2
  doc.text('PRECIO', xPos, yPosition + 6.5)

  yPosition += headerHeight + 1

  // ============ PRODUCTOS (DESDE PRIMERA PÁGINA) ============
  doc.setTextColor(0, 0, 0)
  let alternateRow = false

  for (let i = 0; i < products.length; i++) {
    const product = products[i]

    // Verificar espacio disponible
    if (yPosition > pageHeight - margin - 35) {
      doc.addPage()
      yPosition = margin + 5
    }

    const rowHeight = 40
    const startYPosition = yPosition

    // Fondo alternado de filas
    if (alternateRow) {
      doc.setFillColor(240, 245, 250)
      doc.rect(margin, yPosition, contentWidth, rowHeight, 'F')
    }

    // Borde de fila (rectángulo exterior)
    doc.setDrawColor(200, 210, 220)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPosition, contentWidth, rowHeight)

    // Líneas verticales divisoras (separadores de columnas)
    doc.setDrawColor(200, 210, 220)
    doc.setLineWidth(0.3)
    doc.line(colPositions.imageEnd, yPosition, colPositions.imageEnd, yPosition + rowHeight)
    doc.line(colPositions.nameEnd, yPosition, colPositions.nameEnd, yPosition + rowHeight)
    doc.line(colPositions.detailEnd, yPosition, colPositions.detailEnd, yPosition + rowHeight)

    // ---- IMAGEN ----
    xPos = colPositions.imageStart + 2
    let imageLoaded = false
    
    // Buscar imagen: primero en images array, luego en image field
    // IMPORTANTE: Intenta todos los formatos posibles
    let imageUrl: string | undefined = undefined
    let imageAttempts = 0
    
    // Intento 1: Array de imágenes (nuevo formato)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Validar que la primera imagen sea válida (no undefined, no null, no empty string)
      const firstImage = product.images[0]
      if (firstImage && typeof firstImage === 'string' && firstImage.trim().length > 0) {
        imageUrl = firstImage
        imageAttempts = 1
        console.log(`[PDF] 🔍 Found image in images[0] for "${product.name}"`)
      }
    }
    
    // Intento 2: Campo image legacy (si no encontró en array)
    if (!imageUrl && product.image && typeof product.image === 'string' && product.image.trim().length > 0) {
      imageUrl = product.image
      imageAttempts = 2
      console.log(`[PDF] 🔍 Found image in image field for "${product.name}" (legacy)`)
    }
    
    // Intento 3: Si hay múltiples imágenes, intentar las otras también
    if (!imageUrl && product.images && Array.isArray(product.images) && product.images.length > 1) {
      for (let imgIdx = 1; imgIdx < product.images.length; imgIdx++) {
        const altImage = product.images[imgIdx]
        if (altImage && typeof altImage === 'string' && altImage.trim().length > 0) {
          imageUrl = altImage
          imageAttempts = 3
          console.log(`[PDF] 🔍 Using alternative image index ${imgIdx} for "${product.name}"`)
          break
        }
      }
    }
    
    if (imageUrl) {
      try {
        console.log(`[PDF] 📦 Product #${i + 1}: "${product.name}"`)
        console.log(`[PDF] 🔗 URL (Attempt ${imageAttempts}): ${imageUrl.substring(0, 100)}${imageUrl.length > 100 ? '...' : ''}`)
        
        // loadImage ahora tiene retry automático (hasta 2 reintentos)
        const imageData = await loadImage(imageUrl)
        
        if (imageData) {
          try {
            const imgWidth = 20
            const imgHeight = 20
            const imgX = colPositions.imageStart + (colWidths.image - imgWidth) / 2
            const imgY = yPosition + (rowHeight - imgHeight) / 2
            doc.addImage(imageData, 'JPEG', imgX, imgY, imgWidth, imgHeight)
            imageLoaded = true
            console.log(`[PDF] ✅ SUCCESS: Image inserted for "${product.name}" (attempt ${imageAttempts})`)
          } catch (addImageError) {
            console.error(`[PDF] ❌ FAILED: Error adding image to PDF for "${product.name}":`, addImageError)
            imageLoaded = false
          }
        } else {
          console.warn(`[PDF] ⚠️ WARNING: No image data for "${product.name}" (URL may be invalid, CORS blocked, or all retries failed)`)
          imageLoaded = false
        }
      } catch (error) {
        console.error(`[PDF] ❌ ERROR: Processing image for "${product.name}":`, error)
        imageLoaded = false
      }
    } else {
      console.warn(`[PDF] ⚠️ WARNING: No valid image URL found for product #${i + 1}: "${product.name}" (checked: images[] array and image field)`)
    }

    if (!imageLoaded) {
      // Mostrar rectángulo gris como placeholder
      doc.setFillColor(230, 230, 230)
      doc.rect(colPositions.imageStart + 1, yPosition + 2, colWidths.image - 2, rowHeight - 4, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.rect(colPositions.imageStart + 1, yPosition + 2, colWidths.image - 2, rowHeight - 4)
      
      // Texto pequeño
      doc.setFontSize(6)
      doc.setTextColor(150, 150, 150)
      doc.text('Sin imagen', colPositions.imageStart + colWidths.image / 2, yPosition + rowHeight / 2, {
        align: 'center',
      })
    }

    // ---- NOMBRE PRODUCTO ----
    xPos = colPositions.nameStart + 2
    doc.setFontSize(9)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const nameLines = doc.splitTextToSize(product.name.substring(0, 60), colWidths.name - 4)
    let nameYPos = yPosition + 3
    doc.text(nameLines.slice(0, 1), xPos, nameYPos)
    nameYPos += 4

    // SKU debajo del nombre si existe
    if (product.sku) {
      doc.setFontSize(7)
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text(`SKU: ${product.sku}`, xPos, nameYPos)
    }

    // ---- DESCRIPCIÓN COMPLETA ----
    xPos = colPositions.detailStart + 2
    doc.setFontSize(7.5)
    doc.setFont('Helvetica', 'normal')
    doc.setTextColor(60, 60, 60)

    // Mostrar descripción completa sin truncar
    let detailText = product.description ? product.description : 'Sin descripción'
    
    // Limpiar solo caracteres peligrosos pero mantener contenido completo
    detailText = detailText
      .replace(/[^\w\s\-.,()áéíóúñÁÉÍÓÚÑ:/+]/g, '')
      .trim()

    const detailLines = doc.splitTextToSize(detailText, colWidths.detail - 4)
    // Mostrar más líneas para descripción completa
    const maxDetailLines = 5
    const displayDetailLines = detailLines.slice(0, maxDetailLines)
    let detailYPos = yPosition + 3
    
    displayDetailLines.forEach((line: string, index: number) => {
      doc.text(line, xPos, detailYPos)
      detailYPos += 3.5
    })

    // ---- PRECIO CON DESCUENTO ----
    xPos = colPositions.priceStart + colWidths.price / 2
    doc.setFontSize(8)
    doc.setFont('Helvetica', 'bold')

    let priceYPos = yPosition + 8

    // Si tiene descuento, mostrar precio original tachado y rebajado
    if (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price) {
      // Precio original tachado (gris)
      const originalPrice = product.price
        ? new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(product.price)
        : 'N/A'

      doc.setTextColor(180, 180, 180)
      doc.setFontSize(7)
      const originalPriceText = `$${originalPrice}`
      doc.text(originalPriceText, xPos, priceYPos, { align: 'center' })

      // Tachar el precio original
      const textWidth = doc.getTextWidth(originalPriceText)
      const lineY = priceYPos - 0.5
      doc.line(xPos - textWidth / 2, lineY, xPos + textWidth / 2, lineY)

      priceYPos += 4

      // Precio con descuento en rojo y más grande
      doc.setFontSize(10)
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(220, 50, 50)
      const discountedPrice = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(product.discountedPrice)
      doc.text(`$${discountedPrice}`, xPos, priceYPos, { align: 'center' })

      priceYPos += 4

      // Porcentaje de descuento
      const discountPercent = Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
      doc.setFontSize(6)
      doc.setTextColor(220, 50, 50)
      doc.text(`-${discountPercent}%`, xPos, priceYPos, { align: 'center' })
    } else {
      // Precio normal sin descuento (azul)
      doc.setTextColor(41, 128, 185)
      doc.setFontSize(10)
      const formattedPrice = product.price
        ? new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(product.price)
        : 'N/A'
      doc.text(`$${formattedPrice}`, xPos, priceYPos, { align: 'center' })
    }

    yPosition += rowHeight + 1
    alternateRow = !alternateRow
  }

  // ============ PIE DE PÁGINA ============
  doc.setFontSize(8)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(150, 150, 150)

  // Línea separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8)

  // Texto de pie
  doc.text(
    'Este catálogo contiene información de productos disponibles. Precios sujetos a cambios.',
    margin,
    pageHeight - margin - 4
  )

  // Número de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(180, 180, 180)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 15, pageHeight - margin)
  }

  // Descargar el PDF
  try {
    doc.save(fileName)
    console.log(`[PDF] ✅ PDF saved successfully: ${fileName}`)
  } catch (saveError) {
    console.error(`[PDF] ❌ Error saving PDF:`, saveError instanceof Error ? saveError.message : 'Unknown error')
    throw new Error(`Failed to save PDF: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
  }
  } catch (error) {
    console.error(`[PDF] ❌ Error generating category PDF:`, error instanceof Error ? error.message : 'Unknown error')
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

