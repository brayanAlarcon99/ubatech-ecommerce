# Guía de Implementación: Modo Mantenimiento para Panel Administrativo

**Versión:** 1.0  
**Fecha:** 19 de Enero de 2026  
**Tiempo Estimado:** 15-20 minutos

---

## 📋 Contenido de la Actualización

Esta actualización agrega un botón en el perfil del super usuario para controlar el modo mantenimiento del panel administrativo.

### Archivos a Crear (4 archivos)
1. ✅ `lib/admin-maintenance-status.ts` - Servicio de estado
2. ✅ `components/admin/admin-maintenance-control.tsx` - Componente de control
3. ✅ `components/admin/maintenance-check.tsx` - Verificador de acceso
4. ✅ `app/admin/maintenance/page.tsx` - Página de mantenimiento

### Archivos a Modificar (2 archivos)
1. ✅ `components/admin/settings.tsx` - Agregar componente
2. ✅ `app/admin/dashboard/page.tsx` - Integrar verificación

---

## 🔍 Verificación Previa

Antes de implementar, verifica que tienes:

```bash
# Directorios existentes:
- lib/
- components/admin/
- app/admin/dashboard/
- app/admin/login/

# Archivos base:
- lib/firebase.ts (para conexión a Firestore)
- lib/admin-auth.ts (para autenticación)
- hooks/use-toast.ts (para notificaciones)
- components/ui/card (componentes UI)
```

---

## 📝 Paso a Paso de Implementación

### PASO 1: Crear el Servicio de Estado (5 minutos)

**Archivo:** `lib/admin-maintenance-status.ts`

**Contiene:**
- Interfaz `AdminMaintenanceStatus`
- Función `getAdminMaintenanceStatus()`
- Función `setAdminMaintenanceStatus()`
- Función `shouldRedirectToMaintenance()`

**¿Qué hace?**
Gestiona la lectura y escritura del estado de mantenimiento en Firestore, con soporte para mensajes personalizados y auditoría.

### PASO 2: Crear Componente de Control (5 minutos)

**Archivo:** `components/admin/admin-maintenance-control.tsx`

**Contiene:**
- Componente visual con interfaz
- Toggle ON/OFF
- Campos para personalizar mensaje y tiempo
- Avisos de seguridad
- Toast notifications

**¿Qué hace?**
Proporciona la interfaz visual que ve el super usuario en la sección de Configuración.

### PASO 3: Crear Componente de Verificación (3 minutos)

**Archivo:** `components/admin/maintenance-check.tsx`

**Contiene:**
- Componente wrapper
- Lógica de verificación de acceso
- Redireccionamiento automático

**¿Qué hace?**
Verifica si está en modo mantenimiento y redirige a los administradores regulares.

### PASO 4: Crear Página de Mantenimiento (5 minutos)

**Archivo:** `app/admin/maintenance/page.tsx`

**Contiene:**
- Diseño profesional
- Información del mantenimiento
- Opciones de acción
- Contador de tiempo actual

**¿Qué hace?**
Muestra a los administradores regulares cuando está en modo mantenimiento.

### PASO 5: Integrar en Settings (2 minutos)

**Archivo:** `components/admin/settings.tsx`

**Cambios:**
```typescript
// Agregar import
import AdminMaintenanceControl from "./admin-maintenance-control"

// Agregar en JSX (dentro de la sección de seguridad)
<AdminMaintenanceControl userId={user?.uid || ""} userRole={userRole} />
```

### PASO 6: Integrar en Dashboard (2 minutos)

**Archivo:** `app/admin/dashboard/page.tsx`

**Cambios:**
```typescript
// Agregar import
import MaintenanceCheck from "@/components/admin/maintenance-check"

// Envolver JSX principal
<MaintenanceCheck userRole={role}>
  {/* Todo el contenido del dashboard */}
</MaintenanceCheck>
```

### PASO 7: Configurar Firestore Rules (2 minutos)

En Firebase Console, actualiza las reglas de seguridad:

```javascript
match /admin_settings/{document=**} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
  
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
}
```

---

## ✅ Checklist de Implementación

