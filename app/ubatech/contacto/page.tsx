"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { usePlatformInfo } from "@/hooks/use-platform-info"
import { Mail, Phone, MapPin } from "lucide-react"
import { useStoreSettings } from "@/hooks/use-store-settings"

export default function ContactenosPage() {
  const { platformInfo, loading: platformLoading } = usePlatformInfo()
  const { settings, loading: settingsLoading } = useStoreSettings()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
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
    
    if (!formData.name || !formData.message) {
      setError("Por favor completa todos los campos")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Enviar mensaje a WhatsApp
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Abrir WhatsApp en nueva pestaña
        if (data.data?.whatsappUrl) {
          window.open(data.data.whatsappUrl, "_blank")
        }
        
        setSubmitted(true)
        setFormData({
          name: "",
          message: "",
        })
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      } else {
        setError("Error al enviar el mensaje. Intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error sending contact message:", err)
      setError("Error al enviar el mensaje. Intenta de nuevo.")
    } finally {
      setLoading(false)
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
                href={`mailto:${settings.storeEmail}`}
                className="text-gray-600 hover:underline break-all"
              >
                {settings.storeEmail}
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
                href={`tel:${settings.storePhone}`}
                className="text-gray-600 hover:underline"
              >
                {settings.storePhone}
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
                href="https://www.google.com/maps/search/Cl.+10+%23+7-39,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca+855P%2BRP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
              >
                {settings.storeAddress}
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
                ✅ Tu mensaje ha sido enviado correctamente. Nos pondremos en
                contacto pronto.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 text-red-800">
                ❌ {error}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg font-bold text-white transition-opacity"
                style={{ 
                  backgroundColor: "var(--primary)",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? "Enviando..." : "Enviar Mensaje"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
