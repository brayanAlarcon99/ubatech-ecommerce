/**
 * Image Size Validator for Firebase Security
 * Validates total image size when editing products to ensure compliance with Firebase 1MB limit
 */

export interface ImageSizeValidationResult {
  isValid: boolean
  totalSizeMB: number
  exceedsLimit: boolean
  oversizedImages: Array<{
    index: number
    sizeMB: number
    percentage: number
    recommendation: "change" | "remove"
  }>
  errorMessage: string | null
}

const FIREBASE_LIMIT_MB = 1
const MAX_IMAGES = 3

/**
 * Validates if images exceed Firebase limit when editing a product
 * @param imagePreviews Array of base64 image strings
 * @returns Validation result with detailed information about oversized images
 */
export function validateImagesForEdit(imagePreviews: string[]): ImageSizeValidationResult {
  if (!imagePreviews || imagePreviews.length === 0) {
    return {
      isValid: true,
      totalSizeMB: 0,
      exceedsLimit: false,
      oversizedImages: [],
      errorMessage: null,
    }
  }

  let totalSizeMB = 0
  const oversizedImages: ImageSizeValidationResult["oversizedImages"] = []

  // Calculate size of each image
  imagePreviews.forEach((preview, index) => {
    const sizeMB = getBase64SizeMB(preview)
    totalSizeMB += sizeMB

    // Mark images that are problematic
    if (sizeMB > FIREBASE_LIMIT_MB * 0.8) {
      // Flag images that are above 80% of limit as candidates for change
      oversizedImages.push({
        index: index + 1, // 1-based for display
        sizeMB: parseFloat(sizeMB.toFixed(2)),
        percentage: parseFloat(((sizeMB / FIREBASE_LIMIT_MB) * 100).toFixed(1)),
        recommendation: sizeMB > FIREBASE_LIMIT_MB ? "remove" : "change",
      })
    }
  })

  const exceedsLimit = totalSizeMB > FIREBASE_LIMIT_MB

  // Generate error message if limit is exceeded
  let errorMessage: string | null = null
  if (exceedsLimit) {
    errorMessage = generateImageSizeErrorMessage(
      totalSizeMB,
      oversizedImages,
      imagePreviews.length
    )
  }

  return {
    isValid: !exceedsLimit,
    totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
    exceedsLimit,
    oversizedImages,
    errorMessage,
  }
}

/**
 * Calculates base64 string size in MB
 * @param base64String The base64 encoded image string
 * @returns Size in MB
 */
function getBase64SizeMB(base64String: string): number {
  if (!base64String) return 0
  const bytes = Buffer.byteLength(base64String, "utf8")
  return bytes / (1024 * 1024)
}

/**
 * Generates a detailed error message indicating which images to change or remove
 */
function generateImageSizeErrorMessage(
  totalSizeMB: number,
  oversizedImages: Array<{
    index: number
    sizeMB: number
    percentage: number
    recommendation: "change" | "remove"
  }>,
  totalImages: number
): string {
  let message = `⚠️ **ERROR: Las imágenes superan el límite de ${FIREBASE_LIMIT_MB}MB de Firebase**\n\n`
  message += `📊 **Tamaño Total:** ${totalSizeMB.toFixed(2)}MB (Límite: ${FIREBASE_LIMIT_MB}MB)\n`
  message += `📷 **Total de imágenes:** ${totalImages}/${MAX_IMAGES}\n\n`

  if (oversizedImages.length > 0) {
    message += `❌ **Imágenes problemáticas:**\n`
    oversizedImages.forEach((img) => {
      const action =
        img.recommendation === "remove"
          ? `🗑️ ELIMINA`
          : `🔄 CAMBIA`
      message += `\n• **Imagen ${img.index}**: ${img.sizeMB}MB (${img.percentage}% del límite)\n`
      message += `  ${action} esta imagen por una de menor tamaño o resolución`
    })
  }

  message += `\n\n💡 **Soluciones:**\n`
  message += `1. Usa imágenes con menor resolución o comprensión\n`
  message += `2. Usa formato WebP o JPEG en lugar de PNG\n`
  message += `3. Utiliza herramientas online de compresión de imágenes\n`
  message += `4. Aumenta la compresión en tu editor de imágenes`

  return message
}

/**
 * Gets readable size information for a single image
 */
export function getImageSizeInfo(base64String: string): {
  sizeMB: number
  sizeKB: number
  isOversized: boolean
  percentage: number
} {
  const sizeMB = getBase64SizeMB(base64String)
  const sizeKB = (sizeMB * 1024).toFixed(2)
  const isOversized = sizeMB > FIREBASE_LIMIT_MB

  return {
    sizeMB: parseFloat(sizeMB.toFixed(2)),
    sizeKB: parseFloat(sizeKB as string),
    isOversized,
    percentage: parseFloat(((sizeMB / FIREBASE_LIMIT_MB) * 100).toFixed(1)),
  }
}

/**
 * Recommends which image to remove based on size
 */
export function getImageRemovalRecommendation(
  oversizedImages: Array<{ index: number; sizeMB: number }>
): number | null {
  if (oversizedImages.length === 0) return null

  // Return the largest oversized image
  const largestOversized = oversizedImages.reduce((prev, current) =>
    current.sizeMB > prev.sizeMB ? current : prev
  )

  return largestOversized.index
}
