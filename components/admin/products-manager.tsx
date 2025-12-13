"use client"

import { useState, useEffect } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import type { Product, Subcategory } from "@/types"
import ProductForm from "./product-form"
import { getSubcategoriesByCategory } from "@/lib/subcategories"
import { normalizeProducts } from "@/lib/normalize-products"
import { formatPriceWithCurrency, normalizeProductPrice } from "@/lib/format-price"
import { generateOutOfStockPDF } from "@/lib/pdf-generator"
import { Download } from "lucide-react"

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesMap, setCategoriesMap] = useState<Map<string, string>>(new Map())
  const [subcategoriesMap, setSubcategoriesMap] = useState<Map<string, Subcategory[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  async function handleDownloadOutOfStockPDF() {
    try {
      setDownloadingPDF(true)
      const outOfStockProducts = products.filter((p) => p.stock === 0)
      
      if (outOfStockProducts.length === 0) {
        alert("No hay productos fuera de stock para descargar")
        return
      }

      await generateOutOfStockPDF(outOfStockProducts, categoriesMap, {
        fileName: `Productos_Fuera_de_Stock_${new Date().getTime()}.pdf`,
        title: "Reporte de Productos Fuera de Stock",
      })
    } catch (error) {
      console.error("[ProductsManager] Error downloading PDF:", error)
      alert("Error al descargar el PDF")
    } finally {
      setDownloadingPDF(false)
    }
  }

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const db = getDb()
      const [productsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
      ])

      const prods = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      // Normalizar precios para asegurar que sean números, no strings
      const prodsWithNormalizedPrices = prods.map(normalizeProductPrice)

      // Crear array de categorías con ID y nombre
      const cats = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }))
      setCategories(cats)

      // Crear mapa de ID -> nombre de categoría
      const catMap = new Map<string, string>()
      for (const catDoc of categoriesSnapshot.docs) {
        catMap.set(catDoc.id, catDoc.data().name)
      }
      setCategoriesMap(catMap)

      // Normalizar productos para asegurar que tengan IDs de categoría válidos
      const normalizedProds = normalizeProducts(prodsWithNormalizedPrices, catMap)
      setProducts(normalizedProds)

      // Cargar subcategorías para cada categoría
      const subMap = new Map<string, Subcategory[]>()
      for (const catDoc of categoriesSnapshot.docs) {
        const subs = await getSubcategoriesByCategory(catDoc.id)
        subMap.set(catDoc.id, subs)
      }
      setSubcategoriesMap(subMap)
    } catch (error) {
      console.error("[ProductsManager] Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al cargar productos"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProduct(productData: Omit<Product, "id">) {
    try {
      const db = getDb()
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData)
      } else {
        await addDoc(collection(db, "products"), productData)
      }
      setShowForm(false)
      setEditingProduct(null)
      await loadData()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error("[ProductsManager] Error saving product:", error)
      
      // Propagar el error al formulario
      throw error
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) return

    try {
      const db = getDb()
      await deleteDoc(doc(db, "products", id))
      await loadData()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
    }
  }

  const getSubcategoryName = (subcategoryId: string | undefined): string => {
    if (!subcategoryId) return "-"
    for (const subcategories of subcategoriesMap.values()) {
      const sub = subcategories.find((s) => s.id === subcategoryId)
      if (sub) return sub.name
    }
    return "-"
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error al cargar productos:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Encabezado y buscador sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#f8fafc] to-[#f8fafc] pb-3 -mx-8 px-8 pt-0 -mt-30" style={{ top: "-32px" }}>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
            Gestión de Productos
          </h1>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="🔎 Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-500"
            />
            <div className="flex gap-2">
              {selectedCategory === "out-of-stock" && (
                <button
                  onClick={handleDownloadOutOfStockPDF}
                  disabled={downloadingPDF || products.filter((p) => p.stock === 0).length === 0}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: "var(--accent-turquoise)" }}
                  title="Descargar PDF de productos fuera de stock"
                >
                  <Download size={18} />
                  {downloadingPDF ? "Descargando..." : "Descargar PDF"}
                </button>
              )}
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingProduct(null)
                }}
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                Agregar Producto
              </button>
            </div>
          </div>
        </div>

        {/* Filtro de categorías sticky */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === "all" ? "text-white shadow-lg" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            style={selectedCategory === "all" ? { backgroundColor: "var(--primary-dark)" } : {}}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCategory("out-of-stock")}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === "out-of-stock" ? "text-white shadow-lg" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            style={selectedCategory === "out-of-stock" ? { backgroundColor: "var(--primary-dark)" } : {}}
          >
            Fuera de Stock
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id ? "text-white shadow-lg" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: "var(--primary-dark)" } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {(() => {
          // Filtrar productos según categoría seleccionada
          let filteredProducts = products.filter((product) => {
            // Filtrar por categoría
            const categoryMatch = (() => {
              if (selectedCategory === "all") return true
              if (selectedCategory === "out-of-stock") return product.stock === 0
              return product.category === selectedCategory
            })()

            // Filtrar por búsqueda
            const searchMatch = searchTerm === "" || 
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              categoriesMap.get(product.category)?.toLowerCase().includes(searchTerm.toLowerCase())

            return categoryMatch && searchMatch
          })

          // Si está en "Todos", agrupar por categoría
          if (selectedCategory === "all") {
            const groupedByCategory = new Map<string, Product[]>()
            
            filteredProducts.forEach((product) => {
              const categoryName = categoriesMap.get(product.category) || "Sin categoría"
              if (!groupedByCategory.has(categoryName)) {
                groupedByCategory.set(categoryName, [])
              }
              groupedByCategory.get(categoryName)!.push(product)
            })

            // Convertir a array ordenado alfabéticamente y ordenar productos por precio
            const categorySections = Array.from(groupedByCategory.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([categoryName, prods]) => [
                categoryName,
                [...prods].sort((a, b) => (a.price || 0) - (b.price || 0))
              ]) as [string, Product[]][]

            return (
              <div className="col-span-full space-y-8">
                {categorySections.map(([categoryName, categoryProducts], index) => (
                  <div key={categoryName}>
                    {/* Encabezado de categoría */}
                    <h3 
                      className="text-lg font-bold mb-4 pb-2" 
                      style={{ color: "var(--primary-dark)" }}
                    >
                      {categoryName}
                    </h3>

                    {/* Grid de productos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                      {categoryProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                          {product.image && (
                            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-20 object-contain p-1 bg-gradient-to-br from-gray-100 to-gray-50" />
                          )}
                          <div className="p-2 space-y-1 flex-1 flex flex-col">
                            <h3 className="font-bold text-xs" style={{ color: "var(--primary-dark)" }}>
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{product.description || "-"}</p>
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <div>
                                <p className="text-xs text-gray-500">Precio</p>
                                <p className="text-sm font-bold" style={{ color: "var(--accent-turquoise)" }}>
                                  {formatPriceWithCurrency(product.price)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className="text-sm font-bold">{product.stock}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p style={{ color: "var(--primary-dark)" }}>
                                Categoría: {categoriesMap.get(product.category) || product.category}
                              </p>
                              {product.subcategory && (
                                <p style={{ color: "var(--primary-dark)" }}>
                                  Marca: {getSubcategoryName(product.subcategory)}
                                </p>
                              )}
                              {product.sku && (
                                <p style={{ color: "var(--primary-dark)" }}>
                                  SKU: {product.sku}
                                </p>
                              )}
                              {product.details && (
                                <p style={{ color: "var(--primary-dark)" }} className="line-clamp-2">
                                  Detalles: {product.details}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 pt-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product)
                                  setShowForm(true)
                                }}
                                className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
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
          } else {
            // Para "Fuera de Stock" y categoría específica
            // Si es "Fuera de Stock", agrupar por categoría
            if (selectedCategory === "out-of-stock") {
              const groupedByCategory = new Map<string, Product[]>()
              
              filteredProducts.forEach((product) => {
                const categoryName = categoriesMap.get(product.category) || "Sin categoría"
                if (!groupedByCategory.has(categoryName)) {
                  groupedByCategory.set(categoryName, [])
                }
                groupedByCategory.get(categoryName)!.push(product)
              })

              // Convertir a array ordenado alfabéticamente y ordenar productos por precio
              const categorySections = Array.from(groupedByCategory.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([categoryName, prods]) => [
                  categoryName,
                  [...prods].sort((a, b) => (a.price || 0) - (b.price || 0))
                ]) as [string, Product[]][]

              return (
                <div className="col-span-full space-y-8">
                  {categorySections.map(([categoryName, categoryProducts], index) => (
                    <div key={categoryName}>
                      {/* Encabezado de categoría */}
                      <h3 
                        className="text-lg font-bold mb-4 pb-2" 
                        style={{ color: "var(--primary-dark)" }}
                      >
                        {categoryName}
                      </h3>

                      {/* Grid de productos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {categoryProducts.map((product) => (
                          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                            {product.image && (
                              <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-20 object-contain p-1 bg-gradient-to-br from-gray-100 to-gray-50" />
                            )}
                            <div className="p-2 space-y-1 flex-1 flex flex-col">
                              <h3 className="font-bold text-xs" style={{ color: "var(--primary-dark)" }}>
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1">{product.description || "-"}</p>
                              <div className="flex items-center justify-between mt-auto pt-2">
                                <div>
                                  <p className="text-xs text-gray-500">Precio</p>
                                  <p className="text-sm font-bold" style={{ color: "var(--accent-turquoise)" }}>
                                    {formatPriceWithCurrency(product.price)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Stock</p>
                                  <p className="text-sm font-bold">{product.stock}</p>
                                </div>
                              </div>
                              <div className="space-y-1 text-xs">
                                <p style={{ color: "var(--primary-dark)" }}>
                                  Categoría: {categoriesMap.get(product.category) || product.category}
                                </p>
                                {product.subcategory && (
                                  <p style={{ color: "var(--primary-dark)" }}>
                                    Marca: {getSubcategoryName(product.subcategory)}
                                  </p>
                                )}
                                {product.sku && (
                                  <p style={{ color: "var(--primary-dark)" }}>
                                    SKU: {product.sku}
                                  </p>
                                )}
                                {product.details && (
                                  <p style={{ color: "var(--primary-dark)" }} className="line-clamp-2">
                                    Detalles: {product.details}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 pt-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product)
                                    setShowForm(true)
                                  }}
                                  className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
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
            } else {
              // Para categoría específica, solo ordenar por precio
              const sortedProducts = [...filteredProducts].sort((a, b) => (a.price || 0) - (b.price || 0))
              
              return sortedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                  {product.image && (
                    <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-20 object-contain p-1 bg-gradient-to-br from-gray-100 to-gray-50" />
                  )}
                  <div className="p-2 space-y-1 flex-1 flex flex-col">
                    <h3 className="font-bold text-xs" style={{ color: "var(--primary-dark)" }}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-1">{product.description || "-"}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div>
                        <p className="text-xs text-gray-500">Precio</p>
                        <p className="text-sm font-bold" style={{ color: "var(--accent-turquoise)" }}>
                          {formatPriceWithCurrency(product.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className="text-sm font-bold">{product.stock}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p style={{ color: "var(--primary-dark)" }}>
                        Categoría: {categoriesMap.get(product.category) || product.category}
                      </p>
                      {product.subcategory && (
                        <p style={{ color: "var(--primary-dark)" }}>
                          Marca: {getSubcategoryName(product.subcategory)}
                        </p>
                      )}
                      {product.sku && (
                        <p style={{ color: "var(--primary-dark)" }}>
                          SKU: {product.sku}
                        </p>
                      )}
                      {product.details && (
                        <p style={{ color: "var(--primary-dark)" }} className="line-clamp-2">
                          Detalles: {product.details}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 pt-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setShowForm(true)
                        }}
                        className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          }
        })()}
      </div>

      {products.filter((product) => {
        if (selectedCategory === "all") return true
        if (selectedCategory === "out-of-stock") return product.stock === 0
        return product.category === selectedCategory
      }).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {products.length === 0 ? "No hay productos aún" : "No hay productos en esta categoría"}
        </div>
      )}
    </div>
  )
}
