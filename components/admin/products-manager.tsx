"use client"

import { useState, useEffect } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import type { Product, Subcategory } from "@/types"
import ProductForm from "./product-form"
import { getSubcategoriesByCategory, getAllSubcategoriesGrouped } from "@/lib/subcategories"
import { normalizeProducts } from "@/lib/normalize-products"
import { formatPriceWithCurrency, normalizeProductPrice } from "@/lib/format-price"
import { generateOutOfStockPDF, generateCategoryPDF } from "@/lib/pdf-generator"
import { Download, Share2 } from "lucide-react"
import { uploadProductImage } from "@/lib/image-storage"

function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores] = useState([
    { id: "djcelutecnico", name: "DJCELUTECNICO" },
    { id: "ubatech", name: "Ubatech+Pro" },
  ])
  const [selectedStore, setSelectedStore] = useState<string>("djcelutecnico")
  const [categories, setCategories] = useState<Array<{ id: string; name: string; position?: number }>>([])
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
  const [stockInput, setStockInput] = useState({ ubatech: 0, djcelutecnico: 0 })
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function handleDownloadOutOfStockPDF() {
    try {
      setDownloadingPDF(true)
      
      // Obtener productos que tienen stock a traer pendiente
      const allOutOfStockProducts = products.filter((p) => {
        const djStockToFetch = p.stockToFetchByStore?.djcelutecnico ?? 0
        const ubaStockToFetch = p.stockToFetchByStore?.ubatech ?? 0
        return djStockToFetch > 0 || ubaStockToFetch > 0
      })
      
      if (allOutOfStockProducts.length === 0) {
        alert("No hay productos con stock pendiente a traer para descargar")
        return
      }

      // Validar que los productos tengan datos mínimos
      const validProducts = allOutOfStockProducts.filter(p => {
        if (!p.name || !p.name.trim()) {
          console.warn(`[PDF] Skipping product with no name: ${p.id}`)
          return false
        }
        return true
      })

      if (validProducts.length === 0) {
        alert("No hay productos válidos con stock pendiente para descargar")
        return
      }

      // Crear mapa de cantidad pendiente a traer por tienda y producto
      const outOfStockByProduct = new Map<string, { store: string; stockToFetch: number }[]>()
      validProducts.forEach((p) => {
        const storesWithStockToFetch: { store: string; stockToFetch: number }[] = []
        
        const djStockToFetch = p.stockToFetchByStore?.djcelutecnico ?? 0
        if (djStockToFetch > 0) {
          storesWithStockToFetch.push({
            store: "DJCELUTECNICO",
            stockToFetch: djStockToFetch
          })
        }
        
        const ubaStockToFetch = p.stockToFetchByStore?.ubatech ?? 0
        if (ubaStockToFetch > 0) {
          storesWithStockToFetch.push({
            store: "Ubatech+Pro",
            stockToFetch: ubaStockToFetch
          })
        }
        
        outOfStockByProduct.set(p.id, storesWithStockToFetch)
      })

      const storesText = selectedStore === "all" ? "Todas las Tiendas" : selectedStore
      
      console.log(`[ProductsManager] 📊 Generating stock to fetch PDF with ${validProducts.length} products`)

      // Convert Map to Record for PDF generator
      const categoriesRecord = Object.fromEntries(categoriesMap)

      await generateOutOfStockPDF(validProducts, categoriesRecord, {
        fileName: `Productos_Stock_a_Traer_${storesText}_${new Date().getTime()}.pdf`,
        title: `Reporte de Productos con Stock a Traer (${storesText})`,
        outOfStockByProduct
      })

      console.log(`[ProductsManager] ✅ Stock to fetch PDF generated successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("[ProductsManager] ❌ Error downloading PDF:", error)
      alert(`Error al generar el PDF: ${errorMessage}. Por favor, intenta de nuevo.`)
    } finally {
      setDownloadingPDF(false)
    }
  }

  async function handleDownloadCategoryPDF() {
    try {
      setDownloadingPDF(true)
      
      // Obtener productos de la categoría seleccionada
      const categoryProducts = products.filter((p) => p.category === selectedCategory)
      
      if (categoryProducts.length === 0) {
        alert("No hay productos en esta categoría para descargar")
        return
      }

      const categoryName = categories.find((c) => c.id === selectedCategory)?.name || selectedCategory
      
      // Validar que los productos tengan datos mínimos
      const validProducts = categoryProducts.filter(p => {
        if (!p.name || !p.name.trim()) {
          console.warn(`[PDF] Skipping product with no name: ${p.id}`)
          return false
        }
        return true
      })

      if (validProducts.length === 0) {
        alert("No hay productos válidos en esta categoría para descargar")
        return
      }

      console.log(`[ProductsManager] 📊 Generating PDF for category "${categoryName}" with ${validProducts.length} products`)
      
      await generateCategoryPDF(validProducts, categoryName, {
        fileName: `Catalogo_${categoryName}_${new Date().getTime()}.pdf`
      })
      
      console.log(`[ProductsManager] ✅ PDF generated successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("[ProductsManager] ❌ Error downloading category PDF:", error)
      alert(`Error al generar el PDF: ${errorMessage}. Por favor, intenta de nuevo.`)
    } finally {
      setDownloadingPDF(false)
    }
  }



  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const db = getDb()
      
      console.time("[PERF] loadData")
      
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
        position: doc.data().position ?? 999,
      }))
      // Ordenar categorías por posición
      const sortedCats = cats.sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
      setCategories(sortedCats)

      const catMapObject = Object.fromEntries(
        categoriesSnapshot.docs.map((doc) => [doc.id, doc.data().name])
      ) as Record<string, string>
      setCategoriesMap(new Map(Object.entries(catMapObject)))

      const normalizedProds = normalizeProducts(prodsWithNormalizedPrices, catMapObject)
      setProducts(normalizedProds)

      // 🚀 OPTIMIZACIÓN: Usar query única que agrupa por categoryId
      // ANTES: N queries secuenciales (30-50 segundos)
      // DESPUÉS: 1 sola query (2-3 segundos)
      const subMapRecord = await getAllSubcategoriesGrouped()
      setSubcategoriesMap(new Map(Object.entries(subMapRecord)))
      
      console.timeEnd("[PERF] loadData")
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
      setSaveErrorMessage(null)
      const db = getDb()
      
      // 🚀 VALIDACIÓN: Verificar datos requeridos
      if (!productData.name || productData.name.trim() === "") {
        throw new Error("El nombre del producto es obligatorio")
      }
      
      if (!productData.category || productData.category.trim() === "") {
        throw new Error("Debes seleccionar una categoría")
      }
      
      if ((productData.price ?? 0) <= 0) {
        throw new Error("El precio debe ser mayor a 0")
      }
      
      // Limpiar campos undefined para evitar errores de Firestore
      const cleanedData = Object.fromEntries(
        Object.entries(productData).filter(([_, value]) => value !== undefined)
      )
      
      // 🚀 ASEGURAR que stock y minStockByStore sean objetos válidos
      if (!cleanedData.stock) {
        cleanedData.stock = { djcelutecnico: 0, ubatech: 0 }
      }
      if (!cleanedData.minStockByStore) {
        cleanedData.minStockByStore = { djcelutecnico: 0, ubatech: 0 }
      }

      // 🚀 PROCESAR IMÁGENES: Subir base64 a Firebase Storage, mantener URLs
      const processedImages: string[] = []
      const productId = editingProduct?.id || `temp_${Date.now()}`
      
      if (cleanedData.images && Array.isArray(cleanedData.images)) {
        for (let i = 0; i < cleanedData.images.length; i++) {
          const image = cleanedData.images[i] as string
          
          if (image.startsWith("data:")) {
            // 🔥 Es una imagen base64 - subirla a Firebase Storage
            try {
              console.log(`[ProductsManager] Subiendo imagen ${i + 1} a Storage...`)
              
              // Convertir data URL a Blob
              const response = await fetch(image)
              const blob = await response.blob()
              
              // Crear File object
              const file = new File([blob], `image-${i}.jpg`, { type: "image/jpeg" })
              
              // Subir a Storage y obtener URL
              const downloadURL = await uploadProductImage(file, productId, i)
              processedImages.push(downloadURL)
              
              console.log(`[ProductsManager] Imagen ${i + 1} subida: ${downloadURL}`)
            } catch (uploadError) {
              console.error(`Error subiendo imagen ${i + 1}:`, uploadError)
              throw new Error(`Error al subir imagen ${i + 1} a Firebase Storage`)
            }
          } else {
            // Ya es una URL de Storage, mantenerla como está
            processedImages.push(image)
          }
        }
        
        // Reemplazar imágenes base64 con URLs de Storage
        cleanedData.images = processedImages
      }
      
      console.log("[ProductsManager] Guardando producto:", cleanedData)
      
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), cleanedData)
        console.log("[ProductsManager] Producto actualizado:", editingProduct.id)
      } else {
        const docRef = await addDoc(collection(db, "products"), cleanedData)
        console.log("[ProductsManager] Producto creado:", docRef.id)
      }
      
      setShowForm(false)
      setEditingProduct(null)
      setSaveErrorMessage(null)
      await loadData()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error("[ProductsManager] Error saving product:", error, errorMsg)
      setSaveErrorMessage(errorMsg)
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
          setStockInput({ ubatech: 0, djcelutecnico: 0 });
        }}>
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-8 text-center text-black">Agregar Stock</h2>
            <p className="mb-6 text-center text-gray-600 font-semibold">Producto: <span className="text-black">{showStockPanel.product.name}</span></p>
            
            {/* Sección Tienda 1: UBATECH */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h3 className="text-lg font-bold text-black mb-2">Tienda UBATECH</h3>
              <p className="text-sm text-gray-600 mb-4">Stock actual: <span className="font-bold text-black">{showStockPanel.product.stock?.ubatech ?? 0}</span></p>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a agregar</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setStockInput(s => ({ ...s, ubatech: Math.max(0, s.ubatech - 1) }))}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockInput(s => ({ ...s, ubatech: s.ubatech + 1 }))}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <input
                  type="number"
                  className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black text-center font-semibold text-sm sm:text-lg"
                  placeholder="0"
                  value={stockInput.ubatech}
                  min={0}
                  onChange={e => setStockInput(s => ({ ...s, ubatech: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Sección Tienda 2: DJCELUTECNICO */}
            <div className="mb-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-2">Tienda DJCELUTECNICO</h3>
              <p className="text-sm text-gray-600 mb-4">Stock actual: <span className="font-bold text-black">{showStockPanel.product.stock?.djcelutecnico ?? 0}</span></p>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a agregar</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setStockInput(s => ({ ...s, djcelutecnico: Math.max(0, s.djcelutecnico - 1) }))}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockInput(s => ({ ...s, djcelutecnico: s.djcelutecnico + 1 }))}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <input
                  type="number"
                  className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black text-center font-semibold text-sm sm:text-lg"
                  placeholder="0"
                  value={stockInput.djcelutecnico}
                  min={0}
                  onChange={e => setStockInput(s => ({ ...s, djcelutecnico: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Botón único para agregar a ambas tiendas */}
            <button
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors mb-4"
              onClick={async () => {
                if (!showStockPanel.product || (stockInput.ubatech === 0 && stockInput.djcelutecnico === 0)) return;
                const db = getDb();
                const prodRef = doc(db, "products", showStockPanel.product.id);
                
                // Actualizar ambas tiendas
                const currentStockUbatech = showStockPanel.product.stock?.ubatech ?? 0;
                const currentStockDjcelutecnico = showStockPanel.product.stock?.djcelutecnico ?? 0;
                const stockToFetchUbatech = showStockPanel.product.stockToFetchByStore?.ubatech ?? 0;
                const stockToFetchDjcelutecnico = showStockPanel.product.stockToFetchByStore?.djcelutecnico ?? 0;
                
                const newStock = {
                  ...showStockPanel.product.stock,
                  ubatech: currentStockUbatech + stockInput.ubatech,
                  djcelutecnico: currentStockDjcelutecnico + stockInput.djcelutecnico
                };
                
                const newStockToFetch = {
                  ubatech: Math.max(0, stockToFetchUbatech - stockInput.ubatech),
                  djcelutecnico: Math.max(0, stockToFetchDjcelutecnico - stockInput.djcelutecnico)
                };
                
                await updateDoc(prodRef, { 
                  stock: newStock,
                  stockToFetchByStore: newStockToFetch
                });
                
                setStockInput({ ubatech: 0, djcelutecnico: 0 });
                await loadData();
                
                // Cerrar automáticamente la ventana emergente
                setShowStockPanel({ open: false, product: null });
              }}
              disabled={stockInput.ubatech === 0 && stockInput.djcelutecnico === 0}
            >
              Agregar Stock
            </button>

            {/* Botón Cerrar */}
            <button
              className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
              onClick={() => {
                setShowStockPanel({ open: false, product: null });
                setStockInput({ ubatech: 0, djcelutecnico: 0 });
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

      {/* 🚀 Mostrar errores de guardado */}
      {saveErrorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">❌ Error al guardar producto:</p>
            <p className="text-red-600 font-semibold mt-1">{saveErrorMessage}</p>
          </div>
          <button
            onClick={() => setSaveErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4"
          >
            ✕
          </button>
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
          {selectedCategory !== "all" && selectedCategory !== "out-of-stock" && (
            <button
              onClick={handleDownloadCategoryPDF}
              disabled={downloadingPDF || products.filter((p) => p.category === selectedCategory).length === 0}
              className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: "var(--accent-turquoise)" }}
              title="Descargar catálogo de la categoría en PDF"
            >
              <Share2 size={18} />
              {downloadingPDF ? "Generando..." : "Compartir"}
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
            // Mostrar productos donde el stock a traer es mayor a 0 (hay cantidad pendiente de traer)
            let hasStockToFetch = false
            stores.forEach((store) => {
              const stockToFetch = product.stockToFetchByStore?.[store.id] ?? 0
              if (stockToFetch > 0) {
                hasStockToFetch = true
              }
            })
            categoryMatch = hasStockToFetch
          } else {
            categoryMatch = product.category === selectedCategory
          }

          const searchMatch = searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())

          return categoryMatch && searchMatch
        });

        // Agrupar por categoría
        const groupedByCategory = new Map<string, Product[]>()
        filteredProducts.forEach((product) => {
          const categoryName = categoriesMap.get(product.category) || 'Sin categoría'
          if (!groupedByCategory.has(categoryName)) {
            groupedByCategory.set(categoryName, [])
          }
          groupedByCategory.get(categoryName)!.push(product)
        })

        // Crear un mapa de nombre -> posición para ordenar respetando el orden del panel admin
        const categoryPositionMap = new Map<string, number>()
        categories.forEach((cat) => {
          categoryPositionMap.set(cat.name, cat.position ?? 999)
        })

        // Ordenar categorías por posición (igual que en la página pública) y productos por precio
        const sortedCategories = Array.from(groupedByCategory.entries())
          .sort((a, b) => {
            const posA = categoryPositionMap.get(a[0]) ?? 999
            const posB = categoryPositionMap.get(b[0]) ?? 999
            return posA - posB
          })
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
                  {categoryProducts.map((product) => {
        const isOutOfStockFilter = selectedCategory === "out-of-stock"
        let storesWithStockToFetch: { store: { id: string; name: string }; stockToFetch: number }[] = []
        if (isOutOfStockFilter) {
          stores.forEach((store) => {
            const stockToFetch = product.stockToFetchByStore?.[store.id] ?? 0
            if (stockToFetch > 0) {
              storesWithStockToFetch.push({
                store,
                stockToFetch
              })
            }
          })
        }
        return (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-24 object-contain p-2 bg-gray-50" 
                  onError={(e) => {
                    console.error("Error loading product image:", product.images?.[0], e)
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-24 object-contain p-2 bg-gray-50"
                  onError={(e) => {
                    console.error("Error loading fallback image:", product.image, e)
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center font-bold text-2xl" style={{ color: "var(--accent-turquoise)" }}>
                  {product.name.charAt(0)}
                </div>
              )}
              <div className="p-2 space-y-1 flex-1 flex flex-col">
                <h3 className="font-bold text-xs line-clamp-2" style={{ color: "var(--primary-dark)" }}>
                  {product.name}
                </h3>
                <div className="mt-2">
                  {product.discountedPrice && product.discountedPrice > 0 ? (
                    <div>
                      <p className="text-xs text-gray-500 line-through">
                        {formatPriceWithCurrency(product.price)}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold" style={{ color: "var(--accent-green)" }}>
                          {formatPriceWithCurrency(product.discountedPrice)}
                        </p>
                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent-cyan)" }}>
                          -{Math.ceil(((product.price - product.discountedPrice) / product.price) * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold" style={{ color: "var(--accent-turquoise)" }}>
                      {formatPriceWithCurrency(product.price)}
                    </p>
                  )}
                </div>
                {isOutOfStockFilter ? (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Stock a Traer:</p>
                    <div className="space-y-1">
                      {storesWithStockToFetch.map((item) => (
                        <div key={item.store.id} className="text-xs text-yellow-600 font-semibold">
                          <span className="font-bold text-yellow-700">{item.store.name}:</span> {item.stockToFetch} unidades pendientes
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-gray-700 mb-1">Stock a Traer:</p>
                    {stores.map((store) => (
                      <div key={store.id} className={`${(product.stockToFetchByStore?.[store.id] ?? 0) === 0 ? "text-red-600 font-bold" : ""}`}>
                        {store.name}: {product.stockToFetchByStore?.[store.id] ?? 0}
                      </div>
                    ))}
                  </div>
                )}
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
        )
      })}
                </div>
              </div>
            ))}
          </>
        )
      })()}

      {products.filter((p) => {
        if (selectedCategory === "all") return true
        if (selectedCategory === "out-of-stock") {
          const stockToFetch = p.stockToFetchByStore?.[selectedStore] ?? 0
          return stockToFetch > 0
        }
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
