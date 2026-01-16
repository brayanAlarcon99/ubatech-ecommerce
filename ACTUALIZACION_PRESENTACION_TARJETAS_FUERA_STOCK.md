# ✅ ACTUALIZACIÓN: Presentación de Tarjetas - Filtro Fuera de Stock

## 📋 Resumen
Se ha actualizado la presentación visual de las tarjetas de productos en el filtro **"Fuera de Stock"** para mostrar información clara y específica sobre qué cantidad de productos falta en cada tienda para alcanzar el stock mínimo.

---

## 🎨 Cambios Visuales

### Estructura de la Tarjeta en Filtro "Fuera de Stock"

```
┌─────────────────────────────────┐
│  1. [IMAGEN DEL PRODUCTO]       │
├─────────────────────────────────┤
│  2. Nombre del Producto         │
│                                 │
│  3. $ Precio                    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Stock Bajo:               │  │
│  │ DJCELUTECNICO: Faltan 5   │  │
│  │ Ubatech+Pro: Faltan 2     │  │
│  └───────────────────────────┘  │
│                                 │
│  [Editar] [Eliminar] [Stock]    │
└─────────────────────────────────┘
```

### Comparación: Antes vs Después

#### ANTES (Filtro Fuera de Stock)
```
┌─────────────────────────┐
│ [IMAGEN]                │
├─────────────────────────┤
│ Samsung Galaxy S23      │
│ Descripción corta...    │
│                         │
│ $800,000                │
│                         │
│ DJCELUTECNICO: 0        │  ← Solo mostraba stock actual
│ Ubatech+Pro: 0          │
│                         │
│ [Editar] [Eliminar]     │
└─────────────────────────┘
```

#### AHORA (Filtro Fuera de Stock)
```
┌─────────────────────────────────┐
│ [IMAGEN]                        │
├─────────────────────────────────┤
│ Samsung Galaxy S23              │
│                                 │
│ $800,000                        │
│                                 │
│ ╔═════════════════════════════╗ │
│ ║ Stock Bajo:                 ║ │
│ ║ DJCELUTECNICO: Faltan 5     ║ │  ← NUEVO: Muestra cantidad
│ ║ Ubatech+Pro: Faltan 2       ║ │     faltante para el mínimo
│ ╚═════════════════════════════╝ │
│                                 │
│ [Editar] [Eliminar] [Stock]     │
└─────────────────────────────────┘
```

---

## 📊 Elementos Mostrados

### 1. **Imagen del Producto** ✅
- Se muestra al inicio de la tarjeta
- Fondo gris claro para mejor visualización
- Proporciones: 100% de ancho × 24px de alto

### 2. **Nombre del Producto** ✅
- Texto en negrita
- Tamaño: xs (pequeño)
- Color: primario oscuro
- Máximo 2 líneas (line-clamp-2)

### 3. **Precio** ✅
- Mostrará el precio actual
- Si hay descuento: 
  - Precio original tachado
  - Precio con descuento en verde
  - Porcentaje de descuento en badge cyan
- Si no hay descuento:
  - Solo el precio en color turquesa

### 4. **Stock Bajo (SOLO EN FILTRO "FUERA DE STOCK")** ✅
- **Solo aparece cuando se selecciona el filtro "Fuera de Stock"**
- Caja destacada con fondo rojo claro y borde rojo
- Etiqueta: "Stock Bajo:"
- Información por tienda:
  - Nombre de la tienda (en rojo oscuro, negrita)
  - "Faltan X unidades" (cantidad en grande, rojo)
  
**Ejemplo:**
```
Stock Bajo:
DJCELUTECNICO: Faltan 5 unidades
Ubatech+Pro: Faltan 2 unidades
```

---

## 💻 Cambios en Código

### Lógica Implementada

```typescript
// En categoryProducts.map((product) => {

const isOutOfStockFilter = selectedCategory === "out-of-stock"

// Calcular qué tiendas tienen stock bajo
let storesWithLowStock: { 
  store: { id: string; name: string }; 
  stockNeeded: number 
}[] = []

if (isOutOfStockFilter) {
  stores.forEach((store) => {
    const minStock = product.minStockByStore?.[store.id] ?? 0
    const currentStock = product.stock?.[store.id] ?? 0
    if (currentStock < minStock) {
      storesWithLowStock.push({
        store,
        stockNeeded: minStock - currentStock
      })
    }
  })
}

// En el JSX:
{isOutOfStockFilter ? (
  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
    <p className="text-xs font-semibold text-red-700 mb-1">Stock Bajo:</p>
    <div className="space-y-1">
      {storesWithLowStock.map((item) => (
        <div key={item.store.id} className="text-xs text-red-600 font-semibold">
          <span className="font-bold text-red-700">{item.store.name}:</span> 
          Faltan <span className="font-bold text-lg text-red-600">{item.stockNeeded}</span> unidades
        </div>
      ))}
    </div>
  </div>
) : (
  // Mostrar stock normal en otros filtros
)}
```

---

## 🎯 Beneficios

✅ **Claridad Visual:** Información bien organizada y fácil de entender
✅ **Información Relevante:** Muestra exactamente lo que falta, no lo que hay
✅ **Filtro Específico:** Diferencia la presentación según el filtro seleccionado
✅ **Alertas Visuales:** Colores rojo indican urgencia
✅ **Mejor Gestión:** Facilita la identificación rápida de faltantes por tienda

---

## 📝 Ejemplo Práctico

### Escenario: Producto Samsung Galaxy S23

```
Configuración:
├─ Stock Mínimo DJCELUTECNICO: 10 unidades
├─ Stock Actual DJCELUTECNICO: 5 unidades
├─ Stock Mínimo Ubatech+Pro: 8 unidades
└─ Stock Actual Ubatech+Pro: 8 unidades (OK)

Resultado en Filtro "Fuera de Stock":
┌──────────────────────────────┐
│ [Imagen Samsung S23]         │
├──────────────────────────────┤
│ Samsung Galaxy S23           │
│                              │
│ $800,000                     │
│                              │
│ Stock Bajo:                  │
│ DJCELUTECNICO: Faltan 5 uni. │
│ (No muestra Ubatech+Pro aquí)│
│                              │
│ [Editar] [Eliminar] [Stock]  │
└──────────────────────────────┘
```

---

## ✨ Detalles de Estilo

| Elemento | Estilo | Color |
|----------|--------|-------|
| Caja Stock Bajo | bg-red-50, border red-200 | Rojo claro |
| Etiqueta "Stock Bajo:" | text-xs, font-semibold | Rojo oscuro |
| Nombre Tienda | font-bold | Rojo oscuro |
| Número de unidades | font-bold, text-lg | Rojo intenso |
| Espaciado | space-y-1 | - |
| Padding de caja | p-2 | - |

---

## 🔄 Comportamiento según Filtro

### Filtro: "Todas" o "Categoría Específica"
```
Se muestra información normal de stock:
DJCELUTECNICO: 5 unidades
Ubatech+Pro: 8 unidades
```

### Filtro: "Fuera de Stock" (Bajo Mínimo)
```
Se muestra información de faltantes:
Stock Bajo:
DJCELUTECNICO: Faltan 5 unidades
Ubatech+Pro: Faltan 2 unidades
```

---

## 📋 Checklist

- ✅ Tarjetas muestran imagen
- ✅ Tarjetas muestran nombre
- ✅ Tarjetas muestran precio
- ✅ Filtro "Fuera de Stock" muestra tienda + cantidad faltante
- ✅ Información diferenciada por filtro
- ✅ Estilos visuales claros y destacados
- ✅ Sin errores de sintaxis

