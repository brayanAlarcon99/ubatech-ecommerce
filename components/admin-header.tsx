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
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image src="/logo-ubatech.png" alt="Ubatech+Pro" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg text-white">
            Admin Panel
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {sessionInfo?.email && (
            <span className="text-sm text-white">
              Bienvenido: <strong>{sessionInfo.email}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:bg-red-600 bg-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}
