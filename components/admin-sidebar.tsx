"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: string | null
}

export default function AdminSidebar({ activeTab, onTabChange, userRole }: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Permitir apertura desde el header
  useEffect(() => {
    const handler = () => setMobileMenuOpen(true)
    window.addEventListener('open-admin-menu', handler)
    return () => window.removeEventListener('open-admin-menu', handler)
  }, [])

  const allTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Productos", icon: "📦" },
    { id: "categories", label: "Categorías", icon: "🏷️" },
    { id: "orders", label: "Pedidos", icon: "📋" },
    { id: "stores", label: "Tiendas", icon: "🏪", requiredRoles: ["admin", "super"] },
    { id: "users", label: "Administradores", icon: "👥", requiredRole: "super" },
    { id: "settings", label: "Configuración", icon: "⚙️" },
  ]

  const tabs = allTabs.filter((tab) => {
    if (!tab.requiredRole && !tab.requiredRoles) return true
    if (tab.requiredRoles) return tab.requiredRoles.includes(userRole || "")
    return userRole === tab.requiredRole
  })

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:block w-64 border-r"
        style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-gray)" }}
      >
        <nav className="p-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeTab === tab.id ? "text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              style={activeTab === tab.id ? { backgroundColor: "var(--primary-dark)" } : {}}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Menú móvil restaurado para funcionalidad hamburguesa */}
      {/* Botón flotante NO incluido, solo panel y overlay */}
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden fixed left-0 top-0 h-full w-64 border-r z-50 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-gray)" }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--neutral-gray)" }}>
          <h3 className="font-bold text-lg">Menú</h3>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeTab === tab.id ? "text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              style={activeTab === tab.id ? { backgroundColor: "var(--primary-dark)" } : {}}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
