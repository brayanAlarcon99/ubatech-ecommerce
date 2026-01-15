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

function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores] = useState([
    { id: "djcelutecnico", name: "DJCELUTECNICO" },
    { id: "ubatech", name: "Ubatech+Pro" },
  ])
  const [selectedStore, setSelectedStore] = useState<string>("djcelutecnico")
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
  const [showStockPanel, setShowStockPanel] = useState<{ open: boolean, product: Product | null }>({ open: false, product: null })
  const [stockInput, setStockInput] = useState({ tienda: "djcelutecnico", cantidad: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function handleDownloadOutOfStockPDF() {
    try {
      setDownloadingPDF(true)
      
      // Obtener productos que no tienen stock en ninguna tienda
      const allOutOfStockProducts = products.filter((p) => {
        const dj = p.stock?.djcelutecnico ?? 0
        const uba = p.stock?.ubatech ?? 0
        return dj === 0 || uba === 0
      })
      
      if (allOutOfStockProducts.length === 0) {
        alert("No hay productos fuera de stock para descargar")
        return
      }

      // Crear mapa de tiendas sin stock por producto
      const outOfStockByProduct = new Map<string, string[]>()
      allOutOfStockProducts.forEach((p) => {
        const storesWithoutStock: string[] = []
        if ((p.stock?.djcelutecnico ?? 0) === 0) {
          storesWithoutStock.push("DJCELUTECNICO")
        }
        if ((p.stock?.ubatech ?? 0) === 0) {
          storesWithoutStock.push("Ubatech+Pro")
        }
        outOfStockByProduct.set(p.id, storesWithoutStock)
      })

      const storesText = selectedStore === "all" ? "Todas las Tiendas" : selectedStore
      
      await generateOutOfStockPDF(allOutOfStockProducts, categoriesMap, {
        fileName: `Productos_Fuera_de_Stock_${storesText}_${new Date().getTime()}.pdf`,
        title: `Reporte de Productos Fuera de Stock (${storesText})`,
        outOfStockByProduct
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

      const prodsWithNormalizedPrices = prods.map(normalizeProductPrice)

      const cats = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }))
      setCategories(cats)

      const catMap = new Map<string, string>()
      for (const catDoc of categoriesSnapshot.docs) {
        catMap.set(catDoc.id, catDoc.data().name)
      }
      setCategoriesMap(catMap)

      const normalizedProds = normalizeProducts(prodsWithNormalizedPrices, catMap)
      setProducts(normalizedProds)

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
      {/* Stock Panel Flotante */}
      {showStockPanel.open && showStockPanel.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowStockPanel({ open: false, product: null });
          setStockInput({ tienda: "djcelutecnico", cantidad: 0 });
        }}>
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-8 text-center text-black">Agregar Stock</h2>
            <p className="mb-6 text-center text-gray-600 font-semibold">Producto: <span className="text-black">{showStockPanel.product.name}</span></p>
            
            {/* Sección Tienda 1: UBATECH */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h3 className="text-lg font-bold text-black mb-4">Tienda UBATECH</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a agregar</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setStockInput(s => ({ ...s, tienda: "ubatech", cantidad: Math.max(0, s.cantidad - 1) }))}
                      className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockInput(s => ({ ...s, tienda: "ubatech", cantidad: s.cantidad + 1 }))}
                      className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black text-center font-semibold text-sm sm:text-lg"
                    placeholder="0"
                    value={stockInput.tienda === "ubatech" ? stockInput.cantidad : 0}
                    min={0}
                    onChange={e => setStockInput(s => ({ ...s, tienda: "ubatech", cantidad: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  onClick={async () => {
                    if (!showStockPanel.product || stockInput.cantidad < 1) return;
                    const db = getDb();
                    const prodRef = doc(db, "products", showStockPanel.product.id);
                    const newStock = {
                      ...showStockPanel.product.stock,
                      ubatech: (showStockPanel.product.stock?.ubatech ?? 0) + stockInput.cantidad
                    };
                    await updateDoc(prodRef, { stock: newStock });
                    setStockInput({ tienda: "djcelutecnico", cantidad: 0 });
                    await loadData();
                  }}
                  disabled={stockInput.tienda !== "ubatech" || stockInput.cantidad < 1}
                >
                  Agregar Stock
                </button>
              </div>
            </div>

            {/* Sección Tienda 2: DJCELUTECNICO */}
            <div className="mb-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-4">Tienda DJCELUTECNICO</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a agregar</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setStockInput(s => ({ ...s, tienda: "djcelutecnico", cantidad: Math.max(0, s.cantidad - 1) }))}
                      className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockInput(s => ({ ...s, tienda: "djcelutecnico", cantidad: s.cantidad + 1 }))}
                      className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black text-center font-semibold text-sm sm:text-lg"
                    placeholder="0"
                    value={stockInput.tienda === "djcelutecnico" ? stockInput.cantidad : 0}
                    min={0}
                    onChange={e => setStockInput(s => ({ ...s, tienda: "djcelutecnico", cantidad: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  onClick={async () => {
                    if (!showStockPanel.product || stockInput.cantidad < 1) return;
                    const db = getDb();
                    const prodRef = doc(db, "products", showStockPanel.product.id);
                    const newStock = {
                      ...showStockPanel.product.stock,
                      djcelutecnico: (showStockPanel.product.stock?.djcelutecnico ?? 0) + stockInput.cantidad
                    };
                    await updateDoc(prodRef, { stock: newStock });
                    setStockInput({ tienda: "djcelutecnico", cantidad: 0 });
                    await loadData();
                  }}
                  disabled={stockInput.tienda !== "djcelutecnico" || stockInput.cantidad < 1}
                >
                  Agregar Stock
                </button>
              </div>
            </div>

            {/* Botón Cerrar */}
            <button
              className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
              onClick={() => {
                setShowStockPanel({ open: false, product: null });
                setStockInput({ tienda: "djcelutecnico", cantidad: 0 });
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error al cargar productos:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Encabezado y controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
        <h1 className="font-bold text-lg sm:text-2xl md:text-3xl" style={{ color: "var(--primary-dark)" }}>
          Gestión de Productos
        </h1>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="🔎 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-500"
          />
          {selectedCategory === "out-of-stock" && (
            <button
              onClick={handleDownloadOutOfStockPDF}
              disabled={downloadingPDF || products.filter((p) => (p.stock?.[selectedStore] ?? 0) === 0).length === 0}
              className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: "var(--accent-turquoise)" }}
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

      {/* Filtro de categorías */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
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

      {/* Grid de productos */}
      {(() => {
        // Filtrar productos
        const filteredProducts = products.filter((product) => {
          let categoryMatch = false
          if (selectedCategory === "all") {
            categoryMatch = true
          } else if (selectedCategory === "out-of-stock") {
            categoryMatch = (product.stock?.[selectedStore] ?? 0) === 0
          } else {
            categoryMatch = product.category === selectedCategory
          }

          const searchMatch = searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())

          return categoryMatch && searchMatch
        })

        // Agrupar por categoría
        const groupedByCategory = new Map<string, Product[]>()
        filteredProducts.forEach((product) => {
          const categoryName = categoriesMap.get(product.category) || 'Sin categoría'
          if (!groupedByCategory.has(categoryName)) {
            groupedByCategory.set(categoryName, [])
          }
          groupedByCategory.get(categoryName)!.push(product)
        })

        // Ordenar categorías alfabéticamente y productos por precio
        const sortedCategories = Array.from(groupedByCategory.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([categoryName, categoryProducts]) => [
            categoryName,
            categoryProducts.sort((a, b) => (a.price || 0) - (b.price || 0))
          ]) as [string, Product[]][]

        return (
          <>
            {sortedCategories.map(([categoryName, categoryProducts]) => (
              <div key={categoryName} className="mb-8">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ color: 'var(--primary-dark)', borderColor: 'var(--primary-dark)' }}>
                  {categoryName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
                  {categoryProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-full h-24 object-contain p-2" />
              )}
              <div className="p-2 space-y-1 flex-1 flex flex-col">
                <h3 className="font-bold text-xs" style={{ color: "var(--primary-dark)" }}>
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-1">{product.description || "-"}</p>
                <p className="text-xs font-bold mt-auto" style={{ color: "var(--accent-turquoise)" }}>
                  {formatPriceWithCurrency(product.price)}
                </p>
                <div className="text-xs space-y-0.5">
                  {stores.map((store) => (
                    <div key={store.id} className={`${(product.stock?.[store.id] ?? 0) === 0 ? "text-red-600 font-bold" : ""}`}>
                      {store.name}: {product.stock?.[store.id] ?? 0}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product)
                      setShowForm(true)
                    }}
                    className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setShowStockPanel({ open: true, product })}
                    className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Stock
                  </button>
                </div>
              </div>
            </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )
      })()}

      {products.filter((p) => {
        if (selectedCategory === "all") return true
        if (selectedCategory === "out-of-stock") return (p.stock?.[selectedStore] ?? 0) === 0
        return p.category === selectedCategory
      }).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {products.length === 0 ? "No hay productos aún" : "No hay productos en esta categoría"}
        </div>
      )}
    </div>
  )
}

export default ProductsManager;
