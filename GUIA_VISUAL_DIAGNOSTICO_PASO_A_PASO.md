# 🎬 GUÍA VISUAL: Cómo Diagnosticar El Problema

## Paso 1: Abre DevTools (F12)

### Opción A (Recomendado):
```
Presiona: F12
```

### Opción B:
```
Botón derecho del ratón → Inspeccionar
```

### Opción C:
```
Ctrl + Shift + I (Windows)
Cmd + Option + I (Mac)
```

**Deberías ver:**
```
┌─────────────────────────────────────┐
│ Chrome DevTools                 _█  │
├─────────────────────────────────────┤
│ Elements │ Console │ Sources │ ...  │
├─────────────────────────────────────┤
│                                     │
│  Console (aquí aparecen los logs)   │
│                                     │
└─────────────────────────────────────┘
```

---

## Paso 2: Selecciona la Pestaña "Console"

**Click aquí:**
```
┌──────────────┬──────────┐
│ Elements     │ Console  │  ← CLICK AQUÍ
│              │ Sources  │
└──────────────┴──────────┘
```

**Deberías ver logs azules/verdes/rojos:**
```
ℹ️ [PDF] Started PDF generation...
⚠️  [PDF] Warning: Canvas toDataURL invalid
❌ [PDF] Error: Image failed to load
```

---

## Paso 3: Limpia Los Logs Anteriores (Opcional)

**Click en el icono 🚫 Clear Console:**
```
┌────────────────────────────────┐
│ 🚫 🔍 ⚙️                        │  ← Click en 🚫
├────────────────────────────────┤
│ (Console estará limpia)         │
└────────────────────────────────┘
```

---

## Paso 4: Intenta Compartir Un Catálogo

### Navega a Admin Panel:
```
1. Abre: localhost:3000/admin/dashboard
2. Busca: "Gestión de Productos"
3. Selecciona: Cualquier categoría (ej: "AUDIFONOS")
4. Click botón: "Compartir Catálogo" o "Compartir" o "Descargar PDF"
```

**Deberías ver:**
```
El navegador comienza a procesar
         ↓
Los logs comienzan a aparecer en Console (azules)
         ↓
Después de ~15 segundos, aparecen ERRORES (rojos/naranjas)
         ↓
✅ Si funciona: Se descarga un PDF
❌ Si no funciona: Ves los errores en rojo
```

---

## Paso 5: Lee Los Errores En La Consola

### Busca ESTE PATRÓN primero:
```
[API] 📊 Response status: ???
```

**Presiona Ctrl+F (Find) en la consola:**
```
┌──────────────────────────────┐
│ Search: [API] 📊 Response    │  ← Escribe aquí
└──────────────────────────────┘
```

---

## Paso 6: Identifica El Error

### Tabla de Errores:

```
┌─────────────────────┬──────────────────────────┐
│ Deberías Ver        │ Significa                │
├─────────────────────┼──────────────────────────┤
│ 200 OK              │ ✅ OK, problema es CORS  │
│ 404 Not Found       │ ❌ Imagen borrada        │
│ 403 Forbidden       │ ❌ Sin permiso           │
│ 500+ Error          │ ❌ Servidor caído        │
│ (empty/null)        │ ❌ URL inválida          │
│ TIMEOUT             │ ⏱️  Firebase muy lento   │
└─────────────────────┴──────────────────────────┘
```

### Ejemplo: Si ves esto
```
┌────────────────────────────────────────────┐
│ [API] 📊 Response status: 404 Not Found    │
│ [API] 📝 Response body: File not found     │
└────────────────────────────────────────────┘
     ↓
Significa: Las imágenes fueron borradas de Firebase Storage
     ↓
Solución: Re-subir imágenes
```

---

## Paso 7: Copia Todos Los Logs

### Opción A (Automática):
```
1. Presiona: Ctrl + A (Select All en Console)
2. Presiona: Ctrl + C (Copy)
3. Pega aquí en el chat
```

### Opción B (Manual):
```
1. Busca los logs de [PDF] y [API]
2. Selecciona desde el primer [PDF] hasta el último error
3. Click derecho → Copy
4. Pega aquí
```

