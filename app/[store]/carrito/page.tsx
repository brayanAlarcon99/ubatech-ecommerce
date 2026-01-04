'use client';

import { useCart } from '@/lib/cart-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { Trash2, ArrowLeft } from 'lucide-react';
import { formatPriceWithCurrency } from '@/lib/format-price';
import { useParams } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const params = useParams();
  const store = params.store as string;

  const getLinkColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009'
    return '#2563eb'
  }

  const getDeleteColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009'
    return '#dc2626'
  }

  const getPrimaryColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009'
    return '#1e3a8a'
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href={`/${store}`}
          className="inline-flex items-center gap-2 mb-6 hover:underline"
          style={{ color: getLinkColor(store) }}
        >
          <ArrowLeft size={18} />
          Volver a tienda
        </Link>

        <h1 className="text-3xl font-bold mb-8" style={{ color: getPrimaryColor(store) }}>
          Tu Carrito de Compras
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <Link
              href={`/${store}`}
              className="inline-block px-6 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: getPrimaryColor(store) }}
            >
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Carrito items */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 flex items-center justify-between bg-white"
                >
                  <div className="flex-1">
                    <h3 className="font-bold mb-1" style={{ color: getPrimaryColor(store) }}>
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{formatPriceWithCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 border-l border-r">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      style={{ color: getDeleteColor(store) }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div
              className="rounded-lg p-6 h-fit sticky top-20"
              style={{ backgroundColor: 'var(--neutral-light)' }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: getPrimaryColor(store) }}>
                Resumen
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatPriceWithCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span className="font-semibold">Gratis</span>
                </div>
                <div
                  className="border-t pt-3 flex justify-between text-lg font-bold"
                  style={{ borderTopColor: getPrimaryColor(store) }}
                >
                  <span>Total:</span>
                  <span style={{ color: 'var(--accent-green)' }}>
                    {formatPriceWithCurrency(total)}
                  </span>
                </div>
              </div>

              <Link
                href={`/${store}/checkout`}
                className="w-full block text-center py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: getPrimaryColor(store) }}
              >
                Continuar con la compra
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer storeId={store} />
    </>
  );
}
