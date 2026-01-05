# REFERENCIA TÉCNICA - Nuevas Funcionalidades

## Arquitectura de Cambios

```
ubatech/
├── lib/
│   ├── cart-context.tsx ⭐ MODIFICADO
│   │   └── Carritos separados por tienda
│   ├── format-price.ts ⭐ MODIFICADO
│   │   └── Agregada: formatPhoneForWhatsapp()
│   ├── services/
│   │   └── stores.ts ⭐ NUEVO
│   │       ├── initializeStoresCollection()
│   │       ├── getStoreData()
│   │       └── updateStoreData()
│   └── ...
│
├── hooks/
│   └── use-store-info.ts ⭐ NUEVO
│       └── useStoreInfo(storeId: string)
│
├── components/
│   ├── scroll-to-top.tsx ⭐ NUEVO
│   │   └── ScrollToTop component
│   ├── admin-sidebar.tsx ⭐ MODIFICADO
│   │   └── Agregada opción "Tiendas"
│   ├── admin/
│   │   └── stores-settings.tsx ⭐ NUEVO
│   │       └── StoresSettings component
│   └── ...
│
└── app/
    ├── api/
    │   ├── stores/
    │   │   └── init/
    │   │       └── route.ts ⭐ NUEVO
    │   │           └── POST /api/stores/init
    │   └── ...
    │
    ├── [store]/
    │   ├── layout.tsx ⭐ MODIFICADO
    │   │   └── Agregado: ScrollToTop
    │   ├── carrito/
    │   │   └── page.tsx ⭐ MODIFICADO
    │   │       └── Agregado Footer, independencia por tienda
    │   ├── contacto/
    │   │   └── page.tsx ⭐ NUEVO
    │   │       └── Página dinámica de contacto
    │   └── ...
    │
    ├── admin/
    │   └── dashboard/
    │       └── page.tsx ⭐ MODIFICADO
    │           ├── Agregado: ScrollToTop
    │           ├── Agregado: StoresSettings
    │           └── Import: stores-settings.tsx
    └── ...
```

---

## 1. Sistema de Carritos Independientes

### Archivo: `lib/cart-context.tsx`

**Cambios principales:**
- Agregado `usePathname()` para detectar tienda actual
- Cambio en localStorage: de `cart` a `cart_[storeName]`
- Agregado `currentStore` al contexto

**Lógica:**
```typescript
// Detectar tienda desde pathname
const getStoreFromPathname = (pathname: string | null): string => {
  if (!pathname) return "ubatech"
  if (pathname.includes('/djcelutecnico')) return "djcelutecnico"
  if (pathname.includes('/ubatechpro') || pathname.includes('/ubatech')) return "ubatech"
  return "ubatech"
}

// Cargar carrito específico
const cartKey = `cart_${currentStore}`
const savedCart = localStorage.getItem(cartKey)
```

**Ventajas:**
- Cada tienda tiene carrito completamente separado
- Datos persisten en localStorage
- Detección automática de tienda

**Consideraciones:**
- LocalStorage se sincroniza entre ventanas del mismo origen
- Límite de ~5-10MB por dominio

---

## 2. Componente ScrollToTop

### Archivo: `components/scroll-to-top.tsx`

**Características:**
```typescript
// Aparece cuando scroll > 300px
if (window.scrollY > 300) {
  setIsVisible(true)
}

// Desaparece cuando scroll < 300px
if (window.scrollY <= 300) {
  setIsVisible(false)
}
```

**Smooth Scroll:**
```typescript
window.scrollTo({
  top: 0,
  behavior: "smooth",
})
```

**Integración:**
- Agregado a `app/[store]/layout.tsx`
- Agregado a `app/admin/dashboard/page.tsx`
- No se agrega a rutas específicas (ej: `/admin/login`)

---

## 3. Sistema de Información de Tiendas

### Arquitectura de Datos

#### Firestore Collection: `stores`

```
stores/
├── djcelutecnico (document)
│   ├── id: string
│   ├── name: string
│   ├── email: string
│   ├── phone: string
│   ├── address: string
│   ├── logo: string
│   ├── primaryColor: string
│   ├── secondaryColor: string
│   ├── description: string
│   ├── whatsapp?: string (optional)
│   ├── instagram?: string (optional)
│   ├── facebook?: string (optional)
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
│
└── ubatech (document)
    └── [Same structure as above]
```

### Servicio: `lib/services/stores.ts`

**Funciones principales:**

1. **initializeStoresCollection()**
   - Crea colección si no existe
   - Usa valores por defecto
   - Idempotente (seguro llamar múltiples veces)

2. **getStoreData(storeId: string)**
   - Obtiene datos desde Firestore
   - Si no existe, retorna valor por defecto
   - Manejo de errores con fallback

3. **updateStoreData(storeId: string, updates: Partial<StoreDocument>)**
   - Actualiza documentos en Firestore
   - Merge automático (no sobrescribe datos existentes)
   - Timestamp automático de actualización

