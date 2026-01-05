# 📊 ANÁLISIS DE OPTIMIZACIÓN DE CÓDIGO

## Resumen Ejecutivo
Se encontraron **múltiples redundancias críticas** que afectan la mantenibilidad y performance:
- ❌ **Lógica duplicada**: Same price parsing en 2 funciones
- ❌ **Patrones repetidos**: 40+ llamadas Firestore sin abstracción
- ❌ **Hooks con duplicación**: 3 hooks que repiten lógica Firestore
- ❌ **Configuración esparcida**: Constantes distribuidas en múltiples archivos

---

## 1. REDUNDANCIAS ENCONTRADAS

### 1.1 Parsing de Precios (CRÍTICO)
**Archivo**: `lib/format-price.ts`

#### Problema:
- `ensureNumberPrice()` y `sanitizePriceInput()` tienen **lógica idéntica**
- 60+ líneas de código duplicado
- Dificulta el mantenimiento

**Código duplicado:**
```typescript
// ambas funciones hacen esto:
if (cleaned.includes('.')) {
  const dotCount = (cleaned.match(/\./g) || []).length;
  if (dotCount > 1 || (dotCount === 1 && cleaned.lastIndexOf('.') > cleaned.length - 4)) {
    cleaned = cleaned.replace(/\./g, '');
  }
}
```

#### Solución:
Crear una única función base `parsePriceString()` que ambas usen.

---

### 1.2 Consultas Firestore Repetidas (CRÍTICO)

**Problema 1**: Pattern `getDocs(collection(db, ...))` sin abstracción
- Aparece 40+ veces en el código
- Sin manejo de errores consistente
- Sin caching

**Archivos afectados:**
- `app/api/admin/analytics/route.ts` (7 consultas)
- `app/api/debug/categories-info/route.ts` (3 consultas)
- `lib/services/adminService.ts` (3 consultas)
- `lib/subcategories.ts` (múltiples)

**Problema 2**: Pattern `doc(db, collection, id)` repetido
- Mismo patrón en 15+ archivos
- Sin encapsulación

#### Solución:
Crear utilidades genéricas en `lib/firestore-utils.ts`

---

### 1.3 Hooks Duplicados (ALTO)

**Hooks con lógica similar:**
1. `use-store-info.ts` - Lectura de tienda
2. `use-store-settings.ts` - Lectura de settings
3. `use-platform-info.ts` - Lectura de platform info

**Patrón repetido:**
```typescript
const [data, setData] = useState(defaultValue)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const doc = await getDoc(...)
      if (doc.exists()) {
        setData(doc.data())
      }
    } catch (err) {
      setError(err.message)
      setData(defaultValue)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

#### Solución:
Crear hook genérico `useFirestoreDoc<T>()` que todos usen.

---

### 1.4 Configuración y Constantes Dispersas (MEDIO)

**Constantes duplicadas:**
- `DEFAULT_STORES` en `use-store-info.ts` Y `services/stores.ts`
- `STORE_DEFAULTS` en `use-store-settings.ts`
- `defaultPlatformInfo` en `use-platform-info.ts`

**Soluciones hardcodeadas:**
- URLs de Firestore en múltiples archivos
- Nombres de colecciones como strings literales

#### Solución:
Centralizar en `lib/config/constants.ts`

---

### 1.5 Error Handling Inconsistente (MEDIO)

**Patrones variados:**
- Algunos archivos retornan `null`
- Otros retornan `error` en objeto
- Algunos lanzan excepciones
- Logging inconsistente

---

## 2. OPORTUNIDADES DE POLIMORFISMO

### 2.1 Operaciones Firestore Genéricas

```typescript
// Actualmente (repetido):
const docRef = doc(db, 'stores', storeId)
const snapshot = await getDoc(docRef)

// Y también:
const docRef = doc(db, 'adminUsers', userId)
const snapshot = await getDoc(docRef)

// Solución:
const snapshot = await getDocByPath('stores', storeId)
const snapshot = await getDocByPath('adminUsers', userId)
```

### 2.2 Hooks de Lectura Firestore

```typescript
// Actualmente (3 hooks diferentes):
useStoreInfo(storeId) // returns StoreInfo | null
useStoreSettings(storeId) // returns StoreSettings
usePlatformInfo() // returns PlatformInfo

// Solución polimórfica:
useFirestoreDoc<StoreInfo>('stores', storeId)
useFirestoreDoc<StoreSettings>('store_settings', 'store_settings')
useFirestoreDoc<PlatformInfo>('platform_info', 'platform_info')
```

---

## 3. OPERACIONES REPETIDAS

### 3.1 Conversión de DocumentSnapshot

**Patrón repetido 30+ veces:**
```typescript
const data = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))
```

**Solución:**
```typescript
const data = mapDocs(snapshot.docs)
```

### 3.2 Validación de Email/Contraseña

**Repetido en:**
- `adminService.ts`
- `admin-auth.ts`
- Múltiples endpoints API

**Consolidar en `lib/validation.ts`**

### 3.3 Manejo de Timestamps

Diferentes formatos en:
- `toISOString()`
- `new Timestamp()`
- `new Date()`

---

## 4. ANÁLISIS DE IMPACTO

| Problema | Severidad | Líneas Duplicadas | Impact |
|----------|-----------|------------------|--------|
| Price parsing | 🔴 CRÍTICO | ~60 | Mantenimiento, bugs |
| Firestore queries | 🔴 CRÍTICO | ~100 | Performance, consistencia |
| Hooks similares | 🟠 ALTO | ~150 | Bundle size, mantenibilidad |
| Constantes | 🟠 ALTO | ~50 | Sincronización de config |
| Error handling | 🟡 MEDIO | ~80 | Debugging, experiencia |
| **TOTAL** | | **~440** | **Mejora del 30-40%** |

---

## 5. PLAN DE OPTIMIZACIÓN (PRIORIZADO)

### Fase 1: CRÍTICA (Impact Alto, Esfuerzo Bajo)
1. ✅ Consolidar parsing de precios
2. ✅ Crear `lib/firestore-utils.ts` con funciones base
3. ✅ Centralizar constantes en `lib/config/constants.ts`

### Fase 2: IMPORTANTE (Impact Alto, Esfuerzo Medio)
4. ✅ Crear hook genérico `useFirestoreDoc<T>`
5. ✅ Reemplazar 3 hooks con la versión genérica
6. ✅ Optimizar `adminService.ts`

### Fase 3: MANTENIMIENTO (Impact Medio, Esfuerzo Bajo)
7. ✅ Centralizar validaciones
8. ✅ Standardizar error handling
9. ✅ Cleanup de archivos no usados

---

## 6. BENEFICIOS ESPERADOS

- **Bundle Size**: -15-20% (eliminación de lógica duplicada)
- **Mantenibilidad**: +40% (un único lugar para actualizar lógica)
- **Performance**: +10% (mejor caching y menos re-renders)
- **Bugs**: -30% (menos código, menos puntos de fallo)
- **Onboarding**: +50% (menos patrones diferentes que aprender)

