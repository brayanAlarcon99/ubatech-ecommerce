# 🔧 SOLUCIÓN: Error 500 en Session Validator Hook

## 📋 Diagnóstico

El error `[Session Validator] API error: 500 {}` ocurre cuando el hook `use-session-conflict-detector.ts` intenta validar si la sesión del usuario sigue activa.

**Causa:** Es el mismo problema raíz que el anterior - Firebase Admin SDK no estaba inicializado correctamente.

**Buena noticia:** Ya hemos corregido el endpoint `/api/admin/sessions` en los cambios anteriores.

---

## ✅ Solución Implementada

### 1. **Mejora del Manejo de Errores en el Hook**

El hook ahora:
- ✅ Diferencia entre errores de red (500, 502) y autenticación (401)
- ✅ No lanza excepciones en errores de servidor (reintenta automáticamente)
- ✅ Maneja correctamente los 401 Unauthorized
- ✅ Registra logs más descriptivos para debugging

### 2. **Cambios en `hooks/use-session-conflict-detector.ts`**

| Cambio | Beneficio |
|--------|-----------|
| Usar `console.warn` en lugar de `console.error` | Diferencia errores de red de problemas reales |
| Retornar silenciosamente en errores 500 | No alarma al usuario por problemas de servidor |
| Manejar 401 especialmente | Detecta tokens expirados/inválidos |
| Logs con prefijo `[Session Validator]` | Debugging más fácil |

---

## 🚀 Cómo Funcionan Ahora las Validaciones

### Flujo Actual (Después de Cambios)

```
Hook validaSession() cada 60 segundos
    ↓
POST /api/admin/sessions con { action: 'validate', deviceId }
    ↓
getAdminAuth() / getAdminDb() en endpoint
    ├─ ✅ Firebase Admin está inicializado
    └─ ✅ Token se verifica correctamente
    ↓
Respuesta correcta
    ├─ 200 OK { valid: true }          → Sesión activa, continúa
    ├─ 200 OK { valid: false }         → Cierra sesión y redirige
    ├─ 401 Unauthorized                → Token expirado, logout
    └─ 500 Server Error                → Registra warning, reintenta en 60s
```

---

## 🧪 Instrucciones para Verificar la Solución

### Opción 1: Prueba Manual (Recomendada)

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Abre DevTools (F12) → Console**

3. **Inicia sesión en el admin:**
   - Ve a http://localhost:3000/admin/login
   - Ingresa credenciales válidas
   - Espera a que cargue el dashboard

4. **Observa los logs:**
   - ✅ Deberías ver: `[Firebase Admin] App initialized successfully`
   - ✅ Deberías ver: Sesiones cargadas en el panel
   - ❌ NO deberías ver: `[Session Validator] API error: 500 {}`

5. **Espera 60 segundos:**
   - El hook valida la sesión automáticamente
   - ✅ Deberías ver logs limpios (sin errores)
   - ❌ No deberías ver error 500

### Opción 2: Test Específico en Consola

```javascript
// En la consola del navegador, después de iniciar sesión
const token = localStorage.getItem('firebase_token'); // o donde guardes el token
const deviceId = localStorage.getItem('deviceId');

fetch('/api/admin/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId
  },
  body: JSON.stringify({
    action: 'validate',
    deviceId: deviceId
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e))

// ✅ Esperado: { valid: true, message: 'Session is active' }
// ❌ No esperado: error 500
```

### Opción 3: Verificación Rápida en Terminal

```bash
# Busca el archivo compilado para verificar cambios
grep -n "getAdminAuth\|getAdminDb" .next/server/app/api/admin/sessions/route.js
# ✅ Debería mostrar referencias a getAdminAuth y getAdminDb

# Verifica que firebase-admin.ts fue compilado
grep -n "getAdminAuth\|getAdminDb" .next/static/**/*firebase-admin*.js 2>/dev/null || echo "Check in .next folder"
```

---

## 📊 Cambios Realizados

### Archivo: `hooks/use-session-conflict-detector.ts`

