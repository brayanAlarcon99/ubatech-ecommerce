/**
 * Firebase Document Size Cleanup Utility
 * Detecta y limpia documentos que superan el límite de 1MB
 */

import { getDb } from "@/lib/firebase"
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore"

export interface DocumentSizeInfo {
  currentSizeBytes: number
  maxSizeBytes: number
  isOversize: boolean
  exceedsByBytes: number
  exceedsByPercentage: number
  estimatedImageSizeBytes: number
}

/**
 * Calcula el tamaño aproximado de un documento en Firebase
 * Incluye metadatos y estructura
 */
export function estimateDocumentSize(data: any): number {
  let size = 0

  function calculateSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 8
    }

    switch (typeof obj) {
      case "boolean":
        return 1
      case "number":
        return 8
      case "string":
        return obj.length * 2 // UTF-16 encoding
      case "object":
        if (Array.isArray(obj)) {
          return obj.reduce((sum, item) => sum + calculateSize(item), 0)
        } else {
          return Object.keys(obj).reduce((sum, key) => {
            return sum + key.length * 2 + calculateSize(obj[key])
          }, 0)
        }
      default:
        return 0
    }
  }

  return calculateSize(data)
}

/**
 * Obtiene información del tamaño actual de un documento
 */
export async function getDocumentSizeInfo(
  collectionPath: string,
  documentId: string
): Promise<DocumentSizeInfo | null> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionPath, documentId)
    const docSnapshot = await getDoc(docRef)

    if (!docSnapshot.exists()) {
      return null
    }

    const data = docSnapshot.data()
    const estimatedSize = estimateDocumentSize(data)

    // Estimar tamaño de imágenes (base64 es más grande)
    let estimatedImageSize = 0
    if (data.images && Array.isArray(data.images)) {
      estimatedImageSize = data.images.reduce(
        (sum: number, img: string) => sum + (img?.length || 0),
        0
      )
    } else if (data.image && typeof data.image === "string") {
      estimatedImageSize = data.image.length
    }

    const FIREBASE_MAX_SIZE = 1048576 // 1MB en bytes
    const currentSize = estimatedSize
    const isOversize = currentSize > FIREBASE_MAX_SIZE
    const exceedsByBytes = Math.max(0, currentSize - FIREBASE_MAX_SIZE)
    const exceedsByPercentage = (exceedsByBytes / FIREBASE_MAX_SIZE) * 100

    return {
      currentSizeBytes: currentSize,
      maxSizeBytes: FIREBASE_MAX_SIZE,
      isOversize,
      exceedsByBytes,
      exceedsByPercentage,
      estimatedImageSizeBytes: estimatedImageSize,
    }
  } catch (error) {
    console.error("[DocumentSizeCleanup] Error getting document info:", error)
    throw error
  }
}

/**
 * Genera un mensaje detallado sobre el tamaño del documento
 */
export function generateDocumentSizeMessage(info: DocumentSizeInfo): string {
  const currentMB = (info.currentSizeBytes / (1024 * 1024)).toFixed(2)
  const maxMB = (info.maxSizeBytes / (1024 * 1024)).toFixed(2)
  const exceedMB = (info.exceedsByBytes / (1024 * 1024)).toFixed(2)
  const imageMB = (info.estimatedImageSizeBytes / (1024 * 1024)).toFixed(2)

  let message = `🚨 DOCUMENTO OVERSIZED - No puede guardar cambios\n\n`
  message += `📊 **Tamaño Actual:** ${currentMB}MB / ${maxMB}MB\n`
  message += `⚠️ **Supera por:** ${exceedMB}MB (${info.exceedsByPercentage.toFixed(1)}%)\n`
  message += `🖼️ **Tamaño estimado imágenes:** ${imageMB}MB\n\n`

  message += `❌ **Problema:** Este producto tiene imágenes demasiado grandes\n\n`

  message += `✅ **Solución:** Eliminar todas las imágenes antiguas\n`
  message += `   Las imágenes grandes serán removidas del documento.\n`
  message += `   Luego puedes:\n`
  message += `   1. Guardar los cambios de stock\n`
  message += `   2. Cargar imágenes nuevas más pequeñas\n\n`

  message += `💡 **Recomendación:**\n`
  message += `   • Usa formato JPEG en lugar de PNG\n`
  message += `   • Reduce la resolución a máximo 800x600px\n`
  message += `   • Comprime las imágenes antes de cargar\n`
  message += `   • Máximo 0.3MB por imagen`

  return message
}

/**
 * Limpia un documento removiendo todas las imágenes
 */
export async function cleanDocumentImages(
  collectionPath: string,
  documentId: string
): Promise<DocumentSizeInfo | null> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionPath, documentId)

    // Actualizar documento removiendo imágenes
    await updateDoc(docRef, {
      images: deleteField(),
      image: deleteField(),
    })

    // Obtener tamaño actualizado
    const updatedInfo = await getDocumentSizeInfo(collectionPath, documentId)
    return updatedInfo
  } catch (error) {
    console.error("[DocumentSizeCleanup] Error cleaning document:", error)
    throw error
  }
}

/**
 * Verifica si un documento puede acomodar nuevos datos
 */
export async function canDocumentAccommodateData(
  collectionPath: string,
  documentId: string,
  newDataSize: number
): Promise<{ canAccommodate: boolean; availableBytes: number }> {
  try {
    const info = await getDocumentSizeInfo(collectionPath, documentId)
    if (!info) {
      return { canAccommodate: true, availableBytes: 1048576 }
    }

    // Remover imágenes del tamaño actual para cálculo
    const sizeWithoutImages =
      info.currentSizeBytes - info.estimatedImageSizeBytes
    const projectedSize = sizeWithoutImages + newDataSize
    const canAccommodate = projectedSize <= info.maxSizeBytes
    const availableBytes = Math.max(0, info.maxSizeBytes - projectedSize)

    return { canAccommodate, availableBytes }
  } catch (error) {
    console.error(
      "[DocumentSizeCleanup] Error checking document accommodation:",
      error
    )
    return { canAccommodate: false, availableBytes: 0 }
  }
}
