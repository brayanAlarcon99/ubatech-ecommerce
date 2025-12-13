import jsPDF from 'jspdf'
import type { Product } from '@/types'

interface PDFGeneratorOptions {
  fileName?: string
  title?: string
}

async function loadImage(url: string): Promise<string | null> {
  try {
    return await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        } else {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

export async function generateOutOfStockPDF(
  products: Product[],
  categoriesMap: Map<string, string>,
  options: PDFGeneratorOptions = {}
) {
  const { fileName = 'Productos_Fuera_de_Stock.pdf', title = 'Reporte de Productos Fuera de Stock' } = options

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
  doc.text(`Total de productos fuera de stock: ${products.length}`, margin, yPosition)
  yPosition += 10

  // Agrupar productos por categoría
  const groupedByCategory = new Map<string, Product[]>()
  products.forEach((product) => {
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

      // Agregar imagen si existe
      if (product.image) {
        const imageData = await loadImage(product.image)
        if (imageData) {
          doc.addImage(imageData, 'JPEG', margin + 2, yPosition, imageWidth, imageHeight)
        }
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

      if (product.subcategory) {
        infoLines.push(`Marca: ${product.subcategory}`)
      }

      if (product.sku) {
        infoLines.push(`SKU: ${product.sku}`)
      }

      infoLines.forEach((line) => {
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
  doc.save(fileName)
}
