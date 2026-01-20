# Visual: Modo Mantenimiento - Interfaz y Flujos

**Versión:** 1.0  
**Fecha:** 19 de Enero de 2026

---

## 🎨 Interfaz del Super Usuario

### Ubicación: Configuración → Configuración de Seguridad

```
╔════════════════════════════════════════════════════════════════╗
║                      CONFIGURACIÓN                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Configuración de Seguridad                                   ║
║  Administra la configuración de seguridad y sesiones          ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ⏰ Tiempo de Inactividad de Sesión                        │ ║
║  │                                                            │ ║
║  │ Configura el tiempo máximo de inactividad antes de cerrar │ ║
║  │ sesión automáticamente.                                   │ ║
║  │                                                            │ ║
║  │ Tiempo de inactividad (minutos):                         │ ║
║  │ [  5  ] minutos                                          │ ║
║  │                                                            │ ║
║  │ [Guardar Configuración de Inactividad]                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ───────────────────────────────────────────────────────────── ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ✅ Modo Mantenimiento del Panel Admin                    │ ║
║  │                                                            │ ║
║  │ El panel administrativo funciona normalmente. Todos los   │ ║
║  │ administradores autorizados pueden acceder.               │ ║
║  │                                                            │ ║
║  │ ⚠️ El modo mantenimiento permite aislar al panel          │ ║
║  │    administrativo sin afectar a los clientes.             │ ║
║  │    Ideal para actualizaciones, investigaciones de         │ ║
║  │    seguridad o resolución de problemas.                   │ ║
║  │                                                            │ ║
║  │ [🚧 Activar Mantenimiento]                              │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 🌐 Control de Página Pública                             │ ║
║  │ [Componente existente...]                                │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🎨 Interfaz Activada (Con Mantenimiento)

```
╔════════════════════════════════════════════════════════════════╗
║                      CONFIGURACIÓN                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 🚧 Modo Mantenimiento del Panel Admin                    │ ║
║  │                                                            │ ║
║  │ El panel administrativo está en modo mantenimiento.       │ ║
║  │ Solo tú podrás acceder a él. Los administradores        │ ║
║  │ regulares verán una página de mantenimiento.              │ ║
║  │                                                            │ ║
║  │ Mensaje para administradores:                            │ ║
║  │ [Panel administrativo en mantenimiento]                  │ ║
║  │  Este mensaje se mostrará a los administradores          │ ║
║  │                                                            │ ║
║  │ Tiempo estimado:                                          │ ║
║  │ [15 minutos]                                             │ ║
║  │  Tiempo estimado de duración del mantenimiento            │ ║
║  │                                                            │ ║
║  │ ⚠️ Estado Actual:                                        │ ║
║  │ • ✅ Tú tienes acceso completo al panel                 │ ║
║  │ • 🚫 Los administradores regulares verán página...      │ ║
║  │ • 🌐 La página pública NO es afectada                   │ ║
║  │ • 📧 Pueden contactarte para reportar problemas          │ ║
║  │                                                            │ ║
║  │ [🚫 Desactivar Mantenimiento]                           │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📱 Página de Mantenimiento (Admin Regular)

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                                                                ║
║                    🚧 MANTENIMIENTO 🚧                        ║
║                                                                ║
║              Panel Administrativo en Mantenimiento             ║
║                                                                ║
║    El panel administrativo se encuentra temporalmente         ║
║    fuera de servicio debido a trabajos de mantenimiento       ║
║    y mejoras.                                                  ║
║                                                                ║
║    Hora actual: 10:30:45                                      ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │              ⏱️ Tiempo Estimado                         │  ║
║  │                  15 minutos                             │  ║
║  │            Volveremos pronto con mejoras               │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ 📋 Información Importante:                             │  ║
║  │                                                         │  ║
║  │ → La página pública NO es afectada por el              │  ║
║  │   mantenimiento                                         │  ║
║  │                                                         │  ║
║  │ → Los clientes pueden continuar comprando              │  ║
║  │   normalmente                                           │  ║
║  │                                                         │  ║
║  │ → Intenta acceder más tarde o contacta al              │  ║
║  │   super usuario                                         │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │            💬 Necesitas Ayuda?                         │  ║
║  │                                                         │  ║
║  │  Contacta con el super usuario o el equipo de soporte: │  ║
║  │                                                         │  ║
║  │      [ 📧 support@ubatech.com ]                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║       ─────────────────────────────────────────────────       ║
║                                                                ║
║      [ 🔄 Reintentar ]      [ 🚪 Cerrar Sesión ]           ║
║                                                                ║
║            UbaTech © 2026 - Plataforma de E-commerce         ║
║                    Gracias por tu paciencia                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Flujo de Navegación

