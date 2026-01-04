import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

const SETTINGS_COLLECTION = "store_settings"
const SETTINGS_DOC = "store_settings"

const STORE_CONFIGS = {
  ubatech: {
    storeName: "Ubatech+Pro",
    storeEmail: "info@ubatech.com",
    storePhone: "573134588107",
    storeWhatsApp: "573134588107",
    storeAddress: "ubaté, colombia",
    storeHours: "Lunes - Viernes: 8am - 6pm",
    description: "Tienda especializada en tecnología e innovación",
  },
  djcelutecnico: {
    storeName: "DJ Celutecnico",
    storeEmail: "info@djcelutecnico.com",
    storePhone: "573134588107",
    storeWhatsApp: "573134588107",
    storeAddress: "ubaté, colombia",
    storeHours: "Lunes - Viernes: 8am - 6pm",
    description: "Tu tienda especializada en celulares y accesorios",
  },
}

const DEFAULT_RESPONSE = STORE_CONFIGS.ubatech

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Content-Type": "application/json",
  "Pragma": "no-cache",
  "Expires": "0",
}

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetro de tienda de la query
    const store = request.nextUrl.searchParams.get('store') || 'ubatech'
    const storeConfig = STORE_CONFIGS[store as keyof typeof STORE_CONFIGS] || DEFAULT_RESPONSE

    let db
    try {
      db = getDb()
    } catch (dbError) {
      console.error("[API Settings] Firestore not available:", dbError)
      // Return default settings if Firestore is not available
      return NextResponse.json(storeConfig, {
        status: 200,
        headers: CACHE_HEADERS,
      })
    }

    // Obtener el documento "store_settings" de la colección "store_settings"
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data = docSnapshot.data()
      
      // Mezclar datos de Firestore con config de tienda
      const mergedData = {
        ...storeConfig,
        ...data,
        storeName: storeConfig.storeName, // Preservar el nombre específico de la tienda
      }
      
      return NextResponse.json(mergedData, {
        headers: CACHE_HEADERS,
      })
    } else {
      // Retornar valores por defecto si no existe
      return NextResponse.json(storeConfig, {
        status: 200,
        headers: CACHE_HEADERS,
      })
    }
  } catch (error) {
    console.error("[API Settings] Error fetching settings:", error)
    
    // Retornar valores por defecto en caso de error
    return NextResponse.json(DEFAULT_RESPONSE, {
      status: 200,
      headers: CACHE_HEADERS,
    })
  }
}
