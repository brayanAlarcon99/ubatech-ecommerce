"use client"

import { useStoreInfo } from "@/hooks/use-store-info"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageCircle, Instagram, Facebook, Music } from "lucide-react"

export default function Footer({ storeId = 'ubatech' }: { storeId?: string }) {
  const { storeInfo, loading } = useStoreInfo(storeId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) return null

  const storeName = storeInfo?.name || "Tienda"
  const storeEmail = storeInfo?.email || "info@tienda.com"
  const storePhone = storeInfo?.phone || "+57 3134588107"
  const storeAddress = storeInfo?.address || "Dirección no disponible"
  const mapsUrl = storeInfo?.mapsUrl || "#"
  const businessHours = storeInfo?.businessHours || "Horario no disponible"
  const aboutUs = storeInfo?.aboutUs || "Información de la tienda no disponible"
  const instagram = storeInfo?.instagram || ""
  const facebook = storeInfo?.facebook || ""
  const tiktok = storeInfo?.tiktok || ""

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
        {/* Grid de 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-8">
          
          {/* ==================== COLUMNA 1: CONTACTO ==================== */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--primary-dark)" }}>
              📞 Contacto
            </h3>
            <div className="space-y-3 text-gray-600 text-xs sm:text-sm">
              {/* Teléfono */}
              <div className="flex items-start gap-2">
                <span className="text-lg">☎️</span>
                <div>
                  <p className="font-semibold text-gray-700">Teléfono</p>
                  <a 
                    href={`tel:${storePhone}`}
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors break-words"
                  >
                    {storePhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-semibold text-gray-700">Email</p>
                  <a 
                    href={`mailto:${storeEmail}`}
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors break-words"
                  >
                    {storeEmail}
                  </a>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-2">
                <span className="text-lg">⏰</span>
                <div>
                  <p className="font-semibold text-gray-700">Horario</p>
                  <span>{businessHours}</span>
                </div>
              </div>

              {/* Chatea con nosotros */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <Link 
                  href={`/${storeId}/contacto`}
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-2 hover:text-blue-800 transition-colors"
                >
                  <MessageCircle size={16} />
                  💬 Chatea con nosotros
                </Link>
              </div>
            </div>
          </div>

          {/* ==================== COLUMNA 2: SOBRE NOSOTROS ==================== */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--primary-dark)" }}>
              ℹ️ Sobre Nosotros
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {aboutUs}
            </p>
          </div>

          {/* ==================== COLUMNA 3: UBICACIÓN Y REDES ==================== */}
          <div className="space-y-4">
            {/* Ubicación */}
            <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--primary-dark)" }}>
              📍 Ubicación
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">🏠</span>
                <div>
                  <p className="font-semibold text-gray-700">Dirección</p>
                  <a 
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors text-xs sm:text-sm block"
                  >
                    {storeAddress} →
                  </a>
                </div>
              </div>

              {/* Redes Sociales - Solo si tienen link */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Síguenos en redes</h4>
                <div className="flex gap-3 flex-wrap">
                  {instagram && (
                    <a 
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:text-pink-700 transition-colors"
                      title="Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                  {facebook && (
                    <a 
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {tiktok && (
                    <a 
                      href={tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700 transition-colors"
                      title="TikTok"
                    >
                      <Music size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
