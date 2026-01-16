# 📋 ANÁLISIS: Separación de Footer por Tienda - Campos Editables

## 1. ESTADO ACTUAL

### Footer Unificado
- **Archivo**: `components/footer.tsx`
- **Problema**: Un solo footer compartido por todas las tiendas
- **Impacto**: 
  - Mismo link de Google Maps para todas las tiendas
  - Mismo horario para todas las tiendas
  - Mismo "Sobre Nosotros" para todas las tiendas

### Datos que usa el Footer Actual

```typescript
// De useStoreInfo() hook
const storeInfo = {
  name: string              // ✅ Editable en admin
  email: string             // ✅ Editable en admin
  phone: string             // ✅ Editable en admin
  address: string           // ✅ Editable en admin
  aboutUs: string           // ✅ Editable en admin
}

// Datos que NO son editables (HARDCODED)
const horario = "Lunes - Viernes: 8am - 6pm"  // ❌ NO editable
const mapUrl = "https://www.google.com/maps/..." // ❌ NO editable (mismo para todos)
```

---

## 2. CAMPOS ACTUALES DEL FOOTER

| Campo | Ubicación | Valor Actual | Editable? | Tienda-Específico? |
|-------|-----------|--------------|-----------|-------------------|
| **Teléfono** | Contacto | De `storeInfo.phone` | ✅ SÍ | ✅ SÍ |
| **Email** | Contacto | De `storeInfo.email` | ✅ SÍ | ✅ SÍ |
| **Horario** | Contacto | HARDCODED: "Lunes - Viernes: 8am - 6pm" | ❌ NO | ❌ NO |
| **Link Contacto** | Contacto | Dinámico: `/${storeId}/contacto` | ✅ SÍ | ✅ SÍ |
| **Dirección** | Ubicación | De `storeInfo.address` | ✅ SÍ | ✅ SÍ |
| **Google Maps Link** | Ubicación | HARDCODED (diferente por tienda) | ❌ NO | ⚠️ CONFLICTO |
| **Título "Sobre Nosotros"** | Título | HARDCODED | ❌ NO | ❌ NO |
| **Texto "Sobre Nosotros"** | Contenido | De `storeInfo.aboutUs` | ✅ SÍ | ✅ SÍ |
| **Año de Copyright** | Footer | Dinámico: `new Date().getFullYear()` | ✅ SÍ | ✅ SÍ |
| **Nombre en Copyright** | Footer | De `storeInfo.name` | ✅ SÍ | ✅ SÍ |

---

## 3. CAMPOS QUE DEBEN SER EDITABLES POR TIENDA

### 🔴 CRÍTICOS (Problemas actuales)

1. **Google Maps Link** 
   - **Problema**: Actualmente el mismo para todas (Ubatech)
   - **Solución**: Hacer editable en admin por tienda
   - **Campo BD**: `mapsUrl` o `googleMapsLink`
   - **Tipo**: String (URL completa)

2. **Horario de Atención**
   - **Problema**: Hardcoded "Lunes - Viernes: 8am - 6pm"
   - **Solución**: Editable por tienda en admin
   - **Campo BD**: `businessHours` o `storeHours`
   - **Tipo**: String (ej: "Lunes - Viernes: 8am - 6pm, Sábado: 9am - 2pm")

### 🟡 SECUNDARIOS (Mejoras opcionales)

3. **Número de WhatsApp** (independiente de teléfono)
   - **Problema**: Podría ser diferente del teléfono principal
   - **Campo BD**: `whatsappNumber` (ya existe en StoreInfo)
   - **Tipo**: String

4. **Redes Sociales en Footer**
   - **Problema**: No se muestran en footer actual
   - **Campos BD**: `instagram`, `facebook` (ya existen en StoreInfo)
   - **Tipo**: String (URLs)

5. **Descripción de Ubicación**
   - **Problema**: Solo muestra ciudad y país extraído del address
   - **Campo BD**: `locationDescription` (nuevo)
   - **Tipo**: String (ej: "Centro Comercial Plaza X, Local 10")

---

## 4. ESTRUCTURA FIRESTORE PROPUESTA