**Debería verse así:**
```
[PDF] 📥 Loading URL (Attempt 1/3):
[PDF] 📝 Full URL: https://firebasestorage.googleapis.com/v0/...
[API] 🌐 Fetching from: https://...
[API] 📊 Response status: 404 Not Found
[API] 📝 Response body: File not found
[PDF] ⚠️ Image failed to load - HTTP 404
[PDF] 🔄 Attempt 1.2: Using canvas fallback
...
```

---

## Paso 8: Pégalo En El Chat

Formato ideal:
```
❌ ERROR ENCONTRADO:

Tipo de error: [Selecciona uno]
- [ ] HTTP 404 (Imágenes borradas)
- [ ] Invalid URL (URLs inválidas)
- [ ] CORS blocked (CORS no configurado)
- [ ] Timeout 12s (Firebase lento)
- [ ] Otro:

Logs:
[Pega aquí los logs de DevTools]

Contexto:
- ¿Cuántos productos? [Tu respuesta]
- ¿Cuándo dejó de funcionar? [Tu respuesta]
- ¿Se vieron imágenes alguna vez? [Tu respuesta]
```

---

## 📸 Capturas De Pantalla Visual

### Aquí es donde ves la consola:
```
DevTools                          ← Si no lo ves, presiona F12
    │
    ├─ Elements                   ← Estructura HTML
    ├─ Console      ← ⭐ AQUÍ APARECEN LOS LOGS
    ├─ Sources      ← Código
    ├─ Network      ← Red (opcional)
    └─ ...
```

### Aquí es donde ves el error:
```
Console Tab
    │
    └─ [PDF] 📥 Loading URL...
       [API] 📊 Response status: 404  ← ⭐ AQUÍ ESTÁ LA RESPUESTA
       [API] 📝 Response body: ...    ← ⭐ AQUÍ ESTÁ LA CAUSA
       [PDF] ⚠️ Image failed...       ← ERROR
```

### Aquí es donde copias:
```
┌────────────────────────────────────┐
│ Console Log Area                   │
│ ────────────────────────────────── │
│ ✓ [PDF] Log 1                      │
│ ✓ [PDF] Log 2                      │
│ ✓ [API] Log 3                      │
│ ✓ [API] Log 4  ← Selecciona todo   │
│ ✓ [PDF] Log 5                      │
│ ────────────────────────────────── │
│ Ctrl+A (Select All)                │
│ Ctrl+C (Copy)                      │
└────────────────────────────────────┘
```

---

## ⏱️ Tiempo Requerido

```
Paso 1: Abre F12 ..................... 5 segundos
Paso 2: Console tab .................. 2 segundos
Paso 3: Limpia logs (opcional) ....... 3 segundos
Paso 4: Intenta Compartir ............ 15 segundos
Paso 5: Lee errores .................. 10 segundos
Paso 6: Identifica error ............. 10 segundos
Paso 7: Copia logs ................... 5 segundos
Paso 8: Pega en chat ................. 5 segundos
                                 ────────────
                         TOTAL: ~55 segundos
```

---

## 🆘 Si Tienes Problema

### "No veo la Console"
```
Presiona: F12
Click en: Console tab
```

### "No veo [API] logs"
```
Asegúrate de usar Firefox o Chrome
Safari tiene problemas a veces
```

### "Los logs se borraron"
```
Presiona F5 (Refresh)
Intenta nuevamente
Espera a que aparezcan los logs
```

### "No entiendo el error"
```
Copia y pega los logs completos
Yo identifico la causa
```

---

## ✅ Checklist Final

- [ ] F12 abierto
- [ ] Console tab visible
- [ ] Intenté compartir catálogo
- [ ] Veo logs en la consola
- [ ] Copié los logs
- [ ] Pegué en el chat

**¡Listo! Ahora resolvemos en < 10 minutos.** 🚀

---

## 📞 Información Que Necesito

```
1. [API] 📊 Response status: ??? ← El status HTTP
2. [API] 📝 Response body: ??? ← Por qué falló
3. Cualquier [PDF] ❌ error
4. Cuántos productos tienes
5. Cuándo dejó de funcionar
```

Con eso: **DIAGNOSTICADO en 2 minutos, SOLUCIONADO en 10 minutos.**

¡Adelante! 🎯
