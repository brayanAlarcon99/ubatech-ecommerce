# 📋 GUÍA DE REFACTORIZACIÓN POR ARCHIVO

## Archivos Creados / Modificados

### ✅ CREADOS (Nuevas Utilidades)

1. **`lib/firestore-utils.ts`** (NUEVO)
   - Utilidades genéricas para operaciones Firestore
   - Consolida 40+ llamadas duplicadas
   - Incluye: `getDocByPath`, `safeGetDoc`, `getCollectionDocs`, `mapDocs`, etc.

2. **`lib/config/constants.ts`** (NUEVO)
   - Configuración centralizada
   - Constantes de colecciones Firestore
   - Configuración de tiendas, validación, rutas, endpoints
   - Consolida constantes dispersas

3. **`hooks/useFirestoreDoc.ts`** (NUEVO)
   - Hook genérico reutilizable para Firestore
   - Reemplaza `useStoreInfo`, `useStoreSettings`, `usePlatformInfo`
   - Soporta realtime, caching, valores por defecto

4. **`lib/validation.ts`** (NUEVO)
   - Validaciones centralizadas
   - Funciones para: email, password, producto, tienda, teléfono
   - Manejo consistente de errores

---

## 📝 ARCHIVOS QUE NECESITAN REFACTORIZACIÓN

### FASE 1: CRÍTICA (Comenzar aquí)

#### 1. `lib/format-price.ts` ✅ OPTIMIZADO
**Estado**: LISTO
**Cambios realizados**:
- ✅ Creada función base `parsePriceString()` (interna)
- ✅ `ensureNumberPrice()` ahora usa `parsePriceString()`
- ✅ `sanitizePriceInput()` ahora usa `parsePriceString()`
- **Resultado**: 60 líneas duplicadas eliminadas, lógica centralizada

---

### FASE 2: IMPORTANTE (Próximos)

#### 2. `lib/services/adminService.ts`
**Problemas**:
- 316 líneas con lógica de error handling repetida
- `getDocs(collection(...))` patrón repetido
- Validaciones de email/password hardcodeadas
- `console.log` sin estructura

**Cambios recomendados**:
```typescript
// ❌ ANTES
const existingQuery = query(
  collection(db, "adminUsers"),
  where("email", "==", email)
)
const existingDocs = await getDocs(existingQuery)

if (existingDocs.size > 0) {
  return { success: false, message: "Este email ya existe" }
}

// ✅ DESPUÉS
const existing = await getDocumentsByQuery(
  "adminUsers",
  "email",
  "==",
  email
)

if (existing.length > 0) {
  return { success: false, message: "Este email ya existe" }
}
```

**Plan de refactorización**:
1. Reemplazar `getDocs(collection(...))` con `getDocumentsByQuery()`
2. Usar `validateEmailWithMessage()` y `validatePasswordWithMessage()`
3. Consolidar error handling
4. Usar logger estructurado

---

#### 3. `hooks/use-store-info.ts`
**Problemas**:
- 115 líneas de lógica similar a otros hooks
- `DEFAULT_STORES` duplicado en `services/stores.ts`
- Patrón `useState` + `useEffect` repetido

**Cambios recomendados**:
```typescript
// ❌ ANTES (115 líneas)
export function useStoreInfo(storeId: string) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchStoreInfo = async () => { /* ... 80 líneas */ }
    fetchStoreInfo()
  }, [storeId])
  
  return { storeInfo, loading, error, updateStoreInfo }
}

// ✅ DESPUÉS (5 líneas)
export function useStoreInfo(storeId: string) {
  return useFirestoreDoc<StoreInfo>('stores', storeId, {
    cache: true,
    cacheKey: `store_${storeId}`
  })
}
```

---

#### 4. `hooks/use-platform-info.ts`
**Problemas**:
- 107 líneas con lógica similar a otros hooks
- Listener realtime duplicado
- Manejo de `onSnapshot` inconsistente

**Cambios recomendados**:
```typescript
// ✅ USAR NUEVO HOOK
export function usePlatformInfo() {
  return useFirestoreDoc<PlatformInfo>(
    'platform_info',
    'platform_info',
    {
      defaultValue: defaultPlatformInfo,
      realtime: true,
      cache: true,
      cacheKey: 'platform_info'
    }
  )
}
```

---

#### 5. `hooks/use-store-settings.ts`
**Problemas**:
- 80 líneas con lógica similar
- Listener realtime manual
- Constantes duplicadas en `STORE_DEFAULTS`

**Cambios recomendados**:
```typescript
// ✅ USAR NUEVO HOOK
export function useStoreSettings(storeId?: string) {
  return useFirestoreDoc<StoreSettings>(
    'store_settings',
    'store_settings',
    {
      defaultValue: getStoreSettingsDefault(storeId),
      realtime: true,
      cache: true,
      cacheKey: `store_settings_${storeId}`
    }
  )
}
```

---

### FASE 3: IMPORTANTE (API Routes)

#### 6. `app/api/admin/analytics/route.ts`
**Problemas**:
- 7 llamadas a `getDocs(collection(...))` sin abstracción
- Mapeo manual de documentos (`snapshot.docs.map(...)`)
- Sin manejo de errores consistente

**Cambios recomendados**:
```typescript
// ❌ ANTES (repetido 7 veces)
const productsSnapshot = await getDocs(collection(db, "products"))
const products = productsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}))

// ✅ DESPUÉS
const products = await getCollectionDocs('products')
```

