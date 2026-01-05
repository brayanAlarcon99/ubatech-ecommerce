"use client"

import { useStoreInfo } from "@/hooks/use-store-info"
import { usePlatformInfo } from "@/hooks/use-platform-info"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"

export default function Footer({ storeId = 'ubatech', hideAboutUs = false, hideCopyright = false, hideContactInfo = false }: { storeId?: string; hideAboutUs?: boolean; hideCopyright?: boolean; hideContactInfo?: boolean }) {
  const { storeInfo, loading: storeLoading } = useStoreInfo(storeId)
  const { platformInfo } = usePlatformInfo()
  const [mounted, setMounted] = useState(false)

  // Montar componente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Extraer ciudad y país de la dirección
  const address = storeInfo?.address || "ubaté, colombia"
  const addressParts = address.includes(",")
    ? address.split(",").map((part) => part.trim())
    : [address, "Colombia"]
  
  const city = addressParts[0] || "ubaté"
  const country = addressParts[1] || "Colombia"

  const storeName = storeInfo?.name || "Tienda"
  const storeEmail = storeInfo?.email || "info@tienda.com"
  const storePhone = storeInfo?.phone || "+57 3134588107"

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
        {!hideContactInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Columna izquierda: Contacto y Ubicación */}
            <div className="space-y-6 sm:space-y-8">
              {/* Información de contacto */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: "var(--primary-dark)" }}>
                  Contacto
                </h3>
                <div className="space-y-1 sm:space-y-2 text-gray-600 text-xs sm:text-sm">
                  <p className="break-words">
                    <strong>Teléfono:</strong>{" "}
                    <a 
                      href={`tel:${storePhone}`}
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                    >
                      {storePhone}
                    </a>
                  </p>
                  <p className="break-words">
                    <strong>Email:</strong>{" "}
                    <a 
                      href={`mailto:${storeEmail}`}
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors inline-block"
                    >
                      {storeEmail}
                    </a>
                  </p>
                  <p>
                    <strong>Horario:</strong> Lunes - Viernes: 8am - 6pm
                  </p>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300">
                    <Link 
                      href={`/${storeId}/contacto`}
                      className="text-blue-600 hover:underline font-medium text-xs sm:text-sm inline-flex items-center gap-2"
                    >
                      <MessageCircle size={14} className="sm:w-[18px] sm:h-[18px]" />
                      Chatea con nosotros
                    </Link>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: "var(--primary-dark)" }}>
                  Ubicación
                </h3>
                <div className="space-y-1 sm:space-y-2 text-gray-600 text-xs sm:text-sm">
                  <a 
                    href="https://www.google.com/maps/place/Djcelutecnico/@5.3091793,-73.8131533,3a,75y,157.32h,105.82t/data=!3m7!1e1!3m5!1slHSlJIsSDnObsjD4hXK_UA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-15.819999999999993%26panoid%3DlHSlJIsSDnObsjD4hXK_UA%26yaw%3D157.32!7i16384!8i8192!4m17!1m9!3m8!1s0x8e40385c7a9fe659:0x214002c0c575d2!2sCra.+7+%23+9-72,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca!3b1!8m2!3d5.309132!4d-73.813137!10e5!16s%2Fg%2F11m62rzplt!3m6!1s0x8e4039f96bfe3f27:0x32c874342d4b68da!8m2!3d5.3091399!4d-73.8131219!10e5!16s%2Fg%2F11h129n8_7?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
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

            {/* Información adicional - Sobre Nosotros */}
            {!hideAboutUs && (
              <div className="sm:col-span-2 md:col-span-2">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: "var(--primary-dark)" }}>
                  Sobre Nosotros
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {storeInfo?.aboutUs || platformInfo.description || "Somos una tienda especializada en productos tecnológicos innovadores con confianza y seguridad garantizada."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Línea divisoria */}
        {!hideCopyright && (
          <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}