### Colección: `stores`
### Documento por tienda: `djcelutecnico` | `ubatech`

```json
{
  "id": "ubatech",
  "name": "Ubatech",
  "email": "info@ubatech.com",
  "phone": "+57 3134588107",
  "address": "Cl. 10 #7-39, Ubaté, Colombia",
  "logo": "...",
  "primaryColor": "#...",
  "secondaryColor": "#...",
  "description": "...",
  "aboutUs": "Somos una tienda especializada...",
  
  // NUEVOS CAMPOS PARA FOOTER
  "businessHours": "Lunes - Viernes: 8am - 6pm, Sábado: 9am - 2pm",
  "mapsUrl": "https://www.google.com/maps/search/Cl.+10+%23+7-39...",
  "locationDescription": "Centro Ubaté, Edificio Principal",
  
  // YA EXISTENTES
  "whatsapp": "+57 3134588107",
  "instagram": "https://instagram.com/ubatech",
  "facebook": "https://facebook.com/ubatech"
}
```

---

## 5. LISTA COMPLETA DE CAMPOS EDITABLES

### ✅ TODOS LOS CAMPOS EDITABLES POR TIENDA EN ADMIN

```
INFORMACIÓN BÁSICA
├─ name (Nombre de la Tienda)
├─ description (Descripción corta)
└─ aboutUs (Texto "Sobre Nosotros")

CONTACTO
├─ email (Email principal)
├─ phone (Teléfono principal)
├─ whatsapp (WhatsApp - puede ser igual a phone)
├─ businessHours ⭐ NUEVO (Horarios de atención)
└─ storeHours (Alias de businessHours para compatibilidad)

UBICACIÓN
├─ address (Dirección completa)
├─ locationDescription ⭐ NUEVO (Descripción de ubicación)
└─ mapsUrl ⭐ NUEVO (Link de Google Maps)

REDES SOCIALES
├─ instagram (URL del perfil)
└─ facebook (URL del perfil)

BRANDING
├─ logo (Path de logo)
├─ primaryColor (Color principal)
└─ secondaryColor (Color secundario)
```

---

## 6. PLAN DE IMPLEMENTACIÓN

### FASE 1: Actualizar Estructura de Datos (30 minutos)
- [ ] Actualizar interface `StoreInfo` en `hooks/use-store-info.ts`
  - Agregar: `businessHours`, `mapsUrl`, `locationDescription`
- [ ] Actualizar valores por defecto en `lib/config/constants.ts`
  - Agregar horarios por tienda
  - Agregar maps URLs por tienda
  - Agregar ubicación por tienda

### FASE 2: Actualizar Panel Admin (1 hora)
- [ ] Actualizar `components/admin/stores-settings.tsx`
  - Agregar campos: Business Hours, Maps URL, Location Description
  - Validación de URLs
  - Vista previa de cómo se verá en footer
  - Verificación de link de Maps

### FASE 3: Crear Footers Separados (1.5 horas)
- [ ] Crear `components/footer-ubatech.tsx` (especificado)
  - Usar valores específicos de Ubatech
  - Link de Maps correcto
  - Horario de Ubatech
  
- [ ] Crear `components/footer-djcelutecnico.tsx` (dinámico)
  - Usar `useStoreInfo` para datos dinámicos
  - Link de Maps dinámico
  - Horario dinámico

- [ ] Crear `components/footer-generic.tsx` (fallback)
  - Footer genérico basado en storeId

### FASE 4: Actualizar Uso de Footer (1 hora)
- [ ] `app/[store]/layout.tsx` → Usar footer según tienda
- [ ] `app/ubatech/layout.tsx` → Usar footer-ubatech
- [ ] `app/ubatech/contacto/page.tsx` → Usar footer-ubatech
- [ ] `components/footer.tsx` → Redirigir a versión específica (deprecated)

### FASE 5: Testing (30 minutos)
- [ ] Verificar links de Maps por tienda
- [ ] Verificar horarios se muestren correctamente
- [ ] Verificar cambios en admin se reflejen en footer
- [ ] Verificar responsive en mobile

---

## 7. INTERFAZ ADMIN PROPUESTA

