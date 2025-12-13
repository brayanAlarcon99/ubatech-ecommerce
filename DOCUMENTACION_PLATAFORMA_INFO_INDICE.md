# 📚 DOCUMENTACIÓN - Sistema de Información de Plataforma

## 🎯 Descripción General

Se ha implementado un sistema completo que permite:

1. **Año dinámico en el copyright** - Se actualiza automáticamente sin necesidad de cambios manuales
2. **Gestión centralizada** - Los súper usuarios pueden editar la información desde el panel admin
3. **Sincronización en tiempo real** - Los cambios se reflejan instantáneamente en toda la plataforma
4. **Visualización en paneles** - La información se muestra en los dashboards administrativos

---

## 📖 Guías de Uso

### Para Administradores

#### 1. **Inicializar el Sistema** ⚙️
   📄 Documento: `GUIA_INICIALIZAR_PLATAFORMA_INFO.md`
   
   **Contenido:**
   - 3 opciones para crear la colección en Firestore
   - Verificación paso a paso
   - Solución de problemas
   
   **Tiempo estimado:** 5 minutos

#### 2. **Usar la Plataforma** 👤
   📄 Documento: `PLATAFORMA_INFO_DOCUMENTACION.md`
   
   **Contenido:**
   - Cómo editar información como súper usuario
   - Estructura de la colección en Firestore
   - Cómo usar el hook en otros componentes
   - Reglas de seguridad recomendadas

#### 3. **Resumen de Cambios** ✨
   📄 Documento: `IMPLEMENTACION_PLATAFORMA_INFO.md`
   
   **Contenido:**
   - Lista detallada de todos los cambios
   - Archivos creados y modificados
   - Ejemplos de código
   - Próximos pasos opcionales

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────┐
│   Firebase Firestore                    │
│   Colección: platform_info              │
│   Documento: platform_info              │
└────────────┬────────────────────────────┘
             │
             │ (Lectura automática)
             ▼
    ┌────────────────────┐
    │ Hook: usePlatformInfo │
    │ (Actualización c/10s) │
    └────┬───────────┬────┘
         │           │
         ▼           ▼
    ┌─────────┐  ┌──────────────────┐
    │ Footer  │  │ PlatformInfoPanel │
    │ Dinámico│  │ (Dashboard Admin) │
    └─────────┘  └──────────────────┘
```

### Componentes Principales

```
components/
├── footer.tsx
│   └── Muestra el copyright con año dinámico
│
└── admin/
    ├── settings.tsx
    │   └── Panel de edición para súper usuarios
    │
    └── platform-info-panel.tsx
        └── Visualización de información
```

### Hooks

```
hooks/
└── use-platform-info.ts
    ├── Carga datos desde Firestore
    ├── Refresca cada 10 segundos
    └── Retorna: { platformInfo, loading, reload }
```

---

## 🔄 Datos de la Plataforma

### Estructura en Firestore

```
platform_info/
├── collection: platform_info
│   └── document: platform_info
│       ├── version: "1.0.0" (String)
│       ├── lastUpdate: "Diciembre 2025" (String)
│       ├── supportEmail: "support@ubatech.com" (String)
│       ├── description: "Plataforma de compras..." (String)
│       └── updatedAt: 2025-12-10T... (Timestamp)
```

### Campos Editables

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `version` | Versión actual de la plataforma | `1.0.0`, `2.1.0`, etc. |
| `lastUpdate` | Fecha/período de última actualización | `Diciembre 2025`, `30 Nov 2025` |
| `supportEmail` | Email de contacto para soporte | `support@ubatech.com` |
| `description` | Descripción de la plataforma | `Plataforma de compras online...` |

---

## 💻 Pantallas Principales

### 1. Panel de Edición (Súper Usuarios)

**Ubicación:** Panel Admin → Configuración

```
┌────────────────────────────────────────┐
│  Información de la Plataforma          │
├────────────────────────────────────────┤
│                                        │
│ Versión de la Plataforma               │
│ [_____________________]                │
│                                        │
│ Última Actualización                   │
│ [_____________________]                │
│                                        │
│ Email de Soporte                       │
│ [_____________________]                │
│                                        │
│ Descripción de la Plataforma           │
│ [_________________________]             │
│ [_________________________]             │
│ [_________________________]             │
│                                        │
│  [Guardar Información de Plataforma]   │
│                                        │
└────────────────────────────────────────┘
```

### 2. Visualización en Dashboard

**Ubicación:** Panel Admin → Dashboard

```
┌─────────────────────────────────────────┐
│  Información de la Plataforma           │
├─────────────────────────────────────────┤
│                                         │
│ Versión            │  Última Actualización
│ 1.0.0              │  Diciembre 2025
│                                         │
│ Email de Soporte                        │
│ support@ubatech.com (clickeable)        │
│                                         │
│ Descripción                             │
│ Plataforma de compras online especiali- │
│ zada en productos tecnológicos...       │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Footer Público

