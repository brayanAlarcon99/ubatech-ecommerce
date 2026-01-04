"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  description?: string
  stock?: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  currentStore: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Función para obtener el nombre de la tienda desde el pathname
function getStoreFromPathname(pathname: string | null): string {
  if (!pathname) return "ubatech"
  if (pathname.includes('/djcelutecnico')) return "djcelutecnico"
  if (pathname.includes('/ubatechpro') || pathname.includes('/ubatech')) return "ubatech"
  return "ubatech"
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentStore, setCurrentStore] = useState<string>("ubatech")
  const pathname = usePathname()

  // Detectar la tienda actual
  useEffect(() => {
    const store = getStoreFromPathname(pathname)
    setCurrentStore(store)
  }, [pathname])

  // Cargar carrito del localStorage específico de la tienda
  useEffect(() => {
    const cartKey = `cart_${currentStore}`
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    } else {
      setCart([])
    }
  }, [currentStore])

  // Guardar carrito en localStorage específico de la tienda
  useEffect(() => {
    const cartKey = `cart_${currentStore}`
    localStorage.setItem(cartKey, JSON.stringify(cart))
  }, [cart, currentStore])

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id)
      if (existingItem) {
        return prevCart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prevCart, item]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, currentStore }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider")
  }
  return context
}
