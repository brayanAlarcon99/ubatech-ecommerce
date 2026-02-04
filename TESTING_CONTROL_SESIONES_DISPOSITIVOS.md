# 🧪 INSTRUCCIONES DE PRUEBA: Control de Sesiones por Dispositivo

## Antes de Empezar

Asegúrate de:
- ✅ Tener permisos para acceder a `/admin/login` y `/admin/dashboard`
- ✅ Tener al menos 2 navegadores o pestañas
- ✅ Tener el DevTools abierto (opcional, para debugging)
- ✅ Internet estable

---

## Prueba 1: Verificar DeviceID

### Paso 1: Abre el DevTools
1. Presiona `F12` o `Ctrl+Shift+I`
2. Ve a la pestaña `Console`

### Paso 2: Verifica el DeviceID
```javascript
// En la consola, ejecuta:
localStorage.getItem('admin_device_id')

// Deberías ver algo como:
// "device_abc123def456_1707000000000"
```

### Paso 3: Nota el DeviceID
Copia este ID para comparar más adelante.

---

## Prueba 2: Login Automático en Múltiples Dispositivos

### Escenario: Un admin abre sesión en 2 dispositivos

#### Navegador A (Laptop/Principal)
1. Abre `https://tu-sitio.com/admin/login`
2. Ingresa email y contraseña de admin
3. Login exitoso → Se abre `/admin/dashboard`
4. Abre DevTools → Console
5. Ejecuta: `localStorage.getItem('admin_device_id')`
6. Anota el DeviceID: `device_A123`

#### Navegador B (Mobile/Incógnito/Nueva Tab)
1. Abre nueva ventana/pestaña incógnito (O en otro dispositivo)
2. Ve a `https://tu-sitio.com/admin/login`
3. Ingresa email y contraseña de admin
4. Login exitoso → Se abre `/admin/dashboard`
5. Abre DevTools → Console
6. Ejecuta: `localStorage.getItem('admin_device_id')`
7. Anota el DeviceID: `device_B456` (será diferente)

#### ¿Qué debería pasar?
✅ Navegador B carga el dashboard correctamente  
✅ Después de **60 segundos**, Navegador A detecta conflicto  
✅ Navegador A muestra notificación "Tu sesión fue cerrada..."  
✅ Navegador A hace logout automático  
✅ Navegador A redirige a `/admin/login`

#### Verificar en Firestore
1. Abre Firestore Console
2. Ve a colección `adminSessions`
3. Busca documentos con tu `userId`
4. Verifica:
   - Documento A: `isActive = false` (cerraba)
   - Documento B: `isActive = true` (activa)

---

## Prueba 3: Panel de Sesiones Activas

### Escenario: Ver y cerrar sesión remota manualmente

#### Navegador A (Laptop)
1. Inicia sesión en `/admin/login`
2. Ve a `/admin/dashboard`
3. En la parte superior del main content, busca panel:
   ```
   ┌─────────────────────────────────┐
   │ ⚠️ Otras sesiones activas (1)   │
   │                                 │
   │ 📱 Navegador - 2/3/2026, 14:30 │
   │    Última actividad: hace 2 min │
   │                      [CERRAR]   │
   └─────────────────────────────────┘
   ```

#### Navegador B (Mobile/Incógnito)
1. Inicia sesión en `/admin/login`
2. Ve a `/admin/dashboard`
3. Mantén abierto el dashboard

#### Navegador A: Cerrar sesión remota
1. En el panel de "Otras sesiones activas"
2. Busca el dispositivo B
3. Haz click en botón "CERRAR"
4. Deberías ver loading "Cerrando..."

#### ¿Qué debería pasar?
✅ Botón muestra estado de carga  
✅ Panel se actualiza después de cerrar  
✅ Navegador B detecta cambio (en < 60 segundos)  
✅ Navegador B muestra notificación  
✅ Navegador B hace logout automático  

#### Verificar en Firestore
1. Ve a `adminSessions`
2. Documento B: `isActive = false` e `closedBy = "remote"`

