# 🔧 DOCUMENTACIÓN TÉCNICA: Actualización Sistema de Stock a Traer

## 📌 Resumen Ejecutivo

### Cambios Principales:
1. Renombrado: `minStockByStore` → `stockToFetchByStore`
2. Nueva lógica: Agregar stock resta del "Stock a Traer"
3. Páginas públicas: Siempre muestran 20 disponibles
4. Filtros actualizados: Basados en cantidad a traer, no en mínimo

### Compatibilidad:
- ✅ Compilación: Success
- ✅ TypeScript: Todos los tipos validados
- ✅ Backwards compatibility: Parcial (solo lectura de datos antiguos)

---

## 📂 Cambios por Archivo

### 1. `types/index.ts`

```typescript
// ANTES:
export interface Product {
  stock: { [storeId: string]: number }
  minStockByStore?: { [storeId: string]: number }
}

// DESPUÉS:
export interface Product {
  stock: { [storeId: string]: number }
  stockToFetchByStore?: { [storeId: string]: number }
}
```

**Notas:**
- Campo `stock` se mantiene igual
- Campo `stockToFetchByStore` reemplaza `minStockByStore`
- Ambos campos son independientes

---

### 2. `components/admin/product-form.tsx`

#### Estado inicial:
```typescript
const [formData, setFormData] = useState({
  stock: product?.stock || { djcelutecnico: 0, ubatech: 0 },
  stockToFetchByStore: product?.stockToFetchByStore || { djcelutecnico: 0, ubatech: 0 },
  // ... otros campos
})
```

#### Manejo de cambios:
```typescript
function handleChange(e: React.ChangeEvent<...>) {
  const { name, value } = e.target
  
  if (name.startsWith("stockToFetch_")) {
    const storeId = name.replace("stockToFetch_", "")
    const numValue = parseFloat(cleanValue)
    const finalValue = isNaN(numValue) ? 0 : Math.floor(numValue)
    
    setFormData(prev => ({
      ...prev,
      stockToFetchByStore: {
        ...prev.stockToFetchByStore,
        [storeId]: finalValue,
      },
    }))
  }
}
```

#### Guardado en Firestore:
```typescript
const dataToSave: Omit<Product, "id"> = {
  ...formData,
  stock: {
    djcelutecnico: Math.floor(formData.stock.djcelutecnico || 0),
    ubatech: Math.floor(formData.stock.ubatech || 0),
  },
  stockToFetchByStore: {
    djcelutecnico: Math.floor(formData.stockToFetchByStore?.djcelutecnico || 0),
    ubatech: Math.floor(formData.stockToFetchByStore?.ubatech || 0),
  },
}
```

**Cambios UI:**
- Campos de input para `stockToFetch_djcelutecnico` y `stockToFetch_ubatech`
- Labels: "Stock a Traer 📦"
- Help text: "Cantidad a traer. Al agregar stock se restará de este valor."

---

### 3. `components/admin/products-manager.tsx`

#### Lógica de Agregar Stock (CAMBIO CRÍTICO):

**ANTES (no guardaba el cambio en minStockByStore):**
```typescript
const newStock = {
  ...showStockPanel.product.stock,
  ubatech: (showStockPanel.product.stock?.ubatech ?? 0) + stockInput.cantidad
}
await updateDoc(prodRef, { stock: newStock })
```

**DESPUÉS (actualiza ambos campos):**
```typescript
const currentStock = showStockPanel.product.stock?.ubatech ?? 0
const stockToFetch = showStockPanel.product.stockToFetchByStore?.ubatech ?? 0

const newStock = {
  ...showStockPanel.product.stock,
  ubatech: currentStock + stockInput.cantidad
}

const newStockToFetch = Math.max(0, stockToFetch - stockInput.cantidad)

await updateDoc(prodRef, { 
  stock: newStock,
  stockToFetchByStore: {
    ...showStockPanel.product.stockToFetchByStore,
    ubatech: newStockToFetch
  }
})
```

**Comportamiento:**
- Suma a `stock`
- Resta de `stockToFetchByStore`
- Usa `Math.max(0, ...)` para evitar negativos

