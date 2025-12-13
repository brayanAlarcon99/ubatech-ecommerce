import { initializeDemoData } from "@/lib/init-demo-data"

export async function POST() {
  try {
    const success = await initializeDemoData()
    if (success) {
      return Response.json({ success: true, message: "Base de datos inicializada correctamente" })
    } else {
      return Response.json({ success: false, message: "Error al inicializar" }, { status: 500 })
    }
  } catch (error) {
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
