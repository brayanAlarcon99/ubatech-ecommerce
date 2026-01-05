# 🎓 GUÍA TÉCNICA: Decisiones, Recomendaciones y Mejores Prácticas

**Para**: Desarrolladores implementando multi-tienda  
**Nivel**: Intermedio-Avanzado  
**Objetivo**: Tomar decisiones técnicas correctas  

---

## 📋 CONTENIDOS

1. [Decisiones Clave](#decisiones-clave)
2. [Arquitectura vs Alternativas](#arquitectura-vs-alternativas)
3. [Mejores Prácticas](#mejores-prácticas)
4. [Pitfalls a Evitar](#pitfalls-a-evitar)
5. [Performance & Escalabilidad](#performance--escalabilidad)
6. [Testing Strategy](#testing-strategy)

---

## 🎯 DECISIONES CLAVE

### Decisión 1: Tenant Segmentation vs Separate Databases

#### ELEGIDO: Tenant Segmentation ✅

**Razones**:
- 1 BD = Más fácil de administrar
- 1 Proyecto Firebase = Menos costo
- Firestore Rules puede aislar datos
- Query filtering es eficiente
- Escalabilidad: fácil agregar tienda 3+

```typescript
// ✅ CORRECTO: Tenant Segmentation
const q = query(
  collection(db, "products"),
  where("storeId", "==", currentStoreId)
)
const products = await getDocs(q)
```

#### NO elegido: Separate Databases ❌

```typescript
// ❌ INCORRECTO: Múltiples BDs
// Complica el código, incrementa costos
// Requiere: 2 conectores, 2 autenticaciones, 2 proyectos
```

---

### Decisión 2: Dónde guardar storeId

#### Opción A: En documentos de productos (ELEGIDA) ✅

```typescript
// ✅ MEJOR: storeId en cada documento
{
  id: "prod_001",
  name: "Galaxy A13",
  storeId: "store_001"  // Campo explícito
}

// Ventajas:
// - Query directo
// - Firestore Rules simple
// - Rápido filtrar
```

#### Opción B: En ruta de colección (No recomendada) ❌

```typescript
// ❌ PEOR: stores/store_001/products
// Más complejo de querrear
// Restringe crecimiento
```

---

### Decisión 3: Validación de storeId

#### Opción A: En Frontend + Backend (ELEGIDA) ✅

```typescript
// ✅ MEJOR: Doble validación
// 1. Frontend: Mostrar datos correctos
// 2. Backend API: Validar storeId
// 3. Firestore Rules: Última validación

// Seguridad en capas (defense in depth)
```

#### Opción B: Solo en Firestore Rules ❌

```typescript
// ❌ MENOS SEGURO: Solo en BD
// Si Firestore Rules tiene error → seguridad comprometida
```

---

### Decisión 4: Autenticación por Tienda

#### Opción A: Usuarios globales con acceso a tiendas (ELEGIDA) ✅

```typescript
// ✅ CORRECTO: Usuario existe en todo el sistema
{
  uid: "user_123",
  email: "admin@example.com",
  stores: ["store_001", "store_002"]  // Acceso a múltiples tiendas
}

// Ventajas:
// - 1 login para ambas tiendas
// - Admin puede gestionar 2 tiendas
// - Escalable para tienda 3, 4, etc.
```

#### Opción B: Usuarios separados por tienda ❌

```typescript
// ❌ COMPLICADO: Múltiples logins
// Admin tendría 2 cuentas diferentes
// No es práctico
```

---

## 🏗️ ARQUITECTURA vs ALTERNATIVAS

### Alternativa 1: Monolito (Una app para todo)

```
Ventajas:
✓ Más fácil desarrollo inicial
✓ Una BD compartida
✓ Menos servidores

Desventajas:
✗ Difícil separar datos por tienda
✗ Riesgo de mostrar datos cruzados
✗ Admin no puede filtrar fácilmente
✗ Escalabilidad limitada
```

**Nuestra solución**: Monolito estructurado (mejor práctica)

---

### Alternativa 2: Microservicios

```
Ventajas:
✓ Escalabilidad extrema
✓ Equipos independientes
✓ Deploy independiente

Desventajas:
✗ Muy complejo para 2 tiendas
✗ Múltiples BDs
✗ Sincronización de datos
✗ Mayor costo
✗ No es proporcional
```

**Veredicto**: Overkill para 2 tiendas. Mejor escalar después.

---

### Alternativa 3: Dominios Separados

```
Opción A: Subdominio
├─ store1.example.com  → Código idéntico, BD compartida
├─ store2.example.com  → Código idéntico, BD compartida

Opción B: Path
├─ example.com/store1  → Código idéntico, BD compartida
├─ example.com/store2  → Código idéntico, BD compartida

Opción C: Dominio diferente
├─ store1.example.com  → Código separado, BD separada ❌
├─ store2.example.com  → Código separado, BD separada ❌
```

**Recomendación**: Path (/tienda1, /tienda2) es más simple

---

## ✅ MEJORES PRÁCTICAS

### 1. SIEMPRE INCLUIR STORESID EN QUERIES

❌ **INCORRECTO:**
```typescript
// Trae TODOS los productos
const snapshot = await getDocs(collection(db, "products"))

// ¡Seguridad comprometida!
```

✅ **CORRECTO:**
```typescript
// Trae solo productos de esta tienda
const q = query(
  collection(db, "products"),
  where("storeId", "==", currentStoreId)
)
const snapshot = await getDocs(q)
```

---

### 2. CREAR FUNCIONES REUTILIZABLES

❌ **INCORRECTO: Repetir lógica**
```typescript
// En 10 archivos diferentes
where("storeId", "==", currentStoreId)
```

✅ **CORRECTO: Función centralizada**
```typescript
// lib/services/queryBuilder.ts
export function withStoreFilter(storeId: string) {
  return where("storeId", "==", storeId)
}

// Uso en cualquier lado
const q = query(
  collection(db, "products"),
  withStoreFilter(currentStoreId)
)
```

---

### 3. VALIDAR STORESID EN FIREBASE RULES

✅ **EXCELENTE**:
```firestore
match /products/{productId} {
  // Validar que storeId existe
  allow read: if resource.data.storeId == request.auth.token.storeId;
  
  // Validar que storeId es válido al crear
  allow create: if exists(/databases/$(database)/documents/stores/$(request.resource.data.storeId));
}
```

---

### 4. USAR TIPOS TYPESCRIPT

✅ **CORRECTO**:
```typescript
interface Product {
  id: string
  name: string
  storeId: string  // ⭐ Obligatorio
  price: number
  // ...
}

// TypeScript te avisa si olvidas storeId
```

---

### 5. DOCUMENTAR EL CAMPO STORESID

```typescript
/**
 * Identificador de la tienda a la que pertenece este producto
 * 
 * @example "store_001"
 * @required - SIEMPRE debe estar presente
 * @usage - Usar en queries: where("storeId", "==", storeId)
 */
storeId: string
```

---

## ⚠️ PITFALLS A EVITAR

### Pitfall 1: Olvidar storeId en Creación

❌ **MALO**:
```typescript
// Admin crea producto
const newProduct = {
  name: "Galaxy A13",
  price: 299,
  // ❌ Falta storeId!
}
await addDoc(collection(db, "products"), newProduct)
```

**Resultado**: Producto sin tienda asignada

✅ **CORRECTO**:
```typescript
const newProduct = {
  name: "Galaxy A13",
  price: 299,
  storeId: currentStoreId  // ✅ Siempre incluir
}
await addDoc(collection(db, "products"), newProduct)
```

---

### Pitfall 2: Mostrar Datos de Otra Tienda

❌ **MALO**:
```typescript
// Olvidar filtro de tienda
function getAllProducts() {
  return getDocs(collection(db, "products"))  // ❌ SIN FILTRO
}

// Cliente ve: [prod_1_store1, prod_1_store2, prod_2_store2, ...]
// ¡Mezcla de datos!
```

✅ **CORRECTO**:
```typescript
function getStoreProducts(storeId: string) {
  const q = query(
    collection(db, "products"),
    where("storeId", "==", storeId)  // ✅ CON FILTRO
  )
  return getDocs(q)
}

// Cliente ve: [prod_1_store1, prod_2_store1] (solo su tienda)
```

---

### Pitfall 3: Admin Sin Selector de Tienda

❌ **MALO**:
```typescript
// Admin abre panel
// ¿Qué tienda es? No se sabe.
// ¿Ve datos de tienda 1 o 2? Confusión.
```

✅ **CORRECTO**:
```typescript
// Admin panel SIEMPRE muestra
<StoreSelector 
  currentStoreId={selectedStoreId} 
  onStoreChange={setSelectedStoreId}
/>

// Y la interfaz cambia al selector
```

---

### Pitfall 4: Permisos Firestore Incorrectos

❌ **MALO**:
```firestore
// Permitir leer TODOS los productos
match /products/{productId} {
  allow read: if request.auth != null;  // ❌ SIN FILTRO
}
```

✅ **CORRECTO**:
```firestore
match /products/{productId} {
  allow read: if request.auth != null && 
                 resource.data.storeId == request.auth.token.storeId;
}
```

---

### Pitfall 5: Mezclar Órdenes de Tiendas

❌ **MALO**:
```typescript
// Cliente agrega productos de tienda 1
carrito = [prod_galaxy, prod_note14]  // storeId: store_001

// Cliente agrega producto de tienda 2
carrito = [prod_galaxy, prod_note14, prod_macbook]  // ❌ MEZCLA

// Al checkout: ¿cuál tienda es?
```

✅ **CORRECTO**:
```typescript
// Validar al agregar
function addToCart(product) {
  // ¿Primera vez que agrega?
  if (cart.items.length === 0) {
    cart.storeId = product.storeId  // Asignar tienda
  }
  
  // ¿Producto de otra tienda?
  if (product.storeId !== cart.storeId) {
    throw new Error("No puedes mezclar tiendas")  // Rechazar
  }
  
  cart.items.push(product)
}
```

---

### Pitfall 6: Olvidar Validar en Checkout

❌ **MALO**:
```typescript
// Checkout sin validar
async function checkout() {
  const order = await createOrder(cart)  // ❌ Sin validación
}

// Si carrito tiene productos de 2 tiendas:
// Orden guardada con datos inconsistentes
```

✅ **CORRECTO**:
```typescript
async function checkout() {
  // Validar todos los items pertenecen a misma tienda
  const storeIds = new Set(cart.items.map(i => i.storeId))
  
  if (storeIds.size > 1) {
    throw new Error("No puedes comprar de diferentes tiendas")
  }
  
  // Validar storeId es válido
  const validStore = await getStoreById(cart.storeId)
  if (!validStore) {
    throw new Error("Tienda inválida")
  }
  
  // Crear orden con validaciones
  const order = await createOrder(cart)
}
```

---

## 📊 PERFORMANCE & ESCALABILIDAD

### Query Performance

#### Índices Recomendados

```firestore
// En Firebase Console → Firestore → Indexes
// Crear índices para queries frecuentes:

// 1. Productos por tienda
Collection: products
Fields: storeId (Asc), createdAt (Desc)

// 2. Órdenes por tienda y usuario
Collection: orders
Fields: storeId (Asc), userId (Asc), createdAt (Desc)

// 3. Categorías por tienda
Collection: categories
Fields: storeId (Asc), name (Asc)
```

#### Antes vs Después

```typescript
// ❌ SIN ÍNDICE: Query lenta
// Scans ALL products, luego filtra
const q = query(collection(db, "products"), where("storeId", "==", "store_001"))
// ⏱️ 500ms (malo)

// ✅ CON ÍNDICE: Query rápida
// Firestore accede directamente
const q = query(collection(db, "products"), where("storeId", "==", "store_001"))
// ⏱️ 50ms (bueno)
```

---

### Límites de Firestore

```
❌ Problema: Query con múltiples OR
where("storeId", "==", "store_001") OR where("storeId", "==", "store_002")
❌ No recomendado en Firestore

✅ Solución: Dos queries separadas
const store1Products = await getDocs(query(..., where("storeId", "==", "store_001")))
const store2Products = await getDocs(query(..., where("storeId", "==", "store_002")))
const allProducts = [...store1Products, ...store2Products]

✅ Mejor solución: Admin solo maneja 1 tienda a la vez
```

---

### Paginación

```typescript
// ✅ CORRECTO: Paginar por tienda
async function getStoreProducts(storeId: string, pageSize = 20, lastDoc = null) {
  let q = query(
    collection(db, "products"),
    where("storeId", "==", storeId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  )
  
  if (lastDoc) {
    q = query(..., startAfter(lastDoc))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs
}

// Uso:
const page1 = await getStoreProducts("store_001", 20)
const page2 = await getStoreProducts("store_001", 20, page1[page1.length - 1])
```

---

## 🧪 TESTING STRATEGY

### Unit Tests

```typescript
// test/services/queryBuilder.test.ts
describe("queryBuilder", () => {
  it("should include storeId filter", () => {
    const filter = withStoreFilter("store_001")
    expect(filter._key.path.segments).toContain("storeId")
  })
})
```

### Integration Tests

```typescript
// test/api/products.test.ts
describe("GET /api/products", () => {
  it("should only return products from requested store", async () => {
    const res = await fetch("/api/products?storeId=store_001")
    const products = await res.json()
    
    // Verificar que todos los productos pertenecen a store_001
    expect(products.every(p => p.storeId === "store_001")).toBe(true)
  })
  
  it("should return 400 if storeId is missing", async () => {
    const res = await fetch("/api/products")
    expect(res.status).toBe(400)
  })
})
```

### E2E Tests

```typescript
// test/e2e/multi-store.test.ts
describe("Multi-Store E2E", () => {
  it("should isolate data between stores", async () => {
    // 1. Visitar tienda 1
    await page.goto("/tienda1")
    const store1Products = await page.locator("[data-product]").count()
    
    // 2. Visitar tienda 2
    await page.goto("/tienda2")
    const store2Products = await page.locator("[data-product]").count()
    
    // 3. Verificar que son diferentes
    expect(store1Products).not.toBe(store2Products)
  })
  
  it("should prevent cross-store shopping", async () => {
    // 1. Agregar producto de tienda 1
    await addProductToCart("prod_1_store1")
    
    // 2. Ir a tienda 2
    await page.goto("/tienda2")
    
    // 3. Intentar agregar producto de tienda 2
    await expect(page.locator("[data-error]")).toContainText("No puedes mezclar tiendas")
  })
})
```

---

## 🔧 DEBUGGING TIPS

### Verificar storeId está presente

```typescript
// En console
db.collection("products").doc("prod_001").get().then(doc => {
  console.log("¿Tiene storeId?", "storeId" in doc.data())
  console.log("storeId:", doc.data().storeId)
})
```

### Verificar Firestore Rules

```typescript
// Firestore emulator
firebase emulators:start

// En código
connectFirestoreEmulator(db, "localhost", 8080)

// Testear rules
const result = await getDoc(doc(db, "products", "prod_001"))
// Si regresa datos → Rules permitió
// Si error → Rules bloqueó
```

### Network Inspector

```typescript
// Inspeccionar queries que se envían a Firestore
// En devtools → Network → XHR
// Ver params: ?storeId=store_001
```

---

## 📚 RESUMEN DE MEJORES PRÁCTICAS

| Práctica | ✅ Hacer | ❌ No Hacer |
|----------|---------|-----------|
| **Queries** | Siempre con `where("storeId")` | Queries sin filtro |
| **Creación** | Incluir `storeId` siempre | Crear sin `storeId` |
| **Admin** | Con selector de tienda | Sin selector |
| **Firestore Rules** | Validar `storeId` | Sin validación |
| **Carrito** | Validar una sola tienda | Permitir mezcla |
| **Checkout** | Validar `storeId` antes | Sin validación |
| **Errores** | Mensaje claro al usuario | Silenciar errores |
| **Logs** | Incluir `storeId` en logs | Logs sin contexto |

---

**Guía técnica v1.0** | Diciembre 2025 | Mejores prácticas multi-tienda
