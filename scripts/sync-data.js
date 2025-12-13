import { initializeDemoData } from "./lib/init-demo-data.js"

async function main() {
  console.log("🚀 Iniciando sincronización de datos...")
  try {
    const result = await initializeDemoData()
    if (result) {
      console.log("✅ Datos sincronizados exitosamente")
      process.exit(0)
    } else {
      console.log("❌ Error en la sincronización")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error fatal:", error)
    process.exit(1)
  }
}

main()
