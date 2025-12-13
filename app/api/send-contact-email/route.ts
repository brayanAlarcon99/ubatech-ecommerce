import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface ContactMessageRequest {
  name: string
  message: string
}

const DEFAULT_WHATSAPP = "573134588107" // Default WhatsApp number

export async function POST(request: NextRequest) {
  try {
    const body: ContactMessageRequest = await request.json()

    const { name, message } = body

    // Validar campos requeridos
    if (!name || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Obtener configuración de WhatsApp desde Firestore
    let whatsappNumber = DEFAULT_WHATSAPP
    
    try {
      const db = getDb()
      const settingsDoc = await getDoc(doc(db, "store_settings", "store_settings"))
      
      if (settingsDoc.exists()) {
        whatsappNumber = settingsDoc.data()?.storeWhatsApp || DEFAULT_WHATSAPP
      }
    } catch (error) {
      console.warn("Error loading WhatsApp from Firestore:", error)
      // Usar valor por defecto
      whatsappNumber = DEFAULT_WHATSAPP
    }

    // Limpiar número de WhatsApp: remover espacios, guiones, paréntesis, etc.
    let cleanNumber = whatsappNumber
      .replace(/\s/g, "") // Remover espacios
      .replace(/[-()]/g, "") // Remover guiones y paréntesis
      .trim()

    // Extraer solo dígitos
    const digitsOnly = cleanNumber.replace(/\D/g, "")

    // Validar que el número tenga al menos 10 dígitos
    if (digitsOnly.length < 10) {
      console.error("Invalid WhatsApp number:", digitsOnly.length, "digits")
      return NextResponse.json(
        { error: "Número de WhatsApp inválido configurado en el sistema" },
        { status: 400 }
      )
    }

    // Asegurar que el número está en formato internacional (sin +)
    const finalNumber = digitsOnly.startsWith("57") ? digitsOnly : "57" + digitsOnly

    // Generar mensaje de WhatsApp
    const whatsappMessage = `*Nuevo mensaje de contacto*\n\n*De:* ${name}\n\n*Mensaje:*\n${message}`
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage)
    
    // Generar URL de WhatsApp
    const whatsappUrl = `https://wa.me/${finalNumber}?text=${encodedMessage}`

    console.log("📱 Mensaje de contacto enviado a WhatsApp:")
    console.log({
      from: name,
      to: finalNumber,
      message,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        success: true,
        message: "Tu mensaje será abierto en WhatsApp",
        data: {
          name,
          sentAt: new Date().toISOString(),
          whatsappUrl,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en send-contact-email API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
