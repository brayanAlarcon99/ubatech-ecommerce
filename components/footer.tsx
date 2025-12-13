"use client"

import { useStoreSettings } from "@/hooks/use-store-settings"
import { usePlatformInfo } from "@/hooks/use-platform-info"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"

export default function Footer() {
  const { settings } = useStoreSettings()
  const { platformInfo } = usePlatformInfo()
  const [mounted, setMounted] = useState(false)

  // Montar componente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Extraer ciudad y país de la dirección
  // Si la dirección contiene coma, divide por coma; si no, usa valores por defecto
  const addressParts = settings.storeAddress.includes(",")
    ? settings.storeAddress.split(",").map((part) => part.trim())
    : [settings.storeAddress, "Colombia"]
  
  const city = addressParts[0] || "Bogotá"
  const country = addressParts[1] || "Colombia"

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna izquierda: Contacto y Ubicación */}
          <div className="space-y-8">
            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--primary-dark)" }}>
                Contacto
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>
                  <strong>Teléfono:</strong>{" "}
                  <a 
                    href={`tel:${settings.storePhone}`}
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                  >
                    {settings.storePhone}
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a 
                    href={`mailto:${settings.storeEmail}`}
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                  >
                    {settings.storeEmail}
                  </a>
                </p>
                <p>
                  <strong>Horario:</strong> {settings.storeHours}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <Link 
                    href="/contactenos"
                    className="text-blue-600 hover:underline font-medium text-sm inline-flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Chatea con nosotros
                  </Link>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--primary-dark)" }}>
                Ubicación
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <a 
                  href="https://www.google.com/maps/search/Cl.+10+%23+7-39,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca+855P%2BRP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline hover:text-blue-800 transition-colors hover:cursor-pointer block"
                >
                  <p>{city}</p>
                  <p>{country}</p>
                </a>
              </div>
            </div>
          </div>

          {/* Información adicional - Sobre Nosotros (2 columnas) */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4 text-center" style={{ color: "var(--primary-dark)" }}>
              Sobre Nosotros
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {platformInfo.description || "Somos una tienda especializada en productos tecnológicos innovadores con confianza y seguridad garantizada."}
            </p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
