import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

/**
 * Este endpoint verifica que la sincronización esté funcionando correctamente
 * Devuelve los datos actuales de Firestore
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    
    const docRef = doc(db, "store_settings", "store_settings")
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data = docSnapshot.data()
      
      return NextResponse.json({
        status: "success",
        synced: true,
        timestamp: new Date().toISOString(),
        data: {
          storeName: data.storeName,
          storeEmail: data.storeEmail,
          storePhone: data.storePhone,
          storeAddress: data.storeAddress,
          storeHours: data.storeHours,
          description: data.description,
          updatedAt: data.updatedAt,
          taxPercentage: data.taxPercentage,
          currency: data.currency,
        }
      }, {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Content-Type": "application/json",
        }
      })
    } else {
      return NextResponse.json({
        status: "error",
        synced: false,
        message: "No se encontró el documento de configuración en Firestore",
        location: "store_settings/store_settings"
      }, {
        status: 404,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Content-Type": "application/json",
        }
      })
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      status: "error",
      synced: false,
      error: errorMsg,
      message: "Error al sincronizar configuración con Firestore"
    }, {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Content-Type": "application/json",
      }
    })
  }
}
