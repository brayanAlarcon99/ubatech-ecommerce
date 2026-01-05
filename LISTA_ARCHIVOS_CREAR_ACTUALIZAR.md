# 📋 LISTA DE ARCHIVOS A CREAR Y ACTUALIZAR

**Checklist completo para implementación multi-tienda**  
**Último actualizado**: 19 de Diciembre de 2025

---

## 📊 RESUMEN RÁPIDO

```
Archivos a CREAR:      15
Archivos a ACTUALIZAR: 22
Líneas de código:      ~1500
Tiempo estimado:       15-22 horas
```

---

## ✅ ARCHIVOS A CREAR

### TIPOS & INTERFACES

- [ ] **types/store.ts**
  ```typescript
  interface Store { ... }
  interface StoreContextType { ... }
  ```

### HOOKS & CONTEXT

- [ ] **lib/hooks/useStore.ts**
  - Hook para acceder a tienda actual
  - createContext + useContext

- [ ] **lib/hooks/useStoreProducts.ts**
  - Hook para obtener productos de tienda
  - useEffect + fetch

- [ ] **lib/hooks/index.ts**
  - Exportar todos los hooks

### SERVICIOS

- [ ] **lib/services/storeService.ts**
  - getAllStores()
  - getStoreById()
  - getStoreBySlug()

### PROVIDERS

- [ ] **app/providers/store-provider.tsx**
  - StoreProvider component
  - Cargar tienda + pasar context

### COMPONENTES ADMIN

- [ ] **components/admin/store-selector.tsx**
  - Selector de tiendas (dropdown)
  - onChange handler

### API ROUTES

- [ ] **app/api/stores/route.ts**
  - GET todos las tiendas

- [ ] **app/api/stores/[storeId]/route.ts**
  - GET tienda específica

### TIENDA 1 (Public)

- [ ] **app/tienda1/layout.tsx**
  - StoreProvider(storeId="store_001")
  - Metadata

- [ ] **app/tienda1/page.tsx**
  - useStore() hook
  - Mostrar productos tienda 1

- [ ] **app/tienda1/productos/page.tsx**
  - Listado de productos
  - Filtros y búsqueda

- [ ] **app/tienda1/productos/[id]/page.tsx**
  - Detalle de producto

- [ ] **app/tienda1/carrito/page.tsx**
  - Carrito separado por tienda

- [ ] **app/tienda1/checkout/page.tsx**
  - Checkout validado por tienda

### TIENDA 2 (Public)

- [ ] **app/tienda2/layout.tsx**
  - StoreProvider(storeId="store_002")

- [ ] **app/tienda2/page.tsx**
  - Mostrar productos tienda 2

- [ ] **app/tienda2/productos/page.tsx**
  - Listado de productos

- [ ] **app/tienda2/productos/[id]/page.tsx**
  - Detalle de producto

- [ ] **app/tienda2/carrito/page.tsx**
  - Carrito separado

- [ ] **app/tienda2/checkout/page.tsx**
  - Checkout validado

---

## ✏️ ARCHIVOS A ACTUALIZAR

### TIPOS

- [ ] **types/product.ts**
  - Agregar: `storeId: string` (obligatorio)

- [ ] **types/index.ts**
  - Exportar tipos de store

### SERVICIOS

- [ ] **lib/services/productService.ts**
  - getStoreProducts(storeId) - nueva función
  - createProduct(data, storeId) - incluir storeId
  - Todas las funciones con storeId

- [ ] **lib/services/categoryService.ts**
  - getStoreCategories(storeId) - nueva función
  - createCategory(data, storeId) - incluir storeId

- [ ] **lib/subcategories.ts**
  - Actualizar addSubcategory() - agregar storeId
  - Actualizar getSubcategoriesByCategory() - filtrar por store

- [ ] **lib/services/adminService.ts**
  - createProduct() - incluir storeId
  - createCategory() - incluir storeId

### API ROUTES

- [ ] **app/api/products/route.ts**
  - GET: require storeId query param
  - where("storeId", "==", storeId)
  - POST: incluir storeId en creación

- [ ] **app/api/categories/route.ts**
  - GET: require storeId query param
  - where("storeId", "==", storeId)

- [ ] **app/api/orders/route.ts**
  - POST: incluir storeId
  - GET: filtrar por storeId

- [ ] **app/api/subcategories/route.ts**
  - GET: filtrar por storeId
  - POST: incluir storeId

### COMPONENTES

- [ ] **components/admin/product-form.tsx**
  - PROP: storeId (nuevo)
  - Incluir storeId al guardar

- [ ] **components/admin/categories-manager.tsx**
  - PROP: storeId (nuevo)
  - Incluir storeId en creación/actualización

