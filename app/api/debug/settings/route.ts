import { NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { doc, collection, getDocs, getDoc } from "firebase/firestore"

export async function GET() {
  try {
    const db = getDb()
    
    console.log("[DEBUG] Iniciando lectura de settings...")
    
    // Intentar obtener el documento específico "store"
    const storeDocRef = doc(db, "settings", "store")
    const storeDocSnapshot = await getDoc(storeDocRef)
    
    console.log("[DEBUG] Store doc exists:", storeDocSnapshot.exists())
    console.log("[DEBUG] Store doc data:", storeDocSnapshot.data())
    
    // También obtener todos los documentos en la colección settings
    const settingsCollRef = collection(db, "settings")
    const settingsSnapshot = await getDocs(settingsCollRef)
    
    console.log("[DEBUG] Total documents in settings collection:", settingsSnapshot.size)
    
    const allDocs: any[] = []
    settingsSnapshot.forEach((doc) => {
      console.log(`[DEBUG] Document ID: ${doc.id}, Data:`, doc.data())
      allDocs.push({
        id: doc.id,
        data: doc.data()
      })
    })
    
    return NextResponse.json({
      status: "success",
      storeDoc: {
        exists: storeDocSnapshot.exists(),
        data: storeDocSnapshot.data(),
      },
      allDocuments: allDocs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[DEBUG] Error:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
