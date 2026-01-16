# ✅ ACTUALIZACIÓN: Sistema de Stock Mínimo por Tienda

## 📋 Resumen
Se ha implementado un sistema completo de **stock mínimo por tienda** que permite:
1. Establecer un mínimo de productos por tienda en el panel administrativo
2. Visualizar productos que están por debajo del mínimo establecido
3. Generar reportes PDF mostrando la cantidad de unidades que faltan para alcanzar el mínimo

---

## 🎯 Cambios Realizados

### 1. **Modelo de Datos - `types/index.ts`** ✅

#### Campo Agregado:
```typescript
export interface Product {
  // ... campos existentes ...
  minStockByStore?: {
    [storeId: string]: number
  }
}
```

**Propósito:** Almacenar el stock mínimo requerido para cada tienda (djcelutecnico, ubatech)

---

### 2. **Formulario de Producto - `components/admin/product-form.tsx`** ✅

#### Interfaz Mejorada:
- **Stock Actual:** Campo existente para el stock actual por tienda
- **Stock Mínimo:** Nuevo campo para establecer el mínimo requerido por tienda

#### Diseño Visual:
```
┌─────────────────────────────────┐
│ Stock por Tienda                │
├─────────────────────────────────┤
│ DJCELUTECNICO                   │
│ ├─ Stock Actual: [____]         │
│ └─ Stock Mínimo ⚠️: [____]      │
│                                 │
│ UBATECH+PRO                     │
│ ├─ Stock Actual: [____]         │
│ └─ Stock Mínimo ⚠️: [____]      │
└─────────────────────────────────┘
```

#### Funcionalidad:
- Cada tienda tiene su propio stock actual y stock mínimo
- Campos validados y guardados en la BD
- Incluye etiqueta ⚠️ para mayor visibilidad

#### Código de Cambio:
```typescript
// handleChange actualizado
else if (name.startsWith("minStock_")) {
  const storeId = name.replace("minStock_", "");
  const numValue = parseFloat(value);
  const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue);
  setFormData((prev) => ({
    ...prev,
    minStockByStore: {
      ...prev.minStockByStore,
      [storeId]: finalValue,
    },
  }))
}
```

---

### 3. **Panel de Gestión - `components/admin/products-manager.tsx`** ✅

#### Filtro "Fuera de Stock" Actualizado

**ANTES:**
```
Fuera de Stock: Mostraba productos con stock = 0
```

**DESPUÉS:**
```
Fuera de Stock: Muestra productos con stock < stock mínimo establecido

Lógica:
if (selectedCategory === "out-of-stock") {
  const minStock = product.minStockByStore?.[selectedStore] ?? 0
  const currentStock = product.stock?.[selectedStore] ?? 0
  categoryMatch = currentStock < minStock
}
```

#### Descarga de PDF Mejorada

**ANTES:**
- Mostraba tiendas sin stock (stock = 0)
- Información: "Tienda: Cantidad de productos"

**DESPUÉS:**
- Muestra tiendas con stock bajo (stock < mínimo)
- Información: "Tienda: Faltan X unidades"

---

### 4. **Generador de PDF - `lib/pdf-generator.ts`** ✅

#### Interfaz Actualizada:
```typescript
interface PDFGeneratorOptions {
  fileName?: string
  title?: string
  outOfStockByProduct?: Map<string, { store: string; needed: number }[]>
}
```

#### Información en el Reporte:
```
ANTES:
├─ Fuera de Stock: DJCELUTECNICO, Ubatech+Pro

DESPUÉS:
├─ DJCELUTECNICO: Faltan 5 unidades
└─ Ubatech+Pro: Faltan 3 unidades
```

#### Título del Documento:
```
ANTES: "Reporte de Productos Fuera de Stock"
DESPUÉS: "Reporte de Productos con Stock Bajo"
```

---

## 🎨 Cómo Usar

### Paso 1: Establecer Stock Mínimo
1. Ir a **Gestión de Productos** → **Editar Producto**
2. En la sección "Stock por Tienda":
   - Llenar "Stock Actual" (cantidad disponible)
   - Llenar "Stock Mínimo ⚠️" (cantidad mínima requerida)
3. Guardar el producto

### Paso 2: Ver Productos con Stock Bajo
1. En el panel de productos, hacer clic en **"Fuera de Stock"**
2. Se mostrarán todos los productos donde: `stock_actual < stock_mínimo`
3. La información de stock se colorea en rojo para fácil identificación

### Paso 3: Generar Reporte PDF
1. Con el filtro "Fuera de Stock" activo, hacer clic en **"Descargar PDF"**
2. El reporte mostrará:
   - Nombre del producto
   - Categoría
   - Precio
   - **Tienda y cantidad faltante** (ej: "DJCELUTECNICO: Faltan 5 unidades")
   - SKU y Marca (si aplica)

---

## 📊 Ejemplos

### Ejemplo 1: Producto con Stock Bajo
```
Producto: Samsung Galaxy S23
Categoría: Celulares
Precio: $800,000

DJCELUTECNICO:
  ├─ Stock Actual: 3 unidades
  ├─ Stock Mínimo: 10 unidades
  └─ Estado: ⚠️ BAJO (Faltan 7 unidades)

Ubatech+Pro:
  ├─ Stock Actual: 8 unidades
  ├─ Stock Mínimo: 5 unidades
  └─ Estado: ✅ OK
```

### Ejemplo 2: Reporte PDF
```
REPORTE DE PRODUCTOS CON STOCK BAJO
====================================

Producto: iPhone 15
DJCELUTECNICO: Faltan 8 unidades
Ubatech+Pro: Faltan 2 unidades

Producto: AirPods Pro
DJCELUTECNICO: Faltan 5 unidades

...
```

---

## 🔧 Validaciones

✅ Stock mínimo es un número entero (se redondea automáticamente)
✅ Stock mínimo no puede ser negativo
✅ Se guarda por separado para cada tienda
✅ El filtro "Fuera de Stock" respeta la tienda seleccionada
✅ El PDF muestra información clara y precisa

---

## 📝 Campos Modificados en BD

### Colección `products`
```javascript
{
  id: "prod_001",
  name: "Samsung Galaxy S23",
  price: 800000,
  stock: {
    djcelutecnico: 3,
    ubatech: 8
  },
  minStockByStore: {        // ← NUEVO
    djcelutecnico: 10,
    ubatech: 5
  },
  // ... resto de campos
}
```

---

## 🚀 Beneficios

1. **Control Preciso:** Cada tienda puede tener mínimos diferentes según su demanda
2. **Alertas Visuales:** Fácil identificación de productos con stock bajo
3. **Reportes Automáticos:** PDF genera información útil para compras
4. **Gestión Eficiente:** Saber exactamente cuántas unidades faltan por tienda
5. **Escalabilidad:** Sistema preparado para agregar más tiendas

---

## 📋 Checklist de Implementación

- ✅ Modelo de datos actualizado (types/index.ts)
- ✅ Formulario de producto con campos de stock mínimo
- ✅ Lógica de filtrado "Fuera de Stock" actualizada
- ✅ Generador de PDF con nueva información
- ✅ Validaciones en lugar
- ✅ Respeta selección de tienda en admin

