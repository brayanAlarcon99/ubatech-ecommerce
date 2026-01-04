/**
 * Utilidades genéricas y reutilizables para Firestore
 * Consolida operaciones repetidas en toda la aplicación
 */

import {
  getDb,
} from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  DocumentSnapshot,
  QuerySnapshot,
  Firestore,
} from "firebase/firestore"

// ============================================================================
// TIPOS GENÉRICOS
// ============================================================================

export interface FirestoreDocument {
  id: string
  [key: string]: any
}

export interface FirestoreResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FirestoreCollectionResult<T> {
  success: boolean
  data: T[]
  count: number
  error?: string
}

// ============================================================================
// OPERACIONES DE LECTURA GENÉRICAS
// ============================================================================

/**
 * Obtiene un documento por ruta (colección + id)
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @returns Datos del documento o null si no existe
 */
export async function getDocByPath(
  collectionName: string,
  docId: string
): Promise<any> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      return docSnapshot.data()
    }
    return null
  } catch (error) {
    console.error(`[Firestore] Error getting ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Obtiene un documento con manejo de errores integrado
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @param defaultValue Valor por defecto si falla
 * @returns Resultado envuelto
 */
export async function safeGetDoc<T>(
  collectionName: string,
  docId: string,
  defaultValue?: T
): Promise<FirestoreResult<T>> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      return {
        success: true,
        data: docSnapshot.data() as T,
      }
    }

    return {
      success: false,
      data: defaultValue,
      error: `Document ${collectionName}/${docId} not found`,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      data: defaultValue,
      error: errorMsg,
    }
  }
}

/**
 * Obtiene todos los documentos de una colección
 * @param collectionName Nombre de la colección
 * @returns Array de documentos con IDs incluidos
 */
export async function getCollectionDocs(
  collectionName: string
): Promise<FirestoreDocument[]> {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, collectionName))
    return mapDocs(snapshot)
  } catch (error) {
    console.error(`[Firestore] Error getting collection ${collectionName}:`, error)
    throw error
  }
}

/**
 * Obtiene documentos con manejo de errores
 * @param collectionName Nombre de la colección
 * @returns Resultado envuelto
 */
export async function safeGetCollectionDocs<T>(
  collectionName: string
): Promise<FirestoreCollectionResult<T>> {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, collectionName))
    const data = mapDocs<T>(snapshot)

    return {
      success: true,
      data,
      count: data.length,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      data: [],
      count: 0,
      error: errorMsg,
    }
  }
}

/**
 * Obtiene documentos con filtro (query)
 * @param collectionName Nombre de la colección
 * @param field Campo a filtrar
 * @param operator Operador de comparación
 * @param value Valor a comparar
 * @returns Array de documentos
 */
export async function getDocumentsByQuery(
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Promise<FirestoreDocument[]> {
  try {
    const db = getDb()
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    )
    const snapshot = await getDocs(q)
    return mapDocs(snapshot)
  } catch (error) {
    console.error(
      `[Firestore] Error querying ${collectionName} where ${field} ${operator} ${value}:`,
      error
    )
    throw error
  }
}

// ============================================================================
// OPERACIONES DE ESCRITURA GENÉRICAS
// ============================================================================

/**
 * Crea o actualiza un documento
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @param data Datos a guardar
 * @param merge Si true, mezcla con datos existentes
 * @returns Resultado de la operación
 */
export async function setDocByPath<T>(
  collectionName: string,
  docId: string,
  data: T,
  merge: boolean = true
): Promise<FirestoreResult<void>> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)
    
    const dataToSet = merge
      ? {
          ...(typeof data === 'object' && data !== null ? data : {}),
          updatedAt: new Date().toISOString(),
        }
      : data
    
    await setDoc(
      docRef,
      dataToSet as any,
      { merge }
    )

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Actualiza campos específicos de un documento
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @param updates Campos a actualizar
 * @returns Resultado de la operación
 */
export async function updateDocByPath<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  updates: T
): Promise<FirestoreResult<void>> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Elimina un documento
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @returns Resultado de la operación
 */
export async function deleteDocByPath(
  collectionName: string,
  docId: string
): Promise<FirestoreResult<void>> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)

    await deleteDoc(docRef)

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

// ============================================================================
// UTILIDADES DE MAPEO
// ============================================================================

/**
 * Convierte QuerySnapshot a array de documentos con IDs
 * Remplaza el patrón repetido: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
 * @param snapshot QuerySnapshot o DocumentSnapshot[]
 * @returns Array de documentos
 */
export function mapDocs<T = any>(
  snapshot: QuerySnapshot | DocumentSnapshot[]
): (T & FirestoreDocument)[] {
  if (snapshot instanceof QuerySnapshot) {
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T & FirestoreDocument))
  }

  // Para arrays de DocumentSnapshot
  return (snapshot as DocumentSnapshot[]).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as T & FirestoreDocument))
}

/**
 * Convierte un DocumentSnapshot a objeto
 * @param doc DocumentSnapshot
 * @returns Objeto con ID incluido
 */
export function mapDoc<T = any>(doc: DocumentSnapshot): T & FirestoreDocument {
  return {
    id: doc.id,
    ...doc.data(),
  } as T & FirestoreDocument
}

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Verifica si un documento existe
 * @param collectionName Nombre de la colección
 * @param docId ID del documento
 * @returns true si existe
 */
export async function docExists(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const db = getDb()
    const docRef = doc(db, collectionName, docId)
    const docSnapshot = await getDoc(docRef)
    return docSnapshot.exists()
  } catch (error) {
    console.error(
      `[Firestore] Error checking if ${collectionName}/${docId} exists:`,
      error
    )
    return false
  }
}

/**
 * Obtiene el conteo de documentos en una colección
 * @param collectionName Nombre de la colección
 * @returns Número de documentos
 */
export async function getCollectionCount(
  collectionName: string
): Promise<number> {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, collectionName))
    return snapshot.size
  } catch (error) {
    console.error(
      `[Firestore] Error getting collection count for ${collectionName}:`,
      error
    )
    return 0
  }
}

// ============================================================================
// BATCH OPERATIONS (para operaciones múltiples)
// ============================================================================

/**
 * Guarda múltiples documentos en lote
 * @param operations Array de { collection, docId, data }
 * @returns Resultado de la operación
 */
export async function batchSet(
  operations: Array<{
    collection: string
    docId: string
    data: any
  }>
): Promise<FirestoreResult<void>> {
  try {
    const db = getDb()

    for (const op of operations) {
      const docRef = doc(db, op.collection, op.docId)
      await setDoc(docRef, op.data, { merge: true })
    }

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Obtiene múltiples documentos en lote
 * @param operations Array de { collection, docId }
 * @returns Array de documentos
 */
export async function batchGet(
  operations: Array<{
    collection: string
    docId: string
  }>
): Promise<FirestoreDocument[]> {
  try {
    const db = getDb()
    const results: FirestoreDocument[] = []

    for (const op of operations) {
      const docRef = doc(db, op.collection, op.docId)
      const docSnapshot = await getDoc(docRef)
      if (docSnapshot.exists()) {
        results.push(mapDoc(docSnapshot))
      }
    }

    return results
  } catch (error) {
    console.error("[Firestore] Error in batchGet:", error)
    throw error
  }
}