#### Filtro "Out of Stock" (CAMBIO CRÍTICO):

**ANTES:**
```typescript
if (selectedCategory === "out-of-stock") {
  let hasLowStock = false
  stores.forEach((store) => {
    const minStock = product.minStockByStore?.[store.id] ?? 0
    const currentStock = product.stock?.[store.id] ?? 0
    if (currentStock < minStock) {
      hasLowStock = true
    }
  })
  categoryMatch = hasLowStock
}
```

**DESPUÉS:**
```typescript
if (selectedCategory === "out-of-stock") {
  let hasStockToFetch = false
  stores.forEach((store) => {
    const stockToFetch = product.stockToFetchByStore?.[store.id] ?? 0
    if (stockToFetch > 0) {
      hasStockToFetch = true
    }
  })
  categoryMatch = hasStockToFetch
}
```

**Lógica:**
- Antes: Mostraba si `currentStock < minStock`
- Después: Muestra si `stockToFetch > 0`

#### Display de Stock:

**ANTES:**
```typescript
const storesWithLowStock = []
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
```

**DESPUÉS:**
```typescript
const storesWithStockToFetch = []
stores.forEach((store) => {
  const stockToFetch = product.stockToFetchByStore?.[store.id] ?? 0
  if (stockToFetch > 0) {
    storesWithStockToFetch.push({
      store,
      stockToFetch
    })
  }
})
```

#### PDF Download:

**ANTES:**
```typescript
const allOutOfStockProducts = products.filter((p) => {
  const djMinStock = p.minStockByStore?.djcelutecnico ?? 0
  const ubaMinStock = p.minStockByStore?.ubatech ?? 0
  const djCurrentStock = p.stock?.djcelutecnico ?? 0
  const ubaCurrentStock = p.stock?.ubatech ?? 0
  return djCurrentStock < djMinStock || ubaCurrentStock < ubaMinStock
})
```

**DESPUÉS:**
```typescript
const allOutOfStockProducts = products.filter((p) => {
  const djStockToFetch = p.stockToFetchByStore?.djcelutecnico ?? 0
  const ubaStockToFetch = p.stockToFetchByStore?.ubatech ?? 0
  return djStockToFetch > 0 || ubaStockToFetch > 0
})
```

**Mapeo de datos:**
```typescript
const outOfStockByProduct = new Map<string, { store: string; stockToFetch: number }[]>()
validProducts.forEach((p) => {
  const storesWithStockToFetch = []
  
  const djStockToFetch = p.stockToFetchByStore?.djcelutecnico ?? 0
  if (djStockToFetch > 0) {
    storesWithStockToFetch.push({
      store: "DJCELUTECNICO",
      stockToFetch: djStockToFetch
    })
  }
  
  const ubaStockToFetch = p.stockToFetchByStore?.ubatech ?? 0
  if (ubaStockToFetch > 0) {
    storesWithStockToFetch.push({
      store: "Ubatech+Pro",
      stockToFetch: ubaStockToFetch
    })
  }
  
  outOfStockByProduct.set(p.id, storesWithStockToFetch)
})
```

---

### 4. `components/product-card.tsx`

#### Cambio Fundamental:

**ANTES (Lógica de stock en tiempo real):**
```typescript
const [liveStock, setLiveStock] = useState<number>(product.stock?.[storeId] ?? 0)

useEffect(() => {
  loadLiveStock()
  const interval = setInterval(() => {
    loadLiveStock()
  }, 3000) // Sincronizar cada 3 segundos
  return () => clearInterval(interval)
}, [product.id, storeId])

const loadLiveStock = async () => {
  try {
    const db = getDb()
    const productRef = doc(db, "products", product.id)
    const productSnap = await getDoc(productRef)
    if (productSnap.exists()) {
      const data = productSnap.data() as Product
      setLiveStock(data.stock?.[storeId] ?? 0)
    }
  } catch (error) {
    console.error("Error loading live stock:", error)
  }
}
```

