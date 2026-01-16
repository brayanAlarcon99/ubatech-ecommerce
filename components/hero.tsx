"use client"

import { useEffect, useState, useMemo } from "react"
import { useStoreInfo } from "@/hooks/use-store-info"
import { getStoreConfig } from "@/lib/config/constants"

interface HeroProps {
  storeId?: string
}

export default function Hero({ storeId = 'ubatech' }: HeroProps) {
  const [mounted, setMounted] = useState(false)
  
  // Usa la configuración por defecto mientras se carga desde Firestore
  const defaultConfig = useMemo(() => getStoreConfig(storeId), [storeId])
  const { storeInfo, loading } = useStoreInfo(storeId)

  // Usa storeInfo si está disponible, sino usa la configuración por defecto
  const store = useMemo(() => storeInfo || defaultConfig, [storeInfo, defaultConfig])

  const getBgColor = (storeSlug: string): string => {
    if (storeSlug === 'djcelutecnico') return '#a00009'
    return 'var(--primary-dark)'
  }

  const getTextColor = (storeSlug: string): string => {
    if (storeSlug === 'djcelutecnico') return '#FFFFFF'
    return 'var(--accent-cyan)'
  }

  const getStoreName = (storeSlug: string): string => {
    if (storeSlug === 'djcelutecnico') return 'DJCELUTECNICO'
    return store?.name || 'Tienda'
  }

  const getStoreDescription = (): string => {
    return store?.description || 'Descripción de tu tienda'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section 
      className="py-1 px-4 text-white" 
      style={{ backgroundColor: getBgColor(storeId) }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-0 text-balance">
          Bienvenido a <span style={{ color: getTextColor(storeId) }}>{getStoreName(storeId)}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-full text-balance">
          {getStoreDescription()}
        </p>
      </div>
    </section>
  )
}
