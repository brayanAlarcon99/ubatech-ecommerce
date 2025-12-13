import { getDb } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { headers as getHeaders } from "next/headers"

export async function POST(request: Request) {
  try {
    // Verificar que sea una solicitud interna o del admin
    const headersList = await getHeaders()
    const authorization = headersList.get("authorization")

    // Validación básica - aquí puedes agregar más seguridad
    if (!authorization) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      })
    }

    const db = getDb()

    // Datos iniciales de la plataforma
    const platformInfoData = {
      version: "1.0.0",
      lastUpdate: "Diciembre 2025",
      supportEmail: "support@ubatech.com",
      description: "Plataforma de compras online especializada en productos tecnológicos innovadores",
      updatedAt: new Date().toISOString(),
    }

    // Crear o actualizar el documento
    const platformRef = doc(db, "platform_info", "platform_info")
    await setDoc(platformRef, platformInfoData, { merge: true })

    return new Response(
      JSON.stringify({
        success: true,
        message: "Colección platform_info inicializada correctamente",
        data: platformInfoData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error al inicializar platform_info:", error)
    return new Response(
      JSON.stringify({
        error: "Error al inicializar la colección",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
