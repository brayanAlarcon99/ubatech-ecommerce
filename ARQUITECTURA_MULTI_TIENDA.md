# 🏪 ARQUITECTURA MULTI-TIENDA: 2 Tiendas Independientes

**Fecha**: 19 de Diciembre de 2025  
**Estado**: Propuesta de Arquitectura  
**Objetivo**: Soportar 2 tiendas independientes con interfaces públicas separadas  

---

## 📋 TABLA DE CONTENIDOS

1. [Análisis Actual](#análisis-actual)
2. [Requisitos](#requisitos)
3. [Estrategia Propuesta](#estrategia-propuesta)
4. [Estructura de Base de Datos](#estructura-de-base-de-datos)
5. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
6. [Plan de Implementación](#plan-de-implementación)
7. [Cambios Requeridos](#cambios-requeridos)
8. [Seguridad & Permisos](#seguridad--permisos)

---

## 🔍 ANÁLISIS ACTUAL

### Estado Actual del Proyecto
```
✅ 1 Tienda pública (página principal)
✅ 1 Panel administrativo centralizado
✅ 1 Base de datos compartida (Firestore)
✅ Superusuario con control total
✅ Estructura jerárquica de categorías/subcategorías
```

### Lo que Compartirán las 2 Tiendas
```
✅ Base de datos (Firestore)
✅ Panel administrativo (mismo sistema)
✅ Funcionalidades del superusuario
✅ Autenticación Firebase
✅ Sistema de categorías y productos
```

### Lo que Será Diferente
```
❌ URL/Dominio de acceso público
❌ Identidad visual (branding, colores)
❌ Inventario (cada tienda verá solo sus productos)
❌ Estadísticas y reportes separados
```

---

## ✅ REQUISITOS

### Funcionales
1. **2 Interfaces públicas independientes** con URLs diferentes
2. **Datos separados por tienda** en la misma base de datos
3. **Panel administrativo unificado** con control total
4. **Superusuario puede gestionar ambas tiendas**
5. **Inventario separado** por tienda
6. **Pedidos/Compras separadas** por tienda

### Técnicos
1. Mantener estructura actual de Firestore
2. Agregar campo de "storeId" a productos/categorías
3. Crear 2 rutas públicas (/tienda1, /tienda2)
4. Firestore Rules actualizado para filtrar por tienda
5. Mantener compatibilidad con funcionalidades existentes

### Seguridad
1. Usuario no puede acceder a datos de otra tienda
2. Admin puede ver ambas tiendas
3. Superusuario tiene control total
4. Firestore Rules permite lectura separada por tienda

---

## 🎯 ESTRATEGIA PROPUESTA

### Opción A: TENANT SEGMENTATION (RECOMENDADO)
**Mantener 1 BD, agregar "storeId" a todos los documentos**

```
✅ Ventajas:
- Base de datos única (más simple)
- Panel administrativo centralizado
- Fácil de gestionar datos
- Firestore Rules claras
- Backup/Restore más fácil

❌ Desventajas:
- Requiere filtrar por storeId en todas las consultas
- Más reglas en Firestore
```

**RECOMENDACIÓN**: Usar esta opción.

---

### Opción B: MULTIPLE DATABASES
**Crear 2 bases de datos separadas en Firebase**

```
❌ Ventajas:
- Datos totalmente aislados

❌ Desventajas:
- Panel administrativo más complejo
- Autenticación duplicada
- Mayor costo en Firebase
- Mantenimiento complicado
- No recomendado
```

---

## 🏗️ ESTRUCTURA DE BASE DE DATOS

### Cambios en Firestore

#### Colección: `stores`
```json
stores/
├── store_001: {
│   id: "store_001",
│   name: "Tienda 1",
│   slug: "tienda-1",                    // Para URL
│   domain: "tienda1.tudominio.com",
│   description: "Primera tienda",
│   logo: "url-del-logo",
│   primaryColor: "#FF0000",
│   createdAt: Timestamp
│ }
│
└── store_002: {
    id: "store_002",
    name: "Tienda 2",
    slug: "tienda-2",
    domain: "tienda2.tudominio.com",
    description: "Segunda tienda",
    logo: "url-del-logo",
    primaryColor: "#0000FF",
    createdAt: Timestamp
  }
```

#### Colección: `categories` (MODIFICADA)
```json
categories/
├── cat_celulares_001: {
│   id: "cat_celulares_001",
│   name: "Celulares",
│   storeId: "store_001",                // ⭐ NUEVO
│   createdAt: Timestamp
│ }
│
└── cat_celulares_002: {
    id: "cat_celulares_002",
    name: "Celulares",
    storeId: "store_002",                // ⭐ NUEVO (otra tienda)
    createdAt: Timestamp
  }
```

#### Colección: `subcategories` (MODIFICADA)
```json
subcategories/
├── sub_samsung_001: {
│   id: "sub_samsung_001",
│   name: "Samsung",
│   categoryId: "cat_celulares_001",
│   storeId: "store_001",                // ⭐ NUEVO
│   createdAt: Timestamp
│ }
│
└── sub_samsung_002: {
    id: "sub_samsung_002",
    name: "Samsung",
    categoryId: "cat_celulares_002",
    storeId: "store_002",                // ⭐ NUEVO
    createdAt: Timestamp
  }
```

#### Colección: `products` (MODIFICADA)
```json
products/
├── prod_note14_001: {
│   id: "prod_note14_001",
│   name: "NOTE14PRO+",
│   category: "Celulares",
│   subcategory: "sub_samsung_001",
│   storeId: "store_001",                // ⭐ NUEVO
│   price: 1560000,
│   stock: 10,
│   createdAt: Timestamp
│ }
│
└── prod_note14_002: {
    id: "prod_note14_002",
    name: "NOTE14PRO+",
    category: "Celulares",
    subcategory: "sub_samsung_002",
    storeId: "store_002",                // ⭐ NUEVO (otra tienda)
    price: 1650000,
    stock: 5,
    createdAt: Timestamp
  }
```

#### Colección: `orders` (NUEVA/MODIFICADA)
```json
orders/
├── order_001: {
│   id: "order_001",
│   userId: "user_123",
│   storeId: "store_001",                // ⭐ NUEVO
│   products: [...],
│   total: 3120000,
│   createdAt: Timestamp
│ }
```

---

## 🏛️ ARQUITECTURA DEL PROYECTO

### Estructura de Carpetas Actualizada

```
app/
├── layout.tsx                           (Layout principal)
├── page.tsx                             (Landing o redirect)
│
├── tienda1/                             ⭐ NUEVA TIENDA 1
│   ├── layout.tsx
│   ├── page.tsx                         (Home tienda 1)
│   ├── productos/                       (Listado productos tienda 1)
│   │   └── [id]/page.tsx
│   ├── carrito/                         (Carrito tienda 1)
│   ├── checkout/                        (Checkout tienda 1)
│   └── contacto/                        (Contacto tienda 1)
│
├── tienda2/                             ⭐ NUEVA TIENDA 2
│   ├── layout.tsx
│   ├── page.tsx                         (Home tienda 2)
│   ├── productos/
│   │   └── [id]/page.tsx
│   ├── carrito/
│   ├── checkout/
│   └── contacto/
│
├── admin/                               ✅ ADMINISTRATIVO CENTRALIZADO
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tiendas/                         ⭐ NUEVA: Gestión de tiendas
│   │   ├── page.tsx                     (Lista de tiendas)
│   │   └── [storeId]/page.tsx           (Detalle tienda)
│   ├── categorias/                      (Actualizada para multi-tienda)
│   ├── productos/                       (Actualizada para multi-tienda)
│   ├── ordenes/                         (Actualizada para multi-tienda)
│   └── usuarios/
│
├── api/
│   ├── stores/                          ⭐ NUEVA API
│   │   ├── route.ts                     (CRUD tiendas)
│   │   └── [storeId]/route.ts
│   │
│   ├── products/                        (Actualizada)
│   │   └── route.ts                     (Incluir storeId filter)
│   │
│   ├── categories/                      (Actualizada)
│   │   └── route.ts                     (Incluir storeId filter)
│   │
│   └── orders/                          (Actualizada)
│       └── route.ts                     (Incluir storeId filter)
│
└── styles/
    ├── globals.css
    ├── tienda1.css                      ⭐ ESTILOS TIENDA 1
    └── tienda2.css                      ⭐ ESTILOS TIENDA 2

lib/
├── firebase.ts                          ✅ Sin cambios
├── admin-config.ts                      ✅ Sin cambios
│
├── hooks/
│   ├── useStore.ts                      ⭐ NUEVA: Hook para obtener tienda actual
│   └── useStoreProducts.ts              ⭐ NUEVA: Hook productos por tienda
│
└── services/
    ├── storeService.ts                  ⭐ NUEVA: Servicio tiendas
    ├── adminService.ts                  (Actualizada)
    └── productService.ts                (Actualizada para filtrar por storeId)

types/
├── store.ts                             ⭐ NUEVA: Tipos para tiendas
└── product.ts                           (Actualizada con storeId)

components/
├── admin/
│   ├── store-selector.tsx               ⭐ NUEVA: Selector de tienda en admin
│   ├── product-form.tsx                 (Actualizada)
│   └── categories-manager.tsx           (Actualizada)
│
└── public/
    ├── tienda1-header.tsx               ⭐ NUEVA: Header tienda 1
    ├── tienda2-header.tsx               ⭐ NUEVA: Header tienda 2
    ├── product-card.tsx                 (Usar useStore() para estilos)
    └── cart.tsx                         (Usar useStore() para carrito)
```

---

## 📝 PLAN DE IMPLEMENTACIÓN

### FASE 1: PREPARACIÓN (1-2 horas)
- [ ] Crear colección `stores` en Firestore
- [ ] Insertar 2 documentos de tiendas
- [ ] Crear tipos TypeScript para tiendas
- [ ] Crear servicio `storeService.ts`

### FASE 2: BACKEND API (3-4 horas)
- [ ] Crear API `/api/stores` (GET, POST, PUT, DELETE)
- [ ] Actualizar API `/api/products` para filtrar por storeId
- [ ] Actualizar API `/api/categories` para filtrar por storeId
- [ ] Actualizar Firestore Rules para tenant segmentation

### FASE 3: ADMIN PANEL (2-3 horas)
- [ ] Crear página `/admin/tiendas`
- [ ] Crear `StoreSelector` component
- [ ] Actualizar forms de productos/categorías
- [ ] Agregar filtrado por tienda en panel admin

### FASE 4: INTERFACES PÚBLICAS (4-5 horas)
- [ ] Crear estructura `/tienda1` y `/tienda2`
- [ ] Crear layouts separados por tienda
- [ ] Crear estilos/branding separado
- [ ] Crear hooks `useStore()` y `useStoreProducts()`

### FASE 5: CARRITO & CHECKOUT (2-3 horas)
- [ ] Actualizar contexto de carrito para incluir storeId
- [ ] Actualizar checkout para crear órdenes con storeId
- [ ] Actualizar validaciones de stock por tienda

### FASE 6: TESTING & DEPLOYMENT (3-4 horas)
- [ ] Testing en ambas tiendas
- [ ] Verificar Firestore Rules
- [ ] Deploy a producción
- [ ] Monitoreo

**TIEMPO TOTAL ESTIMADO**: 15-22 horas

---

## 🔧 CAMBIOS REQUERIDOS

### 1. FIRESTORE RULES (ACTUALIZAR)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
    
    function userStoreId() {
      // Obtener storeId del token o contexto
      return request.auth.token.storeId;
    }
    
    // Stores Collection
    match /stores/{storeId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if hasAdminRole();
    }
    
    // Categories - Filtradas por tienda
    match /categories/{categoryId} {
      allow read: if isAuthenticated() && 
                     resource.data.storeId == userStoreId();
      allow create, update: if hasAdminRole() && 
                               request.resource.data.storeId == userStoreId();
      allow delete: if hasAdminRole() && 
                       resource.data.storeId == userStoreId();
    }
    
    // Subcategories - Filtradas por tienda
    match /subcategories/{subcategoryId} {
      allow read: if isAuthenticated() && 
                     resource.data.storeId == userStoreId();
      allow create, update: if hasAdminRole() && 
                               request.resource.data.storeId == userStoreId();
      allow delete: if hasAdminRole() && 
                       resource.data.storeId == userStoreId();
    }
    
    // Products - Filtradas por tienda
    match /products/{productId} {
      allow read: if isAuthenticated() && 
                     resource.data.storeId == userStoreId();
      allow create, update: if hasAdminRole() && 
                               request.resource.data.storeId == userStoreId();
      allow delete: if hasAdminRole() && 
                       resource.data.storeId == userStoreId();
    }
    
    // Orders - Filtradas por tienda
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.userId || 
                      hasAdminRole());
      allow create: if isAuthenticated() && 
                       request.resource.data.storeId == userStoreId();
    }
  }
}
```

### 2. TIPOS TypeScript (CREAR)

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
  createdAt: Date
}

export interface StoreContextType {
  currentStore: Store | null
  storeId: string
  loading: boolean
  switchStore: (storeId: string) => void
}
```

### 3. HOOK useStore() (CREAR)

**Archivo**: `lib/hooks/useStore.ts`
```typescript
import { useState, useEffect, createContext, useContext } from "react"
import type { Store, StoreContextType } from "@/types/store"

const StoreContext = createContext<StoreContextType | null>(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore debe estar dentro de StoreProvider")
  }
  return context
}

export function StoreProvider({ children, storeId }: { children: React.ReactNode; storeId: string }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStore(storeId)
  }, [storeId])
  
  async function fetchStore(id: string) {
    try {
      const response = await fetch(`/api/stores/${id}`)
      const store = await response.json()
      setCurrentStore(store)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <StoreContext.Provider value={{ currentStore, storeId, loading, switchStore: fetchStore }}>
      {children}
    </StoreContext.Provider>
  )
}
```

### 4. SERVICIO storeService.ts (CREAR)

**Archivo**: `lib/services/storeService.ts`
```typescript
import { getDb } from "@/lib/firebase"
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import type { Store } from "@/types/store"

export async function getAllStores(): Promise<Store[]> {
  const db = getDb()
  const snapshot = await getDocs(collection(db, "stores"))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store))
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const db = getDb()
  const docSnap = await getDoc(doc(db, "stores", storeId))
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Store) : null
}

export async function createStore(store: Omit<Store, "id" | "createdAt">): Promise<string> {
  const db = getDb()
  const docRef = await addDoc(collection(db, "stores"), {
    ...store,
    createdAt: new Date()
  })
  return docRef.id
}

export async function updateStore(storeId: string, store: Partial<Store>): Promise<void> {
  const db = getDb()
  await updateDoc(doc(db, "stores", storeId), store)
}

export async function deleteStore(storeId: string): Promise<void> {
  const db = getDb()
  await deleteDoc(doc(db, "stores", storeId))
}
```

### 5. API /api/stores (CREAR)

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 6. ACTUALIZAR RUTAS PÚBLICAS

**Crear**: `app/tienda1/layout.tsx`
```typescript
import { StoreProvider } from "@/lib/hooks/useStore"
import type { ReactNode } from "react"

export const metadata = {
  title: "Tienda 1",
}

export default function Tienda1Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider storeId="store_001">
      <div className="min-h-screen bg-white">
        {/* Header customizado tienda 1 */}
        {children}
      </div>
    </StoreProvider>
  )
}
```

**Crear**: `app/tienda1/page.tsx`
```typescript
"use client"
import { useStore } from "@/lib/hooks/useStore"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"

export default function Tienda1() {
  const { currentStore } = useStore()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    fetch(`/api/products?storeId=store_001`)
      .then(r => r.json())
      .then(setProducts)
  }, [])
  
  if (!currentStore) return <div>Cargando tienda...</div>
  
  return (
    <div style={{ "--primary-color": currentStore.primaryColor } as React.CSSProperties}>
      <h1>{currentStore.name}</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} storeId="store_001" />
        ))}
      </div>
    </div>
  )
}
```

Lo mismo para tienda2 con `store_002`.

---

## 🔐 SEGURIDAD & PERMISOS

### Matriz de Permisos

| Acción | Usuario Público | Administrador | Super Admin |
|--------|---|---|---|
| Ver productos tienda 1 | ✅ Solo tienda 1 | ✅ Tienda asignada | ✅ Todas |
| Ver productos tienda 2 | ✅ Solo tienda 2 | ✅ Tienda asignada | ✅ Todas |
| Crear producto tienda 1 | ❌ | ✅ Si está en tienda 1 | ✅ |
| Crear producto tienda 2 | ❌ | ✅ Si está en tienda 2 | ✅ |
| Ver ambas tiendas | ❌ | ❌ | ✅ |
| Editar tienda | ❌ | ❌ | ✅ |
| Ver órdenes tienda 1 | ✅ Si es cliente | ✅ Si es admin tienda 1 | ✅ |
| Ver órdenes tienda 2 | ✅ Si es cliente | ✅ Si es admin tienda 2 | ✅ |

### Validaciones Requeridas

1. **Crear Producto**
   - Admin debe pertenecer a la tienda
   - storeId debe existir
   - categoryId debe pertenecer a la misma tienda
   - subcategoryId debe pertenecer a la misma tienda

2. **Crear Categoría**
   - Admin debe pertenecer a la tienda
   - storeId debe ser válido

3. **Crear Orden**
   - Usuario debe estar autenticado
   - storeId debe coincidir con URL
   - Todos los productos deben pertenecer a esa tienda

---

## 📊 COMPARATIVA: ANTES vs DESPUÉS

### ANTES (1 Tienda)
```
FIRESTORE:
- categories/
- subcategories/
- products/
- orders/
- adminUsers/

FIREBASE RULES:
- Acceso por rol (admin o no)

FRONTEND:
- /page.tsx (tienda pública)
- /admin/* (panel administrativo)
```

### DESPUÉS (2 Tiendas)
```
FIRESTORE:
- stores/                    ⭐ NUEVA
- categories/ (con storeId)  ✏️ ACTUALIZADA
- subcategories/ (con storeId) ✏️ ACTUALIZADA
- products/ (con storeId)    ✏️ ACTUALIZADA
- orders/ (con storeId)      ✏️ ACTUALIZADA
- adminUsers/                ✅ Sin cambios

FIREBASE RULES:
- Acceso por rol + tenant   ⭐ ACTUALIZADA

FRONTEND:
- /tienda1/*                 ⭐ NUEVA
- /tienda2/*                 ⭐ NUEVA
- /admin/*                   ✏️ ACTUALIZADA (multi-tienda)
- StoreProvider              ⭐ NUEVA
- useStore()                 ⭐ NUEVO HOOK
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración Inicial
- [ ] Crear colección `stores` en Firestore
- [ ] Crear 2 documentos de tiendas
- [ ] Crear tipos TypeScript
- [ ] Crear `storeService.ts`

### Backend
- [ ] Crear API `/api/stores`
- [ ] Actualizar API `/api/products`
- [ ] Actualizar API `/api/categories`
- [ ] Actualizar API `/api/orders`
- [ ] Actualizar Firestore Rules

### Hooks & Context
- [ ] Crear `useStore()` hook
- [ ] Crear `StoreProvider` context
- [ ] Crear `useStoreProducts()` hook

### Admin Panel
- [ ] Crear página `/admin/tiendas`
- [ ] Crear `StoreSelector` component
- [ ] Actualizar `ProductForm`
- [ ] Actualizar `CategoriesManager`

### Interfaces Públicas
- [ ] Crear `/tienda1/layout.tsx`
- [ ] Crear `/tienda1/page.tsx`
- [ ] Crear `/tienda2/layout.tsx`
- [ ] Crear `/tienda2/page.tsx`
- [ ] Crear estilos separados

### Funcionalidades
- [ ] Actualizar carrito para incluir storeId
- [ ] Actualizar checkout
- [ ] Actualizar validaciones de stock
- [ ] Actualizar búsqueda y filtros

### Testing
- [ ] Test navegación entre tiendas
- [ ] Test separación de datos
- [ ] Test permisos en Firestore
- [ ] Test órdenes por tienda

---

## 🚀 PRÓXIMOS PASOS

### Paso 1: Validar Arquitectura
- ¿Está de acuerdo con esta propuesta?
- ¿Necesita cambios o ajustes?

### Paso 2: Empezar Implementación
- Comenzar con FASE 1 (Preparación)
- Luego FASE 2 (Backend API)
- Y así sucesivamente...

### Paso 3: Testing
- Verificar funcionamiento de ambas tiendas
- Validar Firestore Rules

### Paso 4: Deploy
- Deploy a producción
- Monitoreo post-deploy

---

## 📞 PREGUNTAS FRECUENTES

### ¿Puedo cambiar esto después?
Sí, la arquitectura es flexible. Si en futuro quiere agregar tienda 3, solo crea nuevo documento en `stores`.

### ¿Los datos se comparten entre tiendas?
No. Cada tienda solo ve sus datos (categoria, productos, órdenes) gracias a Firestore Rules.

### ¿Qué pasa con el inventario?
Cada tienda tiene stock separado. Si el producto NOTE14PRO+ está en ambas tiendas, tienen stock independiente.

### ¿El admin puede ver ambas tiendas?
Sí. El superusuario ve y controla todo. Un admin normal solo ve su tienda asignada.

### ¿Y si quiero que un admin maneje ambas tiendas?
Se puede hacer. El admin necesitaría acceso a ambas tiendas (nuevo campo en adminUsers).

---

## 💡 VENTAJAS DE ESTA SOLUCIÓN

✅ **Escalable**: Fácil agregar más tiendas  
✅ **Segura**: Firestore Rules aisla datos por tienda  
✅ **Mantenible**: 1 BD, 1 código, múltiples tiendas  
✅ **Económica**: 1 proyecto Firebase  
✅ **Flexible**: Identidad visual independiente por tienda  
✅ **Centralizada**: Admin controla todo desde un panel  

---

## ⚠️ CONSIDERACIONES

- Todos los queriess deben incluir filtro `where('storeId', '==', currentStoreId)`
- Firestore Rules deben validar storeId en cada lectura/escritura
- El carrito debe incluir storeId para validar órdenes cruzadas
- Las URLs públicas deben ser `/tienda1` y `/tienda2` (o dominios separados)

---

**Documento versión 1.0** | Propuesta de Arquitectura Multi-Tienda | Diciembre 2025