---

## Prueba 4: Validación Automática

### Escenario: Cambiar sesión en Firestore y verificar detección

#### Navegador A: Dejar dashboard abierto
1. Abre dashboard en Navegador A
2. No hagas nada, deja abierto

#### Firestore: Simular cierre remoto
1. Abre Firestore Console
2. Ve a colección `adminSessions`
3. Busca documento con tu `userId`
4. Edita el documento A:
   - Cambia `isActive` de `true` a `false`
   - Guardar

#### ¿Qué debería pasar?
✅ Navegador A después de < 60 segundos detecta cambio  
✅ Muestra notificación "Tu sesión fue cerrada..."  
✅ Hace logout automático  
✅ Redirige a `/admin/login`

---

## Prueba 5: Verificar API Endpoints

### Endpoint: GET (Obtener sesiones activas)

```bash
# En tu navegador console o Postman:

const token = await firebase.auth().currentUser.getIdToken()

fetch('/api/admin/sessions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log)
```

**Respuesta esperada:**
```json
{
  "sessions": [
    {
      "id": "user123_device_abc123",
      "userId": "user123",
      "deviceId": "device_abc123",
      "deviceName": "Navegador - 2/3/2026",
      "isActive": true,
      "lastActivity": "2026-02-03T14:35:00Z",
      "createdAt": "2026-02-03T14:30:00Z"
    }
  ],
  "count": 1
}
```

### Endpoint: POST (Validar sesión)

```bash
const token = await firebase.auth().currentUser.getIdToken()
const deviceId = localStorage.getItem('admin_device_id')

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
.then(console.log)
```

**Respuesta esperada (válida):**
```json
{
  "valid": true,
  "message": "Session is active"
}
```

**Respuesta esperada (inválida):**
```json
{
  "valid": false,
  "message": "Session was closed. Please log in again.",
  "reason": "closed_remotely"
}
```

---

## Prueba 6: Limpiar localStorage y Cambiar DeviceID

### Escenario: Verificar que cambiar localStorage crea nuevo deviceId

#### Navegador A: Iniciar sesión
1. Login exitoso
2. DevTools → Console
3. Ejecuta: `localStorage.getItem('admin_device_id')`
4. Nota el deviceId: `device_OLD`

#### Limpiar localStorage
1. DevTools → Console
2. Ejecuta: `localStorage.removeItem('admin_device_id')`
3. Ejecuta: `location.reload()` para recargar

#### Verificar nuevo DeviceID
1. DevTools → Console (después de recargar)
2. Ejecuta: `localStorage.getItem('admin_device_id')`
3. Nota el nuevo deviceId: `device_NEW` (será diferente)

#### ¿Qué debería pasar?
✅ Nuevo deviceId se genera automáticamente  
✅ Ambas sesiones se consideran como de diferentes dispositivos  
✅ En Firestore aparecen 2 documentos diferentes  
✅ La segunda sesión cierra la primera automáticamente  

---

## Prueba 7: Incognito y Private Browsing

### Escenario: Verificar que incognito = nuevo deviceId

#### Navegador A (Normal)
1. Abre `/admin/login`
2. Login exitoso
3. Dashboard abierto
4. DeviceID: `device_A`

#### Navegador B (Incognito/Private)
1. Abre ventana incógnito
2. Ve a `/admin/login`
3. Login exitoso
4. Dashboard abierto
5. DeviceID: `device_B` (diferente)

#### ¿Qué debería pasar?
✅ Incognito tiene su propio localStorage  
✅ Se genera deviceId diferente  
✅ Se trata como un dispositivo completamente diferente  
✅ Cierra la sesión anterior automáticamente  

---

## Prueba 8: Múltiples Pestañas del Mismo Navegador

### Escenario: Abrir múltiples pestañas del dashboard

#### Pestaña A: Login
1. Abre `/admin/login`
2. Login exitoso
3. Dashboard abierto
4. DeviceID: `device_123`

