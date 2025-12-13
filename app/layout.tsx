import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/lib/cart-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ubatech+Pro - Confianza & Seguridad",
  description: "Tienda online de Ubatech+Pro con los mejores productos tech",
  generator: 'v0.app',
  icons: {
    icon: '/robot-favicon.svg',
    apple: '/robot-favicon.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <CartProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  )
}
