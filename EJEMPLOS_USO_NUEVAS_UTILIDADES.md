# 💻 EJEMPLOS DE USO - NUEVAS UTILIDADES

Este documento muestra ejemplos prácticos de cómo usar las nuevas utilidades creadas para optimizar el código.

---

## 📚 Tabla de Contenidos
1. [Firestore Utils](#firestore-utils)
2. [useFirestoreDoc Hook](#usefirestore-hook)
3. [Config Constants](#config-constants)
4. [Validation](#validation)
5. [Migración de Código Existente](#migracion)

---

## 🔥 Firestore Utils

**Ubicación**: `lib/firestore-utils.ts`

### Ejemplo 1: Lectura Simple de Documento

```typescript
// ❌ ANTES (código repetido en muchos lugares)
import { getDb } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const db = getDb()
const docRef = doc(db, 'stores', storeId)
const docSnapshot = await getDoc(docRef)

if (docSnapshot.exists()) {
  const storeData = docSnapshot.data()
  // ...
}

// ✅ DESPUÉS (simple y reutilizable)
import { getDocByPath } from '@/lib/firestore-utils'

const storeData = await getDocByPath('stores', storeId)
```

### Ejemplo 2: Lectura Con Manejo de Errores

```typescript
// ❌ ANTES
try {
  const db = getDb()
  const docRef = doc(db, 'stores', storeId)
  const docSnapshot = await getDoc(docRef)
  
  if (docSnapshot.exists()) {
    setStore(docSnapshot.data())
  } else {
    setStore(DEFAULT_STORE)
  }
} catch (error) {
  console.error('Error:', error)
  setStore(DEFAULT_STORE)
}

// ✅ DESPUÉS (automático, consistente)
import { safeGetDoc } from '@/lib/firestore-utils'

const { success, data, error } = await safeGetDoc<StoreInfo>(
  'stores',
  storeId,
  DEFAULT_STORE
)

if (success) {
  setStore(data)
} else {
  console.error(error)
}
```

### Ejemplo 3: Lectura de Colección Completa

```typescript
// ❌ ANTES (patrón repetido 40+ veces)
const db = getDb()
const snap = await getDocs(collection(db, 'products'))
const products = snap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))

// ✅ DESPUÉS (1 línea, tipo-safe)
import { getCollectionDocs } from '@/lib/firestore-utils'

const products = await getCollectionDocs('products')
```

### Ejemplo 4: Query Con Filtro

```typescript
// ❌ ANTES
const db = getDb()
const q = query(
  collection(db, 'products'),
  where('category', '==', 'electronics')
)
const snap = await getDocs(q)
const products = snap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))

// ✅ DESPUÉS (directo, sin boilerplate)
import { getDocumentsByQuery } from '@/lib/firestore-utils'

const products = await getDocumentsByQuery(
  'products',
  'category',
  '==',
  'electronics'
)
```

### Ejemplo 5: Escritura de Documento

```typescript
// ❌ ANTES
try {
  const db = getDb()
  const docRef = doc(db, 'stores', storeId)
  await setDoc(docRef, {
    name: newName,
    updatedAt: new Date().toISOString()
  }, { merge: true })
  console.log('Guardado')
} catch (error) {
  console.error('Error:', error)
}

// ✅ DESPUÉS (con manejo de errores automático)
import { setDocByPath } from '@/lib/firestore-utils'

const result = await setDocByPath('stores', storeId, {
  name: newName
}) // updatedAt se agrega automático

if (result.success) {
  console.log('Guardado')
} else {
  console.error(result.error)
}
```

### Ejemplo 6: Actualizar Documento

```typescript
// ❌ ANTES
await updateDoc(doc(db, 'stores', storeId), {
  name: newName,
  email: newEmail,
  updatedAt: new Date().toISOString()
})

// ✅ DESPUÉS (updatedAt automático)
import { updateDocByPath } from '@/lib/firestore-utils'

await updateDocByPath('stores', storeId, {
  name: newName,
  email: newEmail
})
```

### Ejemplo 7: Eliminar Documento

```typescript
// ❌ ANTES
await deleteDoc(doc(db, 'stores', storeId))

// ✅ DESPUÉS
import { deleteDocByPath } from '@/lib/firestore-utils'

const result = await deleteDocByPath('stores', storeId)
```

### Ejemplo 8: Operaciones en Lote

```typescript
// ❌ ANTES (código repetitivo)
for (const product of products) {
  const docRef = doc(db, 'products', product.id)
  await setDoc(docRef, product, { merge: true })
}

// ✅ DESPUÉS (eficiente y limpio)
import { batchSet } from '@/lib/firestore-utils'

const result = await batchSet(
  products.map(p => ({
    collection: 'products',
    docId: p.id,
    data: p
  }))
)
```

---

## 🎣 useFirestoreDoc Hook

**Ubicación**: `hooks/useFirestoreDoc.ts`

### Ejemplo 1: Hook Genérico Básico

```typescript
// ❌ ANTES (3 hooks diferentes, 300 líneas totales)
const { storeInfo, loading, error } = useStoreInfo(storeId)
const { settings, loading, error } = useStoreSettings()
const { platformInfo, loading, error } = usePlatformInfo()

// ✅ DESPUÉS (1 hook genérico, 160 líneas)
import { useFirestoreDoc } from '@/hooks/useFirestoreDoc'

const storeInfo = useFirestoreDoc<StoreInfo>('stores', storeId)
const settings = useFirestoreDoc<StoreSettings>('store_settings', 'store_settings')
const platformInfo = useFirestoreDoc<PlatformInfo>('platform_info', 'platform_info')

// Todos retornan: { data, loading, error, reload }
```

### Ejemplo 2: Con Realtime Updates

```typescript
// Hook que escucha cambios en tiempo real
const { data: settings, loading } = useFirestoreDoc(
  'store_settings',
  'store_settings',
  {
    realtime: true // Se actualiza automáticamente cuando cambian en BD
  }
)

// Automáticamente:
// - Se suscribe con onSnapshot
// - Se desuscribe cuando el componente se desmonta
// - Maneja errores de conexión
```

### Ejemplo 3: Con Caching

```typescript
// Guarda en localStorage automáticamente
const { data: product } = useFirestoreDoc(
  'products',
  'product123',
  {
    cache: true,
    cacheKey: 'product_product123'
  }
)

// Beneficios:
// - Primera carga desde cache (instantáneo)
// - Luego actualiza desde Firestore
// - Si Firestore falla, usa cache
```

### Ejemplo 4: Con Valor Por Defecto

```typescript
import { DEFAULT_SETTINGS } from '@/lib/config/constants'

const { data: settings } = useFirestoreDoc(
  'store_settings',
  'store_settings',
  {
    defaultValue: DEFAULT_SETTINGS,
    realtime: true
  }
)

// Si falla o no existe, retorna DEFAULT_SETTINGS
```

### Ejemplo 5: Recargar Datos Manualmente

```typescript
const { data, loading, error, reload } = useFirestoreDoc(
  'products',
  productId
)

// En un botón de refrescar
const handleRefresh = async () => {
  await reload()
}

return (
  <div>
    {data && <p>{data.name}</p>}
    <button onClick={handleRefresh} disabled={loading}>
      Refrescar
    </button>
  </div>
)
```

### Ejemplo 6: Componente Completo

```typescript
import { useFirestoreDoc } from '@/hooks/useFirestoreDoc'
import { StoreInfo } from '@/types'

export function StoreInfoDisplay({ storeId }: { storeId: string }) {
  const { data: store, loading, error, reload } = useFirestoreDoc<StoreInfo>(
    'stores',
    storeId,
    {
      cache: true,
      cacheKey: `store_${storeId}`
    }
  )

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!store) return <div>No encontrado</div>

  return (
    <div>
      <h1>{store.name}</h1>
      <p>{store.description}</p>
      <button onClick={reload}>Actualizar</button>
    </div>
  )
}
```

---

## ⚙️ Config Constants

**Ubicación**: `lib/config/constants.ts`

### Ejemplo 1: Acceder a Configuración de Tienda

```typescript
// ❌ ANTES (hardcodeado o disperso)
const STORES = {
  djcelutecnico: { /* 20 líneas */ },
  ubatech: { /* 20 líneas */ }
}

// Duplicado en:
// - use-store-info.ts
// - services/stores.ts
// - Componentes

// ✅ DESPUÉS (centralizado)
import { STORES_CONFIG, getStoreConfig } from '@/lib/config/constants'

const storeConfig = getStoreConfig(storeId)
// Automáticamente retorna DEFAULT_STORE si no existe
```

### Ejemplo 2: Usar Nombres de Colecciones Centralizados

```typescript
// ❌ ANTES (strings hardcodeados)
const docRef = doc(db, 'store_settings', 'store_settings')
const snap = await getDocs(collection(db, 'products'))

// Problema: si cambias el nombre, hay que actualizar 40 lugares

// ✅ DESPUÉS (centralizado)
import { COLLECTIONS } from '@/lib/config/constants'

const docRef = doc(db, COLLECTIONS.STORE_SETTINGS, 'store_settings')
const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS))

// Cambio en 1 lugar = actualizado everywhere
```

### Ejemplo 3: Configuración de Validación

```typescript
import { VALIDATION_RULES, isValidEmail, isValidPassword } from '@/lib/config/constants'

// Usar directamente
if (email.length === 0) {
  setError('Email requerido')
}

if (!isValidEmail(email)) {
  setError('Email inválido')
}

if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
  setError(`Mínimo ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`)
}
```

### Ejemplo 4: Mensajes de Error Centralizados

```typescript
import { ERROR_MESSAGES } from '@/lib/config/constants'

try {
  // ...
} catch (error) {
  if (error.code === 'auth/email-already-in-use') {
    setError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE)
  }
}
```

---

## ✅ Validation

**Ubicación**: `lib/validation.ts`

### Ejemplo 1: Validar Email

```typescript
// ❌ ANTES (lógica dispersa)
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  setError('Email inválido')
}

// ✅ DESPUÉS (centralizado)
import { validateEmailWithMessage } from '@/lib/validation'

const { valid, error } = validateEmailWithMessage(email)
if (!valid) {
  setError(error)
}
```

### Ejemplo 2: Validar Contraseña

```typescript
import { validatePasswordWithMessage } from '@/lib/validation'

const { valid, error } = validatePasswordWithMessage(password)
// retorna { valid: true } o
// { valid: false, error: "La contraseña debe tener al menos 6 caracteres" }
```

### Ejemplo 3: Validar Formulario de Login

```typescript
import { validateLoginCredentials } from '@/lib/validation'

const handleSubmit = (email: string, password: string) => {
  const { valid, errors } = validateLoginCredentials(email, password)
  
  if (!valid) {
    // errors = { email: "...", password: "..." }
    setFormErrors(errors)
    return
  }
  
  // Proceder con login
}
```

### Ejemplo 4: Validar Configuración de Tienda

```typescript
import { validateStoreSettings } from '@/lib/validation'

const handleSaveSettings = (data: any) => {
  const { valid, errors } = validateStoreSettings(data)
  
  if (!valid) {
    // errors contiene todos los campos inválidos
    console.log(errors)
    // { storeName: "...", storeEmail: "..." }
    return
  }
  
  // Guardar
}
```

### Ejemplo 5: En un Formulario React

```typescript
import { validateStoreSettings } from '@/lib/validation'

export function StoreSettingsForm() {
  const [formData, setFormData] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: ''
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const { valid, errors } = validateStoreSettings(formData)
    setErrors(errors)
    
    if (!valid) return
    
    // Enviar al servidor
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.storeName}
        onChange={e => setFormData({ ...formData, storeName: e.target.value })}
      />
      {errors.storeName && <span className="error">{errors.storeName}</span>}
      
      {/* ... más campos ... */}
      
      <button type="submit">Guardar</button>
    </form>
  )
}
```

---

## 🔄 Migración de Código Existente

### Caso 1: Migrar useStoreInfo

**ANTES** (115 líneas):
```typescript
// hooks/use-store-info.ts
export function useStoreInfo(storeId: string) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const db = getDb()
        const storeDoc = await getDoc(doc(db, 'stores', storeId))
        if (storeDoc.exists()) {
          setStoreInfo(storeDoc.data() as StoreInfo)
        } else {
          setStoreInfo(DEFAULT_STORES[storeId] || DEFAULT_STORES.ubatech)
        }
      } catch (err) {
        console.error('Error fetching store info:', err)
        setStoreInfo(DEFAULT_STORES[storeId] || DEFAULT_STORES.ubatech)
        setError('Error al cargar información de la tienda')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreInfo()
  }, [storeId])

  return { storeInfo, loading, error }
}
```

**DESPUÉS** (10 líneas):
```typescript
// hooks/use-store-info.ts
import { useFirestoreDoc } from './useFirestoreDoc'
import { getStoreConfig } from '@/lib/config/constants'

export function useStoreInfo(storeId: string) {
  return useFirestoreDoc<StoreInfo>(
    'stores',
    storeId,
    {
      defaultValue: getStoreConfig(storeId),
      cache: true,
      cacheKey: `store_${storeId}`
    }
  )
}
```

**Cambios en uso** (el componente no necesita cambios):
```typescript
// Mismo API, funciona igual
const { data: storeInfo, loading, error } = useStoreInfo(storeId)

// Ahora también tiene
const { reload } = useStoreInfo(storeId)
```

### Caso 2: Migrar adminService

**ANTES**:
```typescript
// lib/services/adminService.ts
const existingQuery = query(
  collection(db, "adminUsers"),
  where("email", "==", email)
)
const existingDocs = await getDocs(existingQuery)

if (existingDocs.size > 0) {
  return { success: false, message: "Este email ya existe" }
}
```

**DESPUÉS**:
```typescript
import { getDocumentsByQuery } from '@/lib/firestore-utils'
import { validateEmailWithMessage } from '@/lib/validation'

const { valid, error } = validateEmailWithMessage(email)
if (!valid) {
  return { success: false, message: error }
}

const existing = await getDocumentsByQuery(
  'adminUsers',
  'email',
  '==',
  email
)

if (existing.length > 0) {
  return { success: false, message: "Este email ya existe" }
}
```

### Caso 3: Migrar API Route

**ANTES** (`app/api/admin/analytics/route.ts`):
```typescript
const productsSnapshot = await getDocs(collection(db, "products"))
const products = productsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}))

const categoriesSnapshot = await getDocs(collection(db, "categories"))
const categories = categoriesSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}))
```

**DESPUÉS**:
```typescript
import { getCollectionDocs } from '@/lib/firestore-utils'

const products = await getCollectionDocs('products')
const categories = await getCollectionDocs('categories')
```

---

## 🎯 Checklist de Migración

- [ ] Entender las nuevas utilidades
- [ ] Probar localmente
- [ ] Migrar hooks primero
- [ ] Migrar services
- [ ] Migrar API routes
- [ ] Probar toda la funcionalidad
- [ ] Verificar que no haya breaking changes
- [ ] Actualizar documentación
- [ ] Hacer commit con mensaje claro

---

## 💡 Tips y Trucos

### Tip 1: Entender el Hook Genérico
```typescript
// Todos estos usan el mismo hook internamente:
useFirestoreDoc('stores', storeId) // lectura simple
useFirestoreDoc('store_settings', 'store_settings', { realtime: true })
useFirestoreDoc('products', productId, { cache: true })
```

### Tip 2: Combinación de Opciones
```typescript
// Realtime + Cache = siempre actualizado, pero con respuesta rápida
useFirestoreDoc('items', itemId, {
  realtime: true,
  cache: true,
  cacheKey: `item_${itemId}`
})
```

### Tip 3: Error Handling Automático
```typescript
// Las funciones de validación siempre retornan el mismo shape
const { valid, error } = validateEmailWithMessage(email)
// Nunca lanza, siempre tienes error message si falla
```

### Tip 4: Constantes Centralizadas
```typescript
// Use COLLECTIONS en lugar de strings
import { COLLECTIONS } from '@/lib/config/constants'

// Esto se autocompleta y valida
doc(db, COLLECTIONS.PRODUCTS, productId)

// En lugar de (typos posibles)
doc(db, "prodcuts", productId) // ❌ typo
```

---

## 🚀 Conclusión

Con las nuevas utilidades:
- ✅ Menos código que escribir
- ✅ Menos duplicación
- ✅ APIs consistentes
- ✅ Error handling automático
- ✅ Mejor performance
- ✅ Más fácil de mantener

¡Usar estas utilidades es la nueva forma de hacer las cosas! 💪

