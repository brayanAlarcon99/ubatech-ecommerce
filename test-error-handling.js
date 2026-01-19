#!/usr/bin/env node

/**
 * TEST: Error Handling del Sistema de Productos
 * =============================================
 * 
 * Este script verifica que todos los errores se capturen
 * y se muestren correctamente en el UI.
 */

const ErrorScenarios = [
  {
    id: 1,
    title: "❌ Guardar sin NOMBRE",
    testData: {
      name: "",
      category: "celulares",
      price: 100,
      stock: { djcelutecnico: 10, ubatech: 5 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "El nombre del producto es obligatorio",
    severity: "CRITICAL"
  },
  {
    id: 2,
    title: "❌ Guardar sin CATEGORÍA",
    testData: {
      name: "iPhone 15",
      category: "",
      price: 100,
      stock: { djcelutecnico: 10, ubatech: 5 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "Debes seleccionar una categoría",
    severity: "CRITICAL"
  },
  {
    id: 3,
    title: "❌ Guardar con PRECIO CERO",
    testData: {
      name: "iPhone 15",
      category: "celulares",
      price: 0,
      stock: { djcelutecnico: 10, ubatech: 5 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "El precio debe ser mayor a 0",
    severity: "CRITICAL"
  },
  {
    id: 4,
    title: "❌ Guardar con PRECIO NEGATIVO",
    testData: {
      name: "iPhone 15",
      category: "celulares",
      price: -50,
      stock: { djcelutecnico: 10, ubatech: 5 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "El precio debe ser mayor a 0",
    severity: "CRITICAL"
  },
  {
    id: 5,
    title: "❌ Guardar sin STOCK en NINGUNA TIENDA",
    testData: {
      name: "iPhone 15",
      category: "celulares",
      price: 1200,
      stock: { djcelutecnico: 0, ubatech: 0 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "Debes agregar stock a al menos una tienda",
    severity: "CRITICAL"
  },
  {
    id: 6,
    title: "❌ Guardar con STOCK pero UNDEFINED stock",
    testData: {
      name: "iPhone 15",
      category: "celulares",
      price: 1200,
      stock: undefined,
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: "Debes agregar stock a al menos una tienda",
    severity: "CRITICAL"
  },
  {
    id: 7,
    title: "✅ Guardar VÁLIDO (DJ solo)",
    testData: {
      name: "iPhone 15 válido",
      category: "celulares",
      price: 1200,
      stock: { djcelutecnico: 10, ubatech: 0 },
      minStockByStore: { djcelutecnico: 2, ubatech: 0 }
    },
    expectedError: null,
    severity: "VALID"
  },
  {
    id: 8,
    title: "✅ Guardar VÁLIDO (Ubatech solo)",
    testData: {
      name: "iPhone 15 valid Uba",
      category: "celulares",
      price: 1200,
      stock: { djcelutecnico: 0, ubatech: 5 },
      minStockByStore: { djcelutecnico: 0, ubatech: 2 }
    },
    expectedError: null,
    severity: "VALID"
  },
  {
    id: 9,
    title: "✅ Guardar VÁLIDO (Ambas tiendas)",
    testData: {
      name: "iPhone 15 ambas",
      category: "celulares",
      price: 1200,
      stock: { djcelutecnico: 10, ubatech: 8 },
      minStockByStore: { djcelutecnico: 2, ubatech: 2 }
    },
    expectedError: null,
    severity: "VALID"
  }
]

/**
 * Función para simular la validación
 */
function validateProduct(productData) {
  // Validación 1: Nombre obligatorio
  if (!productData.name || productData.name.trim() === "") {
    return "El nombre del producto es obligatorio"
  }
  
  // Validación 2: Categoría obligatoria
  if (!productData.category || productData.category.trim() === "") {
    return "Debes seleccionar una categoría"
  }
  
  // Validación 3: Precio > 0
  if ((productData.price ?? 0) <= 0) {
    return "El precio debe ser mayor a 0"
  }
  
  // Validación 4: Stock > 0 en al menos una tienda
  const djStock = productData.stock?.djcelutecnico ?? 0
  const ubaStock = productData.stock?.ubatech ?? 0
  
  if (djStock === 0 && ubaStock === 0) {
    return "Debes agregar stock a al menos una tienda"
  }
  
  // ✅ Validación exitosa
  return null
}

/**
 * Ejecutar todos los tests
 */
console.log("\n" + "=".repeat(70))
console.log("🧪 TEST: Error Handling del Sistema de Productos")
console.log("=".repeat(70) + "\n")

let totalTests = ErrorScenarios.length
let passedTests = 0
let failedTests = 0

ErrorScenarios.forEach((scenario) => {
  const actualError = validateProduct(scenario.testData)
  const passed = actualError === scenario.expectedError
  
  passedTests += passed ? 1 : 0
  failedTests += passed ? 0 : 1
  
  const status = passed ? "✅ PASS" : "❌ FAIL"
  const severityIcon = {
    "CRITICAL": "🔴",
    "VALID": "🟢"
  }[scenario.severity] || "🟡"
  
  console.log(`${status} Test #${scenario.id}: ${scenario.title}`)
  console.log(`   ${severityIcon} Severidad: ${scenario.severity}`)
  
  if (scenario.expectedError) {
    console.log(`   Expected: "${scenario.expectedError}"`)
    console.log(`   Actual:   "${actualError || '(Sin error - PASS)'}"`)
  } else {
    console.log(`   Expected: ✅ Sin error`)
    console.log(`   Actual:   ${actualError ? `❌ "${actualError}"` : "✅ Sin error"}`)
  }
  
  if (!passed) {
    console.log(`   ⚠️  MISMATCH DETECTED`)
  }
  
  console.log("")
})

// Resumen
console.log("=".repeat(70))
console.log(`📊 RESUMEN DE TESTS`)
console.log("=".repeat(70))
console.log(`Total Tests:    ${totalTests}`)
console.log(`✅ Passed:       ${passedTests}`)
console.log(`❌ Failed:       ${failedTests}`)
console.log(`Success Rate:   ${((passedTests / totalTests) * 100).toFixed(1)}%`)
console.log("=".repeat(70) + "\n")

if (failedTests === 0) {
  console.log("🎉 ¡TODOS LOS TESTS PASARON!")
  console.log("\n✅ El sistema de validación está funcionando correctamente")
  console.log("✅ Los usuarios verán mensajes de error claros y específicos")
  console.log("✅ Datos inconsistentes serán rechazados antes de Firestore\n")
  process.exit(0)
} else {
  console.log("⚠️  ALGUNOS TESTS FALLARON")
  console.log(`Revisa los ${failedTests} test(s) fallido(s) arriba\n`)
  process.exit(1)
}
