/**
 * Funciones para manejar imágenes en Firebase Storage
 */

import { getStorage, ref, getDownloadURL, getBytes } from 'firebase/storage'

/**
 * Convierte una ruta de Storage a una URL descargable
 * @param storagePath Ruta en Storage (ej: "products/123/image-0.jpg")
 * @returns Promise que retorna la URL descargable de la imagen
 */
export async function getStorageImageUrl(storagePath: string): Promise<string> {
  // Si ya es una URL completa, retornarla tal cual
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath
  }
  
  // Si es base64, retornarla tal cual
  if (storagePath.startsWith('data:')) {
    return storagePath
  }
  
  // Obtener URL descargable desde Firebase Storage
  try {
    const storage = getStorage()
    const imageRef = ref(storage, storagePath)
    const downloadUrl = await getDownloadURL(imageRef)
    return downloadUrl
  } catch (error) {
    console.error('[StorageImages] Error getting download URL:', error, 'Path:', storagePath)
    
    // Fallback: construir URL manualmente
    const bucket = 'ubatech-a8650.appspot.com'
    const encodedPath = encodeURIComponent(storagePath)
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`
  }
}

/**
 * Obtiene el contenido de una imagen desde Storage como data URL para edición
 * @param storagePath Ruta en Storage
 * @returns Data URL de la imagen o URL descargable
 */
export async function getStorageImageAsDataUrl(storagePath: string): Promise<string> {
  // Si ya es una data URL, retornarla
  if (storagePath.startsWith('data:')) {
    return storagePath
  }
  
  // Si es una URL completa, retornarla (Firebase la puede mostrar)
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath
  }
  
  // Intentar obtener como data URL desde Storage
  try {
    const storage = getStorage()
    const imageRef = ref(storage, storagePath)
    const bytes = await getBytes(imageRef, 10 * 1024 * 1024) // 10MB max
    
    // Convertir Uint8Array a base64
    const byteArray = new Uint8Array(bytes)
    const binaryString = String.fromCharCode(...byteArray)
    const base64 = btoa(binaryString)
    
    // Retornar como data URL
    return `data:image/jpeg;base64,${base64}`
  } catch (error) {
    console.error('[StorageImages] Error getting image as data URL:', error)
    // En caso de error, retornar la URL descargable
    return getStorageImageUrl(storagePath)
  }
}

/**
 * Convierte un array de rutas de Storage a URLs descargables
 * @param storagePaths Array de rutas en Storage
 * @returns Promise que retorna array de URLs descargables
 */
export async function getStorageImageUrls(storagePaths: string[] | undefined): Promise<string[]> {
  if (!storagePaths || !Array.isArray(storagePaths)) {
    return []
  }
  
  // Procesar en paralelo
  return Promise.all(storagePaths.map(path => getStorageImageUrl(path)))
}
