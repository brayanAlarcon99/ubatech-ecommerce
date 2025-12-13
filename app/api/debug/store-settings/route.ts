import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    
    // Verificar en colección store_settings con documento store_settings
    const docRef1 = doc(db, "store_settings", "store_settings")
    const docSnapshot1 = await getDoc(docRef1)
    
    // Verificar en colección settings con documento store (antigua ubicación)
    const docRef2 = doc(db, "settings", "store")
    const docSnapshot2 = await getDoc(docRef2)
    
    // Listar todos los documentos en store_settings
    const storeSettingsSnapshot = await getDocs(collection(db, "store_settings"))
    const storeSettingsDocs = storeSettingsSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }))
    
    // Listar todos los documentos en settings
    const settingsSnapshot = await getDocs(collection(db, "settings"))
    const settingsDocs = settingsSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }))
    
    return NextResponse.json({
      status: "debug_info",
      storeSettings_store_settings: {
        exists: docSnapshot1.exists(),
        data: docSnapshot1.exists() ? docSnapshot1.data() : null
      },
      settings_store: {
        exists: docSnapshot2.exists(),
        data: docSnapshot2.exists() ? docSnapshot2.data() : null
      },
      allInStoreSettings: storeSettingsDocs,
      allInSettings: settingsDocs
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: "Error al leer datos de Firestore"
    }, {
      status: 500
    })
  }
}