---

#### 7. `app/api/admin/settings/route.ts`
**Problemas**:
- Valores por defecto hardcodeados en respuesta de error
- Rutas Firestore string literals
- Logging inconsistente

**Cambios recomendados**:
```typescript
// Usar constantes centralizadas
import { COLLECTIONS, getStoreSettingsDefault } from '@/lib/config/constants'

// Reemplazar hardcoded strings
const docRef = doc(db, COLLECTIONS.STORE_SETTINGS, 'store_settings')
```

---

#### 8. `lib/services/stores.ts`
**Problemas**:
- `DEFAULT_STORES` duplicado en `use-store-info.ts`
- Patrón `doc()` + `getDoc()` repetido
- Sin usar `firestore-utils`

**Cambios recomendados**:
```typescript
// Usar utilidades centralizadas
import { 
  getDocByPath, 
  safeGetDoc, 
  setDocByPath 
} from '@/lib/firestore-utils'

// Reemplazar código manual
export async function getStoreData(storeId: string) {
  return await getDocByPath('stores', storeId)
}
```

---

### FASE 4: MANTENIMIENTO (Cleanup)

#### 9. Archivos de DEBUG
**Afectados**:
- `app/api/debug/store-settings/route.ts`
- `app/api/debug/categories-info/route.ts`
- `app/api/debug/settings/route.ts`

**Cambios recomendados**:
- Usar `getCollectionDocs()` en lugar de `getDocs(collection(...))`
- Usar `mapDocs()` para conversión
- Consolidar en una sola utilidad de debug

---

#### 10. `lib/init-demo-data.ts`
**Problemas**:
- Usa `doc(collection(...))` pattern outdated
- Sin usar las nuevas utilidades

**Cambios recomendados**:
```typescript
// Usar setDocByPath en lugar de setDoc manual
await setDocByPath('products', prodData.id, prodData)
```

---

## 📊 RESUMEN DE IMPACTO

| Archivo | Líneas Actuales | Líneas Optimizadas | Reducción | Impacto |
|---------|-----------------|-------------------|-----------|---------|
| format-price.ts | 155 | 95 | -39% | 🟢 CRÍTICO |
| adminService.ts | 316 | 220 | -30% | 🟡 ALTO |
| use-store-info.ts | 115 | 10 | -91% | 🟢 CRÍTICO |
| use-platform-info.ts | 107 | 10 | -91% | 🟢 CRÍTICO |
| use-store-settings.ts | 100 | 10 | -90% | 🟢 CRÍTICO |
| app/api/*.route.ts | ~500 | ~350 | -30% | 🟡 ALTO |
| **TOTAL** | **~1,200** | **~700** | **-42%** | **🚀** |

---

## 🚀 ORDEN DE EJECUCIÓN

### Paso 1: Validar nuevas utilidades
```bash
# Verificar que los nuevos archivos tengan sintaxis correcta
npm run type-check
```

### Paso 2: Refactorizar formato de precios
- ✅ COMPLETADO

### Paso 3: Refactorizar hooks
1. Actualizar `use-store-info.ts` para usar `useFirestoreDoc`
2. Actualizar `use-platform-info.ts` para usar `useFirestoreDoc`
3. Actualizar `use-store-settings.ts` para usar `useFirestoreDoc`

### Paso 4: Refactorizar servicios
1. Actualizar `services/adminService.ts`
2. Actualizar `services/stores.ts`

### Paso 5: Refactorizar API routes
1. Actualizar endpoints de admin
2. Actualizar endpoints de debug

### Paso 6: Testing
```bash
npm run dev
npm run build
```

---

## ⚠️ NOTAS IMPORTANTES

### Compatibilidad hacia atrás
- Las nuevas utilidades son **addictionales**, no reemplazan
- Los hooks antiguos siguen funcionando
- Refactorizar gradualmente para evitar breaking changes

### Testing
- Verificar que el caching funcione correctamente
- Validar que realtime updates sigan funcionando
- Probar error handling

### Performance
- Las nuevas utilidades son más eficientes
- Mejor caching reduce llamadas a Firestore
- Menor bundle size

---

## 📚 Referencia Rápida

### Usar nuevas utilidades Firestore

```typescript
// Lectura simple
const doc = await getDocByPath('stores', storeId)

// Lectura con manejo de errores
const { success, data, error } = await safeGetDoc('stores', storeId)

// Lectura de colección
const docs = await getCollectionDocs('products')

// Con query
const results = await getDocumentsByQuery('products', 'category', '==', 'electronics')

// Escritura
await setDocByPath('stores', storeId, { name: 'New Name' })
```

### Usar nuevos hooks

```typescript
// Hook genérico
const { data, loading, error } = useFirestoreDoc<T>('collection', 'docId')

// Atajos para casos comunes
const storeInfo = useStoreInfoOptimized(storeId)
const settings = useStoreSettingsOptimized()
const platformInfo = usePlatformInfoOptimized()
```

### Usar validaciones

```typescript
// Email
const { valid, error } = validateEmailWithMessage(email)

// Password
const { valid, error } = validatePasswordWithMessage(password)

// Login completo
const { valid, errors } = validateLoginCredentials(email, password)

// Tienda
const { valid, errors } = validateStoreSettings(data)
```

