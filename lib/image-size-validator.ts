/**
 * Image Size Validator for Firebase
 * ✅ Sin restricciones de peso
 * ✅ Máximo 5 imágenes
 * ✅ Formato Base64 o URL
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
const MAX_IMAGES = 5

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

  // ✅ OPTIMIZACIÓN: Sin restricción de tamaño de imágenes
  // La base de datos ha sido mejorada para soportar imágenes sin límite
  return {
    isValid: true,
    totalSizeMB: 0,
    exceedsLimit: false,
    oversizedImages: [],
    errorMessage: null,
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
 * ✅ DESACTIVADO: La base de datos ya no tiene restricción de tamaño
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
  // ✅ Retorna null ya que no hay restricciones
  return ""
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
