# Análisis: Error "Missing or insufficient permissions" - Firestore Rules

**Fecha:** 19 de Enero de 2026  
**Versión:** 1.0

---

## 🔍 Análisis de las Reglas Actuales

### PROBLEMAS IDENTIFICADOS

#### ⚠️ PROBLEMA 1: AdminUsers - Lectura Muy Restrictiva
```javascript
match /adminUsers/{userId} {
  allow read: if isAuthenticated() && hasAdminRole();
  // ❌ Un admin user NO PUEDE leer su PROPIO documento
  //    porque necesita que OTRO admin exista primero
}
```

**Escenario del error:**
1. Usuario intenta leer `/adminUsers/{su_uid}` 
2. Sistema verifica: `isAuthenticated()` ✓ + `hasAdminRole()` ✓
3. Pero `hasAdminRole()` verifica que exista el documento en `adminUsers`
4. Si es el primer admin, el documento no existe aún
5. **RESULTADO: Permission Denied** ❌

**SOLUCIÓN:**
```javascript
match /adminUsers/{userId} {
  allow read: if isAuthenticated() && 
              (request.auth.uid == userId || hasAdminRole());
  // Permitir lectura del PROPIO documento
}
```

---

#### ⚠️ PROBLEMA 2: validateProductStructure() - Subcategoría Obligatoria
```javascript
function validateProductStructure() {
  let hasSubcategory = 'subcategory' in product && product.subcategory != '';
  return !hasSubcategory || 
         exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
}
```

**Escenario del error:**
1. Usuario crea producto SIN especificar subcategoría
2. Validación intenta verificar: `!hasSubcategory` = TRUE ✓
3. Debería permitir, pero si `subcategory` es null/undefined, falla
4. O si la subcategoría ID no existe exactamente como en Firestore

**SOLUCIÓN:**
Hacer la subcategoría verdaderamente opcional:
```javascript
function validateProductStructure() {
  let product = request.resource.data;
  let hasSubcategory = 'subcategory' in product && 
                       product.subcategory != '' &&
                       product.subcategory != null;
  // Si NO tiene subcategoría, permitir
  if (!hasSubcategory) return true;
  // Si tiene, verificar que exista
  return exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
}
```

---

#### ⚠️ PROBLEMA 3: AdminUsers - CREATE Circular Dependency
```javascript
match /adminUsers/{userId} {
  allow create: if isAuthenticated() && 
                   validateAdminStructure() &&
                   (request.auth.uid == userId || hasAdminRole());
  // ❌ Para crear el PRIMER admin, necesita ser admin
  //    Pero no hay admin aún = DEADLOCK
}
```

**SOLUCIÓN:**
```javascript
match /adminUsers/{userId} {
  allow read: if isAuthenticated() && 
              (request.auth.uid == userId || hasAdminRole());
  
  allow create: if isAuthenticated() && 
                   validateAdminStructure() &&
                   (request.auth.uid == userId || 
                    hasAdminRole() ||
                    checkIfFirstAdmin()); // Nueva función
  
  allow update: if isAuthenticated() && 
                   hasAdminRole() && 
                   validateAdminStructure();
  
  allow delete: if isAuthenticated() && hasAdminRole();
}

function checkIfFirstAdmin() {
  // Permite crear si no hay admins aún
  return !exists(/databases/$(database)/documents/adminUsers/admin_counter);
}
```

---

#### ⚠️ PROBLEMA 4: PublicSiteControl - No tiene reglas
```javascript
// ❌ NO HAY REGLAS PARA:
// - public_site_status
// - control_page_public
```

Esto causamaría error si el código intenta leer/escribir en estas colecciones.

---

#### ⚠️ PROBLEMA 5: Admin_settings (Modo Mantenimiento) - No tiene reglas
```javascript
// ❌ NO HAY REGLAS PARA:
// - admin_settings/maintenance (Nueva funcionalidad)
```

---

## ✅ SOLUCIONES

