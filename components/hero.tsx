"use client"

import { useEffect, useState } from "react"
import { useStoreSettings } from "@/hooks/use-store-settings"

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const { settings } = useStoreSettings()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="py-1 px-4 text-white" style={{ backgroundColor: "var(--primary-dark)" }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-0 text-balance">
          Bienvenido a <span style={{ color: "var(--accent-cyan)" }}>{settings.storeName}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-full text-balance">
          {settings.description}
        </p>
      </div>
    </section>
  )
}