#### Pestaña B: Abrir dashboard
1. En la misma ventana, nueva pestaña
2. Ve a `/admin/dashboard` (ya logueado)
3. Dashboard abierto
4. DeviceID: `device_123` (IGUAL, localStorage compartido)

#### ¿Qué debería pasar?
✅ Mismo deviceId en ambas pestañas (localStorage compartido)  
✅ No se cierran entre sí (misma sesión)  
✅ Solo una entrada en Firestore  

---

## Checklist de Pruebas

```
Prueba 1: DeviceID
  [ ] localStorage tiene admin_device_id
  [ ] ID tiene formato "device_xxxxx"

Prueba 2: Login Múltiple
  [ ] Navegador A: Login exitoso
  [ ] Navegador B: Login exitoso
  [ ] Navegador A: Logout después 60s
  [ ] Firestore: isActive = false/true correcto

Prueba 3: Panel de Sesiones
  [ ] Panel aparece en dashboard
  [ ] Muestra otros dispositivos
  [ ] Botón "Cerrar" funciona
  [ ] Otro dispositivo detecta cambio

Prueba 4: Validación Automática
  [ ] Cambio en Firestore es detectado
  [ ] Logout automático después < 60s
  [ ] Notificación muestra correctamente

Prueba 5: API Endpoints
  [ ] GET /api/admin/sessions retorna json
  [ ] POST validate retorna {valid: true}
  [ ] POST close-remote actualiza Firestore

Prueba 6: LocalStorage
  [ ] removeItem crea nuevo deviceId
  [ ] Cierra sesión anterior automáticamente

Prueba 7: Incognito
  [ ] Ventana incognito = nuevo deviceId
  [ ] Cierra sesión anterior

Prueba 8: Múltiples pestañas
  [ ] Misma pestaña = mismo deviceId
  [ ] No se cierran entre sí
```

---

## Debugging

### Ver en Console (DevTools)

```javascript
// Ver deviceId actual
console.log(localStorage.getItem('admin_device_id'))

// Ver todas las sesiones del usuario (necesita token)
const token = await firebase.auth().currentUser.getIdToken()
fetch('/api/admin/sessions', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
```

### Ver en Network (DevTools)

1. DevTools → Network tab
2. Filtrar por `/api/admin/sessions`
3. Ver POST/GET requests
4. Expandir response para ver datos

### Ver en Firestore

1. Firestore Console
2. Colección `adminSessions`
3. Buscar por `userId`
4. Ver campos `isActive`, `lastActivity`, `closedBy`

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "No se pueden cargar sesiones" | Token inválido | Refrescar página |
| Panel no aparece | No hay otra sesión activa | Abrir en otro navegador |
| Logout no ocurre | Intervalo > 60s | Esperar más o cambiar intervalo |
| DeviceID iguales | localStorage compartido | Usar incognito o diferente navegador |
| API retorna 401 | Token expirado o no incluido | Refrescar y reintentar |

---

## Notas Importantes

- ⏱️ Validación ocurre cada **60 segundos**
- 🔄 Panel UI se refresca cada **30 segundos**
- 📱 Cada navegador/dispositivo = deviceId diferente
- 💾 DeviceID se almacena en localStorage
- 🗄️ Sesiones se guardan en Firestore colección `adminSessions`
- 🔐 Todas las APIs requieren token JWT válido

---

## Próximas Pruebas Recomendadas

1. Probar con dispositivos reales (Laptop + Mobile)
2. Probar en diferentes navegadores (Chrome, Firefox, Safari, Edge)
3. Probar con VPN o proxy
4. Probar con conexión lenta/intermitente
5. Probar múltiples usuarios simultáneamente

---

**¡Listo para empezar a probar! 🧪**

Si encuentras algún problema, revisa:
1. Firestore rules permitir lectura/escritura en `adminSessions`
2. Token JWT válido
3. `adminUsers` tiene el usuario
4. Conexión a internet estable