### Opción A: Reglas Corregidas y Mejoradas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNCIONES HELPER
    // ============================================
    
    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    function isSuper() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == "super";
    }

    function validateProductStructure() {
      let product = request.resource.data;
      // Subcategoría es OPCIONAL
      if (!('subcategory' in product) || product.subcategory == '' || product.subcategory == null) {
        return true; // Permitir sin subcategoría
      }
      // Si tiene subcategoría, debe existir
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

    function noAdminsExist() {
      return !exists(/databases/$(database)/documents/adminUsers);
    }

    // ============================================
    // REGLAS PÚBLICAS (LECTURA SIN AUTH)
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
    // CONTROL DE PÁGINA PÚBLICA (NUEVA)
    // ============================================
    
    match /public_site_status/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated() && isSuper();
    }

    // ============================================
    // MODO MANTENIMIENTO ADMIN (NUEVA)
    // ============================================
    
    match /admin_settings/{document=**} {
      allow read: if isAuthenticated() && hasAdminRole();
      allow write: if isAuthenticated() && isSuper();
    }

    // ============================================
    // REGLAS PRIVADAS (AUTENTICACIÓN REQUERIDA)
    // ============================================

    match /adminUsers/{userId} {
      // PERMITIR LEER PROPIO DOCUMENTO O SI ES ADMIN
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || hasAdminRole());
      
      // CREAR: O es el PRIMER admin, O es tu propio perfil, O eres super admin
      allow create: if isAuthenticated() && 
                       validateAdminStructure() &&
                       (request.auth.uid == userId || 
                        isSuper() ||
                        !exists(/databases/$(database)/documents/adminUsers)); // Primer admin
      
      allow update: if isAuthenticated() && 
                       hasAdminRole() && 
                       validateAdminStructure();
      
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

    // ============================================
    // REGLA POR DEFECTO - DENEGAR TODO
    // ============================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🔍 CAMBIOS PRINCIPALES

| Problema | Cambio | Por qué |
|----------|--------|--------|
| AdminUsers read | Permitir leer propio doc | Evitar blooqueo del primer admin |
| AdminUsers create | Permitir si no hay admins | Resolver dependency circular |
| ProductStructure | Subcategoría opcional | No todas tienen subcategoría |
| Public_site_status | Nueva regla agregada | Permitir lectura/escritura |
| Admin_settings | Nueva regla agregada | Para modo mantenimiento |
| Admin_settings read | Solo para auth users | Control de visibilidad |

---

## 🧪 TESTING DE LAS REGLAS

### Test 1: Primer Admin (Sin admins aún)
```
1. Usuario NO autenticado intenta crear admin
   → ❌ Denied (necesita auth)

2. Usuario autenticado intenta crear admin
   → ✅ Allowed (primer admin)
   
3. Admin lee su propio documento
   → ✅ Allowed (es su propio doc)
```

### Test 2: Segundo Admin (Ya existe un admin)
```
1. Usuario autenticado (no admin) intenta crear admin
   → ❌ Denied (necesita ser super o primer admin)

2. Super admin crea nuevo admin
   → ✅ Allowed
```

### Test 3: Productos
```
1. Usuario público lee productos
   → ✅ Allowed (true)

2. Admin crea producto SIN subcategoría
   → ✅ Allowed (subcategoría es opcional)

3. Admin crea producto CON subcategoría inválida
   → ❌ Denied (validación falla)

4. Admin crea producto CON subcategoría válida
   → ✅ Allowed
```

### Test 4: Control de Página Pública
```
1. Usuario público intenta leer status
   → ✅ Allowed (lectura pública)

2. Admin regular intenta cambiar status
   → ❌ Denied (solo super)

3. Super admin cambia status
   → ✅ Allowed
```

### Test 5: Admin Settings (Mantenimiento)
```
1. Usuario no autenticado intenta leer
   → ❌ Denied

2. Admin regular intenta leer
   → ✅ Allowed (si está autenticado)

3. Admin regular intenta escribir
   → ❌ Denied (solo super)

4. Super admin escribe
   → ✅ Allowed
```

---

## 🚨 PUNTOS CRÍTICOS A VERIFICAR

### En tu código Next.js:

```typescript
// ❌ ESTO FALLARÁ si no estás autenticado
const status = await getPublicSiteStatus()

// ✅ ESTO FUNCIONARÁ
const status = await getPublicSiteStatus() // Las reglas dicen: allow read if true

// ❌ ESTO FALLARÁ si no eres super admin
await setAdminMaintenanceStatus(true, userId)

// ✅ ESTO FUNCIONARÁ
await setAdminMaintenanceStatus(true, userId) // Si userRole == "super"
```

---

## 📋 CHECKLIST DE CORRECCIÓN

- [ ] Actualizar reglas de Firestore con versión mejorada
- [ ] Probar creación del PRIMER admin
- [ ] Probar lectura de admin user propio
- [ ] Probar creación de productos sin subcategoría
- [ ] Probar public_site_status (lectura/escritura)
- [ ] Probar admin_settings (lectura/escritura)
- [ ] Verificar no hay errores en console
- [ ] Testing con admin regular
- [ ] Testing con super admin

---

## 💡 RECOMENDACIONES ADICIONALES

1. **Agregar indexación** en Firestore para consultas frecuentes
2. **Agregar logging** de fallos de permisos para debugging
3. **Considerar roles más granulares** en futuro (editor, viewer, etc)
4. **Documentar las reglas** en comentarios para el equipo

---

**Versión:** 1.0  
**Última actualización:** 19 de Enero de 2026
