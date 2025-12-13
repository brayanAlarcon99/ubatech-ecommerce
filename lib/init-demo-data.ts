import { getDb } from "@/lib/firebase"
import { collection, addDoc, doc, setDoc, getDocs, query, where } from "firebase/firestore"

/**
 * Script para inicializar datos de demostración en Firestore
 * Crea: Categorías, Subcategorías y Productos
 */

export async function initializeDemoData() {
  try {
    const db = getDb()

    console.log("🔄 Inicializando datos de demostración...")

    // 1. Crear Categorías
    console.log("📁 Creando categorías...")
    const categoriesData = [
      { id: "celulares", name: "Celulares" },
      { id: "electronica", name: "Electrónica" },
      { id: "accesorios", name: "Accesorios" }
    ]

    const categoriesMap = new Map<string, string>()

    for (const catData of categoriesData) {
      const categoryRef = doc(collection(db, "categories"), catData.id)
      await setDoc(categoryRef, {
        name: catData.name,
        createdAt: new Date()
      })
      categoriesMap.set(catData.id, catData.name)
      console.log(`✅ Categoría creada: ${catData.name}`)
    }

    // 2. Crear Subcategorías
    console.log("📂 Creando subcategorías...")
    const subcategoriesData = [
      { name: "Samsung", categoryId: "celulares" },
      { name: "Redmi", categoryId: "celulares" },
      { name: "iPhone", categoryId: "celulares" },
      { name: "Laptops", categoryId: "electrónica" },
      { name: "Tablets", categoryId: "electrónica" },
      { name: "Fundas", categoryId: "accesorios" },
      { name: "Protectores", categoryId: "accesorios" }
    ]

    for (const subData of subcategoriesData) {
      const subcategoryRef = doc(collection(db, "subcategories"), subData.name.toLowerCase().replace(" ", "_"))
      await setDoc(subcategoryRef, {
        name: subData.name,
        categoryId: subData.categoryId,
        createdAt: new Date()
      })
      console.log(`✅ Subcategoría creada: ${subData.name}`)
    }

    // 3. Crear Productos
    console.log("📦 Creando productos...")
    const productsData = [
      {
        name: "NOTE14PRO+",
        description: "Celular de última generación Redmi",
        price: 1560000,
        stock: 1,
        category: "Celulares",
        subcategory: "redmi",
        image: "https://via.placeholder.com/300x300?text=NOTE14PRO"
      },
      {
        name: "Galaxy A13",
        description: "Celular Samsung económico",
        price: 299999,
        stock: 50,
        category: "Celulares",
        subcategory: "samsung",
        image: "https://via.placeholder.com/300x300?text=GalaxyA13"
      },
      {
        name: "Galaxy S23",
        description: "Celular Samsung premium",
        price: 1099999,
        stock: 12,
        category: "Celulares",
        subcategory: "samsung",
        image: "https://via.placeholder.com/300x300?text=GalaxyS23"
      },
      {
        name: "iPhone 15",
        description: "iPhone última generación",
        price: 1499999,
        stock: 8,
        category: "Celulares",
        subcategory: "iphone",
        image: "https://via.placeholder.com/300x300?text=iPhone15"
      },
      {
        name: "Note 13",
        description: "Celular Redmi gama media",
        price: 899999,
        stock: 25,
        category: "Celulares",
        subcategory: "redmi",
        image: "https://via.placeholder.com/300x300?text=Note13"
      },
      {
        name: "Laptop Dell",
        description: "Laptop Dell última generación",
        price: 2499999,
        stock: 5,
        category: "Electrónica",
        subcategory: "laptops",
        image: "https://via.placeholder.com/300x300?text=DellLaptop"
      },
      {
        name: "Funda Celular",
        description: "Funda protectora para celular",
        price: 49999,
        stock: 100,
        category: "Accesorios",
        subcategory: "fundas",
        image: "https://via.placeholder.com/300x300?text=Funda"
      }
    ]

    for (const prodData of productsData) {
      const productRef = doc(collection(db, "products"), prodData.name.toLowerCase().replace(/\\s+/g, "_"))
      await setDoc(productRef, {
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        stock: prodData.stock,
        category: prodData.category,
        subcategory: prodData.subcategory,
        image: prodData.image,
        createdAt: new Date()
      })
      console.log(`✅ Producto creado: ${prodData.name}`)
    }

    console.log("✅ ¡Datos inicializados correctamente!")
    return true
  } catch (error) {
    console.error("❌ Error inicializando datos:", error)
    return false
  }
}
