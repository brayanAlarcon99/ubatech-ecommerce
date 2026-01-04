"use client"

import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { useStoreInfo } from "@/hooks/use-store-info"
import { ArrowLeft } from "lucide-react"

export default function SobreNosotrosPage() {
  const params = useParams()
  const storeId = (params.store as string) || "ubatech"
  
  const { storeInfo, loading } = useStoreInfo(storeId)

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Cargando información...</p>
        </div>
        <Footer storeId={storeId} hideAboutUs={true} hideCopyright={true} />
      </>
    )
  }

  if (!storeInfo) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600">Error al cargar la información</p>
        </div>
        <Footer storeId={storeId} hideAboutUs={true} hideCopyright={true} />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            href={`/${storeId}/contacto`}
            className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
          >
            <ArrowLeft size={18} />
            Volver a Contacto
          </Link>
        </div>

        <div className="mb-12">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: storeInfo.primaryColor }}
          >
            Sobre Nosotros - {storeInfo.name}
          </h1>
          <p className="text-gray-600 text-lg">{storeInfo.description}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: storeInfo.primaryColor }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: storeInfo.primaryColor }}>
            Información de la Tienda
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nombre</h3>
              <p className="text-gray-600">{storeInfo.name}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{storeInfo.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dirección</h3>
              <p className="text-gray-600">{storeInfo.address}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Horario de Atención</h3>
              <p className="text-gray-600">{storeInfo.storeHours}</p>
            </div>

            <div className="pt-6 border-t border-gray-300">
              <p className="text-gray-600 italic">
                Para más información, contáctanos directamente a través de nuestro formulario de contacto.
              </p>
              <Link 
                href={`/${storeId}/contacto`}
                className="inline-block mt-4 px-6 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: storeInfo.primaryColor }}
              >
                Ir a Contacto
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer storeId={storeId} hideAboutUs={true} hideCopyright={true} />
    </>
  )
}
