/**
 * Utilidad para comprimir imágenes antes de guardarlas en Firestore
 * Reduce el tamaño de las imágenes base64 sin perder calidad visual significativa
 */

/**
 * Comprime una imagen base64 reduciéndola a un tamaño máximo
 * @param base64Image Imagen en formato base64 (con o sin data URL)
 * @param maxWidth Ancho máximo en píxeles (default: 1200)
 * @param maxHeight Alto máximo en píxeles (default: 1200)
 * @param quality Calidad JPEG (0-1, default: 0.8)
 * @returns Promise con la imagen comprimida en base64
 */
export function compressImage(
  base64Image: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Manejar data URLs que pueden contener caracteres especiales
    img.onload = function () {
      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      // Calcular nuevas dimensiones manteniendo aspecto
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a base64 con la calidad especificada
      const compressed = canvas.toDataURL("image/jpeg", quality)
      resolve(compressed)
    }

    img.onerror = function () {
      reject(new Error("Failed to load image"))
    }

    // Establecer la fuente de la imagen
    img.src = base64Image
  })
}

/**
 * Comprime múltiples imágenes
 * @param images Array de imágenes en base64
 * @param maxWidth Ancho máximo
 * @param maxHeight Alto máximo
 * @param quality Calidad
 * @returns Promise con array de imágenes comprimidas
 */
export async function compressImages(
  images: string[],
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string[]> {
  const compressed = await Promise.all(
    images.map((img) => compressImage(img, maxWidth, maxHeight, quality))
  )
  return compressed
}

/**
 * Calcula el tamaño de una imagen base64 en MB
 */
export function getBase64Size(base64String: string): number {
  const sizeInBytes = base64String.length - (base64String.split(",")[0]?.length ?? 0) - 1
  return sizeInBytes / (1024 * 1024)
}

/**
 * Verifica si una imagen excede el tamaño máximo permitido
 */
export function exceedsMaxSize(base64Image: string, maxSizeMB: number = 1): boolean {
  return getBase64Size(base64Image) > maxSizeMB
}
