# 📋 ANÁLISIS: Reorganización de Información de Tienda y Footer

## 1. ESTRUCTURA ACTUAL vs PROPUESTA

### 📊 INTERFAZ STOREINFO - CAMPOS A MODIFICAR

**CAMPOS ACTUALES:**
```typescript
interface StoreInfo {
  id: string                    // ✅ Mantener
  name: string                  // ✅ Mantener (Información Básica)
  email: string                 // ✅ Mantener (Contacto)
  phone: string                 // ✅ Mantener (Contacto)
  address: string               // ✅ Mantener (Contacto)
  logo: string                  // ✅ Mantener
  primaryColor: string          // ✅ Mantener (Colores)
  secondaryColor: string        // ✅ Mantener (Colores)
  description: string           // ⚠️ REVISAR - no se usa en footer
  aboutUs: string               // ✅ Mantener (Sobre Nosotros)
  whatsapp?: string             // ✅ Mantener (WhatsApp requerido)
  instagram?: string            // ✅ Mantener (Redes Sociales)
  facebook?: string             // ✅ Mantener (Redes Sociales)
  
  // ❌ ELIMINAR - REDUNDANTES
  storeName?: string            // Duplicate de 'name'
  storeEmail?: string           // Duplicate de 'email'
  storePhone?: string           // Duplicate de 'phone'
  storeWhatsApp?: string        // Duplicate de 'whatsapp'
  storeAddress?: string         // Duplicate de 'address'
  storeHours?: string           // ⭐ NUEVO - Horario de atención
}
```

**CAMPOS NUEVOS A AGREGAR:**
```typescript
{
  businessHours: string         // ⭐ NUEVO "Lunes - Viernes: 8am - 6pm"
  mapsUrl: string               // ⭐ NUEVO Link de Google Maps
  tiktok?: string               // ⭐ NUEVO Red social
}
```

---

## 2. PANEL ADMINISTRATIVO - REORGANIZACIÓN

### ❌ ELIMINAR SECCIONES
1. **"Configuración de la Tienda"** - COMPLETA
   - Nombre de la Tienda (Configuración) → DELETE
   - Email de la Tienda → DELETE
   - Teléfono de la Tienda → DELETE
   - Dirección → MOVE a Contacto

### ✅ MANTENER SECCIONES

**SECCIÓN 1: Información Básica**
```
- Nombre de la Tienda (from 'name')
- Sobre Nosotros (from 'aboutUs')
```

**SECCIÓN 2: Información de Contacto**
```
- Email (from 'email')
- Teléfono (from 'phone')
- Dirección (from 'address')
- Link de Dirección (from 'mapsUrl') ⭐ NUEVO
- Horario de Atención (from 'businessHours') ⭐ NUEVO
```

**SECCIÓN 3: Configuración de WhatsApp** (MANTENER)
```
- WhatsApp para Órdenes (from 'whatsapp')
```

**SECCIÓN 4: Redes Sociales** (MEJORADO con TikTok)
```
- Instagram
- Facebook
- TikTok ⭐ NUEVO
```

**SECCIÓN 5: Colores y Estilos** (MANTENER)
```
- Color Principal
- Color Secundario
```

---

## 3. FOOTER - NUEVA ESTRUCTURA (3 COLUMNAS)

### ANTES:
```
Contacto | Ubicación          | Sobre Nosotros
Teléf    | Dirección + Maps   | Texto
Email    |                    |
Horario  |
Contacto |
```

### DESPUÉS (3 COLUMNAS CLARAS):
```
┌──────────────────────────────────────────────┐
│ COLUMNA 1          │ COLUMNA 2      │ COLUMNA 3        │
│ CONTACTO           │ SOBRE NOSOTROS │ UBICACIÓN        │
├────────────────────┼────────────────┼──────────────────┤
│ ☎ Teléfono         │ [Texto completo] │ 📍 Dirección   │
│ 📧 Email           │ "Somos una...    │ [Link Maps] →   │
│ ⏰ Horario         │ tienda especia-  │                  │
│ 💬 Chatea          │ lizada..."       │ 🔗 Redes:      │
│                    │                │   🔵 Instagram │
│                    │                │   🟦 Facebook  │
│                    │                │   🎵 TikTok    │
└────────────────────┴────────────────┴──────────────────┘
```

---

## 4. CAMPOS DE BASE DE DATOS - NORMALIZACIÓN

### FIRESTORE: Colección `stores`

**Documento por tienda: `djcelutecnico` | `ubatech`**

