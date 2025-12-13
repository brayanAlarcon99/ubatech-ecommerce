/**
 * Script de Inicialización de Colección platform_info
 * 
 * Ejecutar este script una sola vez para crear la colección inicial
 * en Firestore con los valores por defecto.
 * 
 * NOTA: Este archivo es solo para referencia. Usa la consola de Firebase
 * o la UI del admin panel para crear el documento manualmente.
 */

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB6Yczsu4sF8cjD4H1Jz2KU4TO9f0biCoQ",
  authDomain: "ubatech-a8650.firebaseapp.com",
  projectId: "ubatech-a8650",
  storageBucket: "ubatech-a8650.firebasestorage.app",
  messagingSenderId: "609393850830",
  appId: "1:609393850830:web:567d90bdc33dd65fe2d39f",
  measurementId: "G-G2DW96480G",
}

async function initializePlatformInfo() {
  try {
    // Inicializar Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    const db = getFirestore(app)

    // Datos iniciales
    const platformInfoData = {
      version: "1.0.0",
      lastUpdate: "Diciembre 2025",
      supportEmail: "support@ubatech.com",
      updatedAt: new Date().toISOString(),
    }

    // Crear el documento
    const platformRef = doc(db, "platform_info", "platform_info")
    await setDoc(platformRef, platformInfoData, { merge: true })

    console.log("✅ Colección platform_info inicializada correctamente")
    console.log("Datos:", platformInfoData)
  } catch (error) {
    console.error("❌ Error al inicializar platform_info:", error)
  }
}

// Descomenta la siguiente línea para ejecutar el script
// initializePlatformInfo()

export { initializePlatformInfo }
