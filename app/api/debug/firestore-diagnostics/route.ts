import { diagnoseFirebasePermissions } from "@/lib/firebase-diagnostics"
import { NextResponse } from "next/server"

/**
 * Endpoint para diagnosticar permisos de Firestore
 * GET /api/debug/firestore-diagnostics
 */
export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de Firestore...")
    const results = await diagnoseFirebasePermissions()
    
    return NextResponse.json(
      {
        success: true,
        message: "Diagnóstico completado",
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
