"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import type { Product } from "@/types"
import { useCart } from "@/lib/cart-context"
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { formatPriceWithCurrency } from "@/lib/format-price"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [categoryName, setCategoryName] = useState<string>("")
  const [subcategoryName, setSubcategoryName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  // Cargar nombres de categoría y subcategoría
  useEffect(() => {
    if (product.category) {
      loadCategoryAndSubcategory()
    }
  }, [product.category, product.subcategory])

  const loadCategoryAndSubcategory = async () => {
    setLoading(true)
    try {
      const db = getDb()

      // Cargar categoría
      if (product.category) {
        const categoryRef = doc(db, "categories", product.category)
        const categorySnap = await getDoc(categoryRef)
        if (categorySnap.exists()) {
          setCategoryName(categorySnap.data().name || product.category)
        } else {
          setCategoryName(product.category)
        }
      }

      // Cargar subcategoría
      if (product.subcategory) {
        const subcategoryRef = doc(db, "subcategories", product.subcategory)
        const subcategorySnap = await getDoc(subcategoryRef)
        if (subcategorySnap.exists()) {
          setSubcategoryName(subcategorySnap.data().name || product.subcategory)
        } else {
          setSubcategoryName(product.subcategory)
        }
      }
    } catch (error) {
      console.error("Error cargando categoría/subcategoría:", error)
      setCategoryName(product.category)
      setSubcategoryName(product.subcategory || "")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    setQuantity(1)
  }

  return (
    <>
      {/* Tarjeta simplificada - Solo nombre y precio */}
      <div
        onClick={() => setShowModal(true)}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-300 flex flex-col h-full"
      >
        {/* Imagen del producto */}
        {product.image ? (
          <div className="w-full h-24 sm:h-40 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform p-1"
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

        <div className="p-2 sm:p-3 flex-grow flex flex-col">
          {/* Nombre del producto */}
          <h3 className="font-bold text-xs sm:text-sm line-clamp-2" style={{ color: "var(--primary-dark)" }}>
            {product.name}
          </h3>

          {/* Detalles Adicionales */}
          {product.details && (
            <div className="text-[10px] sm:text-xs text-gray-700 mt-1 font-medium line-clamp-1">
              {product.details}
            </div>
          )}

          {/* Detalle (descripción) */}
          <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 flex-grow">
            {product.description || "Sin descripción"}
          </div>

          {/* Categoría */}
          <div className="text-[9px] sm:text-xs text-gray-600 mt-1 line-clamp-1">
            {categoryName || product.category}
            {subcategoryName && ` - ${subcategoryName}`}
          </div>

          {/* Valor (precio) */}
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-sm sm:text-lg font-bold" style={{ color: "var(--accent-green)" }}>
              {formatPriceWithCurrency(product.price)}
            </span>
          </div>

          {/* Stock */}
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-200">
            {product.stock > 0 ? (
              <span className="text-[9px] sm:text-xs font-semibold" style={{ color: "var(--accent-green)" }}>
                Disponible
              </span>
            ) : (
              <span className="text-[9px] sm:text-xs font-semibold text-red-600">
                Agotado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal con información completa del producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
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

            {/* Contenido del modal */}
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Imagen */}
                <div className="flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full h-auto rounded-lg"
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

                {/* Información */}
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
                        <span className="text-gray-700 font-semibold text-sm">Subcategoría:</span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white w-fit" style={{ backgroundColor: "var(--primary)" }}>
                          {loading ? "Cargando..." : subcategoryName || product.subcategory}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="text-gray-700 font-semibold text-sm">Precio:</span>
                      <span className="text-xl sm:text-3xl font-bold" style={{ color: "var(--accent-green)" }}>
                        {formatPriceWithCurrency(product.price)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-700 font-semibold text-sm">Stock disponible:</span>
                      <span className="text-base sm:text-lg font-bold" style={{ color: product.stock > 0 ? "var(--accent-green)" : "#ef4444" }}>
                        {product.stock > 0 ? `${product.stock} unidades` : "Agotado"}
                      </span>
                    </div>
                  </div>

                  {/* Selector de cantidad y botón agregar */}
                  {product.stock > 0 && (
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
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
