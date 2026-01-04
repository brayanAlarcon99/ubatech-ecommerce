import { 
  getDocByPath, 
  safeGetDoc, 
  setDocByPath,
  docExists,
  batchSet 
} from "@/lib/firestore-utils"
import { STORES_CONFIG, COLLECTIONS } from "@/lib/config/constants"

export interface StoreDocument {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logo: string
  primaryColor: string
  secondaryColor: string
  description: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Inicializa la colección de tiendas en Firestore con los valores por defecto
 */
export async function initializeStoresCollection() {
  try {
    const operations = Object.entries(STORES_CONFIG).map(([storeId, storeData]) => ({
      collection: COLLECTIONS.STORES,
      docId: storeId,
      data: {
        ...storeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }))

    const result = await batchSet(operations)
    
    if (result.success) {
      console.log("✓ Tiendas inicializadas correctamente")
      return {
        success: true,
        message: "Colección de tiendas inicializada correctamente",
      }
    }
    
    return {
      success: false,
      error: result.error || "Error desconocido",
    }
  } catch (error) {
    console.error("Error initializing stores collection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Obtiene los datos de una tienda específica
 */
export async function getStoreData(storeId: string): Promise<StoreDocument | null> {
  try {
    const data = await getDocByPath(COLLECTIONS.STORES, storeId)
    return data as StoreDocument || STORES_CONFIG[storeId] || null
  } catch (error) {
    console.error("Error fetching store data:", error)
    return STORES_CONFIG[storeId] || null
  }
}

/**
 * Actualiza los datos de una tienda específica
 */
export async function updateStoreData(
  storeId: string,
  updates: Partial<StoreDocument>
): Promise<{ success: boolean; error?: string }> {
  const result = await setDocByPath(COLLECTIONS.STORES, storeId, updates)
  return result
}