### Crear Archivos
- [ ] `lib/admin-maintenance-status.ts` creado
- [ ] `components/admin/admin-maintenance-control.tsx` creado
- [ ] `components/admin/maintenance-check.tsx` creado
- [ ] `app/admin/maintenance/page.tsx` creado

### Modificar Archivos
- [ ] `components/admin/settings.tsx` - Import agregado
- [ ] `components/admin/settings.tsx` - Componente agregado en JSX
- [ ] `app/admin/dashboard/page.tsx` - Import agregado
- [ ] `app/admin/dashboard/page.tsx` - JSX envuelto con MaintenanceCheck

### Configuración Firebase
- [ ] Reglas Firestore actualizadas
- [ ] Colección `admin_settings` creada (se crea automáticamente)

### Testing
- [ ] [ ] Acceder como super usuario
  - [ ] Ver botón en Configuración → Seguridad
  - [ ] Activar mantenimiento
  - [ ] Confirmación exitosa
  - [ ] Desactivar mantenimiento
  
- [ ] [ ] Acceder como admin regular
  - [ ] Intenta acceder al dashboard
  - [ ] Es redirigido a página de mantenimiento
  - [ ] Puede reintentar o cerrar sesión
  - [ ] Cuando se desactiva, puede acceder

- [ ] [ ] Página pública
  - [ ] Sigue funcionando durante el mantenimiento
  - [ ] Clientes pueden ver productos
  - [ ] Clientes pueden comprar

---

## 🧪 Testing Manual

### Escenario 1: Super Usuario Activa Mantenimiento

```bash
1. Acceder con cuenta super usuario
2. Ir a Configuración (esquina inferior izquierda)
3. Buscar sección "Configuración de Seguridad"
4. Encontrar "Modo Mantenimiento del Panel Admin"
5. Personalizar mensaje (opcional)
6. Personalizar tiempo estimado (opcional)
7. Clic en "Activar Mantenimiento"
8. Ver confirmación con toast verde ✓
9. Permanecer en panel normalmente
10. Clic en "Desactivar Mantenimiento"
11. Ver confirmación de desactivación
```

**Resultado esperado:** ✅ Todos los pasos completados sin errores

### Escenario 2: Admin Regular Durante Mantenimiento

```bash
1. Super usuario activa mantenimiento (Paso 1-8 anterior)
2. Cerrar sesión del super usuario
3. Acceder con cuenta admin regular
4. Ir a /admin/dashboard
5. Ser redirigido automáticamente a /admin/maintenance
6. Ver página profesional con:
   - Mensaje "Panel Administrativo en Mantenimiento"
   - Tiempo estimado
   - Información sobre página pública
   - Botón de reintentar
   - Botón de cerrar sesión
7. Puede intentar acceder múltiples veces
8. No puede acceder al dashboard
```

**Resultado esperado:** ✅ Redirección correcta, no puede acceder

### Escenario 3: Página Pública No Afectada

```bash
1. Abrir en navegador: https://tu-dominio.com (página pública)
2. Super usuario activa mantenimiento en admin
3. Página pública sigue funcionando
4. Puede ver productos
5. Puede agregar al carrito
6. Puede hacer checkout
7. Mensajes se envían correctamente
```

**Resultado esperado:** ✅ Página pública no ve cambios

---

## 🐛 Resolución de Problemas

### Problema: "Cannot find module"

**Causa:** Ruta de import incorrecta

**Solución:**
```typescript
// Verificar que las rutas sean correctas:
import { getAdminMaintenanceStatus } from "@/lib/admin-maintenance-status"
import AdminMaintenanceControl from "@/components/admin/admin-maintenance-control"
import MaintenanceCheck from "@/components/admin/maintenance-check"
```

### Problema: "user is null" en AdminMaintenanceControl

**Causa:** Usuario no está autenticado cuando se carga el componente

**Solución:**
```typescript
// En settings.tsx, asegurar que user esté disponible
<AdminMaintenanceControl userId={user?.uid || ""} userRole={userRole} />
```

### Problema: Admin ve dashboard en lugar de mantenimiento

**Causa:** Cache del navegador o verificación no ejecutada

**Solución:**
1. Abrir en navegación privada/incógnita
2. Limpiar cookies y cache
3. Verificar que MaintenanceCheck esté envolviendo el JSX
4. Revisar console para errores