**DESPUÉS (Estático, siempre 20):**
```typescript
const maxQuantity = 20
const [liveStock] = useState<number>(maxQuantity)
// Removido: useEffect de sincronización
// Removido: función loadLiveStock
```

**Impacto:**
- ✅ Reduce llamadas a Firestore
- ✅ Mejor performance
- ✅ Experiencia consistente (siempre 20)
- ❌ No refleja stock real

#### Renderizado:
```typescript
{liveStock > 0 ? (
  <span>Disponible: {liveStock}</span>  // Siempre "Disponible: 20"
) : (
  <span>Agotado</span>  // Nunca se ejecuta
)}

// Selector de cantidad:
<button onClick={() => setQuantity(Math.min(liveStock, quantity + 1))}>+</button>
// Siempre permite hasta 20
```

---

### 5. `lib/pdf-generator.ts`

#### Tipos actualizados:
```typescript
interface PDFGeneratorOptions {
  fileName?: string
  title?: string
  outOfStockByProduct?: Map<string, { 
    store: string
    stockToFetch?: number  // ⭐ Nuevo
    needed?: number        // Mantiene compatibilidad
  }[]>
}
```

#### Lógica de generación:
```typescript
if (outOfStockByProduct && outOfStockByProduct.has(product.id)) {
  const storesWithLowStock = outOfStockByProduct.get(product.id)
  if (storesWithLowStock && storesWithLowStock.length > 0) {
    storesWithLowStock.forEach((item: { 
      store: string
      stockToFetch?: number
      needed?: number 
    }) => {
      const quantity = item.stockToFetch ?? item.needed ?? 0
      const label = item.stockToFetch !== undefined ? "a traer" : "faltan"
      infoLines.push(`${item.store}: ${label} ${quantity} unidades`)
    })
  }
}
```

**Compatibilidad:**
- Soporta `stockToFetch` (nuevo)
- Soporta `needed` (antiguo)
- Prefiere `stockToFetch` si existe

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────┐
│  Admin Panel - Crear/Editar Producto    │
│  ├─ Stock Actual: [Campo de lectura]    │
│  └─ Stock a Traer: [Input numérico]     │
└──────────────┬──────────────────────────┘
               │ handleChange() + handleSubmit()
               ▼
┌─────────────────────────────────────────┐
│  Firestore - Documento Producto         │
│  ├─ stock: { djcelutecnico: X, ... }    │
│  └─ stockToFetchByStore: { ... }        │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   ┌────────────┐  ┌──────────────────────┐
   │Agregar     │  │Página Pública        │
   │Stock       │  │├─ Muestra siempre 20 │
   │├─ Suma a   │  │└─ Ignora stock real  │
   ││ stock     │  └──────────────────────┘
   │└─ Resta de │
   │  a traer   │
   └────────────┘
```

---

## ⚙️ Especificaciones de Comportamiento

### Agregar Stock - Algoritmo:

```
ENTRADA:
- showStockPanel.product: Producto actual
- stockInput.cantidad: Cantidad a agregar
- stockInput.tienda: "ubatech" o "djcelutecnico"

PROCESO:
1. Obtener stock actual para la tienda
   currentStock = product.stock?.[tienda] ?? 0

2. Obtener cantidad pendiente a traer
   stockToFetch = product.stockToFetchByStore?.[tienda] ?? 0

3. Calcular nuevo stock actual
   newStock = currentStock + cantidad

4. Calcular nuevo stock a traer
   newStockToFetch = Math.max(0, stockToFetch - cantidad)

5. Guardar en Firestore
   updateDoc(productRef, {
     stock: { ...stock, [tienda]: newStock },
     stockToFetchByStore: { ...stockToFetchByStore, [tienda]: newStockToFetch }
   })

SALIDA:
- Producto actualizado en BD
- UI refresca llamando loadData()
```

### Filtro "Out of Stock" - Lógica:

```
Para cada producto:
├─ IF selectedCategory === "out-of-stock"
│  ├─ PARA cada tienda:
│  │  └─ stockToFetch = product.stockToFetchByStore?.[tienda] ?? 0
│  │  └─ IF stockToFetch > 0 → incluir producto
│  └─ categoryMatch = true/false
├─ ELSE IF selectedCategory !== "all"
│  └─ categoryMatch = product.category === selectedCategory
└─ ELSE
   └─ categoryMatch = true

