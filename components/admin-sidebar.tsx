"use client"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: string | null
}

export default function AdminSidebar({ activeTab, onTabChange, userRole }: AdminSidebarProps) {
  const allTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Productos", icon: "📦" },
    { id: "categories", label: "Categorías", icon: "🏷️" },
    { id: "orders", label: "Pedidos", icon: "📋" },
    { id: "users", label: "Administradores", icon: "👥", requiredRole: "super" },
    { id: "settings", label: "Configuración", icon: "⚙️" },
  ]

  const tabs = allTabs.filter((tab) => !tab.requiredRole || userRole === tab.requiredRole)

  return (
    <aside
      className="w-64 border-r"
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
  )
}
