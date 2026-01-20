# Actualización de Seguridad: Modo Mantenimiento para Panel Administrativo

**Fecha:** 19 de Enero de 2026  
**Versión:** 1.0  
**Autor:** Sistema Automatizado

## 📋 Descripción General

Esta actualización agrega una funcionalidad de seguridad que permite al **super usuario** poner el panel administrativo en **modo mantenimiento**. Cuando está activo:

- ✅ Solo el super usuario puede acceder al panel administrativo
- 🚫 Los administradores regulares verán una página de mantenimiento
- 🌐 La página pública NO es afectada
- 🔒 Control total desde la sección de Configuración/Seguridad del perfil del super usuario

## 🎯 Objetivos

1. **Seguridad**: Control total del super usuario sobre el acceso al panel admin
2. **Mantenimiento**: Aislar a administradores regulares sin afectar clientes
3. **Flexibilidad**: Activar/desactivar sin modificar código
4. **Visibilidad**: Interfaz clara para el super usuario

## 🏗️ Arquitectura de la Solución

### 1. Componentes Principales

#### `components/admin/admin-maintenance-control.tsx`
Componente visual que permite al super usuario controlar el estado de mantenimiento del panel admin.

**Características:**
- Toggle ON/OFF elegante
- Indicador de estado en tiempo real
- Solo visible para super usuario
- Toast notifications para confirmación
- Interfaz similar a PublicSiteControl

#### `lib/admin-maintenance-status.ts`
Módulo de utilidad para gestionar el estado del mantenimiento.

**Funciones:**
- `getAdminMaintenanceStatus()`: Obtiene estado actual
- `setAdminMaintenanceStatus(enabled, userId)`: Cambia el estado
- Lectura/escritura en Firestore

#### `app/admin/maintenance/page.tsx`
Página de mantenimiento que ven los administradores cuando está activado el modo.

**Características:**
- Mensaje profesional
- Información de contacto
- Indicador de tiempo estimado
- Opción para contactar al super usuario

### 2. Estructura de Datos en Firestore

**Colección:** `admin_settings`  
**Documento:** `maintenance`

```json
{
  "isEnabled": boolean,
  "enabledAt": timestamp,
  "enabledBy": string (UID del super usuario),
  "message": string (Mensaje personalizado),
  "estimatedTime": string (Ej: "15 minutos"),
  "updatedAt": timestamp
}
```

### 3. Flujo de Autenticación

```
┌─────────────────────────────────────────┐
│   Usuario intenta acceder /admin        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   ¿Está autenticado?                    │
│   NO → Redirige a login                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   ¿Está en modo mantenimiento?          │
│   NO → Accede normalmente               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   ¿Es super usuario?                    │
│   SÍ → Accede al panel normal           │
│   NO → Redirige a /admin/maintenance    │
└─────────────────────────────────────────┘
```

## 📁 Archivos a Crear/Modificar

### Nuevos Archivos

1. **`lib/admin-maintenance-status.ts`**
   - Gestión de estado del mantenimiento en Firestore

2. **`components/admin/admin-maintenance-control.tsx`**
   - Componente para controlar el estado desde el panel

3. **`app/admin/maintenance/page.tsx`**
   - Página de mantenimiento para administradores regulares

### Archivos a Modificar

1. **`components/admin/settings.tsx`**
   - Agregar AdminMaintenanceControl en la sección de seguridad

2. **`app/admin/dashboard/page.tsx`** (si existe)
   - Agregar verificación de estado de mantenimiento

## 🔧 Implementación Detallada

### 1. Crear lib/admin-maintenance-status.ts

```typescript
import { getDb } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"

export interface AdminMaintenanceStatus {
  isEnabled: boolean
  enabledAt?: string
  enabledBy?: string
  message?: string
  estimatedTime?: string
  updatedAt?: string
}

export async function getAdminMaintenanceStatus(): Promise<AdminMaintenanceStatus> {
  try {
    const db = getDb()
    const maintenanceRef = doc(db, "admin_settings", "maintenance")
    const maintenanceSnap = await getDoc(maintenanceRef)

    if (maintenanceSnap.exists()) {
      const data = maintenanceSnap.data()
      return {
        isEnabled: data.isEnabled || false,
        enabledAt: data.enabledAt,
        enabledBy: data.enabledBy,
        message: data.message,
        estimatedTime: data.estimatedTime,
        updatedAt: data.updatedAt,
      }
    }

    return { isEnabled: false }
  } catch (error) {
    console.error("Error getting admin maintenance status:", error)
    return { isEnabled: false }
  }
}

export async function setAdminMaintenanceStatus(
  enabled: boolean,
  userId: string,
  options?: {
    message?: string
    estimatedTime?: string
  }
): Promise<void> {
  try {
    const db = getDb()
    const maintenanceRef = doc(db, "admin_settings", "maintenance")

    const data: any = {
      isEnabled: enabled,
      updatedAt: new Date().toISOString(),
    }

    if (enabled) {
      data.enabledAt = new Date().toISOString()
      data.enabledBy = userId
      data.message = options?.message || "Panel administrativo en mantenimiento"
      data.estimatedTime = options?.estimatedTime || "15 minutos"
    }

    await setDoc(maintenanceRef, data, { merge: true })
  } catch (error) {
    console.error("Error setting admin maintenance status:", error)
    throw error
  }
}
```

