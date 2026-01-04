"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useStoreInfo } from "@/hooks/use-store-info"
import { formatPhoneForWhatsapp } from "@/lib/format-price"
import { getStoreMapUrl } from "@/lib/store-maps-url"

export default function ContactoPage() {
  const params = useParams()
  const storeId = (params.store as string) || "ubatech"
  
  const { storeInfo, loading } = useStoreInfo(storeId)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prevenir hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      setError("Por favor completa todos los campos")
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          store: storeId,
          storeEmail: storeInfo?.email || "",
          storeName: storeInfo?.name || "",
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: "", email: "", message: "" })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError("Error al enviar el mensaje. Intenta nuevamente.")
      }
    } catch {
      setError("Error al enviar el mensaje. Intenta nuevamente.")
    } finally {
      setFormLoading(false)
    }
  }

  const getMapUrl = () => {
    return "https://www.google.com/maps/place/Djcelutecnico/@5.3091793,-73.8131533,3a,75y,156.25h,105.82t/data=!3m7!1e1!3m5!1slHSlJIsSDnObsjD4hXK_UA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-15.822523369224058%26panoid%3DlHSlJIsSDnObsjD4hXK_UA%26yaw%3D156.2514180955918!7i16384!8i8192!4m16!1m9!3m8!1s0x8e40385c7a9fe659:0x214002c0c575d2!2sCra.+7+%23+9-72,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca!3b1!8m2!3d5.309132!4d-73.813137!10e5!16s%2Fg%2F11m62rzplt!3m5!1s0x8e4039f96bfe3f27:0x32c874342d4b68da!8m2!3d5.3091399!4d-73.8131219!16s%2Fg%2F11h129n8_7?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
  }

  const handleWhatsappClick = () => {
    if (storeInfo?.phone) {
      const phoneFormatted = formatPhoneForWhatsapp(storeInfo.phone)
      const message = encodeURIComponent(
        `Hola, quisiera consultar sobre los productos de ${storeInfo.name}`
      )
      window.open(
        `https://wa.me/${phoneFormatted}?text=${message}`,
        "_blank"
      )
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Cargando información de contacto...</p>
        </div>
        <Footer storeId={storeId} />
      </>
    )
  }

  if (!storeInfo) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-600">Error al cargar la información de contacto</p>
        </div>
        <Footer storeId={storeId} />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: storeInfo.primaryColor }}
          >
            Contacto - {storeInfo.name}
          </h1>
          <p className="text-gray-600 text-lg mb-4">{storeInfo.description}</p>
          <Link 
            href={`/${storeId}/sobre-nosotros`}
            className="inline-block text-blue-600 hover:underline font-semibold"
          >
            Ver "Sobre Nosotros" →
          </Link>
        </div>

        {mounted && (
        <div className="grid md:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: storeInfo.primaryColor }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: storeInfo.primaryColor }}>
                Información de Contacto
              </h2>

              {/* Email */}
              <div className="mb-6 flex items-start gap-4">
                <Mail 
                  size={24} 
                  className="mt-1 flex-shrink-0"
                  style={{ color: storeInfo.primaryColor }}
                />
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <a 
                    href={`mailto:${storeInfo.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {storeInfo.email}
                  </a>
                </div>
              </div>

              {/* Teléfono */}
              <div className="mb-6 flex items-start gap-4">
                <Phone 
                  size={24} 
                  className="mt-1 flex-shrink-0"
                  style={{ color: storeInfo.primaryColor }}
                />
                <div>
                  <p className="font-semibold text-gray-800">Teléfono</p>
                  <a 
                    href={`tel:${storeInfo.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {storeInfo.phone}
                  </a>
                  <button
                    onClick={handleWhatsappClick}
                    className="ml-4 px-4 py-2 rounded-lg text-white transition-colors text-sm"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-4">
                <MapPin 
                  size={24} 
                  className="mt-1 flex-shrink-0"
                  style={{ color: storeInfo.primaryColor }}
                />
                <div>
                  <p className="font-semibold text-gray-800">Dirección</p>
                  <a
                    href={getMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {storeInfo.address}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white p-8 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: storeInfo.primaryColor }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: storeInfo.primaryColor }}>
              Enviar Mensaje
            </h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                ✓ Mensaje enviado correctamente. Nos pondremos en contacto pronto.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ "--tw-ring-color": storeInfo.primaryColor } as React.CSSProperties}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ "--tw-ring-color": storeInfo.primaryColor } as React.CSSProperties}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none bg-white text-black"
                  style={{ "--tw-ring-color": storeInfo.primaryColor } as React.CSSProperties}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-6 py-3 rounded-lg text-white font-semibold transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: storeInfo.primaryColor }}
              >
                <Send size={18} />
                {formLoading ? "Enviando..." : "Enviar Mensaje"}
              </button>
            </form>
          </div>
        </div>
        )}
      </main>
      <Footer storeId={storeId} hideAboutUs={true} hideCopyright={true} hideContactInfo={true} />
    </>
  )
}
