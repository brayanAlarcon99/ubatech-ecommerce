import { getDb } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

const STATUS_DOC_ID = "public_site_status"
const SETTINGS_COLLECTION = "settings"

export interface PublicSiteStatus {
  isPublic: boolean
  lastUpdatedAt: number
  lastUpdatedBy: string
}

/**
 * Obtiene el estado actual de la página pública
 */
export async function getPublicSiteStatus(): Promise<PublicSiteStatus> {
  try {
    const db = getDb()
    const docRef = doc(db, SETTINGS_COLLECTION, STATUS_DOC_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as PublicSiteStatus
    }

    // Si no existe, crear con valor por defecto (pública habilitada)
    const defaultStatus: PublicSiteStatus = {
      isPublic: true,
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: "system",
    }
    await setDoc(docRef, defaultStatus)
    return defaultStatus
  } catch (error) {
    console.error("Error getting public site status:", error)
    // Por defecto, permitir que la página sea pública en caso de error
    return {
      isPublic: true,
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: "system",
    }
  }
}

export async function setPublicSiteStatus(
  isPublic: boolean,
  userId: string
): Promise<void> {
  try {
    const db = getDb()
    const docRef = doc(db, SETTINGS_COLLECTION, STATUS_DOC_ID)

    const statusData = {
      isPublic,
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: userId,
    }

    // Intentar actualizar primero
    try {
      await updateDoc(docRef, statusData)
    } catch (error: any) {
      // Si el documento no existe, crearlo
      if (error.code === "not-found") {
        await setDoc(docRef, statusData)
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error("Error setting public site status:", error)
    throw error
  }
}
