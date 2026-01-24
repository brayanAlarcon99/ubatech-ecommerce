"use client"

import { useState, useEffect, useRef } from "react"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import type { Product } from "@/types"
import { useCart } from "@/lib/cart-context"
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { formatPriceWithCurrency } from "@/lib/format-price"
import ImageRotator from "@/components/image-rotator"

interface ProductCardProps {
  product: Product
  storeId?: string
}

function ProductCard({ product, storeId = "djcelutecnico" }: ProductCardProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [categoryName, setCategoryName] = useState<string>("")
  const [subcategoryName, setSubcategoryName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [liveStock, setLiveStock] = useState<number>(product.stock?.[storeId] ?? 0)
  const { addToCart } = useCart()

  useEffect(() => {
    if (product.category) {
      loadCategoryAndSubcategory()
    }
  }, [product.category, product.subcategory])

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showModal])

  useEffect(() => {
    loadLiveStock()
    const interval = setInterval(() => {
      loadLiveStock()
    }, 3000) // Sincronizar cada 3 segundos
    return () => clearInterval(interval)
  }, [product.id, storeId])

  const loadLiveStock = async () => {
    try {
      const db = getDb()
      const productRef = doc(db, "products", product.id)
      const productSnap = await getDoc(productRef)
      if (productSnap.exists()) {
        const data = productSnap.data() as Product
        setLiveStock(data.stock?.[storeId] ?? 0)
      }
    } catch (error) {
      console.error("Error loading live stock:", error)
    }
  }

  const loadCategoryAndSubcategory = async () => {
    setLoading(true)
    try {
      const db = getDb()

      if (product.category) {
        const categoryRef = doc(db, "categories", product.category)
        const categorySnap = await getDoc(categoryRef)
        if (categorySnap.exists()) {
          setCategoryName(categorySnap.data().name || product.category)
        } else {
          setCategoryName(product.category)
        }
      }

      if (product.subcategory) {
        const subcategoryRef = doc(db, "subcategories", product.subcategory)
        const subcategorySnap = await getDoc(subcategoryRef)
        if (subcategorySnap.exists()) {
          setSubcategoryName(subcategorySnap.data().name || "")
        } else {
          setSubcategoryName(product.subcategory || "")
        }
      } else {
        setSubcategoryName(product.subcategory || "")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    setQuantity(1)
  }

  const getDiscountPercentage = () => {
    if (product.discountedPrice && product.discountedPrice > 0 && product.price > product.discountedPrice) {
      const discount = ((product.price - product.discountedPrice) / product.price) * 100
      return Math.ceil(discount)
    }
    return 0
  }

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-300 flex flex-col h-full"
        style={{ backgroundColor: '#fff' }}
      >
        {/* Mostrar portada (primera imagen) o imagen antigua */}
        {product.images && product.images.length > 0 && product.images[0] ? (
          <div className="w-full h-24 sm:h-40 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform p-1"
              onError={(e) => {
                console.error("Error loading product image:", product.images?.[0], e)
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        ) : product.image ? (
          <div className="w-full h-24 sm:h-40 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform p-1"
              onError={(e) => {
                console.error("Error loading fallback image:", product.image, e)
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        ) : (
          <div
            className="w-full h-24 sm:h-40 flex items-center justify-center text-white font-bold text-2xl sm:text-4xl flex-shrink-0"
            style={{ backgroundColor: "var(--accent-turquoise)" }}
          >
            {product.name.charAt(0)}
          </div>
        )}

        <div className="p-2 sm:p-3 flex-grow flex flex-col" style={{ backgroundColor: '#fff' }}>
          <h3 className="font-bold text-xs sm:text-sm line-clamp-2" style={{ color: "var(--primary-dark)" }}>
            {product.name}
          </h3>

          {product.details && (
            <div className="text-[10px] sm:text-xs text-gray-700 mt-1 font-medium line-clamp-1">
              {product.details}
            </div>
          )}

          <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 flex-grow">
            {product.description || "Sin descripción"}
          </div>

          <div className="text-[9px] sm:text-xs text-gray-600 mt-1 line-clamp-1">
            {categoryName || product.category}
            {subcategoryName && ` - ${subcategoryName}`}
          </div>

          <div className="flex items-center justify-between mt-1 sm:mt-2 gap-2">
            <div className="flex flex-col">
              {getDiscountPercentage() > 0 && (
                <span className="text-[8px] sm:text-xs text-gray-500 line-through">
                  {formatPriceWithCurrency(product.price)}
                </span>
              )}
              <span className="text-sm sm:text-lg font-bold" style={{ color: "var(--accent-green)" }}>
                {getDiscountPercentage() > 0 ? formatPriceWithCurrency(product.discountedPrice!) : formatPriceWithCurrency(product.price)}
              </span>
            </div>
            {getDiscountPercentage() > 0 && (
              <span className="text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full" style={{ backgroundColor: "var(--accent-cyan)" }}>
                -{getDiscountPercentage()}%
              </span>
            )}
          </div>

          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-200">
            {liveStock > 0 ? (
              <span className="text-[9px] sm:text-xs font-semibold" style={{ color: "var(--accent-green)" }}>
                Disponible: {liveStock}
              </span>
            ) : (
              <span className="text-[9px] sm:text-xs font-semibold text-red-600">
                Agotado
              </span>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div ref={modalRef} className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#fff' }}>
            <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg sm:text-2xl font-bold" style={{ color: "var(--primary-dark)" }}>
                Detalles del Producto
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="sm:w-[24px] sm:h-[24px]" />
              </button>
            </div>

            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center justify-center bg-white rounded-lg p-4" style={{ backgroundColor: '#fff' }}>
                  {/* Mostrar ImageRotator si hay múltiples imágenes, sino mostrar imagen única */}
                  {product.images && product.images.length > 0 && product.images.some(img => img && img.length > 0) ? (
                    <div className="w-full h-64 sm:h-80">
                      <ImageRotator
                        images={product.images}
                        title={product.name}
                        autoRotate={true}
                        rotationDelay={2000}
                      />
                    </div>
                  ) : product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        console.error("Error loading image in modal:", product.image, e)
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-40 sm:h-64 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl rounded-lg"
                      style={{ backgroundColor: "var(--accent-turquoise)" }}
                    >
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-xl sm:text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
                      {product.name}
                    </h3>
                  </div>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <textarea
                      value={product.description}
                      readOnly
                      className="w-full h-24 sm:h-40 p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black bg-white text-xs sm:text-sm"
                      style={{ borderColor: "var(--primary)" }}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="text-gray-700 font-semibold text-sm">Categoría:</span>
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white w-fit" style={{ backgroundColor: "var(--primary-dark)" }}>
                        {loading ? "Cargando..." : categoryName || product.category}
                      </span>
                    </div>
                    {product.subcategory && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                        <span className="text-gray-700 font-semibold text-sm">Marca:</span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white w-fit" style={{ backgroundColor: "var(--primary)" }}>
                          {loading ? "Cargando..." : subcategoryName || product.subcategory}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="text-gray-700 font-semibold text-sm">Precio:</span>
                      <div className="flex flex-col items-end gap-1">
                        {getDiscountPercentage() > 0 && (
                          <>
                            <span className="text-sm sm:text-base text-gray-500 line-through">
                              {formatPriceWithCurrency(product.price)}
                            </span>
                            <span className="text-xl sm:text-3xl font-bold" style={{ color: "var(--accent-green)" }}>
                              {formatPriceWithCurrency(product.discountedPrice!)}
                            </span>
                            <span className="text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "var(--accent-cyan)" }}>
                              -{getDiscountPercentage()}% de descuento
                            </span>
                          </>
                        )}
                        {getDiscountPercentage() === 0 && (
                          <span className="text-xl sm:text-3xl font-bold" style={{ color: "var(--accent-green)" }}>
                            {formatPriceWithCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-700 font-semibold text-sm">Stock disponible:</span>
                      <span className="text-base sm:text-lg font-bold" style={{ color: liveStock > 0 ? "var(--accent-green)" : "#ef4444" }}>
                        {liveStock > 0 ? `${liveStock} unidades` : "Agotado"}
                      </span>
                    </div>
                  </div>

                  {liveStock > 0 && (
                    <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                          <Minus size={14} className="sm:w-[16px] sm:h-[16px]" />
                        </button>
                        <span className="flex-1 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(liveStock, quantity + 1))}
                          className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                          <Plus size={14} className="sm:w-[16px] sm:h-[16px]" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          handleAddToCart()
                          setShowModal(false)
                        }}
                        className="w-full py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-white hover:opacity-90 text-sm sm:text-base"
                        style={{ backgroundColor: "var(--accent-cyan)" }}
                      >
                        <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Agregar al carrito
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductCard;
