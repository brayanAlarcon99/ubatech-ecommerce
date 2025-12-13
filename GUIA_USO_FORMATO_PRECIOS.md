# 🎯 GUÍA DE USO - Función de Formato de Precios

## 📌 Ubicación de la Función

**Archivo:** `lib/format-price.ts`

```typescript
// Importar en cualquier componente que necesite formatear precios
import { formatPriceWithCurrency } from "@/lib/format-price"
```

---

## 🔧 Funciones Disponibles

### 1. `formatPrice(price: number): string`
Formatea solo el número sin símbolo de moneda.

**Ejemplo:**
```typescript
formatPrice(3000)        // → "3.000"
formatPrice(1560000)     // → "1.560.000"
formatPrice(299.99)      // → "299.99"
```

**Uso:**
```typescript
const precioFormateado = formatPrice(3000);
console.log(precioFormateado); // "3.000"
```

---

### 2. `formatPriceWithCurrency(price: number, currency?: string): string`
Formatea el número con símbolo de moneda (por defecto "$").

**Ejemplo:**
```typescript
formatPriceWithCurrency(3000)           // → "$3.000"
formatPriceWithCurrency(1560000)        // → "$1.560.000"
formatPriceWithCurrency(299.99)         // → "$299.99"
formatPriceWithCurrency(3000, "COP")    // → "COP3.000"
```

**Uso:**
```typescript
const precioConSimbolo = formatPriceWithCurrency(3000);
console.log(precioConSimbolo); // "$3.000"
```

---

## 📝 Ejemplos de Implementación

### Componente React

```typescript
"use client"

import { formatPriceWithCurrency } from "@/lib/format-price"

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      
      {/* Así se usa en JSX */}
      <p className="price">{formatPriceWithCurrency(product.price)}</p>
    </div>
  )
}
```

**Resultado en HTML:**
```html
<p class="price">$1.560.000</p>
```

---

### Con Operaciones de Cálculo

```typescript
import { formatPriceWithCurrency } from "@/lib/format-price"

// Calcular subtotal y formatear
const quantity = 3;
const unitPrice = 50000;
const subtotal = quantity * unitPrice;

console.log(formatPriceWithCurrency(subtotal));
// Output: "$150.000"
```

---

### En Template Strings

```typescript
import { formatPriceWithCurrency } from "@/lib/format-price"

const item = { name: "iPhone 15", price: 1499999 };

const message = `
Producto: ${item.name}
Precio: ${formatPriceWithCurrency(item.price)}
`;

console.log(message);
// Output:
// Producto: iPhone 15
// Precio: $1.499.999
```

---

## 🎨 Casos de Uso en la App

### 1. Tarjeta de Producto (Tienda Pública)

**Archivo:** `components/product-card.tsx`

```typescript
<span style={{ color: "var(--accent-green)" }}>
  {formatPriceWithCurrency(product.price)}
</span>
```

**Resultado:** `$1.560.000`

---

### 2. Modal de Detalles

**Archivo:** `components/product-card.tsx`

```typescript
<span className="text-3xl font-bold" style={{ color: "var(--accent-green)" }}>
  {formatPriceWithCurrency(product.price)}
</span>
```

**Resultado:** `$1.560.000`

---

### 3. Carrito de Compras

**Archivo:** `app/carrito/page.tsx`

```typescript
{/* Precio individual */}
<p className="text-gray-600 text-sm">
  {formatPriceWithCurrency(item.price)}
</p>

{/* Total del carrito */}
<span style={{ color: "var(--accent-green)" }}>
  {formatPriceWithCurrency(total)}
</span>
```

**Resultado:** 
- Item: `$3.000`
- Total: `$3.109.998`

---

### 4. Checkout

**Archivo:** `app/checkout/page.tsx`

```typescript
{/* Lista de items */}
<span className="font-semibold">
  {formatPriceWithCurrency(item.price * item.quantity)}
</span>

{/* Total */}
<span style={{ color: "var(--accent-green)" }}>
  {formatPriceWithCurrency(total)}
</span>

{/* Mensaje WhatsApp */}
.map((item) => `• ${item.name} x${item.quantity} - ${formatPriceWithCurrency(item.price * item.quantity)}`)
```

