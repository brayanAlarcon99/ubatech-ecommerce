# 🐛 GUÍA DE DEBUGGING - CARGA DE IMÁGENES EN PDF

**Fecha:** Enero 21, 2026

---

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Abrir la Consola del Navegador

1. Abre el navegador (Chrome, Firefox, Edge)
2. Presiona **F12** o **Ctrl + Shift + I**
3. Ve a la pestaña **Console**
4. Limpia la consola (icono 🔄)

### Paso 2: Generar el PDF

1. Ve a **Panel Administrativo → Productos**
2. Selecciona una **Categoría** con productos
3. Haz clic en **"Descargar Catálogo PDF"** (botón Share)
4. Observa los mensajes en la consola

### Paso 3: Analizar los Mensajes

#### ✅ Si VES esto (CORRECTO):
```
[PDF] Loading image for product: Samsung Galaxy S24 - URL: https://firebasestorage...
[PDF] ✅ Image loaded successfully for: Samsung Galaxy S24
[PDF] Loading image for product: iPhone 15 - URL: https://firebasestorage...
[PDF] ✅ Image loaded successfully for: iPhone 15
```

**Significa:** Las imágenes se cargan correctamente ✅

---

#### ❌ Si VES esto (PROBLEMA - CORS):
```
[PDF] Loading image for product: Samsung Galaxy S24 - URL: https://firebasestorage...
Access to XMLHttpRequest at 'https://firebasestorage...' from origin 
'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Significa:** CORS está bloqueado 🚫

**Solución:**
1. Ir a Firebase Console → Storage → Rules
2. Actualizar rules para permitir lectura pública:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // ✅ Permite lectura pública
      allow write: if false;  // ❌ Bloquea escritura
    }
  }
}
```

---

#### ❌ Si VES esto (PROBLEMA - URL Inválida):
```
[PDF] Loading image for product: Samsung Galaxy S24 - URL: https://firebasestorage.../invalid-path
[PDF] No image data returned for: Samsung Galaxy S24
```

**Significa:** La URL no es válida o no existe 🔗

**Solución:**
1. Ir a Firestore Console
2. Abrir Products collection
3. Ver el campo "images" del producto
4. Verificar que la URL comience con `https://firebasestorage.googleapis.com/`
5. Copiar y probar la URL en el navegador

---

#### ❌ Si VES esto (PROBLEMA - Error de conexión):
```
[PDF] Loading image for product: Samsung Galaxy S24 - URL: https://firebasestorage...
[PDF] Error loading image for Samsung Galaxy S24: Error: Failed to fetch
```

**Significa:** Error de conexión/red ⚠️

**Solución:**
1. Verificar conexión a internet
2. Revisar que Firebase Storage esté disponible
3. Verificar que no haya firewall bloqueando
4. Reintentar en unos segundos

---

#### ❌ Si VES esto (PROBLEMA - URL no configurada):
```
[PDF] No images array for product: Samsung Galaxy S24
[PDF] No images array for product: iPhone 15
```

**Significa:** El producto NO tiene imágenes configuradas en Firestore ❌

**Solución:**
1. Ir a Firestore Console
2. Abrir Products collection
3. Editar el producto
4. Agregar URLs en el campo "images" (array)
5. Guardar cambios

---

## 🛠️ Verificación Técnica

### Verificar que las URLs son válidas:

```javascript
// Abre la consola (F12) y copia esto:

fetch('https://your-firebase-url.jpeg')
  .then(r => r.blob())
  .then(blob => {
    console.log('✅ URL válida, tamaño:', blob.size, 'bytes');
    console.log('Tipo:', blob.type);
  })
  .catch(e => console.error('❌ Error:', e.message));
```

**Resultado esperado:**
```
✅ URL válida, tamaño: 125482 bytes
Tipo: image/jpeg
```

### Verificar CORS manualmente:

```javascript
// En la consola (F12), copia esto:

fetch('https://your-firebase-url.jpeg', {
  mode: 'cors',
  cache: 'no-cache'
})
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers.get('content-type'));
    if (r.ok) console.log('✅ CORS OK');
    else console.log('❌ HTTP error:', r.status);
  })
  .catch(e => console.error('❌ CORS Blocked:', e.message));
```

---

## 📋 Checklist de Debugging

- [ ] Abriste la consola (F12)
- [ ] Viste los mensajes `[PDF]` en la consola
- [ ] Las imágenes tienen URLs válidas (comienzan con `https://firebasestorage...`)
- [ ] No hay mensajes de error CORS
- [ ] Las imágenes aparecen en el PDF generado
- [ ] El PDF se descargó correctamente

---

## 🚀 Soluciones Rápidas

### Si ninguna imagen carga:

**Opción 1: Habilitar CORS en Firebase**
```
Firebase Console → Storage → Rules
↓
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
↓
Publish (publicar)
```

**Opción 2: Verificar URLs en productos**
```
Firestore → Products collection
↓
Abrir cada producto
↓
Ver campo "images" (debe ser array de URLs)
↓
Si está vacío o es null → Agregar URLs
```

**Opción 3: Reintentar con nueva categoría**
```
Si una categoría no funciona:
1. Ir a otra categoría
2. Intentar descargar el PDF de esa categoría
3. Ver si las imágenes cargan en la otra
4. Si funciona → El problema es con los productos específicos
5. Si no funciona → El problema es con Firebase Storage
```

---

## 📞 Información para Reportar Problemas

Si el problema persiste, reporta con esta información:

1. **Mensajes de la consola** (F12 → Console)
   ```
   Copiar y pegar exactamente qué aparece
   ```

2. **URL de un producto** (de Firestore)
   ```
   Ejemplo: https://firebasestorage.googleapis.com/...
   ```

3. **Nombre del navegador y versión**
   ```
   Ejemplo: Chrome 131.0, Firefox 122.0
   ```

4. **Entorno**
   ```
   ¿Local (localhost) o producción?
   ```

5. **Categoría donde ocurre**
   ```
   ¿Todas las categorías o una específica?
   ```

---

## ✅ Validación Final

Después de implementar la solución:

1. ✅ Abre consola (F12)
2. ✅ Descarga un PDF
3. ✅ Verifica que aparezca: `[PDF] ✅ Image loaded successfully`
4. ✅ Abre el PDF descargado
5. ✅ Verifica que las imágenes aparezcan (20x20mm)
6. ✅ Si ves imágenes → **ÉXITO** 🎉

---

**Última actualización:** Enero 21, 2026

