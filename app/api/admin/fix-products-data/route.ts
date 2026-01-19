import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

/**
 * 🚀 API para reparar datos de productos
 * Asegurar que todos los productos tengan estructura válida:
 * - stock: { djcelutecnico: number, ubatech: number }
 * - minStockByStore: { djcelutecnico: number, ubatech: number }
 * 
 * Uso: GET /api/admin/fix-products-data
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación (opcional, comentar en desarrollo)
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const db = getDb()
    const productsRef = collection(db, "products")
    const snapshot = await getDocs(productsRef)

    let fixed = 0
    let errors = 0
    const fixedProducts: Array<{ id: string; changes: string[] }> = []

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const update: Record<string, any> = {}
      const changes: string[] = []

      // 🚀 Fijar stock
      if (!data.stock || typeof data.stock !== "object") {
        update.stock = { djcelutecnico: 0, ubatech: 0 }
        changes.push("Stock reestablecido a estructura válida")
      } else {
        const fixedStock: Record<string, number> = {
          djcelutecnico: data.stock.djcelutecnico ?? 0,
          ubatech: data.stock.ubatech ?? 0,
        }

        // Asegurar que sean números
        fixedStock.djcelutecnico = Number(fixedStock.djcelutecnico) || 0
        fixedStock.ubatech = Number(fixedStock.ubatech) || 0

        if (
          fixedStock.djcelutecnico !== data.stock.djcelutecnico ||
          fixedStock.ubatech !== data.stock.ubatech
        ) {
          update.stock = fixedStock
          changes.push("Stock corregido a números válidos")
        }
      }

      // 🚀 Fijar minStockByStore
      if (!data.minStockByStore || typeof data.minStockByStore !== "object") {
        update.minStockByStore = { djcelutecnico: 0, ubatech: 0 }
        changes.push("minStockByStore reestablecido")
      } else {
        const fixedMinStock: Record<string, number> = {
          djcelutecnico: data.minStockByStore.djcelutecnico ?? 0,
          ubatech: data.minStockByStore.ubatech ?? 0,
        }

        // Asegurar que sean números
        fixedMinStock.djcelutecnico = Number(fixedMinStock.djcelutecnico) || 0
        fixedMinStock.ubatech = Number(fixedMinStock.ubatech) || 0

        if (
          fixedMinStock.djcelutecnico !== data.minStockByStore.djcelutecnico ||
          fixedMinStock.ubatech !== data.minStockByStore.ubatech
        ) {
          update.minStockByStore = fixedMinStock
          changes.push("minStockByStore corregido a números válidos")
        }
      }

      // 🚀 Fijar price si es string
      if (typeof data.price === "string") {
        update.price = Number(data.price) || 0
        changes.push("Price convertido a número")
      }

      // Si hay cambios, actualizar
      if (Object.keys(update).length > 0) {
        try {
          await updateDoc(doc(db, "products", docSnap.id), update)
          fixed++
          fixedProducts.push({
            id: docSnap.id,
            changes,
          })
        } catch (err) {
          console.error(`[fix-products-data] Error updating ${docSnap.id}:`, err)
          errors++
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Reparación completada: ${fixed} productos fijos, ${errors} errores`,
        stats: {
          total: snapshot.size,
          fixed,
          errors,
          unchanged: snapshot.size - fixed - errors,
        },
        fixedProducts: fixedProducts.slice(0, 10), // Mostrar primeros 10
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[fix-products-data] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
