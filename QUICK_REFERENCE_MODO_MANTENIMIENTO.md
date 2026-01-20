# QUICK REFERENCE: Modo Mantenimiento Admin

**Ubicación rápida de todo lo que necesitas**

---

## 📂 ARCHIVOS POR TIPO

### SERVICIOS (lib/)
```
lib/admin-maintenance-status.ts
├── getAdminMaintenanceStatus()     → Obtiene estado
├── setAdminMaintenanceStatus()     → Cambia estado
└── shouldRedirectToMaintenance()   → Chequea redireccionamiento
```

### COMPONENTES (components/admin/)
```
components/admin/
├── admin-maintenance-control.tsx   → Control visual (super usuario)
├── maintenance-check.tsx           → Verificador de acceso
└── settings.tsx (modificado)       → Integración
```

### PÁGINAS (app/admin/)
```
app/admin/
├── dashboard/page.tsx (modificado) → Integración
└── maintenance/page.tsx            → Página de espera
```

---

## 🔗 IMPORTS RÁPIDOS

### En settings.tsx
```typescript
import AdminMaintenanceControl from "./admin-maintenance-control"
```

### En dashboard/page.tsx
```typescript
import MaintenanceCheck from "@/components/admin/maintenance-check"
```

### En tu código
```typescript
import { 
  getAdminMaintenanceStatus,
  setAdminMaintenanceStatus 
} from "@/lib/admin-maintenance-status"
```

---

## 💾 FIRESTORE QUERIES

### Leer estado
```typescript
const status = await getAdminMaintenanceStatus()
console.log(status.isEnabled) // true | false
```

### Cambiar estado
```typescript
await setAdminMaintenanceStatus(true, userId, {
  message: "Mantenimiento en curso",
  estimatedTime: "30 minutos"
})
```

---

## 🔐 FIRESTORE RULES

```javascript
match /admin_settings/{document=**} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
  
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
}
```

---

## 🎯 PUNTOS CLAVE

| Aspecto | Detalles |
|--------|----------|
| **Control** | Solo `role == "super"` |
| **Almacenamiento** | Firestore `admin_settings/maintenance` |
| **Redireccionamiento** | Automático en `MaintenanceCheck` |
| **Página espera** | `/admin/maintenance` |
| **Afecto a clientes** | ❌ No |
| **Afecto a super usuario** | ❌ No |
| **Auditoría** | Sí (enabledBy, enabledAt) |

---

## 🧪 TESTING RÁPIDO

### Como Super Usuario
```
1. Configuración → Seguridad
2. Buscar "Modo Mantenimiento"
3. Click "Activar"
4. Ver confirmación ✓
5. Panel funciona normal
```

### Como Admin Regular
```
1. Ir a /admin/dashboard
2. Redirigido a /admin/maintenance ✓
3. Ver página bonita
4. Click "Reintentar" → Sigue bloqueado ✓
5. Super desactiva → Puede acceder ✓
```

---

## 🐛 ERRORES COMUNES

```typescript
// ❌ INCORRECTO - No es super usuario
if (userRole === "admin") {
  // Esto nunca mostrará el control
}

// ✅ CORRECTO - Verificar rol correcto
if (userRole === "super" || userRole === "superuser") {
  // Mostrar control
}

// ❌ INCORRECTO - Olvidar wrapper
<div className="dashboard">
  {/* Sin MaintenanceCheck wrapper */}
  <Dashboard />
</div>

// ✅ CORRECTO - Usar wrapper
<MaintenanceCheck userRole={role}>
  <div className="dashboard">
    <Dashboard />
  </div>
</MaintenanceCheck>
```

---

## 📋 CHECKLIST ULTRA-RÁPIDA

- [ ] Crear `lib/admin-maintenance-status.ts`
- [ ] Crear `components/admin/admin-maintenance-control.tsx`
- [ ] Crear `components/admin/maintenance-check.tsx`
- [ ] Crear `app/admin/maintenance/page.tsx`
- [ ] Importar en `settings.tsx`
- [ ] Integrar en `settings.tsx`
- [ ] Importar en `dashboard/page.tsx`
- [ ] Envolver en `dashboard/page.tsx`
- [ ] Actualizar Firestore rules
- [ ] Probar como super usuario
- [ ] Probar como admin regular
- [ ] Verificar página pública funciona

---

## 🚀 UNA LÍNEA POR CONCEPTO