```
┌─────────────────────────────────────────────────────┐
│ CONFIGURACIÓN DE TIENDA: [UBATECH ▼]               │
└─────────────────────────────────────────────────────┘

📋 INFORMACIÓN BÁSICA
├─ Nombre de Tienda: [Ubatech]
├─ Descripción: [Tienda de tecnología...]
└─ Sobre Nosotros: [Somos especializados...]

📞 CONTACTO
├─ Email: [info@ubatech.com]
├─ Teléfono: [+57 3134588107]
├─ WhatsApp: [+57 3134588107]
└─ Horario de Atención: [Lunes - Viernes: 8am - 6pm]
                        [Sábado: 9am - 2pm]

📍 UBICACIÓN
├─ Dirección: [Cl. 10 #7-39, Ubaté, Colombia]
├─ Descripción de Ubicación: [Centro comercial, local 5]
└─ Link Google Maps: [https://www.google.com/maps/...]
   [🔗 Verificar link] [📋 Copiar]

📱 REDES SOCIALES
├─ Instagram: [https://instagram.com/ubatech]
└─ Facebook: [https://facebook.com/ubatech]

🎨 BRANDING
├─ Color Principal: [#picker]
└─ Color Secundario: [#picker]

[GUARDAR CAMBIOS] [CANCELAR]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISTA PREVIA DEL FOOTER
┌─────────────────────────────────────────────────┐
│ CONTACTO              │ UBICACIÓN               │
│ ☎ +57 3134588107    │ 📍 Cl. 10 #7-39        │
│ 📧 info@ubatech.com  │    (Centro comercial)  │
│ ⏰ Lunes - Viernes... │    [Ver en Maps] →     │
│    Sábado: 9am-2pm   │                        │
└─────────────────────────────────────────────────┘
```

---

## 8. RESUMEN DE CAMBIOS

| Aspecto | Actual | Propuesto | Beneficio |
|---------|--------|-----------|-----------|
| **Footer** | 1 componente | 3 componentes (1 genérico + opcionales específicos) | Libertad total por tienda |
| **Google Maps** | Hardcoded (problema) | Editable por tienda ✅ | Cada tienda su ubicación |
| **Horarios** | Hardcoded (problema) | Editable por tienda ✅ | Horarios distintos |
| **Admin Panel** | 18 campos | 21 campos (+3 nuevos) | Control total |
| **Firestore** | Sin cambios | Agregar 3 campos opcionales | Flexibilidad futura |

---

## 9. PRIORIDAD

### 🔴 CRÍTICO (Implementar YA)
1. **Separar footers por tienda** (ubatech vs djcelutecnico)
2. **Google Maps URL editable** por tienda
3. **Business Hours editable** por tienda

### 🟡 IMPORTANTE (Próxima semana)
4. Redes sociales en footer
5. Descripción de ubicación
6. Vista previa en admin

### 🟢 OPCIONAL (Futuro)
7. Múltiples horarios (feriados, excepciones)
8. Galería de ubicación
9. Testimonios en footer

---

## 10. ARCHIVOS A CREAR/MODIFICAR

```
CREAR:
├─ components/footer-ubatech.tsx          (Footer específico para Ubatech)
├─ components/footer-djcelutecnico.tsx    (Footer específico para DJ)
└─ components/footer-generic.tsx          (Footer genérico reutilizable)

MODIFICAR:
├─ hooks/use-store-info.ts               (Agregar nuevos campos)
├─ lib/config/constants.ts               (Valores por defecto)
├─ components/admin/stores-settings.tsx  (Agregar campos en formulario)
├─ app/[store]/layout.tsx                (Usar footer correcto)
├─ app/ubatech/layout.tsx                (Usar footer-ubatech)
└─ app/ubatech/contacto/page.tsx         (Usar footer-ubatech)

DEPRECAR:
└─ components/footer.tsx                 (Redirigir a componente específico)
```

---

## Siguientes Pasos

¿Quieres que proceda con la implementación?

1. **FASE 1**: Actualizar interface StoreInfo + constantes
2. **FASE 2**: Crear footers separados
3. **FASE 3**: Actualizar panel admin
4. **FASE 4**: Integrar en layouts
5. **FASE 5**: Testing y validación
