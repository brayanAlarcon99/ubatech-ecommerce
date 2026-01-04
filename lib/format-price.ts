/**
 * Parsea un string de precio a número
 * Maneja múltiples formatos: "6000", "6.000", "1.234.567", "299.99", etc.
 * @param priceString String con el precio
 * @returns Número parseado o 0 si es inválido
 * @internal Función privada, usada por ensureNumberPrice y sanitizePriceInput
 */
function parsePriceString(priceString: string): number {
  if (!priceString || priceString.trim() === '') {
    return 0;
  }
  
  let cleaned = priceString.trim();
  
  // Si contiene puntos, asumir que podrían ser separadores de miles
  if (cleaned.includes('.')) {
    const dotCount = (cleaned.match(/\./g) || []).length;
    
    // Si hay múltiples puntos O un punto en los últimos 3 caracteres = separador de miles
    if (dotCount > 1 || (dotCount === 1 && cleaned.lastIndexOf('.') > cleaned.length - 4)) {
      cleaned = cleaned.replace(/\./g, '');
    } else {
      // Un punto pero no al final = separador decimal
      cleaned = cleaned.replace(',', '.');
    }
  }
  
  // Reemplazar coma por punto para decimales
  cleaned = cleaned.replace(',', '.');
  
  // Asegurar que solo haya un punto decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Asegura que el precio sea un número válido
 * Si es string, intenta convertirlo, si no es válido retorna 0
 * Maneja correctamente: "6000", "6.000", "1.234.567", "299.99", etc.
 */
export function ensureNumberPrice(price: any): number {
  if (typeof price === 'number') {
    return Math.round(price * 100) / 100; // Redondea a 2 decimales
  }
  
  if (typeof price === 'string') {
    return parsePriceString(price);
  }
  
  return 0;
}

/**
 * Formatea un precio para mostrar con separadores de miles (puntos)
 * Ejemplo: 3000 -> "3.000"
 *          1560000 -> "1.560.000"
 *          49.99 -> "49.99"
 */
export function formatPrice(price: number | string): string {
  const numPrice = ensureNumberPrice(price);
  
  // Convertir a string y aplicar separadores de miles manualmente
  const parts = numPrice.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Agregar puntos cada 3 dígitos en la parte entera (de derecha a izquierda)
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Recombinar con la parte decimal si existe
  return decimalPart ? `${withSeparators},${decimalPart}` : withSeparators;
}

/**
 * Formatea un precio con símbolo de moneda
 * Ejemplo: 3000 -> "$3.000"
 */
export function formatPriceWithCurrency(price: number | string, currency: string = "$"): string {
  return `${currency}${formatPrice(price)}`;
}

/**
 * Sanitiza entrada de precio para evitar caracteres inválidos
 * Acepta tanto "6000" como "6.000" y convierte correctamente
 * Convierte "1.234.567" a "1234567" antes de guardar en BD
 */
export function sanitizePriceInput(priceString: string): number {
  return parsePriceString(priceString);
}

/**
 * Normaliza los precios de un producto cargado desde Firestore
 * Asegura que el precio sea siempre un número, no un string
 * @param product Producto desde Firestore (puede tener precio como string o número)
 * @returns Producto con precio garantizado como número
 */
export function normalizeProductPrice(product: any): any {
  return {
    ...product,
    price: ensureNumberPrice(product.price)
  };
}

/**
 * Formatea un número de teléfono para WhatsApp
 * Elimina caracteres especiales y espacios
 * @param phone Número de teléfono
 * @returns Número formateado para WhatsApp
 */
export function formatPhoneForWhatsapp(phone: string): string {
  // Eliminar todos los caracteres que no sean números
  const cleaned = phone.replace(/\D/g, '');
  
  // Si no comienza con 54 (código de Argentina), agregarlo
  if (!cleaned.startsWith('54')) {
    // Si comienza con 9, es un número nacional que necesita 54
    if (cleaned.startsWith('9')) {
      return '54' + cleaned;
    }
    // Si no, asumir que ya tiene el código
    return cleaned;
  }
  
  return cleaned;
}
