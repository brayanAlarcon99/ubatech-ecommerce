"use client"

import { usePlatformInfo } from "@/hooks/use-platform-info"

export default function PlatformInfoPanel() {
  const { platformInfo, loading } = usePlatformInfo()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
        Información de la Plataforma
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Versión</h3>
          <p className="text-lg font-bold" style={{ color: "var(--accent-purple)" }}>
            {platformInfo.version}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Última Actualización</h3>
          <p className="text-lg font-bold" style={{ color: "var(--accent-turquoise)" }}>
            {platformInfo.lastUpdate}
          </p>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Email de Soporte</h3>
          <a 
            href={`mailto:${platformInfo.supportEmail}`}
            className="text-lg font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent-green)" }}
          >
            {platformInfo.supportEmail}
          </a>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Descripción</h3>
          <p className="text-gray-600">
            {platformInfo.description}
          </p>
        </div>
      </div>
    </div>
  )
}
