"use client"

import { useEffect, useState } from "react"
import { useStoreInfo } from "@/hooks/use-store-info"

export default function Hero({ storeId = 'ubatech' }: { storeId?: string }) {
  const [mounted, setMounted] = useState(false)
  const { storeInfo, loading } = useStoreInfo(storeId)

  const getBgColor = (store: string) => {
    if (store === 'djcelutecnico') return '#a00009'
    return 'var(--primary-dark)'
  }

  const getTextColor = (store: string) => {
    if (store === 'djcelutecnico') return '#FFFFFF'
    return 'var(--accent-cyan)'
  }

  const getStoreName = (store: string) => {
    if (store === 'djcelutecnico') return 'DJCELUTECNICO'
    return storeInfo?.name || storeInfo?.storeName || 'Tienda'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) return null

  return (
    <section className="py-1 px-4 text-white" style={{ backgroundColor: getBgColor(storeId) }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-0 text-balance">
          Bienvenido a <span style={{ color: getTextColor(storeId) }}>{getStoreName(storeId)}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-full text-balance">
          {storeInfo?.description || 'Descripción de tu tienda'}
        </p>
      </div>
    </section>
  )
}
