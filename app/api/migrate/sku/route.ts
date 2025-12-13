import { NextResponse } from "next/server"
import { migrateSKU } from "@/lib/migrate-sku"

/**
 * POST /api/migrate/sku
 * Ejecuta la migración de SKU en todos los productos existentes
 */
export async function POST() {
  try {
    const result = await migrateSKU()
    return NextResponse.json(
      {
        success: true,
        message: "Migración de SKU completada exitosamente",
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[/api/migrate/sku] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error durante la migración de SKU",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/migrate/sku
 * Muestra información sobre la migración de SKU
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Endpoint de migración de SKU",
      instructions:
        "Envía una solicitud POST para ejecutar la migración de SKU en todos los productos",
      endpoint: "POST /api/migrate/sku",
      note: "Esta migración agregará un SKU automático a todos los productos que no lo tengan",
    },
    { status: 200 }
  )
}
