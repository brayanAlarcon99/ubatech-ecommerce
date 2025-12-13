"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useStoreSettings } from "@/hooks/use-store-settings"
import { useState, useEffect } from "react"

export default function Header() {
  const { cart } = useCart()
  const { settings } = useStoreSettings()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Mostrar header si estamos en el top (primeros 10px)
      if (currentScrollY < 10) {
        setIsVisible(true)
      } 
      // Ocultar header si scroll hacia abajo
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } 
      // Mostrar header si scroll hacia arriba
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-transform duration-300"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-ubatech.png" alt={settings.storeName} width={40} height={40} className="object-contain" />
          <div className="hidden md:block">
            <h1 className="text-lg font-bold" style={{ color: "var(--primary-dark)" }}>
              {settings.storeName}
            </h1>
            <p className="text-xs" style={{ color: "var(--accent-turquoise)" }}>
              Confianza & Seguridad
            </p>
          </div>
        </Link>

        <Link
          href="/carrito"
          className="relative flex items-center gap-2 p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--accent-cyan)",
            color: "white",
          }}
        >
          <ShoppingCart size={20} />
          <span className="hidden md:inline">Carrito</span>
          {cartItemsCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: "var(--destructive)" }}
            >
              {cartItemsCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
