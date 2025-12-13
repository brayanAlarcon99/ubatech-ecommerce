"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InitRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/admin/init-db")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirigiendo...</p>
    </div>
  )
}
