"use client"

import { useState, useEffect } from "react"
import { useStoreInfo, type StoreInfo } from "@/hooks/use-store-info"
import { Save, AlertCircle } from "lucide-react"

export default function StoresSettings() {
  const [selectedStore, setSelectedStore] = useState<"djcelutecnico" | "ubatech">("djcelutecnico")
  const { storeInfo, loading, error, updateStoreInfo } = useStoreInfo(selectedStore)
  const [formData, setFormData] = useState<Partial<StoreInfo> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (storeInfo) {
      setFormData(storeInfo)
    }
  }, [storeInfo, selectedStore])

  const handleInputChange = (field: keyof StoreInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData) return

    setSaving(true)
    setSaveMessage(null)

    try {
      const success = await updateStoreInfo(formData)
      if (success) {
        setSaveMessage({
          type: "success",
          text: "Cambios guardados exitosamente",
        })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({
          type: "error",
          text: "Error al guardar los cambios",
        })
      }
    } catch (err) {
      console.error(err)
      setSaveMessage({
        type: "error",
        text: "Error al guardar los cambios",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStoreChange = (store: "djcelutecnico" | "ubatech") => {
    setSelectedStore(store)
    setFormData(null)
    setSaveMessage(null)
  }

  if (loading && !formData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-gray-600">Cargando información de la tienda...</p>
        </div>
      </div>
    )
  }

  if (error && !formData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración de Tiendas</h1>
        <p className="text-gray-600">Administra la información independiente de cada tienda</p>
      </div>

      {/* Selector de tienda */}
      <div className="flex gap-4">
        {(["djcelutecnico", "ubatech"] as const).map((store) => (
          <button
            key={store}
            onClick={() => handleStoreChange(store)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedStore === store
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {store === "djcelutecnico" ? "DJCELUTECNICO" : "Ubatech+Pro"}
          </button>
        ))}
      </div>

      {/* Mensajes de estado */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <AlertCircle size={20} />
          <p>{saveMessage.text}</p>
        </div>
      )}

      {formData && (
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Información Básica */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-black"
                  placeholder="Descripción que se muestra en la página pública"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sobre Nosotros
                </label>
                <textarea
                  value={formData.aboutUs || ""}
                  onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-black"
                  placeholder="Ingresa la información sobre tu tienda que deseas mostrar a los clientes..."
                />
                <p className="text-sm text-gray-500 mt-2">Este texto se mostrará en la sección 'Sobre Nosotros' de tu tienda</p>
              </div>
            </div>
          </div>

          {/* Configuración de Tienda */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Configuración de la Tienda</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Tienda (Configuración)
                </label>
                <input
                  type="text"
                  value={formData.storeName || ""}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
                <p className="text-sm text-gray-500 mt-1">Nombre usado en configuraciones y correos</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email de la Tienda
                </label>
                <input
                  type="email"
                  value={formData.storeEmail || ""}
                  onChange={(e) => handleInputChange("storeEmail", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono de la Tienda
                </label>
                <input
                  type="tel"
                  value={formData.storePhone || ""}
                  onChange={(e) => handleInputChange("storePhone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              {/* WhatsApp para Órdenes - DESTACADO */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 shadow-lg ring-2 ring-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">📱</div>
                  <div>
                    <label className="block text-lg font-bold text-green-800">
                      🟢 WhatsApp para Órdenes de Compra
                    </label>
                    <p className="text-xs text-green-700 font-semibold">REQUERIDO - Clientes reciben el carrito aquí</p>
                  </div>
                </div>
                
                <input
                  type="tel"
                  value={formData.storeWhatsApp || ""}
                  onChange={(e) => handleInputChange("storeWhatsApp", e.target.value)}
                  placeholder="Ej: +57 3134588107"
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-400 bg-white text-black font-semibold text-lg shadow-md hover:border-green-400 transition-all"
                />
                
                <div className="mt-3 bg-green-100 border-l-4 border-green-600 pl-3 py-2 rounded">
                  <p className="text-sm text-green-800 font-semibold">
                    💡 Tip: Los clientes verán "{formData.storeWhatsApp || 'tu número aquí'}" al completar la compra
                  </p>
                </div>
                
                <p className="text-xs text-green-700 mt-3 font-medium">
                  ✓ Formato: +57 [código área] [número] o solo dígitos<br/>
                  ✓ Mínimo 10 dígitos requerido<br/>
                  ✓ Recibirás órdenes formateadas con productos y total
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.storeAddress || ""}
                  onChange={(e) => handleInputChange("storeAddress", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={formData.storeHours || ""}
                  onChange={(e) => handleInputChange("storeHours", e.target.value)}
                  placeholder="Ej: Lunes - Viernes: 8am - 6pm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Información de Contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-black"
                />
              </div>


            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Redes Sociales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instagram (opcional)
                </label>
                <input
                  type="text"
                  value={formData.instagram || ""}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="URL del perfil"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook (opcional)
                </label>
                <input
                  type="text"
                  value={formData.facebook || ""}
                  onChange={(e) => handleInputChange("facebook", e.target.value)}
                  placeholder="URL del perfil"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>
            </div>
          </div>

          {/* Colores y Estilos */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Colores y Estilos</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Principal
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor || "#000000"}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || "#000000"}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor || "#000000"}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || "#000000"}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
