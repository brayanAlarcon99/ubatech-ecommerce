"use client"

import { useRouter } from "next/navigation"
import { logoutAdmin, getAdminSessionInfo } from "@/lib/admin-auth"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AdminHeader() {
  const router = useRouter()
  const [sessionInfo, setSessionInfo] = useState<{ email: string | null; loginTime: string | null } | null>(null)

  useEffect(() => {
    const info = getAdminSessionInfo()
    setSessionInfo(info)
  }, [])

  function handleLogout() {
    logoutAdmin()
    router.push("/admin/login")
  }

  return (
    <header
      className="border-b shadow-md"
      style={{ backgroundColor: "var(--primary-dark)", borderColor: "var(--primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          {/* Botón menú hamburguesa solo móvil, acorde al header */}
          <button
            className="md:hidden flex items-center justify-center bg-[var(--primary-dark)] text-white rounded p-1 mr-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            style={{ height: '40px', width: '40px', minWidth: '40px' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-admin-menu'))}
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="5" width="24" height="3" rx="1.5" fill="currentColor" />
              <rect y="11" width="24" height="3" rx="1.5" fill="currentColor" />
              <rect y="17" width="24" height="3" rx="1.5" fill="currentColor" />
            </svg>
          </button>
          {/* Logo y título desplazados */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 ml-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <Image src="/logo-ubatech.png" alt="Ubatech+Pro" fill className="object-contain" />
              </div>
              <div className="w-10 h-10 relative">
                <Image src="/dj.svg" alt="DJCELUTECNICO" fill className="object-contain" />
              </div>
            </div>
            <span className="font-semibold text-xl text-white">
              Admin Panel
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {sessionInfo?.email && (
            <span className="text-sm text-white">
              Bienvenido: <strong>{sessionInfo.email}</strong>
            </span>
          )}
          <button onClick={handleLogout} className="px-10 py-2 text-white rounded-lg font-medium transition-all hover:bg-red-600 bg-red-500 shadow-sm hover:shadow-md text-sm whitespace-nowrap">Cerrar Sesión</button>
        </div>
      </div>
    </header>
  )
}