### Flujo 1: Super Usuario - Acceso Normal

```
┌─────────────────┐
│ Acceder Admin   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ ¿Está autenticado?          │
│ NO → Ir a Login             │
│ SÍ → Continuar              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ¿Es Super Usuario?          │
│ NO → Chequear Mantenimiento │
│ SÍ → Acceso Completo        │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────┐
│ Dashboard Normal │
└──────────────────┘
```

### Flujo 2: Admin Regular - Con Mantenimiento

```
┌─────────────────────────────┐
│ Acceder a /admin/dashboard  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ¿Está autenticado?          │
│ NO → Ir a Login             │
│ SÍ → Continuar              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ¿Está en Mantenimiento?     │
│ NO → Dashboard Normal       │
│ SÍ → Continuar              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ¿Es Super Usuario?          │
│ SÍ → Dashboard Normal       │
│ NO → Continuar              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Redirigir a /admin/maintenance
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Página de Mantenimiento      │
│ • Mostrar información         │
│ • Permitir reintentar        │
│ • Permitir cerrar sesión     │
└──────────────────────────────┘
```

---

## 🎬 Ejemplo de Uso Paso a Paso

### Paso 1: Super Usuario Navega a Configuración

```
Dashboard Admin
├── Sidebar Izquierdo
│   ├── Dashboard
│   ├── Productos
│   ├── Categorías
│   ├── Órdenes
│   ├── Tiendas
│   ├── Usuarios
│   └── ⚙️ Configuración ← CLICK AQUÍ
│
└── Dashboard Principal
    [Contenido...]
```

### Paso 2: Abre Configuración de Seguridad

```
Configuración
├── Sección: "Configuración de Seguridad"
│   ├── Tiempo de Inactividad
│   │   ├── Input: [5] minutos
│   │   └── Botón: [Guardar]
│   │
│   └── Modo Mantenimiento del Panel Admin ← AQUÍ ESTÁ
│       ├── Estado: ✅ Normal
│       ├── Info: "El panel funciona normalmente..."
│       ├── Botón: [🚧 Activar Mantenimiento]
│
└── Sección: "Control de Página Pública"
    [PublicSiteControl...]
```

### Paso 3: Hace Clic en Activar Mantenimiento

```
Modo Mantenimiento del Panel Admin
┌──────────────────────────────────────┐
│ ✅ El panel funciona normalmente      │
│                                      │
│ ⓘ El modo mantenimiento permite...    │
│                                      │
│ [🚧 Activar Mantenimiento]         │
│      ↓ CLICK
└──────────────────────────────────────┘

↓ Sistema procesa la activación

Notificación Toast:
┌──────────────────────────────────────┐
│ ✓ Éxito                              │
│ 🚧 Panel administrativo en modo      │
│    mantenimiento                     │
│ [X] Cerrar                           │
└──────────────────────────────────────┘

↓ Interfaz se actualiza

Modo Mantenimiento del Panel Admin
┌──────────────────────────────────────┐
│ 🚧 El panel está en modo              │
│    mantenimiento...                  │
│                                      │
│ Mensaje para administradores:        │
│ [Panel administrativo en             │
│  mantenimiento]                      │
│                                      │
│ Tiempo estimado:                     │
│ [15 minutos]                         │
│                                      │
│ ⚠️ Estado Actual:                    │
│ • ✅ Tú tienes acceso completo...   │
│ • 🚫 Los administradores regulares.. │
│ • 🌐 La página pública NO...        │
│                                      │
│ [🚫 Desactivar Mantenimiento]      │
└──────────────────────────────────────┘
```

### Paso 4: Admin Regular Intenta Acceder

```
Admin Regular abre navegador:
URL: https://mi-tienda.com/admin/dashboard

Sistema detecta:
✓ Usuario autenticado
✓ Modo mantenimiento ACTIVO
✓ User role = "admin" (NO es super)

Redirección automática:
https://mi-tienda.com/admin/maintenance

Página mostrada:
┌──────────────────────────────────────┐
│        🚧 MANTENIMIENTO 🚧          │
│                                      │
│ Panel Administrativo                 │
│ en Mantenimiento                     │
│                                      │
│ ⏱️ Tiempo Estimado: 15 minutos      │
│                                      │
│ 📋 Información Importante:           │
│ → La página pública funciona         │
│ → Los clientes pueden comprar        │
│ → Intenta más tarde                 │
│                                      │
│ 💬 Contacta: support@ubatech.com     │
│                                      │
│ [🔄 Reintentar] [🚪 Cerrar Sesión] │
│                                      │
│ UbaTech © 2026                       │
│ Gracias por tu paciencia             │
└──────────────────────────────────────┘
```

### Paso 5: Super Usuario Termina y Desactiva

