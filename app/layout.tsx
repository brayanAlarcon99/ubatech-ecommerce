import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/lib/cart-context"
import { StoreProvider } from "@/lib/context/StoreContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ubatech+Pro - Confianza & Seguridad",
  description: "Tienda online de Ubatech+Pro con los mejores productos tech",
  generator: 'v0.app',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes',
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
        <StoreProvider>
          <CartProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
