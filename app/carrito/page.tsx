"use client"

import { useCart } from "@/lib/cart-context"
import Header from "@/components/header"
import Link from "next/link"
import { Trash2, ArrowLeft } from "lucide-react"
import { formatPriceWithCurrency } from "@/lib/format-price"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart()

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-blue-600 hover:underline text-sm sm:text-base">
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          Volver a tienda
        </Link>

        <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ color: "var(--primary)" }}>
          Tu Carrito de Compras
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Tu carrito está vacío</p>
            <Link
              href="/"
              className="inline-block px-4 sm:px-6 py-2 rounded-lg text-white transition-colors text-sm sm:text-base"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Carrito items */}
            <div className="md:col-span-2 space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1 text-sm sm:text-base truncate" style={{ color: "var(--primary)" }}>
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{formatPriceWithCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center border rounded-lg text-xs sm:text-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-2 sm:px-4 py-1 sm:py-2 border-l border-r">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 sm:px-3 py-1 sm:py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="rounded-lg p-4 sm:p-6 h-fit sticky top-20" style={{ backgroundColor: "var(--neutral-light)" }}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: "var(--primary)" }}>
                Resumen
              </h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-xs sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatPriceWithCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span className="font-semibold">Gratis</span>
                </div>
                <div
                  className="border-t pt-2 sm:pt-3 flex justify-between font-bold text-sm sm:text-lg"
                  style={{ borderTopColor: "var(--primary)" }}
                >
                  <span>Total:</span>
                  <span style={{ color: "var(--accent-green)" }}>{formatPriceWithCurrency(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full block text-center py-2 sm:py-3 rounded-lg font-semibold text-white transition-colors text-sm sm:text-base"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Continuar con la compra
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