| Concepto | En una línea |
|----------|--------------|
| Qué es | Botón para aislar admin panel sin afectar tienda |
| Quién lo usa | Solo super usuario |
| Dónde está | Settings → Seguridad |
| Cómo funciona | Cambia flag en Firestore + redireccionamiento |
| Afecta clientes | No |
| Necesita backend | No (todo Firebase) |
| Auditoría | Sí |

---

## 🔍 BÚSQUEDA RÁPIDA

**¿Dónde está...?**

| Busco | En archivo |
|-------|-----------|
| Control visual | `admin-maintenance-control.tsx` |
| Verificador acceso | `maintenance-check.tsx` |
| Página espera | `maintenance/page.tsx` |
| Lógica estado | `admin-maintenance-status.ts` |
| Integración Settings | `settings.tsx` |
| Integración Dashboard | `dashboard/page.tsx` |

---

## 💻 CÓDIGO TÍPICO

```typescript
// Obtener estado
const { isEnabled, message } = await getAdminMaintenanceStatus()

// Activar
await setAdminMaintenanceStatus(true, userId, {
  message: "Mantenimiento urgente",
  estimatedTime: "1 hora"
})

// Verificar antes de mostrar algo
if (isMaintenanceMode && !isSuperUser) {
  redirect("/admin/maintenance")
}

// Componente en JSX
<MaintenanceCheck userRole={role}>
  <Dashboard />
</MaintenanceCheck>
```

---

## 🎨 COLORES Y ESTILOS

```
Normal (Desactivado):
- Borde: Verde
- Fondo: Verde claro
- Botón: Naranja
- Icono: ✅

Activado (Mantenimiento):
- Borde: Naranja/Rojo
- Fondo: Naranja claro
- Botón: Rojo
- Icono: 🚧
```

---

## 📱 RESPONSIVE

- Desktop: 100% funcional
- Tablet: 100% funcional
- Mobile: 100% funcional (diseño adaptativo)

---

## ⚙️ CONFIGURACIÓN

```typescript
// Personalización disponible
{
  message: "Tu mensaje aquí",              // Customizable
  estimatedTime: "Tu tiempo aquí",         // Customizable
  isEnabled: boolean,                      // Toggle
  enabledBy: userId,                       // Automático
  enabledAt: timestamp,                    // Automático
  updatedAt: timestamp                     // Automático
}
```

---

## 🔄 FLUJO EN DOS SEGUNDOS

```
Usuario entra
  ↓
¿Autenticado? NO → Login
  ↓ SÍ
¿Mantenimiento? NO → Dashboard
  ↓ SÍ
¿Super? SÍ → Dashboard
  ↓ NO
Mantenimiento page
```

---

## 📞 SI ALGO FALLA

| Error | Solución |
|-------|----------|
| "Cannot find module" | Revisar import paths |
| "Permission denied" | Revisar Firestore rules |
| No aparece botón | Verificar localStorage role |
| No redirige | Verificar MaintenanceCheck envuelve JSX |
| Muestra dashboard | Limpiar cache/cookies |

---

## 📚 DOCUMENTACIÓN RELACIONADA

```
INICIO_RAPIDO_MODO_MANTENIMIENTO.md      ← 2 min read
GUIA_IMPLEMENTACION_MODO_MANTENIMIENTO.md ← 10-20 min
ACTUALIZACION_MODO_MANTENIMIENTO_ADMIN.md ← 20 min
RESUMEN_MODO_MANTENIMIENTO_ADMIN.md       ← 15 min
VISUAL_MODO_MANTENIMIENTO_ADMIN.md        ← 10 min
INDICE_MODO_MANTENIMIENTO_ADMIN.md        ← Índice
QUICK_REFERENCE_MODO_MANTENIMIENTO.md     ← ESTE
```

---

## 🎓 APRENDE MIENTRAS IMPLEMENTAS

```
Si quieres aprender...          Mira...
├── Firebase Firestore          → lib/admin-maintenance-status.ts
├── Next.js Pages               → app/admin/maintenance/page.tsx
├── React Hooks                 → admin-maintenance-control.tsx
├── Component Wrappers          → maintenance-check.tsx
├── TypeScript Interfaces       → Todos los archivos .ts
└── UI/UX con Tailwind          → admin-maintenance-control.tsx
```

---

## ✅ VALIDACIÓN RÁPIDA

```bash
# ¿Está implementado?
[ ] Archivos creados
[ ] Archivos modificados
[ ] Firestore rules actualizadas
[ ] Importaciones correctas
[ ] Sin errores en console
[ ] Super usuario ve botón
[ ] Admin regular redirigido
[ ] Página pública funciona
```

---

**Print this page. You'll need it. 📄**

Última actualización: 19 de Enero de 2026
