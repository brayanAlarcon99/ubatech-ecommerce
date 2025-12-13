# 🔧 ACTUALIZAR FIRESTORE RULES - Guía Rápida

**Tu problema**: Error "Missing or insufficient permissions" al cambiar el estado

**Causa**: Las reglas de Firestore están mal estructuradas y falta la colección `/settings/`

---

## 📋 Pasos para Resolver (5 minutos)

### Paso 1: Abre Firebase Console

```
https://console.firebase.google.com
```

Selecciona tu proyecto.

### Paso 2: Ve a Firestore Rules

```
Firestore Database → Pestaña "Rules"
```

Verás el editor con las reglas actuales (las que están mal).

### Paso 3: Selecciona TODO el código actual

```
Presiona: Ctrl + A
```

O haz clic en cualquier parte y selecciona todo manualmente.

### Paso 4: Borra TODO

```
Presiona: Delete o Backspace
```

El editor debe estar vacío.

### Paso 5: Copia las NUEVAS reglas

**Archivo**: `FIRESTORE_RULES_CORRECTAS_FINAL.txt`

```
Abre el archivo
Selecciona TODO el contenido (Ctrl+A)
Copia (Ctrl+C)
```

### Paso 6: Pega en Firebase

En el editor de Firebase (que ahora está vacío):

```
Pega el contenido (Ctrl+V)
```

Deberías ver las reglas nuevas sin errores de sintaxis.

### Paso 7: Publica

Haz clic en el botón **"Publish"** arriba a la derecha.

**Deberías ver**:
```
✅ Rules updated successfully
```

En verde. Si ves error rojo, revisa la sintaxis.

### Paso 8: Espera

```
Espera 30 segundos a que se propague globalmente
```

### Paso 9: Recarga tu página

```
F5 o Ctrl+F5 (recarga completa)
```

Ve a tu dashboard del admin.

### Paso 10: Prueba el botón

```
Busca: "Control de Página Pública"
Haz click en el switch
```

**Debería funcionar ahora SIN error de permisos** ✅

---

## 🆘 Si Algo Sale Mal

### Error en el editor de Firebase

**Si ves rojo** cuando pegas:
- Asegúrate de haber borrado TODO lo anterior
- Revisa que el archivo `FIRESTORE_RULES_CORRECTAS_FINAL.txt` esté completo
- Copia nuevamente y pega

### Sigue sin funcionar después de Publish

**Si aún da error de permisos**:
1. Limpia caché del navegador (Ctrl+Shift+Delete)
2. Recarga la página (Ctrl+F5)
3. Espera 30 segundos más
4. Intenta nuevamente

### El botón no aparece

Si aún no ves el botón "Control de Página Pública":
1. Recarga `/admin/dashboard`
2. Verifica que estés logeado como **superusuario**
3. Abre consola (F12) y busca errores

---

## 📸 Vista Previa de las Nuevas Reglas

Las nuevas reglas incluyen:

```firestore
✅ /products/          → Lectura pública, escritura admin
✅ /categories/        → Lectura pública, escritura admin
✅ /subcategories/     → Lectura pública, escritura admin
✅ /store_settings/    → Lectura pública, escritura admin
✅ /platform_info/     → Lectura pública, escritura admin
✅ /settings/          → ⭐ NUEVO - Control de página pública
✅ /adminUsers/        → Solo admin
✅ /orders/            → Solo autenticados
✅ /config/            → Solo admin
```

---

## 🎯 Lo Más Importante

**NO hagas cambios manuales**. Usa la función "Publish" de Firebase.

Si intentas hacer cambios sin publicar, no se aplicarán.

---

## ✅ Verificación Final

Después de publicar, verifica:

1. **En Firebase Console**:
   - Las reglas aparecen sin errores rojos
   - Dice "Deployed at..." con fecha/hora reciente

2. **En tu navegador**:
   - Recarga `/admin/dashboard`
   - Ves "Control de Página Pública" al inicio
   - Haces click en el switch
   - **NO hay error de permisos** ✅

3. **En Firestore**:
   - Colección: `settings`
   - Documento: `public_site_status`
   - Campos: `isPublic`, `lastUpdatedAt`, `lastUpdatedBy`

---

## 💡 Tips

**Problema**: "Tardar mucho después de Publish"
**Solución**: Las reglas se propagan gradualmente. Espera 30-60 segundos.

**Problema**: "Sigo viendo el error"
**Solución**: 
1. Limpia caché (Ctrl+Shift+Delete)
2. Cierra todas las pestañas del sitio
3. Abre nueva pestaña
4. Ve a `/admin/dashboard`

**Problema**: "No aparece el botón"
**Solución**: 
1. Verifica que estés logeado como superusuario
2. Abre consola (F12) y busca errores
3. Recarga la página

---

**Una vez hagas esto, todo debería funcionar correctamente** ✨
