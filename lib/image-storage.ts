/**
 * Firebase Storage Image Upload Handler
 * Manages image uploads to Firebase Storage instead of storing Base64 in Firestore
 */

import { getApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

let storageInstance: any = null

/**
 * Get Firebase Storage instance
 */
export function getStorageInstance() {
  if (!storageInstance) {
    try {
      const app = getApp()
      storageInstance = getStorage(app)
    } catch (error) {
      console.error("Error getting Firebase Storage instance:", error)
      throw error
    }
  }
  return storageInstance
}

/**
 * Upload a single image to Firebase Storage
 * @param file - The image file to upload
 * @param productId - The product ID (used for folder structure)
 * @param index - The index of the image (for multiple images)
 * @returns The public download URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  index: number = 0
): Promise<string> {
  try {
    const storage = getStorageInstance()
    
    // Create storage path: products/{productId}/image-{index}.{ext}
    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `image-${index}.${ext}`
    const storagePath = `products/${productId}/${fileName}`
    
    // Create storage reference
    const storageRef = ref(storage, storagePath)
    
    // Upload file with metadata
    const metadata = {
      contentType: file.type || "image/jpeg",
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    }
    
    await uploadBytes(storageRef, file, metadata)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error("Error uploading image to Storage:", error)
    throw error
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of image files
 * @param productId - The product ID
 * @returns Array of public download URLs
 */
export async function uploadProductImages(
  files: File[],
  productId: string
): Promise<string[]> {
  try {
    const urls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadProductImage(files[i], productId, i)
      urls.push(url)
    }
    
    return urls
  } catch (error) {
    console.error("Error uploading multiple images:", error)
    throw error
  }
}

/**
 * Convert a data URL (Base64) to File object
 * @param dataUrl - The data URL string (e.g., data:image/jpeg;base64,...)
 * @param filename - The filename for the file object
 * @returns File object
 */
export function dataUrlToFile(dataUrl: string, filename: string = "image.jpg"): File {
  try {
    // Extract the base64 content and MIME type
    const arr = dataUrl.split(",")
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg"
    
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)
    
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }
    
    return new File([u8arr], filename, { type: mimeType })
  } catch (error) {
    console.error("Error converting data URL to File:", error)
    throw error
  }
}

/**
 * Upload Base64 image data to Firebase Storage
 * This converts the Base64 to a File first, then uploads
 * @param base64Data - The Base64 encoded image data (data URL)
 * @param productId - The product ID
 * @param index - The image index
 * @returns The public download URL
 */
export async function uploadBase64ImageToStorage(
  base64Data: string,
  productId: string,
  index: number = 0
): Promise<string> {
  try {
    const file = dataUrlToFile(base64Data, `image-${index}.jpg`)
    return await uploadProductImage(file, productId, index)
  } catch (error) {
    console.error("Error uploading Base64 image:", error)
    throw error
  }
}

/**
 * Check if an image is already a Storage URL (not Base64)
 * @param image - The image data (could be Base64 data URL or Storage URL)
 * @returns true if it's a Storage URL, false if it's Base64
 */
export function isStorageUrl(image: string): boolean {
  return image.startsWith("https://firebasestorage.googleapis.com/")
}

/**
 * Filter out Base64 images and keep only Storage URLs
 * @param images - Array of images (mix of Base64 and Storage URLs)
 * @returns Array of only Storage URLs
 */
export function filterStorageUrls(images: string[]): string[] {
  return images.filter((img) => isStorageUrl(img))
}

/**
 * Separate Base64 images from Storage URLs
 * @param images - Array of images
 * @returns Object with base64 and storageUrls arrays
 */
export function separateImageTypes(images: string[]): {
  base64: string[]
  storageUrls: string[]
} {
  return {
    base64: images.filter((img) => !isStorageUrl(img)),
    storageUrls: images.filter((img) => isStorageUrl(img)),
  }
}