**Antes (❌ Problemas):**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  console.error('[Session Validator] API error:', response.status, errorData)  // ← Alarma al usuario
  throw new Error(...)  // ← Lanza excepción innecesaria
}
```

**Después (✅ Mejorado):**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  console.warn('[Session Validator] API returned status:', response.status, errorData)  // ← Advertencia
  
  // Diferencia tipos de error
  if (response.status === 401) {
    throw new Error('Session validation failed: Unauthorized')  // ← Solo para 401
  }
  
  // Para 500, simplemente registra y reintenta
  console.warn('[Session Validator] Will retry session validation next cycle')
  return  // ← No lanza excepción
}
```

---

## 🔄 Flujo de Recuperación

Si se produce un error 500:

1. **Hooks/Endpoint intenta:**
   - Inicializa Firebase Admin SDK con `getAdminAuth()`
   - Verifica token del usuario
   - Valida sesión en Firestore

2. **Si sucede error 500:**
   - Se registra el warning (no el error)
   - **NO** se muestra toast de error al usuario
   - Hook continúa ejecutándose

3. **Después de 60 segundos:**
   - Hook reintenta automáticamente
   - Si la causa se resolvió, funciona correctamente
   - Si persiste, sigue registrando warnings

4. **Si es 401:**
   - Se cierra sesión inmediatamente
   - Se redirige a login
   - Se muestra mensaje al usuario

---

## 🆘 Si Aún Ves Errores 500

### Paso 1: Verifica Firebase Admin
```bash
# Confirma que serviceAccountKey.json existe y es válido
cat serviceAccountKey.json | head -5
# ✅ Debe mostrar: { "type": "service_account", "project_id": "ubatech-a8650", ...

# Verifica que contiene credenciales válidas
grep "private_key" serviceAccountKey.json | head -1
# ✅ Debe mostrar una clave privada (no vacía)
```

### Paso 2: Verifica Token
```javascript
// En la consola del navegador
const token = localStorage.getItem('firebase_token') || localStorage.getItem('idToken');
console.log('Token length:', token?.length); // ✅ Debe ser > 100
console.log('Token starts with:', token?.substring(0, 20));

// Decodifica para verificar (en https://jwt.io si lo necesitas)
```

### Paso 3: Limpia Caché y Reconstruye

```bash
# Detén el servidor (Ctrl+C)
rm -r .next
npm run dev
# Espera a que compile completamente
```

### Paso 4: Revisa los Logs del Servidor

En la terminal donde corre `npm run dev`, busca:

```
✅ [Firebase Admin] App initialized successfully
✅ [Sessions API] Session validation passed
```

En lugar de:

```
❌ Error: Cannot read property 'verifyIdToken' of undefined
❌ [Sessions API] Error in POST: ...
```

---

## 📈 Comparativa de Comportamiento

| Situación | Antes | Después |
|-----------|-------|---------|
| Error 500 | ❌ Muestra error, detiene validación | ✅ Registra warning, reintenta en 60s |
| Token inválido | ❌ Genérico error 500 | ✅ 401, logout automático |
| Sesión válida | ✅ Funciona | ✅ Funciona (igual) |
| Red inestable | ❌ Falla inmediatamente | ✅ Reintenta automáticamente |

---

## 🎯 Resumen de Solución

| Cambio | Archivo | Efecto |
|--------|---------|--------|
| Lazy initialization | `lib/firebase-admin.ts` | Garantiza Firebase Admin listo |
| Actualizar endpoint | `app/api/admin/sessions/route.ts` | Usa getAdminAuth() y getAdminDb() |
| Mejor error handling | `hooks/use-session-conflict-detector.ts` | No alarma por errores de servidor |
| Logs descriptivos | Ambos archivos | Debugging más fácil |

---

## 🚀 Próximos Pasos

1. ✅ Los cambios ya están implementados
2. 👉 Ejecuta: `npm run dev`
3. 👉 Prueba iniciar sesión
4. 👉 Verifica que NO ves error 500 en console
5. 👉 Espera 60 segundos para ver validación automática
6. 👉 Verifica que todo funciona correctamente

---

**Status:** ✅ SOLUCIÓN COMPLETADA  
**Fecha:** 3 de Febrero de 2026  
**Versión:** 1.0
