# 🐛 VERIFICACIÓN Y DEBUGGING - Error Failed to Fetch

**Fecha:** Enero 21, 2026

---

## 🔍 Cómo Diagnosticar el Error

### Paso 1: Abrir Consola del Navegador
1. Presiona **F12**
2. Ve a la pestaña **Console**
3. Limpia mensajes antiguos (icono 🔄)

### Paso 2: Generar PDF
1. **Panel Admin → Productos**
2. **Selecciona una categoría**
3. **Clic en "Descargar Catálogo PDF"**
4. Observa los mensajes en consola

### Paso 3: Leer los Mensajes

---

## ✅ Mensajes de ÉXITO

```
[PDF] Attempting to load image: https://firebasestorage.googleapis.com/v0/b/...
[PDF] Product: "Samsung Galaxy S24" - Attempting to load image...
[PDF] Image URL: https://firebasestorage.googleapis.com/v0/b/...
[PDF] ✅ Image loaded successfully
[PDF] ✅ Image inserted to PDF for: "Samsung Galaxy S24"
```

**Significa:** Las imágenes se cargan correctamente ✅

---

## ⚠️ Mensajes de FALLBACK (Intento 2)

```
[PDF] Attempting to load image: https://firebasestorage.googleapis.com/v0/b/...
[PDF] Fetch failed (attempt 1): Failed to fetch
[PDF] ✅ Image loaded via canvas fallback
[PDF] ✅ Image inserted to PDF for: "iPhone 15"
```

**Significa:** Fetch falló pero Image tag funcionó ✅ (todavía carga la imagen)

---

## ❌ Mensajes de ERROR

### Error 1: CORS Bloqueado
```
[PDF] Attempting to load image: https://firebasestorage.googleapis.com/v0/b/...
[PDF] Fetch failed (attempt 1): Failed to fetch
[PDF] Image tag load failed (attempt 2)
[PDF] ⚠️ No image data returned for: "Samsung Galaxy S24"
(URL may be invalid or CORS blocked)
```

**Solución:**
```
Firebase Console → Storage → Rules
↓
allow read: if true;
↓
Publish
```

### Error 2: URL Inválida
```
[PDF] Attempting to load image: https://firebasestorage.googleapis.com/v0/b/invalid-path
[PDF] Fetch failed: 404 Not Found
[PDF] Image tag load failed (attempt 2)
[PDF] ⚠️ No image data returned for: "Samsung Galaxy S24"
```

**Solución:**
1. Ir a **Firestore Console**
2. **Products collection**
3. Verificar URLs en campo "images"
4. Probar URL en navegador directamente

### Error 3: Sin Imágenes Configuradas
```
[PDF] ⚠️ No images array for product: "Samsung Galaxy S24"
[PDF] ⚠️ No images array for product: "iPhone 15"
```

**Solución:**
1. Ir a **Firestore Console**
2. **Products collection**
3. Editar producto
4. Agregar URLs en campo "images" (array)

---

## 🛠️ Pruebas Manuales

### Test 1: Verificar URL de imagen

Abre consola (F12) y ejecuta:
```javascript
const url = 'https://your-firebase-url.jpeg';
fetch(url, { mode: 'cors' })
  .then(r => {
    console.log('✅ Fetch funciona, status:', r.status);
    return r.blob();
  })
  .then(blob => console.log('✅ Blob obtenido, tamaño:', blob.size))
  .catch(e => console.log('❌ Error:', e.message));
```

**Resultado esperado:**
```
✅ Fetch funciona, status: 200
✅ Blob obtenido, tamaño: 125482
```

### Test 2: Verificar CORS

```javascript
const url = 'https://your-firebase-url.jpeg';
fetch(url, { 
  mode: 'cors',
  headers: { 'Accept': 'image/*' }
})
  .then(r => {
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    if (r.ok) console.log('✅ CORS OK');
    else console.log('❌ Error HTTP:', r.status);
  })
  .catch(e => console.log('❌ CORS Bloqueado:', e.message));
```

**Resultado esperado:**
```
Status: 200
Content-Type: image/jpeg
✅ CORS OK
```

### Test 3: Probar Image tag fallback

```javascript
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => console.log('✅ Image tag cargó');
img.onerror = () => console.log('❌ Image tag falló');
img.src = 'https://your-firebase-url.jpeg?t=' + Date.now();
```

---

## 📊 Tabla de Soluciones

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "Failed to fetch" | CORS bloqueado | Habilitar CORS en Firebase |
| "404 Not Found" | URL inválida | Verificar URL en Firestore |
| "Fetch failed" → "Canvas fallback" | CORS bloqueado pero Image tag funciona | Normal, el fallback maneja |
| "No images array" | Sin imágenes en Firestore | Agregar URLs en campo images |
| PDF muestra [Sin imagen] | Todos los intentos fallaron | Ver CORS + URLs |

---

## 🔧 Soluciones Rápidas

### Solución 1: Habilitar CORS (Recomendado)

**Firebase Console:**
1. **Storage → Rules**
2. **Reemplazar con:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if false;
       }
     }
   }
   ```
3. **Publish**
4. **Esperar 1-2 minutos**
5. **Reintentar descargar PDF**

### Solución 2: Verificar URLs

**Firestore Console:**
1. **Products collection**
2. **Abrir un producto**
3. **Ver campo "images"**
4. **Copiar URL de una imagen**
5. **Probar en navegador:**
   - Abre nueva pestaña
   - Pega la URL
   - ¿Carga la imagen? Si no → URL inválida

### Solución 3: Regenerar URLs

Si las URLs son inválidas:
1. **Subir imagen nuevamente** en admin
2. **Firebase Storage** generará nueva URL
3. **Copiar URL del panel de upload**
4. **Pegar en campo "images"** de Firestore

---

## 📞 Información para Reportar

Si el problema persiste, reporta con:

1. **Pantalla de consola (F12)**
   - Captura de los mensajes [PDF]

2. **URL de imagen** (de Firestore)
   - Primera línea de la URL

3. **Resultado de test manual**
   - ¿Funciona `fetch()` en consola?
   - ¿Funciona Image tag en consola?

4. **Entorno**
   - ¿Local o producción?
   - ¿Qué navegador?

5. **Categoría problematic**
   - ¿Una específica o todas?

---

## ✅ Validación Final

Después de implementar la solución:

1. ✅ Abre **Consola (F12)**
2. ✅ **Descarga PDF**
3. ✅ Busca: `[PDF] ✅ Image loaded successfully`
4. ✅ **Abre PDF descargado**
5. ✅ Verifica que **imágenes aparezcan**

**Si ves imágenes → FUNCIONANDO** 🎉

---

**Última actualización:** Enero 21, 2026

