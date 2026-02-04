"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Product, Subcategory } from "@/types"
import { getSubcategoriesByCategory } from "@/lib/subcategories"
import { getDb } from "@/lib/firebase"
import { getDocs, collection, query, where } from "firebase/firestore"
import { formatPrice, ensureNumberPrice, sanitizePriceInput } from "@/lib/format-price"
import { getStorageImageUrls } from "@/lib/storage-images"

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

export default function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Convertir imagen antigua a array de imágenes si existe
  const initialImages = product?.images ? 
    product.images : 
    (product?.image ? [product.image] : [])

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    discountedPrice: product?.discountedPrice || 0,
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    stock: product?.stock || { djcelutecnico: 0, ubatech: 0 },
    stockToFetchByStore: product?.stockToFetchByStore || { djcelutecnico: 0, ubatech: 0 },
    images: initialImages,
    image: product?.image || "", // Mantener por compatibilidad
    sku: product?.sku || "",
    details: product?.details || "",
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages)
  const [imageInputFocus, setImageInputFocus] = useState(false)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [imageLoadSuccess, setImageLoadSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([])

  // Cargar datos de categorías y subcategorías
  useEffect(() => {
    loadCategoriesData()
  }, [])

  // 🚀 Cargar imágenes de Storage cuando se abre el formulario
  useEffect(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      // Las imágenes ya están como URLs (convertidas desde rutas de Storage)
      // Se pueden mostrar directamente en los previews
      setImagePreviews(product.images)
      setFormData(prev => ({ ...prev, images: product.images || [] }))
    }
  }, [product?.id])

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onCancel])

  // Calcular descuento cuando hay precio con descuento
  useEffect(() => {
    if (formData.price > 0 && formData.discountedPrice > 0) {
      const discount = ((formData.price - formData.discountedPrice) / formData.price) * 100
      const roundedDiscount = Math.ceil(discount)
      setDiscountPercentage(roundedDiscount)
    } else {
      setDiscountPercentage(0)
    }
  }, [formData.price, formData.discountedPrice])

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
    
    // Función para limpiar ceros iniciales en números
    const removeLeadingZero = (val: string): string => {
      const trimmed = val.trim()
      if (!trimmed) return ""
      // Si empieza con 0 y tiene más de un dígito, quitar TODOS los ceros iniciales
      if (trimmed.startsWith("0") && trimmed.length > 1 && trimmed[1] !== ".") {
        // Usar replace con regex para remover todos los ceros iniciales
        const cleaned = trimmed.replace(/^0+/, "")
        // Si el resultado está vacío (ej: "000"), retornar "0"
        return cleaned || "0"
      }
      return trimmed
    }
    
    if (name === "price" || name === "discountedPrice") {
      const numValue = sanitizePriceInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    } else if (name.startsWith("stock_")) {
      const storeId = name.replace("stock_", "");
      // Primero limpiar ceros iniciales
      let cleanValue = removeLeadingZero(value)
      // Luego convertir a número
      const numValue = cleanValue === "" ? NaN : parseFloat(cleanValue);
      const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue);
      setFormData((prev) => ({
        ...prev,
        stock: {
          ...prev.stock,
          [storeId]: finalValue,
        },
      }))
    } else if (name.startsWith("stockToFetch_")) {
      const storeId = name.replace("stockToFetch_", "");
      // Primero limpiar ceros iniciales
      let cleanValue = removeLeadingZero(value)
      // Luego convertir a número
      const numValue = cleanValue === "" ? NaN : parseFloat(cleanValue);
      const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue);
      setFormData((prev) => ({
        ...prev,
        stockToFetchByStore: {
          ...prev.stockToFetchByStore,
          [storeId]: finalValue,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      // 🚀 Limitar a máximo 5 imágenes
      if (imagePreviews.length >= 5) {
        setPasteMessage("⚠️ Máximo 5 imágenes permitidas")
        setTimeout(() => setPasteMessage(null), 3000)
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          let result = event.target?.result as string
          
          setImagePreviews((prev) => [...prev, result])
          setFormData((prev) => ({ 
            ...prev, 
            images: [...(prev.images || []), result]
          }))
          setImageLoadSuccess(true)
          setPasteMessage(null)
          setTimeout(() => setImageLoadSuccess(false), 3000)
        } catch (error) {
          console.error("Error procesando imagen:", error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  function handleImagePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault()
        
        // 🚀 Limitar a máximo 5 imágenes
        if (imagePreviews.length >= 5) {
          setPasteMessage("⚠️ Máximo 5 imágenes permitidas")
          setTimeout(() => setPasteMessage(null), 3000)
          return
        }
        
        const file = items[i].getAsFile()
        if (file) {

          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              let result = event.target?.result as string
              
              setImagePreviews((prev) => [...prev, result])
              setFormData((prev) => ({ 
                ...prev, 
                images: [...(prev.images || []), result]
              }))
              setPasteMessage("✓ Imagen pegada correctamente")
              setImageLoadSuccess(true)
              setTimeout(() => {
                setPasteMessage(null)
                setImageLoadSuccess(false)
              }, 3000)
            } catch (error) {
              console.error("Error al procesar imagen pegada:", error)
            }
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
      // Validación de descuento
      if (formData.discountedPrice > 0 && formData.discountedPrice >= formData.price) {
        setSaveError("⚠️ El precio con descuento debe ser menor que el precio original")
        setLoading(false)
        return
      }

      // Asegurar que el precio se guarde como un número válido con máximo 2 decimales
      const dataToSave: Omit<Product, "id"> = {
        ...formData,
        images: imagePreviews.length > 0 ? imagePreviews : undefined,
        price: Math.round(formData.price * 100) / 100, // Redondea a 2 decimales
        stock: {
          djcelutecnico: Math.floor(formData.stock.djcelutecnico || 0),
          ubatech: Math.floor(formData.stock.ubatech || 0),
        },
        stockToFetchByStore: {
          djcelutecnico: Math.floor(formData.stockToFetchByStore?.djcelutecnico || 0),
          ubatech: Math.floor(formData.stockToFetchByStore?.ubatech || 0),
        },
      }
      
      // Agregar discountedPrice solo si es mayor a 0
      if (formData.discountedPrice > 0) {
        dataToSave.discountedPrice = Math.round(formData.discountedPrice * 100) / 100
      }

      // Eliminar el campo image antiguo si hay nuevas imágenes
      if (imagePreviews.length > 0) {
        delete (dataToSave as any).image
      }
      
      onSave(dataToSave)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      setSaveError(`Error al guardar el producto: ${errorMsg}`)
      console.error("[ProductForm] Save error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                Stock por tienda
              </label>
              <div className="flex flex-row gap-4">
                {/* DJCELUTECNICO */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">DJCELUTECNICO</span>
                    <span className="text-xs text-gray-500">Stock actual: {formData.stock.djcelutecnico || 0}</span>
                  </div>
                  
                  {/* Stock a traer */}
                  <div>
                    <label className="text-xs text-gray-600 font-medium block mb-1">Stock a Traer 📦</label>
                    <input
                      type="number"
                      name="stockToFetch_djcelutecnico"
                      value={formData.stockToFetchByStore?.djcelutecnico}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cantidad a traer. Al agregar stock se restará de este valor.</p>
                  </div>
                </div>

                {/* UBATECH */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Ubatech+Pro</span>
                    <span className="text-xs text-gray-500">Stock actual: {formData.stock.ubatech || 0}</span>
                  </div>
                  
                  {/* Stock a traer */}
                  <div>
                    <label className="text-xs text-gray-600 font-medium block mb-1">Stock a Traer 📦</label>
                    <input
                      type="number"
                      name="stockToFetch_ubatech"
                      value={formData.stockToFetchByStore?.ubatech}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cantidad a traer. Al agregar stock se restará de este valor.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black" style={{ color: "var(--primary)" }}>
                Precio con Descuento (Opcional)
              </label>
              <div>
                <input
                  type="text"
                  name="discountedPrice"
                  value={formData.discountedPrice > 0 ? String(formData.discountedPrice) : ""}
                  onChange={handleChange}
                  placeholder="Ej: 4500 o 4.500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                />
                {formData.discountedPrice > 0 && formData.price > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500" style={{ color: "var(--accent-green)" }}>
                      ✓ Mostrará como: ${formatPrice(formData.discountedPrice)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: "var(--accent-cyan)" }}>
                        Descuento: {discountPercentage}%
                      </span>
                      {formData.discountedPrice >= formData.price && (
                        <span className="text-xs text-red-600 font-semibold">
                          ⚠️ Debe ser menor que el precio original
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                  Imágenes
                </label>
                <span className="text-xs text-gray-500">
                  Máximo: 5 imágenes
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
                  
                  // 🚀 Limitar a máximo 5 imágenes
                  if (imagePreviews.length >= 5) {
                    setPasteMessage("⚠️ Máximo 5 imágenes permitidas")
                    setTimeout(() => setPasteMessage(null), 3000)
                    return
                  }
                  
                  const file = e.dataTransfer.files?.[0]
                  if (file && file.type.startsWith("image/")) {

                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = event.target?.result as string
                      setImagePreviews((prev) => [...prev, result])
                      setFormData((prev) => ({ 
                        ...prev, 
                        images: [...(prev.images || []), result]
                      }))
                      setPasteMessage("✓ Imagen cargada correctamente")
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
                    También puedes pegar con <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd>
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

              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-600">
                      Imágenes cargadas ({imagePreviews.length}/5):
                    </p>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Primera = Portada
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => {
                      return (
                        <div key={index} className="relative">
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-contain" />
                          </div>
                          
                          {/* Número de imagen */}
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </div>
                          
                          {/* Etiqueta de portada */}
                          {index === 0 && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              Portada
                            </div>
                          )}
                          
                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = imagePreviews.filter((_, i) => i !== index)
                              setImagePreviews(newPreviews)
                              setFormData((prev) => ({ ...prev, images: newPreviews }))
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="✕ Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
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
