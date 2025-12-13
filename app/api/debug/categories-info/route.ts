import { getDb } from "@/lib/firebase"
import { getDocs, collection } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = getDb()

    // Obtener todas las categorías
    const categoriesSnapshot = await getDocs(collection(db, "categories"))
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    // Obtener todas las subcategorías
    const subcategoriesSnapshot = await getDocs(collection(db, "subcategories"))
    const subcategories = subcategoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    // Obtener todos los productos
    const productsSnapshot = await getDocs(collection(db, "products"))
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      category: doc.data().category,
      subcategory: doc.data().subcategory,
    }))

    return NextResponse.json({
      categories: {
        total: categories.length,
        list: categories,
      },
      subcategories: {
        total: subcategories.length,
        list: subcategories,
      },
      products: {
        total: products.length,
        list: products.slice(0, 10), // Solo primeros 10
      },
    })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
