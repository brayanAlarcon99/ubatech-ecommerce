# 🚀 GUÍA RÁPIDA: Control de Sesiones por Dispositivo

## En 3 minutos

El sistema está **completamente implementado** y funcionando. Los administradores:

✅ **No pueden iniciar sesión en dos dispositivos simultáneamente**  
✅ **Al login en nuevo dispositivo, cierra automáticamente la sesión anterior**  
✅ **Pueden cerrar sesiones remotas manualmente desde el dashboard**  

---

## ¿Qué cambió?

### Para el Usuario (Admin)

1. **Al iniciar sesión**: Se cierra automáticamente cualquier otra sesión activa
2. **En el dashboard**: Aparece un panel mostrando "Otras sesiones activas" (si las hay)
3. **Panel de control**: Opción para cerrar sesiones remotas con un botón "Cerrar"
4. **Validación automática**: Cada 60 segundos verifica si su sesión sigue activa

### Para el Desarrollador

4 archivos nuevos + 2 modificados:

```
Nuevos:
├─ lib/admin-session-manager.ts          (Gestión de sesiones)
├─ app/api/admin/sessions/route.ts       (API REST)
├─ components/admin/active-sessions-manager.tsx  (Panel UI)
└─ hooks/use-session-conflict-detector.ts        (Validación automática)

Modificados:
├─ app/admin/login/page.tsx              (+import +1 función)
└─ app/admin/dashboard/page.tsx          (+imports +estado +hook +componente)
```

---

## Funcionales Principales

### 1️⃣ Inicio de Sesión Automático
```
Admin → Login → registerAdminSession() → Cierra otras sesiones → Dashboard
```

### 2️⃣ Validación Periódica
```
Dashboard cargado → useSessionConflictDetector() → Valida cada 60s → Si inválida → Logout
```

### 3️⃣ Cerrar Sesión Remota
```
Panel UI → Botón "Cerrar" → API POST → Firestore actualiza → Otro dispositivo detecta → Logout
```

---

## Flujos de Datos en Firestore

### Nueva Colección: `adminSessions`

**Documento ID**: `{userId}_{deviceId}`

```json
{
  "userId": "user123",
  "deviceId": "device_abc123def",
  "deviceName": "Navegador - 2/3/2026",
  "isActive": true,
  "lastActivity": "2026-02-03T14:35:00Z",
  "createdAt": "2026-02-03T14:30:00Z"
}
```

---

## Escenarios de Prueba

### Escenario 1: Dos navegadores diferentes
```
Navegador A (Laptop) → Login exitoso ✓
Navegador B (Mobile) → Login exitoso ✓
Navegador A → Después 60s → Logout automático ✓
```

### Escenario 2: Cerrar remoto
```
Navegador A → Ve panel "Otras sesiones activas" ✓
Navegador A → Click "Cerrar" en Navegador B ✓
Navegador B → Dentro 60s → Logout automático ✓
```

---

## Endpoints API

### GET `/api/admin/sessions`
Obtener todas las sesiones activas
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://your-site.com/api/admin/sessions
```

### POST `/api/admin/sessions`
Validar o cerrar sesión remota
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","deviceId":"device_123"}' \
  https://your-site.com/api/admin/sessions
```

### DELETE `/api/admin/sessions`
Cerrar sesión actual
```bash
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Device-ID: device_123" \
  https://your-site.com/api/admin/sessions
```

---

## Configuración

### Cambiar intervalo de validación
📄 `hooks/use-session-conflict-detector.ts` línea ~40
```typescript
// Cambiar a 30 segundos
checkIntervalRef.current = setInterval(validateSession, 30000)
```

### Cambiar refresco de sesiones UI
📄 `components/admin/active-sessions-manager.tsx` línea ~50
```typescript
// Cambiar a 15 segundos
const interval = setInterval(loadSessions, 15000)
```

---

## Debugging

### Ver sessionId en localStorage
```javascript
localStorage.getItem('admin_device_id')
```

### Ver en Firestore
1. Ir a `Firestore Database`
2. Seleccionar colección `adminSessions`
3. Buscar por `userId`
4. Ver campo `isActive`

### Ver en Network (DevTools)
1. Abrir DevTools → Network tab
2. Filtrar por `/api/admin/sessions`
3. Ver POST/GET requests
4. Revisar payloads y respuestas

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Panel no aparece | Verificar que hay otra sesión activa |
| "No se pueden cargar sesiones" | Revisar token y permisos Firestore |
| Logout inesperado | Revisar validación cada 60s |
| DeviceId cambia | No limpiar localStorage |

---

## Seguridad

- ✅ Token JWT requerido en todas las APIs
- ✅ DeviceId único por dispositivo
- ✅ Validación cada 60 segundos
- ✅ Solo 1 sesión activa por usuario
- ✅ Logs de quién cerró cada sesión

---

## Integración en Dashboard

El componente `ActiveSessionsManager` se renderiza automáticamente:

```typescript
<ActiveSessionsManager
  userId={user.uid}
  token={token}
  onSessionClosed={() => {
    toast({
      title: "Sesión cerrada",
      description: "La sesión remota fue cerrada"
    })
  }}
/>
```

---

## Documentación Completa

Para detalles técnicos completos, ver:  
📖 [CONTROL_SESIONES_DISPOSITIVOS_COMPLETO.md](CONTROL_SESIONES_DISPOSITIVOS_COMPLETO.md)

---

## ✅ Checklist de Implementación

- [x] Archivos creados
- [x] Archivos modificados  
- [x] Firestore colección configurada
- [x] API endpoints funcionales
- [x] Componentes UI integrados
- [x] Hooks de validación activos
- [x] Documentación completa
- [x] Listo para producción

---

**¡Sistema completamente funcional! 🎉**
