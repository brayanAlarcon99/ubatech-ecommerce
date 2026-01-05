# 📊 GUÍA PASO A PASO: Implementar 2 Tiendas Multi-Tenant

**Fecha**: 19 de Diciembre de 2025  
**Dificultad**: Media-Alta  
**Tiempo Estimado**: 15-22 horas  
**Prerequisitos**: Conocimiento de Next.js, Firestore, TypeScript  

---

## 🎯 OBJETIVO FINAL

Al finalizar este documento, tendrás:

✅ 2 tiendas públicas independientes (`/tienda1`, `/tienda2`)  
✅ Panel administrativo multi-tienda centralizado  
✅ Datos separados por tienda en la misma BD  
✅ Funcionalidades del superusuario mantidas  
✅ Seguridad mediante Firestore Rules  

---

## 📋 CONTENIDOS

1. [FASE 1: Preparación (1-2h)](#fase-1-preparación)
2. [FASE 2: Backend API (3-4h)](#fase-2-backend-api)
3. [FASE 3: Admin Panel (2-3h)](#fase-3-admin-panel)
4. [FASE 4: Tiendas Públicas (4-5h)](#fase-4-tiendas-públicas)
5. [FASE 5: Carrito & Checkout (2-3h)](#fase-5-carrito--checkout)
6. [FASE 6: Testing (3-4h)](#fase-6-testing)

---

## FASE 1: PREPARACIÓN

### Paso 1.1: Crear colección `stores` en Firestore

**Acción**: En Firebase Console, crear manualmente:

```javascript
// Colección: stores
// Documentos:

// Doc 1: store_001
{
  id: "store_001",
  name: "Tienda 1",
  slug: "tienda-1",
  domain: "tienda1.example.com",
  description: "Primera tienda",
  logo: "https://...",
  primaryColor: "#FF5733",
  secondaryColor: "#FFC300",
  createdAt: (server timestamp)
}

// Doc 2: store_002
{
  id: "store_002",
  name: "Tienda 2",
  slug: "tienda-2",
  domain: "tienda2.example.com",
  description: "Segunda tienda",
  logo: "https://...",
  primaryColor: "#0066CC",
  secondaryColor: "#00CCFF",
  createdAt: (server timestamp)
}
```

**Verificación**:
```javascript
// En Console → Firestore → collections
✅ stores/ (colección creada)
  ├── store_001 (documento)
  └── store_002 (documento)
```

---

### Paso 1.2: Crear tipos TypeScript

**Archivo**: `types/store.ts`

```typescript
export interface Store {
  id: string
  name: string
  slug: string
  domain: string
  description: string
  logo: string
  primaryColor: string
  secondaryColor?: string
  createdAt: any
}

export interface StoreContextType {
  currentStore: Store | null
  storeId: string
  loading: boolean
}
```

**Actualizar**: `types/index.ts`

```typescript
export * from "./store"
// ...resto de tipos
```

---

### Paso 1.3: Crear servicio `storeService.ts`

**Archivo**: `lib/services/storeService.ts`

```typescript
import { getDb } from "@/lib/firebase"
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore"
import type { Store } from "@/types"

/**
 * Obtiene todas las tiendas
 */
export async function getAllStores(): Promise<Store[]> {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, "stores"))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Store[]
  } catch (error) {
    console.error("[StoreService] Error getting stores:", error)
    return []
  }
}

/**
 * Obtiene una tienda por ID
 */
export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const db = getDb()
    const docSnap = await getDoc(doc(db, "stores", storeId))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Store
    }
    return null
  } catch (error) {
    console.error("[StoreService] Error getting store:", error)
    return null
  }
}

/**
 * Obtiene una tienda por slug
 */
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    const db = getDb()
    const snapshot = await getDocs(
      query(collection(db, "stores"), where("slug", "==", slug))
    )
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Store
  } catch (error) {
    console.error("[StoreService] Error getting store by slug:", error)
    return null
  }
}
```

**Verificación**:
```bash
# Sin cambios en compilación
npm run build
# ✅ Sin errores
```

---

### Paso 1.4: Crear hooks para Store

**Archivo**: `lib/hooks/useStore.ts`

```typescript
"use client"
import { useContext, createContext } from "react"
import type { Store, StoreContextType } from "@/types"

export const StoreContext = createContext<StoreContextType | null>(null)

export function useStore(): StoreContextType {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore debe usarse dentro de <StoreProvider>")
  }
  return context
}
```

**Archivo**: `lib/hooks/useStoreProducts.ts`

```typescript
"use client"
import { useState, useEffect } from "react"
import { useStore } from "./useStore"
import type { Product } from "@/types"

export function useStoreProducts() {
  const { storeId } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId) return

    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch(`/api/products?storeId=${storeId}`)
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [storeId])

  return { products, loading, error }
}
```

**Archivo**: `lib/hooks/index.ts`

```typescript
export { useStore, StoreContext } from "./useStore"
export { useStoreProducts } from "./useStoreProducts"
```

---

## FASE 2: BACKEND API

### Paso 2.1: Crear API `/api/stores`

**Archivo**: `app/api/stores/route.ts`

```typescript
import { getDb } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, "stores"))
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return NextResponse.json(stores)
  } catch (error) {
    console.error("[API /stores] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    )
  }
}
```

**Archivo**: `app/api/stores/[storeId]/route.ts`

```typescript
import { getDb } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const db = getDb()
    const docSnap = await getDoc(doc(db, "stores", params.storeId))
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data()
    })
  } catch (error) {
    console.error("[API /stores/[storeId]] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    )
  }
}
```

**Test**:
```bash
# Terminal
curl http://localhost:3000/api/stores
# Resultado esperado: [{ id: "store_001", name: "Tienda 1", ... }, ...]

curl http://localhost:3000/api/stores/store_001
# Resultado esperado: { id: "store_001", name: "Tienda 1", ... }
```

---

### Paso 2.2: Actualizar API `/api/products`

**Localizar archivo**: `app/api/products/route.ts`

**Buscar** esta sección:
```typescript
export async function GET(request: Request) {
  try {
    const db = getDb()
    const snapshot = await getDocs(collection(db, "products"))
    // ...
```

**Reemplazar por**:
```typescript
import { query, where } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const db = getDb()
    
    // Obtener storeId del query parameter
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId parameter is required" },
        { status: 400 }
      )
    }
    
    // Query: solo productos de esta tienda
    const q = query(
      collection(db, "products"),
      where("storeId", "==", storeId)
    )
    
    const snapshot = await getDocs(q)
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(products)
  } catch (error) {
    console.error("[API /products] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**Test**:
```bash
curl "http://localhost:3000/api/products?storeId=store_001"
# Resultado: Array de productos solo de tienda 1
```

---

### Paso 2.3: Actualizar API `/api/categories`

**Patrón similar** al anterior:

```typescript
// En app/api/categories/route.ts
// Agregar filtro por storeId
const storeId = searchParams.get("storeId")
const q = query(
  collection(db, "categories"),
  where("storeId", "==", storeId)
)
```

---

### Paso 2.4: Actualizar Firestore Rules

**Abrir**: Firebase Console → Firestore → Rules

**Reemplazar TODO el contenido por**:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // === HELPER FUNCTIONS ===
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
    
    function belongsToStore(storeId) {
      // Validar que el storeId exista
      return exists(/databases/$(database)/documents/stores/$(storeId));
    }
    
    // === STORES COLLECTION ===
    match /stores/{storeId} {
      // Cualquiera autenticado puede leer tiendas
      allow read: if isAuthenticated();
      // Solo admins pueden crear/actualizar/eliminar
      allow create, update, delete: if hasAdminRole();
    }
    
    // === CATEGORIES COLLECTION ===
    match /categories/{categoryId} {
      let storeId = request.resource.data.storeId;
      
      allow read: if isAuthenticated() && 
                     resource.data.storeId == request.auth.token.storeId;
      
      allow create: if isAuthenticated() && 
                       hasAdminRole() && 
                       belongsToStore(storeId);
      
      allow update: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
      
      allow delete: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
    }
    
    // === SUBCATEGORIES COLLECTION ===
    match /subcategories/{subcategoryId} {
      let storeId = request.resource.data.storeId;
      
      allow read: if isAuthenticated() && 
                     resource.data.storeId == request.auth.token.storeId;
      
      allow create: if isAuthenticated() && 
                       hasAdminRole() && 
                       belongsToStore(storeId);
      
      allow update: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
      
      allow delete: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
    }
    
    // === PRODUCTS COLLECTION ===
    match /products/{productId} {
      let storeId = request.resource.data.storeId;
      
      allow read: if isAuthenticated() && 
                     resource.data.storeId == request.auth.token.storeId;
      
      allow create: if isAuthenticated() && 
                       hasAdminRole() && 
                       belongsToStore(storeId);
      
      allow update: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
      
      allow delete: if isAuthenticated() && 
                       hasAdminRole() && 
                       resource.data.storeId == request.auth.token.storeId;
    }
    
    // === ORDERS COLLECTION ===
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.userId || 
                      hasAdminRole());
      
      allow create: if isAuthenticated() && 
                       request.resource.data.storeId == request.auth.token.storeId;
    }
    
    // === ADMIN USERS (SIN CAMBIOS) ===
    match /adminUsers/{userId} {
      allow read: if isAuthenticated() && hasAdminRole();
      allow write: if hasAdminRole();
    }
  }
}
```

**Publicar**: Click en "Publish"

---

## FASE 3: ADMIN PANEL

### Paso 3.1: Crear componente `StoreSelector`

**Archivo**: `components/admin/store-selector.tsx`

```typescript
"use client"
import { useState, useEffect } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import type { Store } from "@/types"

interface StoreSelectorProps {
  currentStoreId: string
  onStoreChange: (storeId: string) => void
}

export function StoreSelector({ currentStoreId, onStoreChange }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [])

  async function fetchStores() {
    try {
      const db = getDb()
      const snapshot = await getDocs(collection(db, "stores"))
      const storesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[]
      setStores(storesData)
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Cargando tiendas...</div>

  return (
    <div className="mb-4">
      <label htmlFor="store-select" className="block text-sm font-medium mb-2">
        Seleccionar Tienda
      </label>
      <select
        id="store-select"
        value={currentStoreId}
        onChange={(e) => onStoreChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">-- Seleccionar tienda --</option>
        {stores.map(store => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

### Paso 3.2: Actualizar Admin Layout

**Archivo**: `app/admin/layout.tsx`

**Agregar** al inicio del componente:

```typescript
"use client"
import { useState } from "react"
import { StoreSelector } from "@/components/admin/store-selector"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [selectedStoreId, setSelectedStoreId] = useState("store_001")

  return (
    <div className="admin-layout">
      <nav className="bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Panel Administrativo</h1>
        <StoreSelector 
          currentStoreId={selectedStoreId} 
          onStoreChange={setSelectedStoreId}
        />
        {/* Rest of navigation */}
      </nav>
      
      <main className="p-4">
        {/* Pass selectedStoreId to children */}
        {children}
      </main>
    </div>
  )
}
```

---

### Paso 3.3: Actualizar Formulario de Productos

**Archivo**: `components/admin/product-form.tsx`

**Localizar** donde se guarda el producto:

```typescript
// Buscar esta línea aproximadamente:
const docRef = await addDoc(collection(db, "products"), {
```

**Reemplazar por**:

```typescript
const docRef = await addDoc(collection(db, "products"), {
  ...formData,
  storeId: props.storeId,  // ⭐ Agregar storeId
  createdAt: new Date()
})
```

**Agregar prop** al componente:

```typescript
interface ProductFormProps {
  // ...existing props
  storeId: string  // ⭐ NUEVO
}

export default function ProductForm({ storeId, ...props }: ProductFormProps) {
  // ...
}
```

---

### Paso 3.4: Actualizar Gestor de Categorías

**Archivo**: `components/admin/categories-manager.tsx`

**Similar al anterior**:

```typescript
// Al crear categoría
await addDoc(collection(db, "categories"), {
  name: categoryName,
  storeId: props.storeId,  // ⭐ NUEVO
  createdAt: new Date()
})

// Al crear subcategoría
await addSubcategory(categoryId, subcategoryName, props.storeId)
```

**Actualizar function** en `lib/subcategories.ts`:

```typescript
export async function addSubcategory(
  categoryId: string,
  subcategoryName: string,
  storeId: string  // ⭐ NUEVO
): Promise<string | null> {
  const db = getDb()
  const docRef = await addDoc(collection(db, "subcategories"), {
    name: subcategoryName,
    categoryId,
    storeId,  // ⭐ NUEVO
    createdAt: new Date()
  })
  return docRef.id
}
```

---

## FASE 4: TIENDAS PÚBLICAS

### Paso 4.1: Crear Provider de Tienda

**Archivo**: `app/providers/store-provider.tsx`

```typescript
"use client"
import { StoreContext } from "@/lib/hooks/useStore"
import { getStoreById } from "@/lib/services/storeService"
import { useEffect, useState } from "react"
import type { Store, StoreContextType } from "@/types"

export function StoreProvider({
  children,
  storeId
}: {
  children: React.ReactNode
  storeId: string
}) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStore() {
      try {
        const store = await getStoreById(storeId)
        setCurrentStore(store)
      } catch (error) {
        console.error("Error loading store:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [storeId])

  const value: StoreContextType = {
    currentStore,
    storeId,
    loading
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
```

---

### Paso 4.2: Crear Layout de Tienda 1

**Archivo**: `app/tienda1/layout.tsx`

```typescript
import { StoreProvider } from "@/app/providers/store-provider"
import type { ReactNode } from "react"

export const metadata = {
  title: "Tienda 1",
  description: "Tienda 1 - Tu tienda de confianza",
}

export default function Tienda1Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider storeId="store_001">
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </StoreProvider>
  )
}
```

---

### Paso 4.3: Crear Page de Tienda 1

**Archivo**: `app/tienda1/page.tsx`

```typescript
"use client"
import { useStore, useStoreProducts } from "@/lib/hooks"
import ProductCard from "@/components/product-card"

export default function Tienda1() {
  const { currentStore, loading: storeLoading } = useStore()
  const { products, loading: productsLoading } = useStoreProducts()

  if (storeLoading || productsLoading) {
    return <div className="p-8">Cargando tienda...</div>
  }

  if (!currentStore) {
    return <div className="p-8">Error: Tienda no encontrada</div>
  }

  return (
    <div style={{ "--primary-color": currentStore.primaryColor } as React.CSSProperties}>
      {/* Header customizado */}
      <header className="bg-gray-100 p-4">
        {currentStore.logo && (
          <img src={currentStore.logo} alt={currentStore.name} className="h-12" />
        )}
        <h1 className="text-3xl font-bold">{currentStore.name}</h1>
        <p className="text-gray-600">{currentStore.description}</p>
      </header>

      {/* Productos */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-6">Catálogo</h2>
        {products.length === 0 ? (
          <p>No hay productos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

---

### Paso 4.4: Crear Layout de Tienda 2

**Archivo**: `app/tienda2/layout.tsx`

```typescript
import { StoreProvider } from "@/app/providers/store-provider"
import type { ReactNode } from "react"

export const metadata = {
  title: "Tienda 2",
  description: "Tienda 2 - Tu tienda favorita",
}

export default function Tienda2Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider storeId="store_002">
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </StoreProvider>
  )
}
```

---

### Paso 4.5: Crear Page de Tienda 2

**Archivo**: `app/tienda2/page.tsx`

Mismo contenido que tienda1 pero con estilos diferentes.

---

## FASE 5: CARRITO & CHECKOUT

### Paso 5.1: Actualizar Context de Carrito

**Archivo**: `lib/cart-context.tsx`

**Localizar** la interfaz `CartItem`:

```typescript
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  // ...
}
```

**Agregar**:

```typescript
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  storeId: string  // ⭐ NUEVO
  // ...
}
```

**En la función `addToCart`**:

```typescript
function addToCart(product: Product) {
  // ...antes
  setItems([...items, {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    storeId: product.storeId,  // ⭐ NUEVO
    // ...resto
  }])
}
```

---

### Paso 5.2: Actualizar Checkout

**Archivo**: `app/checkout/page.tsx`

**Antes de crear orden**, validar que todos los productos pertenecen a la misma tienda:

```typescript
function validateCartStore() {
  const storeIds = new Set(cartItems.map(item => item.storeId))
  if (storeIds.size > 1) {
    alert("No puedes comprar de diferentes tiendas en una sola orden")
    return false
  }
  return true
}

async function handleCheckout() {
  if (!validateCartStore()) return
  
  const storeId = cartItems[0].storeId
  
  // Crear orden con storeId
  const order = {
    userId: currentUser.uid,
    storeId,  // ⭐ NUEVO
    items: cartItems,
    total: calculateTotal(),
    createdAt: new Date()
  }
  
  await addDoc(collection(db, "orders"), order)
}
```

---

## FASE 6: TESTING

### Paso 6.1: Testing Manual

**Checklist de Testing**:

```
Tienda 1:
- [ ] Acceder a /tienda1
- [ ] Ver productos de tienda 1
- [ ] NO ver productos de tienda 2
- [ ] Agregar producto al carrito
- [ ] Realizar checkout
- [ ] Orden guardada con storeId="store_001"

Tienda 2:
- [ ] Acceder a /tienda2
- [ ] Ver productos de tienda 2
- [ ] NO ver productos de tienda 1
- [ ] Agregar producto al carrito
- [ ] Realizar checkout
- [ ] Orden guardada con storeId="store_002"

Admin Panel:
- [ ] Selector de tienda visible
- [ ] Al seleccionar tienda 1, ver solo categorías/productos de tienda 1
- [ ] Al seleccionar tienda 2, ver solo categorías/productos de tienda 2
- [ ] Crear producto en tienda 1
- [ ] Verificar que storeId="store_001" en Firestore
- [ ] Crear producto en tienda 2
- [ ] Verificar que storeId="store_002" en Firestore

Firestore Rules:
- [ ] Usuario tienda 1 NO puede ver productos de tienda 2
- [ ] Usuario tienda 2 NO puede ver productos de tienda 1
- [ ] Admin puede ver ambas tiendas
- [ ] No se pueden crear órdenes cruzadas
```

---

### Paso 6.2: Testing en Firebase Emulator (Opcional)

```bash
# Inicializar emulator
firebase emulators:start

# Cambiar código para usar emulator
// En lib/firebase.ts
if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
  connectFirestoreEmulator(db, "localhost", 8080)
}
```

---

## ✅ CHECKLIST FINAL

- [ ] Colección `stores` creada en Firestore
- [ ] Tipos TypeScript creados
- [ ] `storeService.ts` implementado
- [ ] Hooks (`useStore`, `useStoreProducts`) creados
- [ ] API `/api/stores` funcionando
- [ ] API `/api/products` filtra por storeId
- [ ] API `/api/categories` filtra por storeId
- [ ] Firestore Rules actualizadas
- [ ] `StoreSelector` component en admin
- [ ] ProductForm con storeId
- [ ] CategoriesManager con storeId
- [ ] `/tienda1/layout.tsx` y `/tienda1/page.tsx` creados
- [ ] `/tienda2/layout.tsx` y `/tienda2/page.tsx` creados
- [ ] Carrito actualizado con storeId
- [ ] Checkout valida multi-tienda
- [ ] Testing manual completado
- [ ] Firestore Rules testeadas
- [ ] Deploy a producción

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "storeId parameter is required"
**Solución**: Asegurate que todas las llamadas a `/api/products`, `/api/categories` incluyan `?storeId=store_001`

### Problema: "useStore debe usarse dentro de StoreProvider"
**Solución**: Asegurate que el componente está dentro del layout que tiene `<StoreProvider>`

### Problema: Productos de ambas tiendas visibles
**Solución**: Verificar que cada producto en Firestore tiene el campo `storeId` correcto

### Problema: "Permission denied" en Firestore
**Solución**: Revisar que `request.auth.token.storeId` está correctamente seteado

---

**Documento versión 1.0** | Guía Paso a Paso | Diciembre 2025
