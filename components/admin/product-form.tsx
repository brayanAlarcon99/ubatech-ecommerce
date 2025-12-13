"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product, Subcategory } from "@/types"
import { getSubcategoriesByCategory } from "@/lib/subcategories"
import { getDb } from "@/lib/firebase"
import { getDocs, collection, query, where } from "firebase/firestore"
import { formatPrice, ensureNumberPrice, sanitizePriceInput } from "@/lib/format-price"

interface ProductFormProps {
  product: Product | null
  categories?: string[]
  onSave: (product: Omit<Product, "id">) => void
  onCancel: () => void
}

interface CategoryData {
  id: string
  name: string
}

// Constante para el límite de tamaño de imagen en bytes (1MB - Límite de Firestore)
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

export default function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    stock: product?.stock || 0,
    image: product?.image || "",
    sku: product?.sku || "",
    details: product?.details || "",
  })
  const [imagePreview, setImagePreview] = useState<string>(product?.image || "")
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([])
  const [imageInputFocus, setImageInputFocus] = useState(false)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageLoadSuccess, setImageLoadSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Cargar datos de categorías y subcategorías
  useEffect(() => {
    loadCategoriesData()
  }, [])

  // Una vez que se carguen las categorías, si estamos editando, necesitamos convertir el nombre a ID
  useEffect(() => {
    if (!loadingCategories && product?.category && categoriesData.length > 0) {
      // Si formData.category es un nombre (porque vino del producto existente), convertirlo a ID
      // Primero verificamos si el formData.category es realmente un ID o un nombre
      const isId = categoriesData.some(cat => cat.id === formData.category)
      if (!isId) {
        // Es un nombre, buscar el ID correspondiente
        const categoryDoc = categoriesData.find(cat => cat.name === product.category)
        if (categoryDoc) {
          setFormData(prev => ({ ...prev, category: categoryDoc.id }))
        }
      }
    }
  }, [loadingCategories, categoriesData, product?.category])

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (formData.category) {
      // formData.category contiene el ID de la categoría
      loadSubcategories(formData.category)
    } else {
      setSubcategories([])
    }
  }, [formData.category])

  async function loadCategoriesData() {
    try {
      setCategoryError(null)
      setLoadingCategories(true)
      const db = getDb()
      const snapshot = await getDocs(collection(db, "categories"))
      if (snapshot.empty) {
        setCategoryError("No hay categorías disponibles. Crea una primero.")
        console.warn("[v0] No categories found in Firestore")
      }
      const cats = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Sin nombre",
      }))
      setCategoriesData(cats)
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
      setCategoryError(error instanceof Error ? error.message : "Error al cargar categorías")
      setCategoriesData([])
    } finally {
      setLoadingCategories(false)
    }
  }

  async function loadSubcategories(categoryId: string) {
    try {
      // Validar que categoryId no esté vacío o undefined
      if (!categoryId || !categoryId.trim()) {
        setSubcategories([])
        return
      }

      // Usar directamente el ID de la categoría
      const subs = await getSubcategoriesByCategory(categoryId)
      setSubcategories(subs)
    } catch (error) {
      console.error("[v0] Error loading subcategories:", error)
      setSubcategories([])
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    
    if (name === "price" || name === "stock") {
      if (name === "price") {
        // Para el precio, usar sanitizePriceInput para limpiar puntos de mil
        // permitir que el usuario digite con puntos de mil y se conviertan correctamente
        const numValue = sanitizePriceInput(value);
        setFormData((prev) => ({
          ...prev,
          [name]: numValue,
        }))
      } else {
        // Para stock, convertir a número entero
        const numValue = parseFloat(value);
        const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue);
        setFormData((prev) => ({
          ...prev,
          [name]: finalValue,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño de archivo
      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        const limitMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(2)
        const errorMsg = `⚠️ Cambiar imagen: El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
        setImageError(errorMsg)
        setImagePreview("")
        setFormData((prev) => ({ ...prev, image: "" }))
        setImageLoadSuccess(false)
        setPasteMessage(null)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, image: result }))
        setImageError(null)
        setImageLoadSuccess(true)
        setPasteMessage(null)
        // Mostrar mensaje de éxito por 3 segundos
        setTimeout(() => setImageLoadSuccess(false), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleImagePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items
    if (!items) return

    // Buscar una imagen en los elementos del portapapeles
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          // Validar tamaño de archivo
          if (file.size > MAX_IMAGE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            const limitMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(2)
            const errorMsg = `⚠️ Cambiar imagen: El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
            setImageError(errorMsg)
            setImagePreview("")
            setFormData((prev) => ({ ...prev, image: "" }))
            setImageLoadSuccess(false)
            setPasteMessage(null)
            return
          }

          const reader = new FileReader()
          reader.onload = (event) => {
            const result = event.target?.result as string
            setImagePreview(result)
            setFormData((prev) => ({ ...prev, image: result }))
            setPasteMessage("✓ Imagen pegada correctamente")
            setImageError(null)
            setImageLoadSuccess(true)
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
              setPasteMessage(null)
              setImageLoadSuccess(false)
            }, 3000)
          }
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError(null)
    try {
      // Validación de tamaño de imagen en base64 ANTES de guardar
      if (formData.image) {
        const imageSizeBytes = formData.image.length
        const MAX_BASE64_SIZE = 1048487 // bytes
        
        if (imageSizeBytes > MAX_BASE64_SIZE) {
          const sizeMB = (imageSizeBytes / (1024 * 1024)).toFixed(2)
          const limitMB = (MAX_BASE64_SIZE / (1024 * 1024)).toFixed(2)
          setSaveError(`⚠️ Cambiar imagen: La imagen en base64 supera el límite máximo permitido (${limitMB}MB). Tamaño actual: ${sizeMB}MB. Por favor, selecciona una imagen más pequeña o de menor resolución.`)
          setLoading(false)
          return
        }
      }

      // Asegurar que el precio se guarde como un número válido con máximo 2 decimales
      const dataToSave = {
        ...formData,
        price: Math.round(formData.price * 100) / 100, // Redondea a 2 decimales
        stock: Math.floor(formData.stock), // Stock debe ser un entero
      }
      onSave(dataToSave)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      
      // Detectar error de tamaño de imagen
      if (errorMsg.includes("1048487") || errorMsg.includes("image") || errorMsg.includes("longer than")) {
        setSaveError(`⚠️ Error al guardar: La imagen supera el límite máximo permitido (1MB). Por favor, cambia la imagen por una más pequeña.`)
        console.error("[ProductForm] Image size error:", errorMsg)
      } else {
        setSaveError(`Error al guardar el producto: ${errorMsg}`)
        console.error("[ProductForm] Save error:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-black" style={{ color: "var(--primary)" }}>
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          {/* Mostrar error si no hay categorías */}
          {categoryError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              ⚠️ {categoryError}
            </div>
          )}

          {/* Mostrar estado de carga */}
          {loadingCategories && (
            <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              ⏳ Cargando categorías...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                  Precio
                </label>
                <div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price > 0 ? String(formData.price) : ""}
                    onChange={handleChange}
                    placeholder="Ej: 6000 o 6.000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                    required
                  />
                  {formData.price > 0 && (
                    <p className="text-xs text-gray-500 mt-1" style={{ color: "var(--accent-green)" }}>
                      ✓ Mostrará como: ${formatPrice(formData.price)}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                SKU (Código Interno)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ej: SKU-001, PRD-2024-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                Detalles Adicionales
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Ej: Incluye accesorios, especificaciones técnicas, información importante, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                  required
                >
                  <option value="" className="text-black">Seleccionar categoría</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-black">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                  Subcategoría {subcategories.length > 0 && "*"}
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                  required={subcategories.length > 0}
                  disabled={subcategories.length === 0}
                >
                  <option value="" className="text-black">
                    {subcategories.length === 0 ? "Sin subcategorías" : "Seleccionar subcategoría"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id} className="text-black">
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div onPaste={handleImagePaste} className="focus:outline-none">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-black" style={{ color: "var(--primary)" }}>
                  Imagen
                </label>
                <span className="text-xs text-gray-500">
                  Máximo: 1MB
                </span>
              </div>
              <div
                className={`w-full px-4 py-4 border-2 border-dashed rounded-lg transition-all ${
                  imageInputFocus
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                } flex flex-col items-center justify-center cursor-pointer`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setImageInputFocus(true)
                }}
                onDragLeave={() => setImageInputFocus(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setImageInputFocus(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file && file.type.startsWith("image/")) {
                    // Validar tamaño de archivo
                    if (file.size > MAX_IMAGE_SIZE) {
                      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
                      const limitMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(2)
                      const errorMsg = `⚠️ Cambiar imagen: El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
                      setImageError(errorMsg)
                      setImagePreview("")
                      setFormData((prev) => ({ ...prev, image: "" }))
                      setImageLoadSuccess(false)
                      setPasteMessage(null)
                      return
                    }

                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = event.target?.result as string
                      setImagePreview(result)
                      setFormData((prev) => ({ ...prev, image: result }))
                      setPasteMessage("✓ Imagen cargada correctamente")
                      setImageError(null)
                      setImageLoadSuccess(true)
                      setTimeout(() => {
                        setPasteMessage(null)
                        setImageLoadSuccess(false)
                      }, 3000)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a4 4 0 00-5.656 0L9.172 15.172a4 4 0 000 5.656l.6.6a4 4 0 005.656 0L24 13.656l8.772 8.772a4 4 0 005.656 0l.6-.6a4 4 0 000-5.656z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="16" cy="16" r="2" fill="currentColor" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Haz clic para seleccionar o arrastra una imagen
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    También puedes pegar una imagen con <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd>
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 cursor-pointer transition-colors"
                >
                  📁 Cargar imagen
                </label>
              </div>
              
              {imageError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="text-sm font-medium">
                    {imageError}
                  </p>
                </div>
              )}

              {formData.image && formData.image.length > 1048487 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="text-sm font-medium">
                    ⚠️ Cambiar imagen: La imagen en base64 supera el límite máximo permitido (~1MB). Tamaño actual: {(formData.image.length / (1024 * 1024)).toFixed(2)}MB. Por favor, selecciona una imagen más pequeña o de menor resolución.
                  </p>
                </div>
              )}

              {imageLoadSuccess && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✓ Imagen cargada correctamente
                </p>
              )}
              
              {pasteMessage && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  {pasteMessage}
                </p>
              )}

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Vista previa:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                    <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("")
                      setFormData((prev) => ({ ...prev, image: "" }))
                      setPasteMessage(null)
                      setImageError(null)
                      setImageLoadSuccess(false)
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    ✕ Eliminar imagen
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium hover:opacity-90"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
