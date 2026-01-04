"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useStoreSettings } from "@/hooks/use-store-settings"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const { cart } = useCart()
  const { settings } = useStoreSettings()
  const router = useRouter()
  const pathname = usePathname()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Detectar tienda desde el pathname
  const getCurrentStore = () => {
    if (pathname.includes('/djcelutecnico')) return 'djcelutecnico'
    if (pathname.includes('/ubatech')) return 'ubatech'
    return 'ubatech' // default
  }

  const currentStore = getCurrentStore()

  const getCartColor = (store: string) => {
    if (store === 'djcelutecnico') return '#a00009'
    return 'var(--accent-cyan)'
  }

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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <Link href={`/${currentStore}`} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Image 
            src={currentStore === 'djcelutecnico' ? "/logo-djcelutecnico.jpg" : "/logo-ubatech.png"} 
            alt={settings.storeName} 
            width={currentStore === 'djcelutecnico' ? 50 : 40} 
            height={currentStore === 'djcelutecnico' ? 50 : 40}
            className="object-contain sm:w-[60px] sm:h-[60px] lg:w-[75px] lg:h-[75px]" 
          />
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-lg font-bold truncate" style={{ color: currentStore === 'djcelutecnico' ? '#000000' : "var(--primary-dark)" }}>
              {currentStore === 'djcelutecnico' ? 'DJCELUTECNICO' : 'Ubatech+Pro'}
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href={pathname?.includes('/carrito') ? pathname : `/${currentStore}/carrito`}
            className="relative flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-colors text-xs sm:text-base"
            style={{
              backgroundColor: getCartColor(currentStore),
              color: "white",
            }}
          >
            <ShoppingCart size={18} className="sm:w-[20px] sm:h-[20px]" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemsCount > 0 && (
              <span
                className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs font-bold text-white rounded-full text-[10px] sm:text-xs"
                style={{ backgroundColor: getCartColor(currentStore) }}
              >
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
