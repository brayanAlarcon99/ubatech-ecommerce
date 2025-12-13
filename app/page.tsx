"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ProductCard from "@/components/product-card"
import Hero from "@/components/hero"
import Footer from "@/components/footer"
import type { Product, Subcategory } from "@/types"
import { getDb } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { getSubcategoriesByCategory } from "@/lib/subcategories"
import { normalizeProducts } from "@/lib/normalize-products"
import { getPublicSiteStatus } from "@/lib/public-site-status"
import { normalizeProductPrice } from "@/lib/format-price"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [subcategory, setSubcategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showHero, setShowHero] = useState(true)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subcategoriesMap, setSubcategoriesMap] = useState<Map<string, Subcategory[]>>(new Map())
  const [categoriesMap, setCategoriesMap] = useState<Map<string, string>>(new Map()) // categoryId -> categoryName
  const [checkingStatus, setCheckingStatus] = useState(true)
  const router = useRouter()

  // Verificar estado de la página pública primero
  useEffect(() => {
    checkPublicStatus()
  }, [router])

  async function checkPublicStatus() {
    try {
      const status = await getPublicSiteStatus()
      
      if (!status.isPublic) {
        // Redirigir a página de mantenimiento
        router.push("/maintenance")
        return
      }
      
      setCheckingStatus(false)
      loadProducts()
    } catch (error) {
      console.error("Error checking public status:", error)
      // En caso de error, permitir que continúe normalmente
      setCheckingStatus(false)
      loadProducts()
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      // Ocultar hero cuando se scroll más de 10px
      setShowHero(window.scrollY < 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (category === "all") {
      setSubcategories([])
      setSubcategory("all")
    } else {
      loadSubcategoriesForCategory(category)
    }
  }, [category, subcategoriesMap])

  async function loadProducts() {
    try {
      setLoading(true)
      setError(null)
      const db = getDb()
      
      // Cargar productos
      const productsSnapshot = await getDocs(collection(db, "products"))
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      // Normalizar precios para asegurar que sean números, no strings
      const productsWithNormalizedPrices = productsData.map(normalizeProductPrice)

      // Cargar todas las categorías y sus subcategorías
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const subMap = new Map<string, Subcategory[]>()
      const catMap = new Map<string, string>()
      
      for (const catDoc of categoriesSnapshot.docs) {
        const categoryId = catDoc.id
        const categoryName = catDoc.data().name
        catMap.set(categoryId, categoryName)
        const subs = await getSubcategoriesByCategory(categoryId)
        subMap.set(categoryId, subs)
      }
      
      // Normalizar productos para asegurar que tengan IDs de categoría válidos
      const normalizedProducts = normalizeProducts(productsWithNormalizedPrices, catMap)
      
      setProducts(normalizedProducts)
      setSubcategoriesMap(subMap)
      setCategoriesMap(catMap)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      setError("Error al cargar productos. Por favor, verifica tu conexión a Firebase.")
    } finally {
      setLoading(false)
    }
  }

  async function loadSubcategoriesForCategory(categoryId: string) {
    try {
      const subs = subcategoriesMap.get(categoryId) || []
      setSubcategories(subs)
      setSubcategory("all")
    } catch (error) {
      console.error("[v0] Error loading subcategories:", error)
      setSubcategories([])
    }
  }

  // Filtrar productos por categoría, subcategoría y búsqueda
  let filteredProducts = products
  
  if (category !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === category)
  }

  if (subcategory !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.subcategory === subcategory)
  }

  // Filtrar por búsqueda
  if (searchTerm !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoriesMap.get(p.category)?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Crear lista de categorías con sus IDs que tengan productos
  const categories = Array.from(categoriesMap.entries())
    .map(([id, name]) => ({ id, name }))
    .filter(cat => {
      // Verificar si hay algún producto con esta categoría (por ID)
      return products.some(p => p.category === cat.id)
    })

  const getSubcategoryName = (subcategoryId: string | undefined): string => {
    if (!subcategoryId) return "-"
    for (const subcats of subcategoriesMap.values()) {
      const sub = subcats.find((s) => s.id === subcategoryId)
      if (sub) return sub.name
    }
    return "-"
  }

  return (
    <>
      {/* Si está verificando el estado, mostrar loader */}
      {checkingStatus ? (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando tienda...</p>
          </div>
        </div>
      ) : (
        <>
          <Header />
          
          {/* Hero que se oculta al hacer scroll */}
          {showHero && <Hero />}

          {/* Categorías siempre visible (sticky) */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                  Nuestros Productos
                </h2>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-500"
                />
              </div>

              {/* Filtro de categorías */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600 mb-2">Categorías</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setCategory("all")}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                      category === "all" ? "text-white shadow-lg" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    style={category === "all" ? { backgroundColor: "var(--primary)" } : {}}
                  >
                    Todas
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                        category === cat.id ? "text-white shadow-lg" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      style={category === cat.id ? { backgroundColor: "var(--primary)" } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-0">
            {/* Sidebar izquierdo con marcas/subcategorías */}
            {subcategories.length > 0 && (
          <aside className="lg:w-56 bg-gradient-to-b from-gray-50 to-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sticky top-[104px] z-30 max-h-[calc(100vh-104px)] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "var(--primary-dark)" }}>
                Filtrar por marca
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSubcategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    subcategory === "all" 
                      ? "text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  style={subcategory === "all" ? { backgroundColor: "var(--accent-turquoise)" } : {}}
                >
                  Ver todas
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubcategory(sub.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      subcategory === sub.id 
                        ? "text-white shadow-md" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    style={subcategory === sub.id ? { backgroundColor: "var(--accent-turquoise)" } : {}}
                  >
                    {sub.name}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Contenido principal */}
        <main className={`flex-1 px-4 py-12 ${subcategories.length > 0 ? '' : 'lg:max-w-7xl lg:mx-auto'}`}>
          {error && <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"
                style={{ borderTopColor: "var(--primary)" }}
              />
            </div>
          ) : filteredProducts.length > 0 ? (
            (() => {
              // Agrupar productos por categoría
              const groupedByCategory = new Map<string, Product[]>()
              
              filteredProducts.forEach((product) => {
                const categoryName = categoriesMap.get(product.category) || "Sin categoría"
                if (!groupedByCategory.has(categoryName)) {
                  groupedByCategory.set(categoryName, [])
                }
                groupedByCategory.get(categoryName)!.push(product)
              })

              // Convertir a array ordenado y ordenar productos por precio dentro de cada categoría
              const categorySections = Array.from(groupedByCategory.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([categoryName, products]) => [
                  categoryName,
                  [...products].sort((a, b) => (a.price || 0) - (b.price || 0))
                ]) as [string, Product[]][]

              return (
                <div className="space-y-8">
                  {categorySections.map(([categoryName, categoryProducts], index) => (
                    <div key={categoryName}>
                      {/* Encabezado de categoría */}
                      <h3 
                        className="text-xl font-bold mb-4 pb-2" 
                        style={{ color: "var(--primary)" }}
                      >
                        {categoryName}
                      </h3>

                      {/* Grid de productos */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {categoryProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Separador de categoría (no mostrar en la última) */}
                      {index < categorySections.length - 1 && (
                        <div className="my-8 border-t-2" style={{ borderColor: "#d4d4d4" }} />
                      )}
                    </div>
                  ))}
                </div>
              )
            })()
          ) : (
            <p className="col-span-full text-center text-gray-500 py-12">No hay productos en esta categoría</p>
          )}
        </main>
      </div>

      <Footer />
        </>
      )}
    </>
  )
}