### Problema: "Permission denied" en Firestore

**Causa:** Reglas de seguridad no actualizadas

**Solución:**
1. Ir a Firebase Console
2. Firestore → Reglas
3. Actualizar con las reglas proporcionadas
4. Publicar cambios

### Problema: Botón no aparece en Settings

**Causa:** userRole no es "super"

**Solución:**
```typescript
// En browser console, verificar:
localStorage.getItem("adminRole")
// Debe retornar "super" o "superuser"
```

---

## 📊 Monitoreo Post-Implementación

Después de implementar, monitorear:

1. **Firestore Console**
   - Verificar colección `admin_settings`
   - Documento `maintenance` existe
   - Datos se escriben correctamente

2. **Error Console del Navegador**
   - Sin errores de módulos no encontrados
   - Sin errores de permisos
   - Sin advertencias de consola

3. **Funcionalidad**
   - Toggle funciona en ambas direcciones
   - Mensajes se personalizan
   - Redireccionamiento es automático
   - Página pública no se ve afectada

---

## 🚀 Deployment

### Antes de Deploy a Producción

1. [ ] Probar localmente (todos los escenarios)
2. [ ] Verificar Firestore rules en staging
3. [ ] Hacer respaldo de datos
4. [ ] Notificar a administradores del cambio
5. [ ] Verificar permisos de super usuario

### Pasos de Deploy

```bash
# 1. Commit de cambios
git add -A
git commit -m "feat: Agregar modo mantenimiento para panel admin"

# 2. Push a repositorio
git push origin feature/maintenance-mode

# 3. Merge a rama principal
git checkout main
git merge feature/maintenance-mode

# 4. Deploy a hosting
npm run build
# Seguir instrucciones de tu plataforma de hosting
```

---

## 📚 Documentación Adicional

- **Detalles Técnicos:** [ACTUALIZACION_MODO_MANTENIMIENTO_ADMIN.md](ACTUALIZACION_MODO_MANTENIMIENTO_ADMIN.md)
- **Resumen Visual:** [RESUMEN_MODO_MANTENIMIENTO_ADMIN.md](RESUMEN_MODO_MANTENIMIENTO_ADMIN.md)
- **Componentes Creados:**
  - [lib/admin-maintenance-status.ts](lib/admin-maintenance-status.ts)
  - [components/admin/admin-maintenance-control.tsx](components/admin/admin-maintenance-control.tsx)
  - [components/admin/maintenance-check.tsx](components/admin/maintenance-check.tsx)
  - [app/admin/maintenance/page.tsx](app/admin/maintenance/page.tsx)

---

## ❓ Preguntas Frecuentes

**P: ¿Esto afecta a clientes que están comprando?**  
R: No. La página pública continúa funcionando normalmente. Solo el panel administrativo se ve afectado.

**P: ¿Puedo personalizar el mensaje?**  
R: Sí. En el control de mantenimiento puedes cambiar el mensaje y el tiempo estimado.

**P: ¿Qué pasa si se cae el internet durante el mantenimiento?**  
R: El estado se guardan en Firestore, así que cuando vuelva la conexión, se reanuda el mantenimiento.

**P: ¿Puede otro super usuario desactivar el mantenimiento?**  
R: Sí, cualquier super usuario puede activar/desactivar. Se registra quién hace los cambios.

**P: ¿Se puede agendar mantenimiento automático?**  
R: En la versión actual no. Es una mejora futura que se puede agregar.

**P: ¿Los administradores reciben notificación?**  
R: En la versión actual no. En futuras versiones se agregará notificación por email.

---

## 🎯 Próximos Pasos

1. **Implementación Inmediata**
   - Crear los 4 archivos nuevos
   - Modificar los 2 archivos existentes
   - Actualizar Firestore rules

2. **Testing**
   - Probar todos los escenarios
   - Verificar no haya errores

3. **Deployment**
   - Deploy a staging
   - Deploy a producción

4. **Mejoras Futuras**
   - Programación automática de mantenimiento
   - Notificaciones a administradores
   - Historial de cambios
   - Bloqueo granular por sección

---

**Implementación lista para proceder.**

Versión: 1.0  
Fecha: 19 de Enero de 2026  
Tiempo total: ~20 minutos