- [ ] **components/admin/layout.tsx** (si existe)
  - Agregar StoreSelector
  - Pasar storeId a children

- [ ] **components/product-card.tsx**
  - Si usa estilos contextuales, usar useStore()

- [ ] **components/cart/cart.tsx**
  - Validar storeId en carrito
  - Prevenir mezcla de tiendas

- [ ] **components/checkout/checkout.tsx**
  - Validar storeId antes de crear orden
  - Mostrar tienda seleccionada

### CONTEXTOS

- [ ] **lib/cart-context.tsx**
  - Agregar storeId a CartItem interface
  - addToCart() incluya storeId
  - Validar: no mezclar tiendas

### ADMIN PAGES

- [ ] **app/admin/layout.tsx**
  - Agregar StoreSelector
  - Pasar selectedStoreId a children

- [ ] **app/admin/page.tsx**
  - Mostrar selector de tienda
  - Dashboard básico

- [ ] **app/admin/productos/page.tsx**
  - PROP: storeId (del layout)
  - Pasar a product-form y listado

- [ ] **app/admin/categorias/page.tsx**
  - PROP: storeId
  - Pasar a categories-manager

- [ ] **app/admin/ordenes/page.tsx**
  - Filtrar ordenes por storeId
  - Mostrar solo órdenes de tienda seleccionada

- [ ] **app/admin/usuarios/page.tsx**
  - Si existe, considerar permisos por tienda

### CONFIG

- [ ] **firebase-rules.json** o **firestore.rules**
  - Reemplazar todo (ver ARQUITECTURA_MULTI_TIENDA.md)
  - Incluir validaciones storeId

- [ ] **package.json**
  - Sin cambios (probablemente)
  - Verificar versiones

### ESTILOS (Opcional)

- [ ] **styles/tienda1.css**
  - Variables CSS tienda 1
  - Colores primarios/secundarios

- [ ] **styles/tienda2.css**
  - Variables CSS tienda 2
  - Colores diferentes

---

## 📊 DETALLES DE CAMBIOS POR ARCHIVO

### **types/product.ts**

```typescript
// ANTES
interface Product {
  id: string
  name: string
  price: number
  category: string
  // ...
}

// DESPUÉS
interface Product {
  id: string
  name: string
  price: number
  category: string
  storeId: string  // ⭐ NUEVO - OBLIGATORIO
  // ...
}
```

---

### **lib/services/productService.ts**

```typescript
// NUEVA FUNCIÓN
export async function getStoreProducts(storeId: string): Promise<Product[]> {
  const db = getDb()
  const q = query(
    collection(db, "products"),
    where("storeId", "==", storeId)
  )
  return getDocs(q).then(snap => 
    snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
  )
}

// ACTUALIZAR
export async function createProduct(product: Product): Promise<string> {
  const db = getDb()
  // Verificar que storeId está presente
  if (!product.storeId) {
    throw new Error("storeId is required")
  }
  // Resto del código igual, pero con storeId
}
```

---

### **app/api/products/route.ts**

```typescript
// ACTUALIZAR GET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get("storeId")
  
  // ⭐ NUEVO: Validar storeId
  if (!storeId) {
    return NextResponse.json(
      { error: "storeId parameter is required" },
      { status: 400 }
    )
  }
  
  // ⭐ NUEVO: Filtrar por storeId
  const db = getDb()
  const q = query(
    collection(db, "products"),
    where("storeId", "==", storeId)
  )
  
  const snapshot = await getDocs(q)
  // ...
}

// ACTUALIZAR POST
export async function POST(request: Request) {
  const data = await request.json()
  
  // ⭐ NUEVO: Incluir storeId
  if (!data.storeId) {
    return NextResponse.json(
      { error: "storeId is required" },
      { status: 400 }
    )
  }
  
  // Resto igual...
}
```

---

### **components/admin/store-selector.tsx** (NUEVO)

```typescript
"use client"
export function StoreSelector({ 
  currentStoreId, 
  onStoreChange 
}: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([])
  
  // Cargar tiendas
  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(setStores)
  }, [])
  
  return (
    <select 
      value={currentStoreId}
      onChange={(e) => onStoreChange(e.target.value)}
    >
      {stores.map(s => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}
```

---

### **app/tienda1/layout.tsx** (NUEVO)

```typescript
import { StoreProvider } from "@/app/providers/store-provider"

export const metadata = { title: "Tienda 1" }

export default function Tienda1Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider storeId="store_001">
      <div className="min-h-screen">
        {children}
      </div>
    </StoreProvider>
  )
}
```