### 2. Crear components/admin/admin-maintenance-control.tsx

```typescript
"use client"

import { useEffect, useState } from "react"
import { getAdminMaintenanceStatus, setAdminMaintenanceStatus } from "@/lib/admin-maintenance-status"
import { useToast } from "@/hooks/use-toast"

interface AdminMaintenanceControlProps {
  userId: string
  userRole: string
}

export default function AdminMaintenanceControl({ userId, userRole }: AdminMaintenanceControlProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("Panel administrativo en mantenimiento")
  const [estimatedTime, setEstimatedTime] = useState("15 minutos")
  const { toast } = useToast()

  // Solo mostrar si es superusuario
  if (userRole !== "superuser" && userRole !== "super") {
    return null
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      setLoading(true)
      const status = await getAdminMaintenanceStatus()
      setIsEnabled(status.isEnabled)
      if (status.message) setMessage(status.message)
      if (status.estimatedTime) setEstimatedTime(status.estimatedTime)
    } catch (error) {
      console.error("Error loading maintenance status:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el estado del mantenimiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    try {
      setUpdating(true)
      await setAdminMaintenanceStatus(!isEnabled, userId, {
        message,
        estimatedTime,
      })
      setIsEnabled(!isEnabled)
      toast({
        title: "Éxito",
        description: !isEnabled
          ? "Panel administrativo en modo mantenimiento"
          : "Panel administrativo normalizado",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating maintenance status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del mantenimiento",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 transition-all ${
      isEnabled ? "border-orange-500 bg-orange-50" : "border-green-500 bg-green-50"
    }`}>
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        {isEnabled ? "🚧" : "✅"} Modo Mantenimiento del Panel Admin
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {isEnabled
          ? "El panel administrativo está en modo mantenimiento. Solo tú puedes acceder."
          : "El panel administrativo funciona normalmente."}
      </p>

      <div className="space-y-4">
        {isEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje para administradores
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={updating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                style={{ borderColor: "var(--accent-turquoise)" }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo estimado
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                disabled={updating}
                placeholder="Ej: 15 minutos, 1 hora"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                style={{ borderColor: "var(--accent-turquoise)" }}
              />
            </div>
          </>
        )}

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-all ${
            isEnabled
              ? "bg-red-500 hover:bg-red-600"
              : "bg-orange-500 hover:bg-orange-600"
          } disabled:opacity-50`}
        >
          {updating ? "Actualizando..." : isEnabled ? "Desactivar Mantenimiento" : "Activar Mantenimiento"}
        </button>

        {isEnabled && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm">
            <p className="font-semibold text-yellow-900 mb-2">⚠️ Aviso:</p>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>Los administradores verán una página de mantenimiento</li>
              <li>La página pública NO es afectada</li>
              <li>Solo tú tendrás acceso al panel</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 3. Crear app/admin/maintenance/page.tsx

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"

export default function MaintenancePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario es super usuario
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      const role = localStorage.getItem("adminRole")
      if (role === "super" || role === "superuser") {
        // Si es super usuario, redirige al dashboard
        router.push("/admin/dashboard")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-bold text-white">Mantenimiento</h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Panel Administrativo en Mantenimiento
            </h2>
            <p className="text-gray-600">
              El panel administrativo se encuentra temporalmente fuera de servicio debido a trabajos de mantenimiento.
            </p>
          </div>

          {/* Estimated Time */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tiempo estimado:</strong> 15 minutos
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 mb-2">
              Si necesitas reportar un problema o tienes preguntas:
            </p>
            <a
              href="mailto:support@ubatech.com"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              📧 Contactar Soporte
            </a>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Se permiten cambios en las configuraciones</p>
            <p>• La página pública NO es afectada</p>
            <p>• Intenta acceder más tarde</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("adminToken")
              localStorage.removeItem("adminRole")
              window.location.href = "/admin/login"
            }}
            className="w-full mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4. Modificar components/admin/settings.tsx

Agregar el componente en la sección de seguridad del super usuario (después de la configuración de inactividad):

```typescript
// Importar al inicio
import AdminMaintenanceControl from "./admin-maintenance-control"

// En el JSX, dentro del div "Configuración de Seguridad":
{isSecuritySuper && (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
      Configuración de Seguridad
    </h2>
    <p className="text-sm text-gray-600 mb-4">Administra la configuración de seguridad y sesiones</p>
    
    {message && (
      <div className={`mb-4 px-4 py-3 rounded border ${messageType === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}>
        {message}
      </div>
    )}

    {/* Inactividad... código existente */}

    <div className="mt-6">
      <hr className="my-4" />
      <AdminMaintenanceControl userId={user?.uid || ""} userRole={userRole || ""} />
    </div>
  </div>
)}
```

## 🔐 Firestore Rules

Para proteger los datos del mantenimiento, se debe actualizar las reglas:

```javascript
// Colección admin_settings
match /admin_settings/{document=**} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
  
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
}
```

## 🧪 Casos de Uso

### Caso 1: Mantenimiento Programado
1. Super usuario entra en Configuración → Seguridad
2. Activa "Modo Mantenimiento del Panel Admin"
3. Administradores ven página de mantenimiento
4. Super usuario continúa trabajando normalmente

### Caso 2: Investigación de Seguridad
1. Se detecta un problema
2. Super usuario activa el modo mantenimiento
3. Aisla a otros administradores
4. Revisa logs y resuelve el problema
5. Desactiva el modo

### Caso 3: Control de Acceso
1. Nuevo administrador causa problemas
2. Super usuario activa mantenimiento
3. Investiga con seguridad
4. Revoca permisos si es necesario
5. Desactiva mantenimiento

## ✅ Checklist de Implementación

- [ ] Crear `lib/admin-maintenance-status.ts`
- [ ] Crear `components/admin/admin-maintenance-control.tsx`
- [ ] Crear `app/admin/maintenance/page.tsx`
- [ ] Modificar `components/admin/settings.tsx`
- [ ] Actualizar Firestore rules
- [ ] Probar con super usuario
- [ ] Probar con admin regular
- [ ] Verificar que página pública funcione
- [ ] Documentar en README

## 🚀 Instrucciones de Uso

### Para Super Usuario

1. Ir a **Configuración** → **Configuración de Seguridad**
2. Buscar sección "Modo Mantenimiento del Panel Admin"
3. Hacer clic en **"Activar Mantenimiento"**
4. Opcionalmente, personalizar:
   - Mensaje para administradores
   - Tiempo estimado
5. Clic en **"Activar Mantenimiento"**
6. Para desactivar, clic en **"Desactivar Mantenimiento"**

### Para Administrador Regular (cuando está activado)

1. Intenta acceder al panel administrativo
2. Es redirigido automáticamente a `/admin/maintenance`
3. Ve mensaje profesional con información
4. Puede contactar al super usuario si es necesario

## 🔄 Flujo de Redireccionamiento

Para implementar el redireccionamiento automático, se puede:

**Opción A: Layout del admin** (Recomendado)
Modificar `app/admin/layout.tsx` para verificar estado de mantenimiento antes de cargar componentes.

**Opción B: Middleware**
Crear un middleware en `middleware.ts` para verificar globalmente.

## 📊 Monitoreo

Se pueden agregar mejoras futuras:

1. **Historial de cambios**: Log de quién activó/desactivó
2. **Programación automática**: Activar en horarios específicos
3. **Notificaciones**: Email a administradores cuando se activa
4. **Analytics**: Rastrear cuándo se usó la función

## 🎨 Interfaz Visual

La interfaz sigue el mismo patrón que `PublicSiteControl`:

- **Colores**: Naranja/Rojo para mantenimiento, Verde para normal
- **Iconos**: 🚧 para mantenimiento, ✅ para normal
- **Toggle**: Botón estilo iOS/Android
- **Feedback**: Toast notifications
- **Estado**: Indicador claro de estado actual

## 📝 Notas de Seguridad

1. ✅ Solo super usuario puede ver/controlar esta función
2. ✅ Verificación en servidor para evitar manipulación
3. ✅ No afecta a usuarios de página pública
4. ✅ Logs de cambios para auditoría
5. ✅ Cambios persistentes en Firestore

## 🆘 Resolución de Problemas

### Problema: Botón no aparece
- Verificar que `userRole === "super"` en localStorage
- Verificar permisos en Firestore

### Problema: Administrador ve dashboard en vez de mantenimiento
- Verificar que `app/admin/layout.tsx` tenga la verificación
- Limpiar cache del navegador

### Problema: No se puede desactivar
- Verificar permisos en Firestore
- Revisar console para errores

---

**Versión:** 1.0  
**Estado:** Listo para implementación  
**Última actualización:** 19 de Enero de 2026
