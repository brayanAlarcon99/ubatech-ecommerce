# ⚠️ IMPORTANTE: CAMBIAR FIRESTORE RULES

## EL PROBLEMA
El sitio público está mostrando el error:
```
FirebaseError: Missing or insufficient permissions.
```

Esto ocurre porque **las Firestore Rules no permiten lectura pública** a la colección `store_settings`.

---

## SOLUCIÓN: ACTUALIZAR FIRESTORE RULES

### Paso 1: Ir a Firebase Console
1. Abre: https://console.firebase.google.com
2. Selecciona el proyecto: `ubatech-a8650`
3. Ve a: **Cloud Firestore** → **Rules**

### Paso 2: Reemplazar las reglas
1. **Selecciona TODO el contenido actual** (Ctrl+A)
2. **Borra todo**
3. **Copia el contenido de `FIRESTORE_RULES_FINAL.txt`** de este repositorio
4. **Pega en Firebase Console**

### Paso 3: Publicar las reglas
1. Haz clic en **"Publish"** (botón azul)
2. Espera a que se procese (2-3 segundos)
3. Deberías ver: ✅ **"Rules published successfully"**

---

## REGLAS APLICADAS

### ✅ store_settings (PÚBLICA)
```javascript
match /store_settings/{document=**} {
  allow read: if true;  // ✅ Cualquiera puede leer
  allow write: if request.auth != null;  // Solo autenticados pueden escribir
}
```

### ✅ products (PÚBLICA)
```javascript
match /products/{document=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### ✅ categories (PÚBLICA)
```javascript
match /categories/{document=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### ✅ orders (PRIVADA)
```javascript
match /orders/{document=**} {
  allow read, write: if request.auth != null;
}
```

### ✅ adminUsers (PRIVADA)
```javascript
match /adminUsers/{userId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null;
  allow delete: if request.auth != null;
}
```

---

## DESPUÉS DE ACTUALIZAR LAS REGLAS

1. **Recarga el navegador** (Ctrl+F5)
2. **Verifica que el error desaparezca**
3. **El sitio público debería mostrar:**
   - ✅ Nombre de la tienda en el header
   - ✅ Información del footer
   - ✅ Descripción en el hero

---

## VERIFICACIÓN RÁPIDA

Una vez aplicadas las reglas, prueba esto:

### En el Sitio Público
1. Ve a: `http://localhost:3000`
2. Abre F12 → Consola
3. Deberías ver los datos cargados sin errores
4. El footer debe mostrar toda la información

### En el Panel Admin
1. Ve a: `http://localhost:3000/admin/dashboard`
2. Ve a: Configuración
3. Cambia un valor
4. Guarda
5. Espera 1-3 segundos
6. Abre el sitio público en otra pestaña
7. Verifica que el cambio se refleje

---

## SI SIGUE FALLANDO

1. **Verifica que copiaste TODO el código** de `FIRESTORE_RULES_FINAL.txt`
2. **Verifica que hagas clic en "Publish"**
3. **Limpia el cache del navegador**: Ctrl+Shift+Delete
4. **Abre en modo incógnito**: Ctrl+Shift+N
5. **Recarga la página**: Ctrl+F5

---

## SEGURIDAD

⚠️ Estas reglas permiten:
- ✅ Lectura PÚBLICA de: `store_settings`, `products`, `categories`
- ✅ Escritura PROTEGIDA: Solo usuarios autenticados
- ✅ Datos sensibles (órdenes, usuarios admin): Totalmente privados

**ESTO ES SEGURO** porque:
- Solo lee datos públicos de configuración y productos
- Cualquier cambio requiere autenticación
- Órdenes y usuarios admin totalmente privados

---

## ARCHIVOS RELEVANTES

- `FIRESTORE_RULES_FINAL.txt` ← **COPIA ESTO A FIREBASE CONSOLE**
- `app/api/settings/route.ts` ← Lee de `store_settings`
- `hooks/use-store-settings.ts` ← Usa listener en tiempo real
- `components/footer.tsx` ← Muestra la configuración

---

## CONTACTO

Si algo sigue sin funcionar después de aplicar las reglas:
1. Verifica la consola del navegador (F12)
2. Ve a `/api/sync/settings` para ver si Firebase devuelve datos
3. Ve a `/api/debug/store-settings` para verificar ubicación de datos

**Timestamp**: 10 Diciembre 2025
**Status**: 🔴 REQUIERE ACCIÓN MANUAL EN FIREBASE CONSOLE
