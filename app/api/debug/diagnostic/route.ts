import { NextResponse } from "next/server"
import { runDiagnostic, formatDiagnosticReport } from "@/lib/diagnostic"

export async function GET() {
  try {
    console.log("[Diagnostic API] Ejecutando diagnóstico...")
    const result = await runDiagnostic()

    const report = formatDiagnosticReport(result)
    console.log(report)

    return NextResponse.json({
      success: true,
      timestamp: result.timestamp,
      report: report,
      data: result,
    })
  } catch (error) {
    console.error("[Diagnostic API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