**Resultado:**
```
• iPhone 15 x1 - $1.499.999
Total: $1.499.999
```

---

### 5. Panel Administrativo

**Archivo:** `components/admin/products-manager.tsx`

```typescript
<p className="text-sm font-bold" style={{ color: "var(--accent-turquoise)" }}>
  {formatPriceWithCurrency(product.price)}
</p>
```

**Resultado:** `$1.560.000`

---

## 🔄 Flujo de Datos

```
Entrada (número)
    ↓
formatPrice() 
    ├─ Valida que sea número
    ├─ Aplica locale es-ES
    ├─ Formatea separadores de miles
    ├─ Limita decimales a máximo 2
    └─ Retorna string formateado
    ↓
formatPriceWithCurrency()
    ├─ Toma resultado de formatPrice()
    ├─ Agrega símbolo de moneda ($)
    └─ Retorna string final
    ↓
Salida (string con formato)
```

---

## ⚙️ Configuración

### Locale Actual
- **País:** España (Español)
- **Separador de miles:** Punto (.)
- **Separador decimal:** Coma (,) - pero no mostramos decimales innecesarios
- **Símbolo predeterminado:** $ (dólar)

### Cambiar Locale

Si necesitas cambiar el locale, edita `lib/format-price.ts`:

```typescript
// Cambiar de es-ES a otro locale
new Intl.NumberFormat("en-US", {  // Ahora es en-US
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(price)

// en-US: 1,000 (coma para miles, punto para decimales)
// es-ES: 1.000 (punto para miles, coma para decimales)
// fr-FR: 1 000 (espacio para miles, coma para decimales)
```

---

## 🐛 Troubleshooting

### Problema: Importación no funciona
**Solución:**
```typescript
// ❌ Incorrecto
import { formatPriceWithCurrency } from "./format-price"

// ✅ Correcto
import { formatPriceWithCurrency } from "@/lib/format-price"
```

---

### Problema: Precio muestra NaN
**Solución:**
```typescript
// ❌ Incorrecto - pasar string
formatPriceWithCurrency("3000")

// ✅ Correcto - pasar número
formatPriceWithCurrency(3000)

// ✅ O convertir string a número
formatPriceWithCurrency(parseFloat("3000"))
```

---

### Problema: Decimales no se muestran
**Solución:**
```typescript
// ✅ Funciona correctamente
formatPriceWithCurrency(299.99)  // → "$299.99"

// Si quieres forzar 2 decimales siempre:
// Edita lib/format-price.ts
minimumFractionDigits: 2,  // Cambiar de 0 a 2
```

---

## 📊 Comparativa de Locales

| Locale | Entrada | Salida |
|--------|---------|--------|
| es-ES | 1000 | 1.000 |
| en-US | 1000 | 1,000 |
| fr-FR | 1000 | 1 000 |
| de-DE | 1000 | 1.000 |

---

## 🚀 Recomendaciones

1. **Siempre usar `formatPriceWithCurrency`** en UI (interfaz de usuario)
2. **Usar `formatPrice`** solo si necesitas solo el número sin símbolo
3. **Guardar valores sin formato** en base de datos (números puros)
4. **Formatear al mostrar** en pantalla
5. **Nunca almacenar** strings formateados en base de datos

---

## ✅ Checklist de Implementación

Cuando agregues un nuevo componente que muestre precios:

- [ ] Importar `formatPriceWithCurrency` desde `@/lib/format-price`
- [ ] Reemplazar `$price` con `{formatPriceWithCurrency(price)}`
- [ ] Validar que el valor sea un número (no string)
- [ ] Probar con diferentes valores (100, 1000, 1000000, 999.99)
- [ ] Verificar visualmente el formato en navegador

---

## 📞 Soporte

**Archivo principal:** `lib/format-price.ts`

Si necesitas modificar el comportamiento, este es el único archivo que necesitas editar. Los cambios se aplicarán automáticamente en toda la aplicación.

---

**Última actualización:** 10 de Diciembre de 2025
