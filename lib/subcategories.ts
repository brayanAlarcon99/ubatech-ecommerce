import { getDb } from "@/lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Firestore,
} from "firebase/firestore"
import type { Subcategory } from "@/types"

/**
 * Obtiene todas las subcategorías de una categoría específica
 */
export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  try {
    // Validar que categoryId no esté vacío
    if (!categoryId || !categoryId.trim?.()) {
      console.warn("[v0] getSubcategoriesByCategory called with empty/undefined categoryId")
      return []
    }

    const db = getDb()
    const q = query(
      collection(db, "subcategories"),
      where("categoryId", "==", categoryId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subcategory[]
  } catch (error) {
    console.error("[v0] Error loading subcategories:", error)
    return []
  }
}

/**
 * Obtiene todas las subcategorías
 */
export async function getAllSubcategories(): Promise<Subcategory[]> {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, "subcategories"))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subcategory[]
  } catch (error) {
    console.error("[v0] Error loading all subcategories:", error)
    return []
  }
}

/**
 * Agrega una nueva subcategoría a una categoría
 */
export async function addSubcategory(
  categoryId: string,
  subcategoryName: string
): Promise<string | null> {
  try {
    const db = getDb()
    const docRef = await addDoc(collection(db, "subcategories"), {
      name: subcategoryName,
      categoryId: categoryId,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("[v0] Error adding subcategory:", error)
    return null
  }
}

/**
 * Actualiza el nombre de una subcategoría
 */
export async function updateSubcategory(
  subcategoryId: string,
  newName: string
): Promise<boolean> {
  try {
    const db = getDb()
    await updateDoc(doc(db, "subcategories", subcategoryId), {
      name: newName,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error updating subcategory:", error)
    return false
  }
}

/**
 * Elimina una subcategoría
 */
export async function deleteSubcategory(subcategoryId: string): Promise<boolean> {
  try {
    const db = getDb()
    
    // Primero verificar si hay productos con esta subcategoría
    const productsQuery = query(
      collection(db, "products"),
      where("subcategory", "==", subcategoryId)
    )
    const productsSnapshot = await getDocs(productsQuery)
    
    if (productsSnapshot.size > 0) {
      throw new Error(`No se puede eliminar: contiene ${productsSnapshot.size} producto(s)`)
    }
    
    await deleteDoc(doc(db, "subcategories", subcategoryId))
    return true
  } catch (error) {
    console.error("[v0] Error deleting subcategory:", error)
    throw error
  }
}

/**
 * Obtiene el nombre de una subcategoría por ID (usando búsqueda en memoria)
 * Nota: Esta función requiere que las subcategorías ya estén cargadas en la aplicación
 */
export async function getSubcategoryName(subcategoryId: string): Promise<string | null> {
  try {
    if (!subcategoryId) return null
    
    // Obtener todas las subcategorías
    const allSubs = await getAllSubcategories()
    const sub = allSubs.find((s) => s.id === subcategoryId)
    
    return sub ? sub.name : null
  } catch (error) {
    console.error("[v0] Error getting subcategory name:", error)
    return null
  }
}

/**
 * Cuenta el número de productos con una subcategoría específica
 */
export async function countProductsBySubcategory(subcategoryId: string): Promise<number> {
  try {
    const db = getDb()
    const q = query(
      collection(db, "products"),
      where("subcategory", "==", subcategoryId)
    )
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error("[v0] Error counting products:", error)
    return 0
  }
}

/**
 * NORMA: Valida la estructura jerárquica de un producto
 * 
 * Regla: Si un producto tiene una subcategoría, DEBE:
 * 1. La subcategoría debe existir en la colección subcategories
 * 2. La subcategoría debe pertenecer a la categoría especificada en el producto
 * 3. La categoría debe existir en la colección categories
 * 
 * @param productData - Datos del producto a validar
 * @returns { valid: boolean, error?: string }
 */
export async function validateProductHierarchy(productData: {
  category?: string
  subcategory?: string
}): Promise<{ valid: boolean; error?: string }> {
  try {
    const { category, subcategory } = productData

    // Si no hay subcategoría, es válido
    if (!subcategory) {
      return { valid: true }
    }

    // Si hay subcategoría pero no hay categoría, es inválido
    if (!category) {
      return { valid: false, error: "Se debe especificar una categoría si se selecciona una subcategoría" }
    }

    const db = getDb()

    // Verificar que la subcategoría existe
    const subcategoryRef = doc(db, "subcategories", subcategory)
    const subcategorySnap = await getDocs(query(collection(db, "subcategories"), where("__name__", "==", subcategory)))

    if (subcategorySnap.empty) {
      return { valid: false, error: `La subcategoría no existe: ${subcategory}` }
    }

    const subcategoryData = subcategorySnap.docs[0].data()

    // Verificar que la subcategoría pertenece a la categoría especificada
    // Obtener el ID de la categoría
    const categorySnap = await getDocs(query(collection(db, "categories"), where("name", "==", category)))

    if (categorySnap.empty) {
      return { valid: false, error: `La categoría no existe: ${category}` }
    }

    const categoryId = categorySnap.docs[0].id

    // Validar que el categoryId de la subcategoría coincide con la categoría del producto
    if (subcategoryData.categoryId !== categoryId) {
      return {
        valid: false,
        error: `La subcategoría "${subcategoryData.name}" no pertenece a la categoría "${category}"`,
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("[v0] Error validating product hierarchy:", error)
    return { valid: false, error: "Error al validar la estructura jerárquica" }
  }
}

/**
 * NORMA: Obtiene todas las subcategorías de una categoría con su información completa
 * Incluye el nombre de la categoría para verificación
 * 
 * @param categoryId - ID de la categoría
 * @returns Array de subcategorías con información de categoría
 */
export async function getSubcategoriesWithCategoryInfo(
  categoryId: string
): Promise<
  Array<{
    id: string
    name: string
    categoryId: string
    categoryName?: string
  }>
> {
  try {
    if (!categoryId || !categoryId.trim?.()) {
      return []
    }

    const db = getDb()

    // Obtener la categoría para verificar que existe
    const categoryDoc = await getDocs(query(collection(db, "categories"), where("__name__", "==", categoryId)))

    if (categoryDoc.empty) {
      console.warn("[v0] Category does not exist:", categoryId)
      return []
    }

    const categoryName = categoryDoc.docs[0].data().name

    // Obtener subcategorías
    const q = query(collection(db, "subcategories"), where("categoryId", "==", categoryId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      categoryId: doc.data().categoryId,
      categoryName: categoryName,
    }))
  } catch (error) {
    console.error("[v0] Error loading subcategories with category info:", error)
    return []
  }
}
