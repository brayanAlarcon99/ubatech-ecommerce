/**
 * Script de Diagnóstico para verificar consultas y datos de Firestore
 * Ejecutar desde: http://localhost:3000/api/debug/diagnostic
 */

import { getDb } from "@/lib/firebase"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore"

export interface DiagnosticResult {
  timestamp: string
  categories: {
    count: number
    data: Array<{ id: string; name: string }>
    error: string | null
  }
  subcategories: {
    count: number
    byCategory: Record<
      string,
      Array<{ id: string; name: string; categoryId: string }>
    >
    error: string | null
  }
  products: {
    count: number
    withoutCategory: number
    withoutSubcategory: number
    sample: Array<{ id: string; name: string; category: string; subcategory: string }>
    error: string | null
  }
  storeSettings: {
    exists: boolean
    data: Record<string, any>
    error: string | null
  }
  platformInfo: {
    count: number
    data: Array<Record<string, any>>
    error: string | null
  }
}

export async function runDiagnostic(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    categories: {
      count: 0,
      data: [],
      error: null,
    },
    subcategories: {
      count: 0,
      byCategory: {},
      error: null,
    },
    products: {
      count: 0,
      withoutCategory: 0,
      withoutSubcategory: 0,
      sample: [],
      error: null,
    },
    storeSettings: {
      exists: false,
      data: {},
      error: null,
    },
    platformInfo: {
      count: 0,
      data: [],
      error: null,
    },
  }

  try {
    const db = getDb()

    // 1. Verificar categorías
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      result.categories.count = categoriesSnapshot.size
      result.categories.data = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Sin nombre",
      }))
      console.log(`✅ Categorías: ${result.categories.count} encontradas`)
    } catch (error) {
      result.categories.error = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando categorías:", result.categories.error)
    }

    // 2. Verificar subcategorías
    try {
      const subcategoriesSnapshot = await getDocs(collection(db, "subcategories"))
      result.subcategories.count = subcategoriesSnapshot.size

      for (const subDoc of subcategoriesSnapshot.docs) {
        const data = subDoc.data()
        const categoryId = data.categoryId
        if (!result.subcategories.byCategory[categoryId]) {
          result.subcategories.byCategory[categoryId] = []
        }
        result.subcategories.byCategory[categoryId].push({
          id: subDoc.id,
          name: data.name || "Sin nombre",
          categoryId: categoryId,
        })
      }
      console.log(`✅ Subcategorías: ${result.subcategories.count} encontradas`)
    } catch (error) {
      result.subcategories.error = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando subcategorías:", result.subcategories.error)
    }

    // 3. Verificar productos
    try {
      const productsSnapshot = await getDocs(collection(db, "products"))
      result.products.count = productsSnapshot.size

      let withoutCat = 0
      let withoutSub = 0

      for (const prodDoc of productsSnapshot.docs) {
        const data = prodDoc.data()
        if (!data.category) withoutCat++
        if (!data.subcategory) withoutSub++

        if (result.products.sample.length < 5) {
          result.products.sample.push({
            id: prodDoc.id,
            name: data.name || "Sin nombre",
            category: data.category || "SIN CATEGORÍA",
            subcategory: data.subcategory || "SIN SUBCATEGORÍA",
          })
        }
      }

      result.products.withoutCategory = withoutCat
      result.products.withoutSubcategory = withoutSub
      console.log(
        `✅ Productos: ${result.products.count} encontrados (${withoutCat} sin categoría, ${withoutSub} sin subcategoría)`
      )
    } catch (error) {
      result.products.error = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando productos:", result.products.error)
    }

    // 4. Verificar store_settings
    try {
      const settingsRef = doc(db, "store_settings", "store_settings")
      const settingsDoc = await getDoc(settingsRef)

      result.storeSettings.exists = settingsDoc.exists()
      if (settingsDoc.exists()) {
        result.storeSettings.data = settingsDoc.data()
        console.log("✅ Store settings encontrados")
      } else {
        console.warn("⚠️ Store settings no existen - usando valores por defecto")
      }
    } catch (error) {
      result.storeSettings.error = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando store_settings:", result.storeSettings.error)
    }

    // 5. Verificar platform_info
    try {
      const platformSnapshot = await getDocs(collection(db, "platform_info"))
      result.platformInfo.count = platformSnapshot.size
      result.platformInfo.data = platformSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log(`✅ Platform info: ${result.platformInfo.count} documentos encontrados`)
    } catch (error) {
      result.platformInfo.error = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando platform_info:", result.platformInfo.error)
    }
  } catch (error) {
    console.error("❌ Error general en diagnóstico:", error)
  }

  return result
}

export function formatDiagnosticReport(result: DiagnosticResult): string {
  return `
═══════════════════════════════════════════════════════════
📋 REPORTE DE DIAGNÓSTICO - ${result.timestamp}
═══════════════════════════════════════════════════════════

🏷️ CATEGORÍAS
──────────────────────────────────────────────────────────
  Total: ${result.categories.count}
  ${result.categories.error ? `❌ Error: ${result.categories.error}` : ""}
  Datos:
${result.categories.data.map((cat) => `    - ${cat.name} (ID: ${cat.id})`).join("\n")}

📊 SUBCATEGORÍAS
──────────────────────────────────────────────────────────
  Total: ${result.subcategories.count}
  ${result.subcategories.error ? `❌ Error: ${result.subcategories.error}` : ""}
  Por categoría:
${Object.entries(result.subcategories.byCategory)
  .map(
    ([catId, subs]) =>
      `    ${catId}: ${subs.length} subcategorías\n${subs.map((sub) => `      - ${sub.name}`).join("\n")}`
  )
  .join("\n")}

📦 PRODUCTOS
──────────────────────────────────────────────────────────
  Total: ${result.products.count}
  Sin categoría: ${result.products.withoutCategory}
  Sin subcategoría: ${result.products.withoutSubcategory}
  ${result.products.error ? `❌ Error: ${result.products.error}` : ""}
  Muestra (primeros 5):
${result.products.sample.map((prod) => `    - ${prod.name} (Cat: ${prod.category}, SubCat: ${prod.subcategory})`).join("\n")}

⚙️ STORE SETTINGS
──────────────────────────────────────────────────────────
  Existe: ${result.storeSettings.exists ? "✅ SÍ" : "❌ NO"}
  ${result.storeSettings.error ? `❌ Error: ${result.storeSettings.error}` : ""}
  ${
    Object.keys(result.storeSettings.data).length > 0
      ? `Datos:\n${Object.entries(result.storeSettings.data)
          .map(([key, value]) => `    ${key}: ${value}`)
          .join("\n")}`
      : ""
  }

ℹ️ PLATFORM INFO
──────────────────────────────────────────────────────────
  Total: ${result.platformInfo.count}
  ${result.platformInfo.error ? `❌ Error: ${result.platformInfo.error}` : ""}
  ${
    result.platformInfo.data.length > 0
      ? `Datos:\n${result.platformInfo.data
          .map(
            (info) =>
              `    ${Object.entries(info)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}`
          )
          .join("\n")}`
      : ""
  }

═══════════════════════════════════════════════════════════
`
}
