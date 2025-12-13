import { NextResponse } from "next/server"
import { migrateDetails } from "@/lib/migrate-details"

/**
 * POST /api/migrate/details
 * Ejecuta la migración de details en todos los productos existentes
 */
export async function POST() {
  try {
    const result = await migrateDetails()
    return NextResponse.json(
      {
        success: true,
        message: "Migración de detalles completada exitosamente",
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[/api/migrate/details] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error durante la migración de detalles",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/migrate/details
 * Muestra información sobre la migración de details
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Endpoint de migración de detalles",
      instructions: "Envía una solicitud POST para ejecutar la migración de detalles en todos los productos",
      endpoint: "POST /api/migrate/details",
      note: "Esta migración agregará un campo de detalles a todos los productos que no lo tengan",
    },
    { status: 200 }
  )
}