```json
{
  // Identificador
  "id": "ubatech",
  
  // INFORMACIÓN BÁSICA
  "name": "Ubatech+Pro",
  "aboutUs": "En Ubatech+Pro somos...",
  
  // INFORMACIÓN DE CONTACTO
  "email": "info@ubatech.com",
  "phone": "+57 3134588107",
  "address": "Cl. 10 #7-39, Ubaté, Colombia",
  "businessHours": "Lunes - Viernes: 8am - 6pm, Sábado: 9am - 2pm",
  "mapsUrl": "https://www.google.com/maps/search/Cl.+10+%23+7-39...",
  
  // CONTACTO ALTERNATIVO
  "whatsapp": "+57 3134588107",
  
  // REDES SOCIALES
  "instagram": "https://instagram.com/ubatech",
  "facebook": "https://facebook.com/ubatech",
  "tiktok": "https://tiktok.com/@ubatech",
  
  // BRANDING
  "logo": "/logo-ubatech.png",
  "primaryColor": "#000000",
  "secondaryColor": "#4db8ff",
  
  // DEPRECIADOS (ELIMINAR)
  // "storeName": "❌ DELETE - use 'name'",
  // "storeEmail": "❌ DELETE - use 'email'",
  // "storePhone": "❌ DELETE - use 'phone'",
  // "storeWhatsApp": "❌ DELETE - use 'whatsapp'",
  // "storeAddress": "❌ DELETE - use 'address'",
  // "storeHours": "❌ DELETE - use 'businessHours'",
  // "description": "⚠️ REVISAR - no se usa"
}
```

---

## 5. CAMBIOS A REALIZAR

### FASE 1: Actualizar Estructura de Datos
- [ ] Actualizar interface `StoreInfo` en `hooks/use-store-info.ts`
  - ✅ Mantener: id, name, email, phone, address, logo, colors, aboutUs, whatsapp, instagram, facebook
  - ⭐ Agregar: businessHours, mapsUrl, tiktok
  - ❌ Eliminar: storeName, storeEmail, storePhone, storeWhatsApp, storeAddress, storeHours

- [ ] Actualizar `lib/config/constants.ts`
  - Mantener valores de STORES_CONFIG
  - ⭐ Agregar businessHours, mapsUrl, tiktok
  - ❌ Remover propiedades duplicadas

### FASE 2: Panel Administrativo
- [ ] Refactorizar `components/admin/stores-settings.tsx`
  - ✅ Mantener: Información Básica, WhatsApp, Redes Sociales, Colores
  - ➕ Agregar: Link de Dirección, Horario, TikTok
  - ❌ Eliminar: Sección "Configuración de la Tienda" completa

### FASE 3: Crear Footers por Tienda
- [ ] Crear `components/footer-layout.tsx` (Nuevo layout genérico)
  - 3 columnas: Contacto, Sobre Nosotros, Ubicación
  - Iconos de redes sociales
  - Responsivo

- [ ] Adaptar uso en layouts
  - `app/[store]/layout.tsx`
  - `app/ubatech/layout.tsx`
  - `app/ubatech/contacto/page.tsx`

### FASE 4: Implementación y Testing
- [ ] TypeScript: npx tsc --noEmit (sin errores)
- [ ] Build: npm run build (exitoso)
- [ ] Visual: Verificar 3 columnas en footer
- [ ] Datos: Verificar sincronización admin → footer

---

## 6. RESUMEN DE CAMBIOS

| Área | Cambio | Beneficio |
|------|--------|-----------|
| **StoreInfo** | -6 campos duplicados, +3 nuevos | Datos normalizados |
| **Admin Panel** | -4 campos redundantes, +3 nuevos | Interfaz clara |
| **Footer** | 3 columnas bien definidas | Mejor UX |
| **BD** | Campos únicos, no duplicados | Mantenible |
| **Redes** | +TikTok | Moderno |

---

## 7. CAMPOS POR UBICACIÓN

```
INFORMACIÓN BÁSICA (Admin)
├─ name → Nombre de la Tienda
└─ aboutUs → Sobre Nosotros

INFORMACIÓN DE CONTACTO (Admin + Footer Col 1)
├─ email → Email
├─ phone → Teléfono
├─ address → Dirección
├─ businessHours → Horario de Atención ⭐
└─ mapsUrl → Link de Dirección ⭐

WHATSAPP (Admin - Sección Destacada)
└─ whatsapp → WhatsApp para Órdenes

REDES SOCIALES (Admin + Footer Col 3)
├─ instagram → Instagram
├─ facebook → Facebook
└─ tiktok → TikTok ⭐

SOBRE NOSOTROS (Footer Col 2)
└─ aboutUs → Texto "Sobre Nosotros"

UBICACIÓN (Footer Col 3)
├─ address → Dirección
├─ mapsUrl → Link Maps
└─ Redes Sociales (iconos)

COLORES Y ESTILOS (Admin)
├─ primaryColor → Color Principal
└─ secondaryColor → Color Secundario
```

---

## SIGUIENTE PASO

Proceder con la **implementación completa** en 4 fases.
