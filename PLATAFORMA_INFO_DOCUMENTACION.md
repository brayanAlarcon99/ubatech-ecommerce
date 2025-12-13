# Configuración de Información de la Plataforma

## Descripción General

Se ha implementado un sistema que permite:

1. **Año dinámico en el footer**: El copyright ahora muestra automáticamente el año actual sin necesidad de actualización manual.
2. **Gestión de información de la plataforma**: Los súper usuarios pueden editar la información de la plataforma desde el panel de administración.
3. **Visualización de información**: La información se muestra en los paneles administrativos y se sincroniza en tiempo real.

## Cambios Realizados

### 1. Footer Dinámico

**Archivo**: `components/footer.tsx`

El footer ahora usa `new Date().getFullYear()` para mostrar automáticamente el año actual:

```tsx
<p className="text-center text-gray-600 text-sm">
  © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
</p>
```

**Beneficio**: No necesita actualización manual cada año.

### 2. Colección en Firestore

**Colección**: `platform_info`
**Documento**: `platform_info`

Estructura del documento:

```json
{
  "version": "1.0.0",
  "lastUpdate": "Diciembre 2025",
  "supportEmail": "support@ubatech.com",
  "description": "Plataforma de compras online",
  "updatedAt": "2025-12-10T15:30:00.000Z"
}
```

### 3. Gestión desde el Panel Admin

**Ubicación**: Panel de Administración > Configuración

Solo los **súper usuarios** pueden editar la información de la plataforma. Los administradores regulares pueden ver la información pero no pueden modificarla.

Los campos editables (solo para super usuarios) incluyen:

- **Versión de la Plataforma**: Versión actual (ej: 1.0.0)
- **Última Actualización**: Fecha/período de actualización (ej: Diciembre 2025)
- **Email de Soporte**: Email de contacto para soporte (ej: support@ubatech.com)
- **Descripción de la Plataforma**: Descripción general de la plataforma

**Acceso por rol:**
- **Super Usuario**: ✅ Puede ver y editar toda la información
- **Administrador Regular**: 👁️ Solo puede ver la información (campos deshabilitados)

### 4. Componentes Creados

#### Hook: `hooks/use-platform-info.ts`

Hook personalizado para acceder a la información de la plataforma desde cualquier componente:

```typescript
const { platformInfo, loading, reload } = usePlatformInfo()
```

**Propiedades**:
- `platformInfo`: Objeto con la información de la plataforma
- `loading`: Booleano que indica si se están cargando los datos
- `reload()`: Función para refrescar manualmente la información

#### Componente: `components/admin/platform-info-panel.tsx`

Componente que muestra la información de la plataforma en los paneles administrativos:

```tsx
<PlatformInfoPanel />
```

Muestra:
- Versión
- Última actualización
- Email de soporte (como enlace clickeable)
- Descripción

### 5. Actualización del Dashboard

El dashboard principal (Analytics) ahora muestra la información de la plataforma al final, permitiendo a los super usuarios tener una vista rápida de estos datos.

## Cómo Usar

### Para Súper Usuarios

1. Acceder al Panel de Administración
2. Ir a **Configuración** (Settings)
3. Desplazarse a la sección **Información de la Plataforma**
4. Editar los campos según sea necesario
5. Hacer clic en **Guardar Información de Plataforma**

### Para Administradores Regulares

Los administradores regulares pueden:
1. Ver la información de la plataforma en la sección de Configuración
2. Consultar versión, última actualización, email de soporte y descripción
3. **No pueden editar** ninguno de estos campos (aparecen deshabilitados)

**Nota**: Solo los súper usuarios ven el botón "Guardar Información de Plataforma"

### Para Mostrar en Otros Componentes

Para usar la información de la plataforma en cualquier componente:

```tsx
"use client"

import { usePlatformInfo } from "@/hooks/use-platform-info"

export default function MiComponente() {
  const { platformInfo, loading } = usePlatformInfo()

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <p>Versión: {platformInfo.version}</p>
      <p>Soporte: {platformInfo.supportEmail}</p>
      {/* más contenido */}
    </div>
  )
}
```

## Sincronización en Tiempo Real

- El footer se actualiza automáticamente cada año (basado en la fecha del navegador)
- Los paneles administrativos refrescan la información cada 10 segundos
- También se actualiza cuando el usuario regresa a la página (cambio de visibilidad)

## Reglas de Firestore Sugeridas

Para proteger la colección `platform_info`, agregar estas reglas:

```javascript
// Permitir lectura pública
match /platform_info/{document=**} {
  allow read: if true;
  // Solo súper usuarios pueden escribir
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
}
```

## Campos Personalizables

Los campos de la información de la plataforma son completamente personalizables. Puedes agregar más campos editando:

1. `components/admin/settings.tsx` - Agregar nuevos campos en el formulario
2. `hooks/use-platform-info.ts` - Actualizar la interfaz `PlatformInfo`
3. `components/admin/platform-info-panel.tsx` - Mostrar los nuevos campos

## Verificación

Para verificar que todo funciona correctamente:

1. ✅ El footer muestra el año actual dinámicamente
2. ✅ El súper usuario puede editar la información de la plataforma
3. ✅ Los cambios se guardan en Firestore
4. ✅ La información se muestra en el dashboard administrativo
5. ✅ Los cambios se reflejan en tiempo real en los paneles
