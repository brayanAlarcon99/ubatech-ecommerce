"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Product, Subcategory } from "@/types"
import { getSubcategoriesByCategory } from "@/lib/subcategories"
import { getDb } from "@/lib/firebase"
import { getDocs, collection, query, where } from "firebase/firestore"
import { formatPrice, ensureNumberPrice, sanitizePriceInput } from "@/lib/format-price"
import { compressImage, getBase64Size } from "@/lib/image-compression"
import { validateImagesForEdit, getImageSizeInfo } from "@/lib/image-size-validator"
import { getDocumentSizeInfo, cleanDocumentImages, generateDocumentSizeMessage } from "@/lib/firebase-document-cleanup"

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
const MAX_BASE64_SIZE_MB = 0.9; // Dejar margen

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
    minStockByStore: product?.minStockByStore || { djcelutecnico: 0, ubatech: 0 },
    images: initialImages,
    image: product?.image || "", // Mantener por compatibilidad
    sku: product?.sku || "",
    details: product?.details || "",
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages)
  const [imageInputFocus, setImageInputFocus] = useState(false)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageLoadSuccess, setImageLoadSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([])
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null)
  const [imageSizeError, setImageSizeError] = useState<string | null>(null)
  const [documentOversizeError, setDocumentOversizeError] = useState<string | null>(null)
  const [isCleaningDocument, setIsCleaningDocument] = useState(false)

  // Cargar datos de categorías y subcategorías
  useEffect(() => {
    loadCategoriesData()
  }, [])

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

  // Validar tamaño de imágenes cuando cambien
  useEffect(() => {
    if (imagePreviews.length > 0) {
      const validation = validateImagesForEdit(imagePreviews)
      
      if (validation.exceedsLimit) {
        setImageSizeError(validation.errorMessage)
        setImageSizeWarning(null)
      } else if (validation.oversizedImages.length > 0) {
        // Mostrar advertencia si hay imágenes grandes pero no excede el límite
        let warningMsg = `⚠️ **Advertencia: Algunas imágenes son grandes**\n\n`
        warningMsg += `📊 **Tamaño total:** ${validation.totalSizeMB}MB / 1MB\n\n`
        warningMsg += `🖼️ **Imágenes grandes detectadas:**\n`
        validation.oversizedImages.forEach((img) => {
          warningMsg += `• Imagen ${img.index}: ${img.sizeMB}MB (${img.percentage}% del límite)\n`
        })
        warningMsg += `\n💡 Considera cambiar estas imágenes por versiones más pequeñas para mejor rendimiento.`
        setImageSizeWarning(warningMsg)
        setImageSizeError(null)
      } else {
        setImageSizeWarning(null)
        setImageSizeError(null)
      }
    } else {
      setImageSizeWarning(null)
      setImageSizeError(null)
    }
  }, [imagePreviews])

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
    } else if (name.startsWith("minStock_")) {
      const storeId = name.replace("minStock_", "");
      // Primero limpiar ceros iniciales
      let cleanValue = removeLeadingZero(value)
      // Luego convertir a número
      const numValue = cleanValue === "" ? NaN : parseFloat(cleanValue);
      const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue);
      setFormData((prev) => ({
        ...prev,
        minStockByStore: {
          ...prev.minStockByStore,
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
      // Validar tamaño de archivo
      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        const limitMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(2)
        const errorMsg = `⚠️ El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
        setImageError(errorMsg)
        setPasteMessage(null)
        return
      }

      // Verificar cantidad máxima de imágenes (máx 3)
      if (imagePreviews.length >= 3) {
        setImageError("⚠️ Máximo 3 imágenes permitidas por producto")
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          let result = event.target?.result as string
          
          // Comprimir imagen si es necesario
          if (getBase64Size(result) > MAX_BASE64_SIZE_MB) {
            console.log("Comprimiendo imagen...")
            result = await compressImage(result)
          }
          
          setImagePreviews((prev) => [...prev, result])
          setFormData((prev) => ({ 
            ...prev, 
            images: [...(prev.images || []), result]
          }))
          setImageError(null)
          setImageLoadSuccess(true)
          setPasteMessage(null)
          setTimeout(() => setImageLoadSuccess(false), 3000)
        } catch (error) {
          console.error("Error comprimiendo imagen:", error)
          setImageError("❌ Error al procesar la imagen. Intenta con otra.")
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
        const file = items[i].getAsFile()
        if (file) {
          // Validar tamaño de archivo
          if (file.size > MAX_IMAGE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            const limitMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(2)
            const errorMsg = `⚠️ El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
            setImageError(errorMsg)
            setPasteMessage(null)
            return
          }

          // Verificar cantidad máxima de imágenes (máx 3)
          if (imagePreviews.length >= 3) {
            setImageError("⚠️ Máximo 3 imágenes permitidas por producto")
            return
          }

          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              let result = event.target?.result as string
              
              // Comprimir imagen si es necesario
              if (getBase64Size(result) > MAX_BASE64_SIZE_MB) {
                console.log("Comprimiendo imagen pegada...")
                result = await compressImage(result)
              }
              
              setImagePreviews((prev) => [...prev, result])
              setFormData((prev) => ({ 
                ...prev, 
                images: [...(prev.images || []), result]
              }))
              setPasteMessage("✓ Imagen pegada correctamente")
              setImageError(null)
              setImageLoadSuccess(true)
              setTimeout(() => {
                setPasteMessage(null)
                setImageLoadSuccess(false)
              }, 3000)
            } catch (error) {
              console.error("Error al procesar imagen pegada:", error)
              setImageError("❌ Error al procesar la imagen pegada. Intenta con otra.")
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
    setDocumentOversizeError(null)
    try {
      // Validación de imágenes con el nuevo validador de seguridad
      if (imagePreviews.length > 0) {
        const validation = validateImagesForEdit(imagePreviews)
        
        // Si excede el límite, mostrar error detallado
        if (validation.exceedsLimit) {
          setSaveError(validation.errorMessage)
          setLoading(false)
          return
        }

        // Validación adicional por imagen individual
        for (let i = 0; i < imagePreviews.length; i++) {
          const sizeInfo = getImageSizeInfo(imagePreviews[i])
          
          if (sizeInfo.isOversized) {
            setSaveError(
              `⚠️ La imagen ${i + 1} supera el límite máximo permitido (1MB). ` +
              `Tamaño actual: ${sizeInfo.sizeMB.toFixed(2)}MB. ` +
              `Por favor, selecciona una imagen más pequeña o de menor resolución.`
            )
            setLoading(false)
            return
          }
        }
      }

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
        minStockByStore: {
          djcelutecnico: Math.floor(formData.minStockByStore?.djcelutecnico || 0),
          ubatech: Math.floor(formData.minStockByStore?.ubatech || 0),
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
      
      // Detectar error de tamaño de documento de Firebase
      if (
        errorMsg.includes("exceeds the maximum allowed size") ||
        errorMsg.includes("1048576") ||
        errorMsg.includes("1048487")
      ) {
        // Este es el error que estamos viendo - documento oversized
        setDocumentOversizeError(
          "🚨 DOCUMENTO OVERSIZED\n\n" +
          "El producto tiene imágenes demasiado grandes y no se puede guardar.\n\n" +
          "Haz clic en 'Limpiar Imágenes Antiguas' para remover las imágenes " +
          "que ocupan demasiado espacio. Luego podrás guardar los cambios.\n\n" +
          "Después puedes cargar imágenes nuevas más pequeñas."
        )
        console.error("[ProductForm] Document oversize error:", errorMsg)
      } else if (errorMsg.includes("image") || errorMsg.includes("longer than")) {
        setSaveError(`⚠️ Error al guardar: Una imagen supera el límite máximo permitido (1MB). Por favor, usa imágenes más pequeñas.`)
        console.error("[ProductForm] Image size error:", errorMsg)
      } else {
        setSaveError(`Error al guardar el producto: ${errorMsg}`)
        console.error("[ProductForm] Save error:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar imágenes de un documento oversized
  async function handleCleanDocumentImages() {
    if (!product?.id) return

    setIsCleaningDocument(true)
    try {
      await cleanDocumentImages("products", product.id)
      
      // Limpiar las imágenes locales también
      setImagePreviews([])
      setFormData((prev) => ({
        ...prev,
        images: [],
        image: "",
      }))
      setDocumentOversizeError(null)
      setSaveError("✅ Imágenes antiguas eliminadas. Ahora puedes guardar los cambios.")
    } catch (error) {
      console.error("[ProductForm] Error cleaning document:", error)
      setSaveError(`Error al limpiar las imágenes: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsCleaningDocument(false)
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
                  Stock por tienda
                </label>
                <div className="flex flex-col gap-4">
                  {/* DJCELUTECNICO */}
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">DJCELUTECNICO</span>
                      <span className="text-xs text-gray-500">Stock actual: {formData.stock.djcelutecnico || 0}</span>
                    </div>
                    
                    {/* Stock actual */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-600 font-medium block mb-1">Stock Actual</label>
                      <input
                        type="number"
                        name="stock_djcelutecnico"
                        value={formData.stock.djcelutecnico}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                        placeholder="0"
                      />
                    </div>

                    {/* Stock mínimo */}
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-1">Stock Mínimo ⚠️</label>
                      <input
                        type="number"
                        name="minStock_djcelutecnico"
                        value={formData.minStockByStore?.djcelutecnico}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cantidad mínima de productos que debe haber en esta tienda</p>
                    </div>
                  </div>

                  {/* UBATECH */}
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Ubatech+Pro</span>
                      <span className="text-xs text-gray-500">Stock actual: {formData.stock.ubatech || 0}</span>
                    </div>
                    
                    {/* Stock actual */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-600 font-medium block mb-1">Stock Actual</label>
                      <input
                        type="number"
                        name="stock_ubatech"
                        value={formData.stock.ubatech}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                        placeholder="0"
                      />
                    </div>

                    {/* Stock mínimo */}
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-1">Stock Mínimo ⚠️</label>
                      <input
                        type="number"
                        name="minStock_ubatech"
                        value={formData.minStockByStore?.ubatech}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cantidad mínima de productos que debe haber en esta tienda</p>
                    </div>
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
                      const errorMsg = `⚠️ El archivo es demasiado grande (${sizeMB}MB). El límite máximo es ${limitMB}MB. Selecciona una imagen más pequeña o de menor resolución.`
                      setImageError(errorMsg)
                      setPasteMessage(null)
                      return
                    }

                    // Verificar cantidad máxima de imágenes (máx 3)
                    if (imagePreviews.length >= 3) {
                      setImageError("⚠️ Máximo 3 imágenes permitidas por producto")
                      return
                    }

                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = event.target?.result as string
                      setImagePreviews((prev) => [...prev, result])
                      setFormData((prev) => ({ 
                        ...prev, 
                        images: [...(prev.images || []), result]
                      }))
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
                    Máximo 3 imágenes. También puedes pegar con <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd>
                  </p>
                  {imagePreviews.length > 0 && (
                    <p className="text-xs text-blue-600 font-semibold mb-3">
                      {imagePreviews.length}/3 imágenes cargadas
                    </p>
                  )}
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

              {imageSizeError && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-lg space-y-2">
                  <div className="text-sm font-bold">🚨 ERROR DE SEGURIDAD - Límite de Firebase Excedido</div>
                  <div className="text-sm whitespace-pre-line" style={{ whiteSpace: "pre-wrap" }}>
                    {imageSizeError}
                  </div>
                </div>
              )}

              {imageSizeWarning && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 rounded-lg space-y-2">
                  <div className="text-sm font-bold">⚠️ ADVERTENCIA - Imágenes Grandes Detectadas</div>
                  <div className="text-sm whitespace-pre-line" style={{ whiteSpace: "pre-wrap" }}>
                    {imageSizeWarning}
                  </div>
                </div>
              )}

              {documentOversizeError && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-600 text-red-800 rounded-lg space-y-3">
                  <div className="text-sm font-bold">🚨 DOCUMENTO OVERSIZED - No puede guardar</div>
                  <div className="text-sm whitespace-pre-line" style={{ whiteSpace: "pre-wrap" }}>
                    {documentOversizeError}
                  </div>
                  <button
                    type="button"
                    onClick={handleCleanDocumentImages}
                    disabled={isCleaningDocument || loading}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isCleaningDocument ? "🔄 Limpiando..." : "🗑️ Limpiar Imágenes Antiguas"}
                  </button>
                  <p className="text-xs text-red-700 mt-2">
                    Esto removará todas las imágenes antigas que ocupan demasiado espacio.
                    Después podrás guardar los cambios y cargar nuevas imágenes más pequeñas.
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

              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-600">
                      Imágenes cargadas ({imagePreviews.length}/3):
                    </p>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Primera = Portada
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => {
                      const sizeInfo = getImageSizeInfo(preview)
                      const isLarge = sizeInfo.percentage > 80
                      
                      return (
                        <div key={index} className="relative">
                          <div className={`w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 ${
                            isLarge ? 'border-orange-400' : 'border-gray-200'
                          }`}>
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
                          
                          {/* Información de tamaño */}
                          <div className={`absolute bottom-1 left-1 right-1 text-xs font-semibold px-2 py-1 rounded text-center ${
                            sizeInfo.isOversized 
                              ? 'bg-red-500 text-white' 
                              : isLarge 
                              ? 'bg-orange-400 text-white' 
                              : 'bg-gray-800 text-white opacity-75'
                          }`}>
                            {sizeInfo.sizeMB.toFixed(2)}MB ({sizeInfo.percentage.toFixed(0)}%)
                          </div>
                          
                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = imagePreviews.filter((_, i) => i !== index)
                              setImagePreviews(newPreviews)
                              setFormData((prev) => ({ ...prev, images: newPreviews }))
                              setImageError(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            title={sizeInfo.isOversized ? '🗑️ ELIMINA esta imagen' : '✕ Eliminar'}
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
