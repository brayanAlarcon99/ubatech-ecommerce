# 🚀 INICIO RÁPIDO: Implementar 2 Tiendas en 30 Minutos (Resumen)

**Para**: Desarrolladores que quieren empezar YA  
**Tiempo**: ~30 min para fase inicial  
**Objetivo**: Tener estructura base lista para expandir  

---

## ⚡ 5 PASOS EN 30 MINUTOS

### ✅ Paso 1: Crear Tiendas en Firestore (5 min)

**Firebase Console → Firestore → Crear colección `stores`**

```json
// Documento 1: store_001
{
  id: "store_001",
  name: "Tienda 1",
  slug: "tienda-1",
  primaryColor: "#FF5733",
  logo: "https://example.com/logo1.png",
  description: "Mi tienda 1",
  createdAt: (server timestamp)
}

// Documento 2: store_002
{
  id: "store_002",
  name: "Tienda 2",
  slug: "tienda-2",
  primaryColor: "#0066CC",
  logo: "https://example.com/logo2.png",
  description: "Mi tienda 2",
  createdAt: (server timestamp)
}
```

**Verificar**: Firestore Console muestra 2 documentos ✅

---

### ✅ Paso 2: Crear Tipos TypeScript (3 min)

**Archivo**: `types/store.ts`

```typescript
export interface Store {
  id: string
  name: string
  slug: string
  primaryColor: string
  logo: string
  description: string
  createdAt: any
}

export interface StoreContextType {
  currentStore: Store | null
  storeId: string
  loading: boolean
}
```

**Verificar**: `npm run build` sin errores ✅

---

### ✅ Paso 3: Crear Hook useStore (5 min)

**Archivo**: `lib/hooks/useStore.ts`

```typescript
"use client"
import { createContext, useContext } from "react"
import type { Store, StoreContextType } from "@/types"

export const StoreContext = createContext<StoreContextType | null>(null)

export function useStore(): StoreContextType {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore debe estar dentro de <StoreProvider>")
  }
  return context
}
```

**Archivo**: `app/providers/store-provider.tsx`

```typescript
"use client"
import { StoreContext } from "@/lib/hooks/useStore"
import { getDoc, doc } from "firebase/firestore"
import { getDb } from "@/lib/firebase"
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
        const db = getDb()
        const docSnap = await getDoc(doc(db, "stores", storeId))
        if (docSnap.exists()) {
          setCurrentStore({ id: docSnap.id, ...docSnap.data() } as Store)
        }
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [storeId])

  const value: StoreContextType = { currentStore, storeId, loading }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
```

**Verificar**: Compilación sin errores ✅

---

### ✅ Paso 4: Crear Rutas /tienda1 y /tienda2 (12 min)

**Archivo**: `app/tienda1/layout.tsx`

```typescript
import { StoreProvider } from "@/app/providers/store-provider"
import type { ReactNode } from "react"

export const metadata = {
  title: "Tienda 1",
}

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

**Archivo**: `app/tienda1/page.tsx`

```typescript
"use client"
import { useStore } from "@/lib/hooks/useStore"