RESULTADO: Array filtrado de productos
```

---

## 🧪 Casos de Prueba

### Test 1: Crear Producto
```
Entrada:
- Nombre: "Test Product"
- Stock a Traer DJCELUTECNICO: 100
- Stock a Traer Ubatech: 50

Esperado:
- Producto en BD con stockToFetchByStore: { djcelutecnico: 100, ubatech: 50 }
- Stock inicial: { djcelutecnico: 0, ubatech: 0 }
```

### Test 2: Agregar Stock
```
Entrada:
- Producto con Stock a Traer: 100
- Agregar: 30 unidades

Esperado:
- stock.djcelutecnico: 0 → 30
- stockToFetchByStore.djcelutecnico: 100 → 70
```

### Test 3: Filtro Out of Stock
```
Entrada:
- Producto 1: stockToFetchByStore.djcelutecnico = 50
- Producto 2: stockToFetchByStore.djcelutecnico = 0
- Seleccionar "Out of Stock"

Esperado:
- Solo Producto 1 se muestra
```

### Test 4: Página Pública
```
Entrada:
- Cualquier producto

Esperado:
- Siempre muestra "Disponible: 20"
- Selector permite máximo 20
- Sin importar stock real en BD
```

---

## 📊 Datos de Ejemplo

### Documento en Firestore:
```json
{
  "id": "prod_iphone15",
  "name": "iPhone 15 Pro",
  "price": 1200000,
  "stock": {
    "djcelutecnico": 35,
    "ubatech": 12
  },
  "stockToFetchByStore": {
    "djcelutecnico": 65,
    "ubatech": 88
  },
  "category": "celulares"
}
```

**Interpretación:**
- DJCELUTECNICO: Tiene 35, espera 65 más (total 100)
- Ubatech: Tiene 12, espera 88 más (total 100)

---

## 🚨 Consideraciones de Seguridad

### Datos Expuestos:
- ❌ `stock` - No exponer en página pública
- ❌ `stockToFetchByStore` - No exponer en página pública
- ✅ Máximo 20 - Valor constante, seguro

### Validaciones:
```typescript
// En backend (handleSubmit en ProductForm):
if (!formData.name || !formData.name.trim()) {
  throw new Error("Name is required")
}

// En Firestore rules:
// Solo admins pueden leer/escribir products
allow read, write: if request.auth != null && request.auth.customClaims.admin == true;
```

---

## 📈 Performance

### Antes:
- Sincronización cada 3 segundos por producto
- 1 producto × 3 segundos = 20 llamadas/minuto
- 10 productos abiertos = 200 llamadas/minuto
- ❌ Consumo alto de BD

### Después:
- Sin sincronización en página pública
- Stock estático (20) = 0 llamadas
- ✅ Reducción del 100% en página pública

---

## 🔮 Extensibilidad Futura

### Si se quiere cambiar "20" en el futuro:
```typescript
// En product-card.tsx:
// De:
const maxQuantity = 20

// A (dinámico):
const maxQuantity = getConfigValue('maxQuantityPerProduct', 20)
```

### Si se quiere re-agregar sincronización:
```typescript
// Restaurar useEffect con loadLiveStock()
// Cambiar lógica de disponibilidad
// Considerar caché para performance
```

---

## 📋 Checklist de Implementación Verificada

- ✅ Tipos actualizados en `types/index.ts`
- ✅ Formulario actualizado en `product-form.tsx`
- ✅ Lógica de agregar stock en `products-manager.tsx`
- ✅ Filtros actualizados en `products-manager.tsx`
- ✅ PDF actualizado en `pdf-generator.ts`
- ✅ Páginas públicas actualizadas en `product-card.tsx`
- ✅ TypeScript compilation: ✅ PASSED
- ✅ Build production: ✅ PASSED

---

**Documento técnico completado: 2026-02-03**