### Hook: `hooks/use-store-info.ts`

**Interfaz:**
```typescript
export function useStoreInfo(storeId: string) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  return { storeInfo, loading, error, updateStoreInfo }
}
```

**Uso:**
```typescript
const { storeInfo, loading, error, updateStoreInfo } = useStoreInfo("djcelutecnico")

// Actualizar
const success = await updateStoreInfo({
  email: "newemail@example.com",
  primaryColor: "#FF0000"
})
```

---

## 4. Página de Contacto Dinámica

### Archivo: `app/[store]/contacto/page.tsx`

**Características:**
- Ruta: `/[store]/contacto`
- Dinámica por parámetro `store`
- Integración con `useStoreInfo`
- Formulario con validación
- Integración WhatsApp
- Email de contacto

**Flujo:**
```
1. Usuario entra a /djcelutecnico/contacto
2. Componente obtiene storeId del params
3. Hook useStoreInfo carga datos desde Firestore
4. Muestra información específica de la tienda
5. Usuario puede:
   - Ver contactos
   - Hacer click en WhatsApp
   - Llenar y enviar formulario
```

**Validación:**
```typescript
if (!formData.name || !formData.email || !formData.message) {
  setError("Por favor completa todos los campos")
  return
}
```

**WhatsApp Integration:**
```typescript
const phoneFormatted = formatPhoneForWhatsapp(storeInfo.phone)
const message = encodeURIComponent("Hola, quisiera consultar...")
window.open(`https://wa.me/${phoneFormatted}?text=${message}`)
```

---

## 5. Panel Administrativo - Tiendas

### Archivo: `components/admin/stores-settings.tsx`

**Estructura del componente:**
```typescript
const [selectedStore, setSelectedStore] = useState<"djcelutecnico" | "ubatech">("djcelutecnico")
const { storeInfo, loading, error, updateStoreInfo } = useStoreInfo(selectedStore)
const [formData, setFormData] = useState<Partial<StoreInfo> | null>(null)
const [saving, setSaving] = useState(false)
const [saveMessage, setSaveMessage] = useState(...)
```

**Secciones editables:**
1. Información Básica
2. Información de Contacto
3. Redes Sociales
4. Colores y Estilos

**Guardado:**
```typescript
const handleSave = async () => {
  setSaving(true)
  const success = await updateStoreInfo(formData)
  if (success) {
    setSaveMessage({ type: "success", text: "Cambios guardados..." })
  }
}
```

**Validación de acceso:**
```typescript
{activeTab === "stores" && (
  role === "super" ? (
    <StoresSettings />
  ) : (
    <div>No autorizado</div>
  )
)}
```

---

## 6. API de Inicialización

### Ruta: `app/api/stores/init/route.ts`

**Endpoint:**
```
POST /api/stores/init
```

**Respuesta (éxito):**
```json
{
  "success": true,
  "message": "Colección de tiendas inicializada correctamente"
}
```

**Respuesta (error):**
```json
{
  "success": false,
  "error": "Mensaje de error..."
}
```

**Uso:**
```javascript
const response = await fetch("/api/stores/init", {
  method: "POST"
})
const data = await response.json()
```

---

## Flujos de Integración

### Flujo 1: Cargar Información de Tienda
```
Usuario entra a /[store]/contacto
    ↓
useParams() obtiene [store]
    ↓
useStoreInfo(storeId) hace:
  1. useEffect()
  2. getDoc(db, 'stores', storeId)
  3. Si existe → setStoreInfo(data)
  4. Si no existe → setStoreInfo(DEFAULT)
    ↓
Componente renderiza con datos
```

### Flujo 2: Actualizar Información en Admin
```
Admin hace click "Guardar Cambios"
    ↓
handleSave() llama updateStoreInfo(formData)
    ↓
updateStoreInfo():
  1. updateDoc(db, 'stores', storeId, updates)
  2. setStoreInfo(prev ∪ updates)
  3. Retorna success/error
    ↓
Mostrar mensaje de confirmación
```

### Flujo 3: Separación de Carritos
```
Usuario en /djcelutecnico
    ↓
CartContext lee pathname
    ↓
getStoreFromPathname() → "djcelutecnico"
    ↓
cartKey = "cart_djcelutecnico"
    ↓
localStorage.getItem("cart_djcelutecnico")
    ↓
Si existe → cargar items
Si no existe → carrito vacío
    ↓
Usuario en /ubatech
    ↓
cartKey = "cart_ubatech"
    ↓
localStorage.getItem("cart_ubatech") ← DIFERENTE
```

---

## Dependencias y Herramientas

### Nuevas dependencias: NINGUNA
Todas las funcionalidades usan librerías ya existentes:
- `react` - Hooks y componentes
- `next/navigation` - Routing y params
- `firebase/firestore` - Base de datos
- `lucide-react` - Iconos

### Herramientas de desarrollo:
- TypeScript - Type safety
- Tailwind CSS - Estilos (ya existente)
- Next.js 13+ - Framework (ya existente)

---

## Seguridad y Permisos

### Firestore Rules (recomendado)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección stores: lectura pública, escritura solo admin
    match /stores/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'super';
    }
    
    // ... resto de rules ...
  }
}
```

