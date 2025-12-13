import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore"

// Usar la colección store_settings
const SETTINGS_COLLECTION = "store_settings"
const SETTINGS_DOC = "store_settings"

export async function GET() {
  try {
    const db = getDb()
    console.log("[API] Fetching settings from Firestore...")
    
    // Obtener el documento "store_settings" de la colección "store_settings"
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const docSnapshot = await getDoc(docRef)

    console.log("[API] Document exists:", docSnapshot.exists())
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data()
      console.log("[API] Settings from DB:", JSON.stringify(data, null, 2))
      
      // Retornar exactamente lo que está en la BD
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      })
    } else {
      console.log("[API] No settings document found in Firestore")
      // Si no existe, retornar error para que el cliente sepa que no hay datos
      return NextResponse.json(
        {
          error: "No settings found in database",
          storeName: "Ubatech+Pro",
          storeEmail: "info@ubatech.com",
          storePhone: "+57 3134588107",
          storeAddress: "ubaté, colombia",
          storeHours: "Lunes - Viernes: 8am - 6pm",
          description: "Plataforma de compras online",
        },
        { 
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          }
        }
      )
    }
  } catch (error) {
    console.error("[API] Error getting settings:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[API] Error details:", errorMsg)
    
    return NextResponse.json(
      { 
        error: "Error al obtener configuración: " + errorMsg,
        storeName: "Ubatech+Pro",
        storeEmail: "info@ubatech.com",
        storePhone: "+57 3134588107",
        storeAddress: "ubaté, colombia",
        storeHours: "Lunes - Viernes: 8am - 6pm",
        description: "Plataforma de compras online",
      }, 
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        }
      }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validar que los datos necesarios estén presentes
    if (!data.storeName || !data.storeEmail || !data.storePhone || !data.storeAddress) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const db = getDb()
    const settingsRef = doc(db, SETTINGS_COLLECTION, "store")

    const settingsData = {
      storeName: data.storeName,
      storeEmail: data.storeEmail,
      storePhone: data.storePhone,
      storeAddress: data.storeAddress,
      storeHours: data.storeHours || "Lunes - Viernes: 8am - 6pm",
      description: data.description || "",
      updatedAt: new Date().toISOString(),
    }

    await setDoc(settingsRef, settingsData, { merge: true })

    return NextResponse.json({ 
      success: true, 
      message: "Configuración guardada correctamente" 
    })
  } catch (error) {
    console.error("[API] Error saving settings:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Error al guardar configuración: " + errorMessage },
      { status: 500 }
    )
  }
}