```
Super usuario va a Configuración → Seguridad

Ve el control actualizado:
Modo Mantenimiento del Panel Admin
┌──────────────────────────────────────┐
│ 🚧 El panel está en modo mantenimiento
│                                      │
│ Mensaje: [Panel administrativo...]  │
│ Tiempo: [15 minutos]                 │
│                                      │
│ [🚫 Desactivar Mantenimiento]      │
│      ↓ CLICK
└──────────────────────────────────────┘

↓ Sistema procesa la desactivación

Toast:
┌──────────────────────────────────────┐
│ ✓ Éxito                              │
│ ✅ Panel administrativo normalizado  │
└──────────────────────────────────────┘

Interfaz vuelve a:
┌──────────────────────────────────────┐
│ ✅ Modo Mantenimiento del Panel Admin│
│                                      │
│ El panel funciona normalmente.       │
│                                      │
│ ⓘ El modo mantenimiento permite...   │
│                                      │
│ [🚧 Activar Mantenimiento]         │
└──────────────────────────────────────┘
```

### Paso 6: Admin Regular Ahora Puede Acceder

```
Admin Regular abre navegador:
URL: https://mi-tienda.com/admin/dashboard

Sistema detecta:
✓ Usuario autenticado
✓ Modo mantenimiento DESACTIVO
✓ User role = "admin"

Acceso otorgado:
Dashboard carga normalmente ✓
```

---

## 🎨 Componentes Visuales Principales

### Toggle de Control

```
Estado: DESACTIVADO ✅
╔─────────────────╗
│ Activar ▪═══○   │  ← círculo puede moverse
└─────────────────┘

Estado: ACTIVADO 🚧
╔─────────────────╗
│ ○═══▪ Desactivar│  ← círculo se movió
└─────────────────┘

Colores:
- OFF: Gris/Rojo
- ON: Verde/Naranja
```

### Notificaciones (Toast)

```
Éxito (verde):
┌─────────────────────┐
│ ✓ Éxito             │
│ 🚧 Panel en modo... │
└─────────────────────┘

Error (rojo):
┌─────────────────────┐
│ ✗ Error             │
│ No se pudo          │
│ actualizar...       │
└─────────────────────┘
```

---

## 📊 Componentes por Rol

### Super Usuario ve:

```
✅ Control de Inactividad
   [Input] [Botón Guardar]

✅ Control de Mantenimiento (NUEVO)
   [Toggle] [Inputs] [Botón]

✅ Control de Página Pública (Existente)
   [Toggle] [Info]

✅ Información de Plataforma
   [Inputs editable] [Botón Guardar]
```

### Admin Regular ve:

```
❌ Control de Inactividad
   (No visible)

❌ Control de Mantenimiento (NUEVO)
   (No visible)

❌ Control de Página Pública
   (No visible)

✅ Información de Plataforma
   [Inputs solo lectura] (No puede guardar)
```

---

## 🎯 Estados Posibles

```
┌─────────────────────────────────────┐
│ 1. Mantenimiento DESACTIVADO        │
│                                     │
│ Panel Admin: Acceso normal          │
│ Admin Regular: Acceso normal        │
│ Página Pública: Funciona            │
│ Control visible: SÍ                 │
│ Botón muestra: "Activar"            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 2. Mantenimiento ACTIVADO           │
│                                     │
│ Panel Admin: Solo super usuario     │
│ Admin Regular: Bloqueado → /maint.. │
│ Página Pública: Funciona            │
│ Control visible: SÍ                 │
│ Botón muestra: "Desactivar"         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 3. Loading (Guardando cambios)      │
│                                     │
│ Control: Deshabilitado              │
│ Spinner: Girando                    │
│ Botón: "Activando..." / "Desact.."  │
│ Toast: No mostrado aún              │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Versión Desktop

```
┌─────────────────────────────────────────────────────┐
│ 🚧 Modo Mantenimiento del Panel Admin              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Descripción: El panel está en modo mantenimiento   │
│                                                     │
│ Mensaje: [                                    ]    │
│ Tiempo:  [                                    ]    │
│                                                     │
│ ⚠️ Avisos...                                       │
│                                                     │
│ [       Desactivar Mantenimiento        ]         │
└─────────────────────────────────────────────────────┘
```

### Versión Mobile

```
┌──────────────┐
│ 🚧 Modo Mant.│
├──────────────┤
│              │
│ El panel     │
│ está en...   │
│              │
│ Mensaje:     │
│ [        ]   │
│              │
│ Tiempo:      │
│ [        ]   │
│              │
│ [Desactiv.]  │
└──────────────┘
```

---

**Diseño completado y listo para implementación.**

Versión: 1.0  
Fecha: 19 de Enero de 2026