### Validación en Frontend
- Campos requeridos
- Formato de email
- Validación de colores hex
- Mensaje de confirmación antes de guardar

### Control de Acceso
- `StoresSettings` solo visible para `role === "super"`
- API endpoints pueden agregar autenticación
- Datos públicos (tiendas) se leen sin autenticación
- Datos editables se actualizan solo si es admin

---

## Performance y Optimizaciones

### Caché Local
- LocalStorage para carritos (evita consultas BD)
- React state para formularios (evita re-renders innecesarios)

### Lazy Loading
- Componentes cargados bajo demanda
- Imágenes con Next.js Image (optimizado)

### Revalidación
- useEffect se ejecuta en cambio de `storeId`
- No hay consultas duplicadas
- Merge automático en Firestore (no sobrescribe)

---

## Testing Recomendado

### Tests E2E
```gherkin
Scenario: Carritos independientes
  Given Usuario en /djcelutecnico
  When Agrega 3 productos
  And Navega a /ubatech
  Then El carrito está vacío
  When Regresa a /djcelutecnico
  Then El carrito tiene 3 productos

Scenario: Scroll to Top
  Given Usuario en /djcelutecnico
  When Hace scroll 400px
  Then Ve el botón "Scroll to Top"
  When Hace click
  Then Sube al top suavemente

Scenario: Página de contacto
  Given Usuario en /djcelutecnico/contacto
  Then Ve información de DJCELUTECNICO
  When Ve a /ubatech/contacto
  Then Ve información de Ubatech+Pro
```

### Tests Unitarios
```typescript
// cart-context.tsx
describe('CartContext', () => {
  it('debería tener carritos separados por tienda', () => {
    // Mock de pathname
    // Verificar que cart_djcelutecnico y cart_ubatech son diferentes
  })
})

// useStoreInfo.ts
describe('useStoreInfo', () => {
  it('debería cargar datos desde Firestore', async () => {
    // Mock de Firestore
    // Verificar que carga datos correctos
  })
  
  it('debería usar valores por defecto si no existen', async () => {
    // Mock de getDoc que retorna no existe
    // Verificar que usa DEFAULT_STORES
  })
})
```

---

## Configuración de Firestore

### Inicialización Automática
1. Usuario accede a `/[store]/contacto`
2. `useStoreInfo` intenta cargar datos
3. Si no existe, muestra datos por defecto
4. Los datos se crean automáticamente en la primera actualización

### Inicialización Manual
```bash
curl -X POST http://localhost:3000/api/stores/init
```

### Verificación
1. Abre Firebase Console
2. Ve a Firestore
3. Verifica colección "stores"
4. Debe haber 2 documentos: "djcelutecnico" y "ubatech"

---

## Rollback y Deshacer Cambios

Si algo no funciona, puedes:

### Opción 1: Limpiar localStorage
```javascript
localStorage.removeItem('cart_djcelutecnico')
localStorage.removeItem('cart_ubatech')
```

### Opción 2: Limpiar Firestore
```javascript
// En Firebase Console:
// Elimina colección 'stores'
// Vuelve a llamar a /api/stores/init
```

### Opción 3: Código original
```bash
git revert <commit-hash>
npm run dev
```

---

## Monitoreo y Logging

### Logs del Sistema
```typescript
// En console (DevTools)
console.log('Cart store changed:', currentStore)
console.log('Store info loaded:', storeInfo)
console.log('Firestore update:', success)
```

### Debugging
```javascript
// En navegador:
localStorage.getItem('cart_djcelutecnico')
// Retorna JSON con items del carrito

// En Firebase Console:
// Verifica que los datos se guardaron correctamente
```

---

## Casos de Uso Avanzados

### Caso 1: Migración de Datos Antiguos
```typescript
// Si tenías un carrito antiguo en localStorage['cart']
const oldCart = localStorage.getItem('cart')
if (oldCart) {
  localStorage.setItem('cart_ubatech', oldCart)
  localStorage.removeItem('cart')
}
```

### Caso 2: Sincronización entre Pestañas
```typescript
// Escuchar cambios de storage en otras pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'cart_djcelutecnico') {
    // Actualizar carrito
    setCart(JSON.parse(e.newValue))
  }
})
```

### Caso 3: Analytics
```typescript
// Rastrear cambios de tienda
const handleStoreChange = (newStore: string) => {
  gtag.event('store_changed', {
    from_store: selectedStore,
    to_store: newStore
  })
  setSelectedStore(newStore)
}
```

---

**Última actualización:** 29 de Diciembre de 2025
**Versión técnica:** 1.0
**Estado:** ✅ Completamente documentado