```
┌─────────────────────────────────────────┐
│ Contacto  │  Ubicación  │  Sobre Nosotros
│ ...       │  ...        │  ...
├─────────────────────────────────────────┤
│ © 2025 Ubatech+Pro. Todos los derechos │
│    reservados.                          │
│ (Se actualiza automáticamente en 2026)  │
└─────────────────────────────────────────┘
```

---

## 🔐 Control de Acceso

### Quién puede ver

✅ **Todos**: Información en el footer y paneles públicos
✅ **Todos los Admins**: Información en el dashboard administrativo

### Quién puede editar

🔒 **Solo Súper Usuarios**: Pueden editar desde Configuración

---

## 📊 Sincronización

- ⏱️ **Auto-refresh**: Cada 10 segundos
- 📱 **Visibilidad**: Se actualiza al regresa a la pestaña
- 🔄 **Manual**: Función `reload()` disponible en el hook

---

## 🚀 Inicio Rápido

1. **Inicializar Firestore** (Una sola vez)
   ```bash
   # Ver: GUIA_INICIALIZAR_PLATAFORMA_INFO.md
   ```

2. **Inicia sesión como Súper Usuario**
   ```
   Panel Admin → Login
   ```

3. **Edita la Información**
   ```
   Panel Admin → Configuración → Información de la Plataforma
   ```

4. **Guarda los cambios**
   ```
   [Guardar Información de Plataforma]
   ```

5. **Verifica en el Dashboard**
   ```
   Panel Admin → Dashboard (Analytics)
   ```

---

## 📝 Archivos de Referencia

### Creados Nuevos

- ✨ `hooks/use-platform-info.ts` - Hook personalizado
- ✨ `components/admin/platform-info-panel.tsx` - Componente de visualización
- ✨ `app/api/admin/init-platform-info/route.ts` - API de inicialización
- ✨ `lib/init-platform-info.ts` - Script de inicialización

### Modificados

- ✏️ `components/footer.tsx` - Año dinámico
- ✏️ `components/admin/settings.tsx` - Panel de edición
- ✏️ `components/admin/analytics.tsx` - Visualización en dashboard

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué el año no se actualiza automáticamente en Firestore?**
R: No es necesario. El footer usa `new Date().getFullYear()` que siempre devuelve el año actual del navegador.

**P: ¿Puedo agregar más campos?**
R: Sí, solo agrega los campos al formulario en `settings.tsx` y actualiza la interfaz en `use-platform-info.ts`.

**P: ¿Qué pasa si Firestore no está disponible?**
R: Se usan valores por defecto automáticamente. Ver `defaultPlatformInfo` en el hook.

**P: ¿Con qué frecuencia se sincroniza?**
R: Cada 10 segundos automáticamente, o cuando regresa el usuario a la pestaña.

---

## 🆘 Soporte

Para más información:
- 📧 support@ubatech.com
- 📱 +57 3134588654
- 🕐 Lunes-Domingo 9am-7:30pm

---

## ✅ Estado: PRODUCCIÓN LISTA

✅ Todos los módulos implementados
✅ Sincronización en tiempo real
✅ Control de acceso por roles
✅ Manejo de errores
✅ Documentación completa

**¡Sistema operativo y listo para usar!**
