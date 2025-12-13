# SINCRONIZACIÓN DE CONFIGURACIÓN - DOCUMENTACIÓN

## Problema Identificado y Corregido

El sitio público y el panel administrativo no estaban sincronizados porque:

1. **Ubicación de datos incorrecta**: El código buscaba en `colección: settings, documento: store`
2. **Ubicación real de datos**: Los datos están en `colección: store_settings, documento: store_settings`

## Archivos Corregidos

### 1. API Pública (`/api/settings`)
**Ruta**: `app/api/settings/route.ts`
- Lee desde: `store_settings/store_settings`
- Sin caché para siempre obtener datos frescos
- Accesible desde el sitio público

### 2. API Admin (`/api/admin/settings`)
**Ruta**: `app/api/admin/settings/route.ts`
- Lee desde: `store_settings/store_settings`
- Usado por el panel administrativo

### 3. Componente Admin Settings
**Ruta**: `components/admin/settings.tsx`
- `loadSettings()`: Lee desde colección `store_settings`
- `handleSave()`: Guarda en `store_settings/store_settings`

### 4. Hook useStoreSettings
**Ruta**: `hooks/use-store-settings.ts`
- **Listener en tiempo real**: Usa `onSnapshot` de Firestore
- **Polling como fallback**: Cada 3 segundos
- **Carga automática**: Al montar el componente
- Devuelve: `{ settings, loading, error, reload }`

### 5. Componentes Públicos Actualizados
- `components/footer.tsx`: Recarga cada 5 segundos + visibilidad
- `components/header.tsx`: Recarga cada 5 segundos
- `components/hero.tsx`: Recarga cada 5 segundos

## Flujo de Sincronización

```
Panel Admin (components/admin/settings.tsx)
    ↓
Guardar en Firestore (store_settings/store_settings)
    ↓
Listener de Firestore se dispara (useStoreSettings)
    ↓
Actualiza estado en React
    ↓
Componentes públicos se re-renderean con datos nuevos
```

## Cómo Verificar que Funcione

### Opción 1: Verificar en Firestore Console
1. Ve a: https://console.firebase.google.com
2. Selecciona proyecto: `ubatech-a8650`
3. Ve a: Cloud Firestore → Database
4. Navega a: `store_settings → store_settings`
5. Verifica que los campos estén presentes:
   - storeName
   - storeEmail
   - storePhone
   - storeAddress
   - storeHours
   - description
   - updatedAt
   - currency
   - taxPercentage

### Opción 2: Verificar con API Debug
1. Abre en el navegador: `http://localhost:3000/api/debug/store-settings`
2. Debería devolver datos sobre dónde están los datos en Firestore

### Opción 3: Verificar Sincronización
1. Abre en el navegador: `http://localhost:3000/api/sync/settings`
2. Debería devolver los datos actuales de la configuración

## Prueba Completa de Sincronización

1. **Abre dos navegadores/pestañas**:
   - Pestaña 1: Panel Administrativo (`http://localhost:3000/admin/dashboard`)
   - Pestaña 2: Sitio Público (`http://localhost:3000`)

2. **En el Panel Admin**:
   - Ve a Configuración
   - Cambia un valor (ej: Teléfono)
   - Haz clic en "Guardar Configuración"

3. **En el Sitio Público**:
   - Verifica que el footer/header muestre el nuevo valor
   - **Máximo 3 segundos de latencia** (por el polling)
   - O **inmediato** si usa listener de Firestore

## Troubleshooting

### Si no ves cambios en el sitio público:

1. **Verifica que Firestore esté actualizado**:
   ```
   curl http://localhost:3000/api/sync/settings
   ```

2. **Verifica la consola del navegador** (F12):
   - Busca errores de fetch
   - Verifica que el hook esté cargando datos

3. **Limpia cache**:
   - Ctrl+Shift+Delete
   - O abre en modo incógnito

4. **Verifica Firestore Rules**:
   - Los datos deben ser accesibles al público
   - Las reglas permiten lectura de `store_settings`

## Referencias Importantes

### Ubicación de Datos Firestore
```
Database: ubatech-a8650
Collection: store_settings
Document: store_settings
Fields:
  - storeName (string)
  - storeEmail (string)
  - storePhone (string)
  - storeAddress (string)
  - storeHours (string)
  - description (string)
  - currency (string)
  - taxPercentage (number)
  - updatedAt (timestamp)
```

### Archivos Críticos
- `lib/firebase.ts`: Inicialización de Firebase
- `lib/admin-config.ts`: Configuración de admin
- `hooks/use-store-settings.ts`: Hook de sincronización
- `app/api/settings/route.ts`: API pública
- `components/admin/settings.tsx`: Panel administrativo

## Nota de Seguridad

⚠️ **Importante**: Asegurate de que en Firestore Rules está permitida la lectura de `store_settings/store_settings` para usuarios públicos:

```
match /store_settings/{document=**} {
  allow read: if true;  // Público puede leer configuración
  allow write: if request.auth.uid != null;  // Solo autenticados pueden escribir
}
```
