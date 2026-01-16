"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin } from "lucide-react"
import { useStoreInfo } from "@/hooks/use-store-info"
import { formatPhoneForWhatsapp } from "@/lib/format-price"

export default function ContactenosPage() {
  const { storeInfo, loading } = useStoreInfo("ubatech")
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
      // Crear mensaje para WhatsApp con formato elegante
      const whatsappMessage = encodeURIComponent(
        `*Consulta de ${formData.name}*\n\n📧 Email: ${formData.email}\n\n💬 Mensaje:\n${formData.message}\n\n_Enviado desde ${storeInfo?.name}_`
      )
      const phoneFormatted = formatPhoneForWhatsapp(storeInfo?.phone || "")
      
      // Abrir WhatsApp con el mensaje
      window.open(
        `https://wa.me/${phoneFormatted}?text=${whatsappMessage}`,
        "_blank"
      )

      setSubmitted(true)
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      setError("Error al enviar el mensaje. Intenta nuevamente.")
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Encabezado */}
          <div className="mb-12 text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: "var(--primary)" }}
            >
              Contáctanos
            </h1>
            <p className="text-gray-600 text-lg">
              Estamos aquí para ayudarte. ¿Tienes preguntas o sugerencias? Nos
              encantaría escucharte.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {mounted && (
              <>
            {/* Información de contacto directo */}
            <div className="rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <Mail
                  size={32}
                  style={{ color: "var(--accent-green)" }}
                />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--primary)" }}>
                Email
              </h3>
              <a
                href={`mailto:${storeInfo?.email}`}
                className="text-gray-600 hover:underline break-all"
              >
                {storeInfo?.email}
              </a>
            </div>

            <div className="rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <Phone
                  size={32}
                  style={{ color: "var(--accent-turquoise)" }}
                />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--primary)" }}>
                Teléfono
              </h3>
              <a
                href={`tel:${storeInfo?.phone}`}
                className="text-gray-600 hover:underline"
              >
                {storeInfo?.phone}
              </a>
            </div>

            <div className="rounded-lg p-6 border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <MapPin
                  size={32}
                  style={{ color: "var(--accent-purple)" }}
                />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--primary)" }}>
                Ubicación
              </h3>
              <a
                href={storeInfo?.mapsUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
              >
                {storeInfo?.address}
              </a>
            </div>
              </>
            )}
          </div>

          {/* Formulario de contacto */}
          <div className="max-w-2xl mx-auto rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--primary)" }}>
              Envíanos un mensaje
            </h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800">
                ✓ Tu mensaje ha sido enviado correctamente. Nos pondremos en
                contacto pronto.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 text-red-800">
                ✕ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ borderColor: "var(--primary)" }}
                  placeholder="Juan Pérez"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ borderColor: "var(--primary)" }}
                  placeholder="tu@email.com"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Mensaje *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ borderColor: "var(--primary)" }}
                  placeholder="Cuéntanos más sobre tu consulta..."
                  disabled={formLoading}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 px-6 rounded-lg font-bold text-white transition-opacity"
                style={{ 
                  backgroundColor: "var(--primary)",
                  opacity: formLoading ? 0.6 : 1,
                  cursor: formLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {formLoading ? "Enviando..." : "Enviar Mensaje"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer storeId="ubatech" />
    </>
  )
}
