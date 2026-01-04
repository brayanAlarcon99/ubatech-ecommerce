import { initializeStoresCollection } from "@/lib/services/stores"
import { NextResponse } from "next/server"

/**
 * POST /api/stores/init
 * Inicializa la colección de tiendas en Firestore
 */
export async function POST() {
  try {
    const result = await initializeStoresCollection()

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in stores init API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