---

### **lib/cart-context.tsx**

```typescript
// ACTUALIZAR CartItem
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  storeId: string  // ⭐ NUEVO
  // ...
}

// ACTUALIZAR addToCart
function addToCart(product: Product) {
  // ⭐ NUEVO: Validar storeId
  if (items.length > 0 && items[0].storeId !== product.storeId) {
    throw new Error("No puedes mezclar tiendas en el carrito")
  }
  
  setItems([...items, {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    storeId: product.storeId,  // ⭐ NUEVO
    // ...
  }])
}
```

---

## 🔄 FIRESTORE RULES

- [ ] **firestore.rules**
  ```firestore
  // Reemplazar TODO el contenido
  // Ver: ARQUITECTURA_MULTI_TIENDA.md (sección Firestore Rules)
  
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Helpers...
      // Stores collection...
      // Products with storeId filter...
      // Categories with storeId filter...
      // Etc...
    }
  }
  ```

---

## 📊 VALIDACIÓN POST-IMPLEMENTACIÓN

### Checklist de Verificación

```
ARCHIVOS CREADOS:
☑ types/store.ts
☑ lib/hooks/useStore.ts
☑ lib/hooks/useStoreProducts.ts
☑ lib/services/storeService.ts
☑ app/providers/store-provider.tsx
☑ components/admin/store-selector.tsx
☑ app/api/stores/route.ts
☑ app/api/stores/[storeId]/route.ts
☑ app/tienda1/layout.tsx
☑ app/tienda1/page.tsx
☑ app/tienda2/layout.tsx
☑ app/tienda2/page.tsx
☑ (+ más archivos tienda1/2)

ARCHIVOS ACTUALIZADOS:
☑ types/product.ts (agregar storeId)
☑ lib/services/productService.ts
☑ lib/services/categoryService.ts
☑ app/api/products/route.ts
☑ app/api/categories/route.ts
☑ components/admin/product-form.tsx
☑ components/admin/categories-manager.tsx
☑ app/admin/layout.tsx
☑ app/admin/productos/page.tsx
☑ app/admin/categorias/page.tsx
☑ lib/cart-context.tsx
☑ firestore.rules

VERIFICACIONES:
☑ npm run build sin errores
☑ Acceder a /tienda1 funciona
☑ Acceder a /tienda2 funciona
☑ Admin tiene selector de tienda
☑ API /api/products?storeId=store_001 funciona
☑ Firestore Rules publicadas
☑ Productos en BD tienen storeId
☑ Test: Cliente tienda 1 no ve productos tienda 2
```

---

## 🚨 ARCHIVOS CRÍTICOS

Estos son los MÁS IMPORTANTES (no olvides):

1. **firestore.rules** - Seguridad
2. **types/store.ts** - Tipos
3. **lib/hooks/useStore.ts** - Hook principal
4. **app/api/products/route.ts** - API con filtro
5. **components/admin/store-selector.tsx** - Selector admin
6. **app/tienda1/layout.tsx** - Proveedor tienda 1
7. **app/tienda2/layout.tsx** - Proveedor tienda 2

---

## 📝 NOTAS IMPORTANTES

### Orden de Implementación Recomendado

1. Crear tipos (types/store.ts)
2. Crear servicios (storeService.ts)
3. Crear hooks (useStore.ts)
4. Crear provider (store-provider.tsx)
5. Crear APIs básicas (/api/stores)
6. Actualizar APIs productos/categorías
7. Crear componentes admin
8. Crear rutas tienda1/tienda2
9. Actualizar Firestore Rules
10. Testing

### Evitar Estos Errores

❌ Olvidar agregar storeId en creación  
❌ No filtrar queries por storeId  
❌ No validar storeId en API  
❌ No actualizar Firestore Rules  
❌ No incluir storeId en interface Product  
❌ Olvidar validar en checkout  

---

## 🔧 COMANDOS ÚTILES

```bash
# Compilar
npm run build

# Verificar tipos
npx tsc --noEmit

# Dev server
npm run dev

# Firestore Rules deploy
firebase deploy --only firestore:rules

# Firebase emulator
firebase emulators:start
```

---

## ✅ FINAL CHECKLIST

Cuando hayas terminado:

- [ ] Todos los 15 archivos creados
- [ ] Todos los 22 archivos actualizados
- [ ] npm run build sin errores
- [ ] /tienda1 y /tienda2 accesibles
- [ ] Admin con selector funcionando
- [ ] Firestore Rules publicadas
- [ ] Tests pasando
- [ ] Documentación leída
- [ ] Listo para deploy

---

**Lista de Archivos v1.0** | Diciembre 2025
