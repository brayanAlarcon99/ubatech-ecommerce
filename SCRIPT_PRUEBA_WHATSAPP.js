// Prueba rápida: Validación de números WhatsApp
// Copia y pega esto en la consola del navegador en checkout

console.log("=== PRUEBA DE VALIDACIÓN WHATSAPP ===\n");

// Función para validar número
function validateWhatsAppNumber(rawNumber) {
  console.log(`📝 Número original: "${rawNumber}"`);
  
  // Detectar placeholders
  if (rawNumber.toLowerCase().includes("xxxx") || rawNumber.toLowerCase().includes("xxx")) {
    console.log("❌ RESULTADO: Contiene placeholders (xxxx/xxx)");
    console.log("❓ ACCIÓN: Ve al panel admin y actualiza con un número real\n");
    return null;
  }
  
  // Limpiar
  let cleanNumber = rawNumber
    .replace(/\s/g, "")
    .replace(/[-()]/g, "")
    .trim();
  
  console.log(`🧹 Número limpio: "${cleanNumber}"`);
  
  // Extraer dígitos
  const digitsOnly = cleanNumber.replace(/\D/g, "");
  console.log(`🔢 Solo dígitos: "${digitsOnly}"`);
  console.log(`📊 Cantidad de dígitos: ${digitsOnly.length}`);
  
  // Validar longitud
  if (digitsOnly.length < 10) {
    console.log(`❌ RESULTADO: Insuficientes dígitos (mínimo 10, tienes ${digitsOnly.length})`);
    console.log("❓ ACCIÓN: Ingresa un número completo con código de país\n");
    return null;
  }
  
  // Agregar código de país si no lo tiene
  const finalNumber = cleanNumber.startsWith("+") ? digitsOnly : "57" + digitsOnly;
  console.log(`✅ RESULTADO: ${finalNumber}`);
  console.log("✅ ACCIÓN: Número válido para WhatsApp API\n");
  return finalNumber;
}

// Casos de prueba
console.log("--- CASOS VÁLIDOS ---");
validateWhatsAppNumber("+57 1 1234 5678");
validateWhatsAppNumber("573187654321");
validateWhatsAppNumber("+57 (1) 1234-5678");

console.log("--- CASOS INVÁLIDOS ---");
validateWhatsAppNumber("+57 1 xxxx xxxx");
validateWhatsAppNumber("+57 1 XXXX XXXX");
validateWhatsAppNumber("+57 1 xxx xxxx");
validateWhatsAppNumber("+57");
validateWhatsAppNumber("12345");

console.log("--- CASO ACTUAL EN CHECKOUT ---");
// Reemplaza "NÚMERO_DE_AQUÍ" con el valor que ves en la consola
// De: "Raw WhatsApp number from settings:"
validateWhatsAppNumber("REEMPLAZA_AQUÍ_CON_EL_NÚMERO_DE_CONSOLA");

console.log("=== FIN DE PRUEBA ===");
