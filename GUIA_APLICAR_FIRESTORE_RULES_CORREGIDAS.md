# Guía: Aplicar Firestore Rules Corregidas

**Fecha:** 19 de Enero de 2026  
**Versión:** 1.0

---

## 🚀 PASOS PARA APLICAR LAS REGLAS

### PASO 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto **ubatech**
3. En el menú izquierdo, selecciona **Firestore Database**
4. Haz clic en la pestaña **Reglas**

---

### PASO 2: Reemplazar las Reglas Actuales

1. **Selecciona TODO el contenido actual** (Ctrl+A)
2. **Borra todo** el contenido
3. **Copia el siguiente contenido** desde [FIRESTORE_RULES_CORREGIDAS.txt](FIRESTORE_RULES_CORREGIDAS.txt):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNCIONES HELPER
    // ============================================
    
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }

    function isSuper() {
      return isAuthenticated() && 
             hasAdminRole() &&
             get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
    }

    function validateProductStructure() {
      let product = request.resource.data;
      let hasSubcategory = 'subcategory' in product && 
                          product.subcategory != '' &&
                          product.subcategory != null;
      if (!hasSubcategory) return true;
      return exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
    }

    function validateSubcategoryStructure() {
      let subcategory = request.resource.data;
      return ('categoryId' in subcategory) && 
             ('name' in subcategory) &&
             subcategory.categoryId != '' &&
             subcategory.name != '';
    }

    function validateAdminStructure() {
      let admin = request.resource.data;
      return ('email' in admin) && 
             ('role' in admin) &&
             admin.email != '' &&
             (admin.role == 'admin' || admin.role == 'super');
    }

    // ============================================
    // REGLAS PÚBLICAS (LECTURA SIN AUTENTICACIÓN)
    // ============================================

    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated() && hasAdminRole() && validateProductStructure();
      allow update: if isAuthenticated() && hasAdminRole() && validateProductStructure();
      allow delete: if isAuthenticated() && hasAdminRole();
    }

    match /products/{productId}/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && hasAdminRole();
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow create: if isAuthenticated() && hasAdminRole();
      allow update: if isAuthenticated() && hasAdminRole();
      allow delete: if isAuthenticated() && hasAdminRole();
    }

    match /subcategories/{subcategoryId} {
      allow read: if true;
      allow create: if isAuthenticated() && hasAdminRole() && validateSubcategoryStructure();
      allow update: if isAuthenticated() && hasAdminRole() && validateSubcategoryStructure();
      allow delete: if isAuthenticated() && hasAdminRole();
    }

    match /store_settings/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && hasAdminRole();
    }

    match /platform_info/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && hasAdminRole();
    }

    match /stores/{storeId} {
      allow read: if true;
      allow create: if isAuthenticated() && hasAdminRole();
      allow update: if isAuthenticated() && hasAdminRole();
      allow delete: if isAuthenticated() && hasAdminRole();
    }

    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && hasAdminRole();
    }

    // ============================================
    // CONTROL DE PÁGINA PÚBLICA
    // ============================================
    
    match /public_site_status/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && isSuper();
    }

    // ============================================
    // MODO MANTENIMIENTO ADMIN
    // ============================================
    
    match /admin_settings/{document=**} {
      allow read: if isAuthenticated() && hasAdminRole();
      allow write: if isAuthenticated() && isSuper();
    }

    // ============================================
    // REGLAS PRIVADAS (AUTENTICACIÓN REQUERIDA)
    // ============================================

    match /adminUsers/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || hasAdminRole());
      
      allow create: if isAuthenticated() && 
                       validateAdminStructure() &&
                       (request.auth.uid == userId || 
                        isSuper() ||
                        !exists(/databases/$(database)/documents/adminUsers));
      
      allow update: if isAuthenticated() && hasAdminRole() && validateAdminStructure();
      
      allow delete: if isAuthenticated() && isSuper();
    }

    match /orders/{orderId} {
      allow read, write: if isAuthenticated();
    }

    match /orders/{orderId}/{document=**} {
      allow read, write: if isAuthenticated();
    }

    match /config/{document=**} {
      allow read, write: if isAuthenticated() && hasAdminRole();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Pega el contenido** en el editor

---

### PASO 3: Publicar las Reglas

1. Haz clic en el botón **"Publicar"** en la esquina inferior derecha
2. **Espera a que se publique** (verás una confirmación)
3. Verifica que no haya errores de sintaxis

---

### PASO 4: Verificar en Firebase Console

Después de publicar:
1. Abre la pestaña **"Datos"** en Firestore
2. Expande las colecciones
3. Verifica que puedas leer:
   - `products` ✓
   - `categories` ✓
   - `subcategories` ✓
   - etc.

---

## 🧪 TESTING INMEDIATO

### Test 1: Lectura Pública (Sin autenticación)

```bash
# En Firebase Console, abre Firestore
# Selecciona colección "products"
# Debería mostrar los productos SIN necesidad de estar autenticado ✓
```

### Test 2: Escritura Admin

```bash
# En tu aplicación Next.js, intenta crear un producto como admin
# Debería funcionar si eres admin autenticado ✓
```

### Test 3: Primer Admin

```bash
# Si es la PRIMERA VEZ que creas un admin:
# - Usuario autenticado intenta crear documento en adminUsers
# - Debería funcionar incluso sin ser admin aún ✓
```

### Test 4: Control de Página Pública

```bash
# Intenta escribir en public_site_status como super admin
# Debería funcionar ✓

# Intenta escribir como admin regular
# Debería FALLAR ✗
```

### Test 5: Mantenimiento Admin

```bash
# Intenta leer admin_settings como admin regular
# Debería funcionar ✓

# Intenta escribir como admin regular
# Debería FALLAR ✗

# Intenta escribir como super admin
# Debería funcionar ✓
```

---

## 🔍 CAMBIOS PRINCIPALES

### ✅ CAMBIO 1: Función `isSuper()` Agregada
```javascript
function isSuper() {
  return isAuthenticated() && 
         hasAdminRole() &&
         get(...).data.role == "super";
}
```
**Por qué:** Para verificar si el usuario es SUPER admin (no solo admin regular)

---

### ✅ CAMBIO 2: adminUsers - Lectura Mejorada
```javascript
// ANTES (INCORRECTO)
allow read: if isAuthenticated() && hasAdminRole();

// AHORA (CORRECTO)
allow read: if isAuthenticated() && 
              (request.auth.uid == userId || hasAdminRole());
```
**Por qué:** Permite que un usuario lea su PROPIO documento

---

### ✅ CAMBIO 3: adminUsers - Crear Primer Admin
```javascript
// ANTES (INCORRECTO)
allow create: if isAuthenticated() && 
                 validateAdminStructure() &&
                 (request.auth.uid == userId || hasAdminRole());

// AHORA (CORRECTO)
allow create: if isAuthenticated() && 
                 validateAdminStructure() &&
                 (request.auth.uid == userId || 
                  isSuper() ||
                  !exists(/databases/$(database)/documents/adminUsers));
```
**Por qué:** Permite crear el PRIMER admin sin necesidad de que exista uno previo

---

### ✅ CAMBIO 4: validateProductStructure() Mejorada
```javascript
// ANTES (INCORRECTO)
let hasSubcategory = 'subcategory' in product && product.subcategory != '';
return !hasSubcategory || exists(...);

// AHORA (CORRECTO)
let hasSubcategory = 'subcategory' in product && 
                     product.subcategory != '' &&
                     product.subcategory != null;
if (!hasSubcategory) return true;
return exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
```
**Por qué:** Hace la subcategoría verdaderamente opcional

---

### ✅ CAMBIO 5: public_site_status - Nuevas Reglas
```javascript
match /public_site_status/{document=**} {
  allow read: if true;
  allow write: if isAuthenticated() && isSuper();
}
```
**Por qué:** Agregar soporte para PublicSiteControl

---

### ✅ CAMBIO 6: admin_settings - Nuevas Reglas
```javascript
match /admin_settings/{document=**} {
  allow read: if isAuthenticated() && hasAdminRole();
  allow write: if isAuthenticated() && isSuper();
}
```
**Por qué:** Agregar soporte para Modo Mantenimiento Admin

---

## 📋 CHECKLIST POST-APLICACIÓN

- [ ] Reglas publicadas en Firebase
- [ ] Sin errores de sintaxis
- [ ] Lectura pública de productos funciona
- [ ] Admin puede crear productos
- [ ] Primer admin puede crearse
- [ ] Admin regular NO puede cambiar public_site_status
- [ ] Super admin SÍ puede cambiar public_site_status
- [ ] Admin regular NO puede escribir en admin_settings
- [ ] Super admin SÍ puede escribir en admin_settings
- [ ] Error "Permission denied" ha desaparecido

---

## 🆘 SI ALGO SALE MAL

### Error: "Permission denied"

**1. Verifica que estés autenticado:**
```typescript
const auth = getAuth(app)
console.log(auth.currentUser) // Debe mostrar usuario
```

**2. Verifica tu rol:**
```typescript
const role = localStorage.getItem("adminRole")
console.log(role) // Debe ser "admin" o "super"
```

**3. Verifica que el documento adminUsers exista:**
```javascript
// En Firestore Console
// adminUsers/{tu_uid} debe existir
// Con campos: email, role, createdAt
```

**4. Revisa la consola de errores:**
```
Si ves: "Missing or insufficient permissions"
→ Las reglas denegan la acción
→ Verifica los pasos anteriores
```

---

## 🔄 ROLLBACK (Si necesitas volver atrás)

Si las nuevas reglas causan problemas:

1. Ve a Firebase Console → Firestore → Reglas
2. Haz clic en **"Ver historial"**
3. Selecciona la versión anterior
4. Haz clic en **"Restaurar"**

---

## 📞 SOPORTE

### Para entender las reglas en detalle:
→ [ANALISIS_ERROR_FIRESTORE_PERMISSIONS.md](ANALISIS_ERROR_FIRESTORE_PERMISSIONS.md)

### Para ver las reglas correctas:
→ [FIRESTORE_RULES_CORREGIDAS.txt](FIRESTORE_RULES_CORREGIDAS.txt)

### Para documentación oficial:
→ [Firebase Security Rules Docs](https://firebase.google.com/docs/firestore/security/start)

---

**Implementación estimada: 5 minutos**

**Resultado esperado:** ✅ Error "Permission denied" resuelto

Versión: 1.0  
Fecha: 19 de Enero de 2026