export default function Tienda1() {
  const { currentStore, loading } = useStore()

  if (loading) return <div className="p-8">Cargando...</div>
  if (!currentStore) return <div className="p-8">Error: Tienda no encontrada</div>

  return (
    <div 
      className="p-8"
      style={{ 
        "--primary-color": currentStore.primaryColor 
      } as React.CSSProperties}
    >
      <h1 className="text-3xl font-bold">{currentStore.name}</h1>
      <p className="text-gray-600 mt-2">{currentStore.description}</p>
      
      {currentStore.logo && (
        <img 
          src={currentStore.logo} 
          alt={currentStore.name} 
          className="h-12 mt-4"
        />
      )}
      
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded">Producto 1</div>
        <div className="p-4 bg-gray-100 rounded">Producto 2</div>
        <div className="p-4 bg-gray-100 rounded">Producto 3</div>
      </div>
    </div>
  )
}
```

**Copiar mismo contenido a**:
- `app/tienda2/layout.tsx` (cambiar `storeId="store_002"`)
- `app/tienda2/page.tsx`

**Verificar**:
```bash
npm run dev
# Acceder a http://localhost:3000/tienda1 ✅
# Ver "Tienda 1" y su descripción ✅
# Acceder a http://localhost:3000/tienda2 ✅
# Ver "Tienda 2" y su descripción ✅
```

---

### ✅ Paso 5: Crear API básica (5 min)

**Archivo**: `app/api/stores/route.ts`

```typescript
import { getDb } from "@/lib/firebase"
import { getDocs, collection } from "firebase/firestore"
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
    return NextResponse.json(
      { error: "Error fetching stores" },
      { status: 500 }
    )
  }
}
```

**Verificar**:
```bash
curl http://localhost:3000/api/stores
# Resultado: [{ id: "store_001", name: "Tienda 1", ... }, ...]
```

---

## ✅ CHECKLIST POST-IMPLEMENTACIÓN (30 MIN)

- [ ] Colección `stores` creada en Firestore con 2 documentos
- [ ] Tipos TypeScript creados (`types/store.ts`)
- [ ] Hook `useStore()` implementado
- [ ] `StoreProvider` componente creado
- [ ] `/tienda1/layout.tsx` y `/tienda1/page.tsx` creados
- [ ] `/tienda2/layout.tsx` y `/tienda2/page.tsx` creados
- [ ] API `/api/stores` funcionando
- [ ] Acceder a `localhost:3000/tienda1` muestra tienda 1
- [ ] Acceder a `localhost:3000/tienda2` muestra tienda 2
- [ ] Colores y nombres diferentes por tienda

---

## 🚀 PRÓXIMOS PASOS (Después de estos 30 min)

### Fase 2: Agregar Productos (1-2 horas)

1. Actualizar colección `products` con campo `storeId`
2. Crear API `/api/products?storeId=store_001`
3. Mostrar productos en cada tienda

```typescript
// Ejemplo rápido
export async function useStoreProducts(storeId: string) {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    fetch(`/api/products?storeId=${storeId}`)
      .then(r => r.json())
      .then(setProducts)
  }, [storeId])
  
  return products
}
```

### Fase 3: Admin Multi-Tienda (2-3 horas)

1. Agregar selector en panel admin
2. Filtrar categorías/productos por tienda
3. Crear productos con storeId automático

### Fase 4: Carrito y Checkout (2-3 horas)

1. Actualizar carrito para incluir storeId
2. Validar una sola tienda por carrito
3. Guardar órdenes con storeId

---

## 📚 DOCUMENTOS PARA PROFUNDIZAR

Después de estos 30 minutos, lee estos documentos en orden:

1. **PROPUESTA_SISTEMA_2_TIENDAS.md** (15 min)
   - Entender la arquitectura completa

2. **ARQUITECTURA_MULTI_TIENDA.md** (30 min)
   - Detalles de cada cambio
   - Estructura de BD
   - Firestore Rules

3. **GUIA_PASO_A_PASO_MULTI_TIENDA.md** (2-3 horas)
   - Implementación detallada
   - Código listo para copiar
   - Testing

4. **GUIA_TECNICA_DECISIONES_RECOMENDACIONES.md** (30 min)
   - Mejores prácticas
   - Qué NO hacer
   - Performance

5. **COMPARATIVA_VISUAL_1_vs_2_TIENDAS.md** (10 min)
   - Entender diferencias visuales

---

## ❓ SOLUCIÓN RÁPIDA DE PROBLEMAS

### "storeId is not defined"
```typescript
// ❌ Problema: Olvidaste pasar storeId
<StoreProvider>  {/* FALTA: storeId="store_001" */}

// ✅ Solución:
<StoreProvider storeId="store_001">
```

### "Cannot read property 'currentStore' of null"
```typescript
// ❌ Problema: useStore() usado fuera de StoreProvider
export default function Component() {
  const { currentStore } = useStore()  // ❌ Sin Provider padre
}

// ✅ Solución: Asegurar que está dentro del Provider
// En layout.tsx:
export default function Layout({ children }) {
  return (
    <StoreProvider storeId="store_001">
      {children}  {/* Los children ahora pueden usar useStore() */}
    </StoreProvider>
  )
}
```

### "Tienda no encontrada"
```typescript
// ❌ Problema: storeId en Firestore es diferente
// En Firestore: store_001
// En código: store-001 (diferente ID)

// ✅ Solución: Usar exactamente el mismo ID
// Firestore: "store_001"
// Código: <StoreProvider storeId="store_001">
```

---

## 🎯 PRÓXIMA ACCIÓN

**Ahora**: Sigue los 5 pasos en 30 minutos arriba ⬆️

**Después**: Lee los documentos en orden (lista abajo)

**Cuando esté listo**: Implementa todas las fases desde `GUIA_PASO_A_PASO_MULTI_TIENDA.md`

---

## 📊 LÍNEA DE TIEMPO ESTIMADA

| Etapa | Tiempo | Acción |
|-------|--------|--------|
| **Ahora** | 30 min | 5 pasos rápidos (este documento) |
| **Hoy** | 1-2 h | Leer documentos y entender |
| **Mañana** | 5-10 h | Implementar fases 2-6 |
| **Siguiente semana** | 5-10 h | Testing y deployment |
| **TOTAL** | 15-22 h | Sistema completo |

---

## ✨ BONUS: Docker Setup (Opcional)

```bash
# Si quieres usar Firebase Emulator
firebase emulators:start

# Luego en código:
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

---

## 🎊 RESUMEN

En **30 minutos** tendrás:

✅ 2 tiendas en Firestore  
✅ Rutas `/tienda1` y `/tienda2`  
✅ Hook `useStore()` listo  
✅ API `/api/stores` funcionando  
✅ Base para expansión  

En **2-3 semanas** tendrás:

✅ Sistema multi-tienda completo  
✅ Productos separados por tienda  
✅ Panel admin multi-tienda  
✅ Carrito y checkout  
✅ Testing y deployment  

---

**¡Ahora sí, a empezar!** 🚀

**Versión**: 1.0 | **Diciembre 2025**
