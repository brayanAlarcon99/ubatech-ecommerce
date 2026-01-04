import { initializeDemoData } from "@/lib/init-demo-data"

let initialized = false

export async function register() {
  // Desactivado: La inicialización se intenta en desarrollo pero falla por permisos
  // Usa /admin/init-db para inicializar manualmente si es necesario
  if (false && !initialized && process.env.NODE_ENV === "development") {
    try {
      console.log("🔄 Verificando datos de demostración...")
      const result = await initializeDemoData()
      if (result) {
        console.log("✅ Datos inicializados correctamente en Firestore")
        initialized = true
      }
    } catch (error) {
      console.error("⚠️ Error al inicializar datos:", error)
    }
  }
}
