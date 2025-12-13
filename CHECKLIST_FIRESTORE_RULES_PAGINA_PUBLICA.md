# 📋 Checklist: Actualización de Reglas Firestore

## ⚠️ IMPORTANTE
Las reglas de Firestore DEBEN ser actualizadas para que funcione correctamente el control de página pública. Sin esto, los cambios no se guardarán.

---

## 🔄 Pasos para Actualizar las Reglas

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. En el menú izquierdo, ve a **Firestore Database**

### Paso 2: Ir a Reglas de Seguridad
1. Haz clic en la pestaña **"Rules"** (Reglas)
2. Verás el editor de reglas actual

### Paso 3: Copiar las Nuevas Reglas
1. Abre el archivo: `FIRESTORE_RULES_UPDATED.txt`
2. Copia TODO el contenido (desde `rules_version` hasta el último `}`)
3. Pega en el editor de Firebase Console

### Paso 4: Verificar Cambios
Los cambios principales son:
- ✅ Nueva sección para `match /settings/{document=**}` 
- ✅ Lectura pública permitida
- ✅ Escritura solo para autenticados

```firestore
// NUEVO: Soporte para control de página pública
match /settings/{document=**} {
  allow read: if true;              // Cualquiera puede leer
  allow write: if request.auth != null;  // Solo autenticados pueden escribir
}
```

### Paso 5: Publicar Reglas
1. Haz clic en **"Publish"** (Publicar)
2. Espera a que aparezca "Rules updated successfully"
3. ¡Listo! Las reglas están activas

---

## ✅ Verificación de Éxito

Después de publicar, verifica que funciona:

### Test 1: Lectura Pública
1. Abre tu navegador en modo incógnito
2. Ve a `/maintenance` (sin estar logeado)
3. No debería mostrar error de permisos
4. La página debe cargar normalmente

### Test 2: Cambio por Superusuario
1. Inicia sesión como superusuario
2. Ve a `/admin/dashboard`
3. Busca "Control de Página Pública"
4. Haz click en el switch
5. Debería aparece un toast verde: "Éxito"
6. Si ves error rojo, las reglas no se actualizaron correctamente

### Test 3: Verificar en Firestore
1. En Firebase Console
2. Firestore Database
3. Colección: `settings`
4. Documento: `public_site_status`
5. Verifica que tenga:
   - `isPublic`: true/false
   - `lastUpdatedAt`: número (timestamp)
   - `lastUpdatedBy`: string (user ID)

---

## 🔴 Si Algo Sale Mal

### Error: "Permission denied" al cambiar el switch

**Solución:**
1. Verifica que copiaste TODAS las reglas
2. Asegúrate que incluye la sección `/settings/{document=**}`
3. Haz clic en **Publish** nuevamente
4. Espera 30 segundos a que se propague
5. Recarga la página

### Error: "Document not found" al cambiar el switch

**Solución:**
1. Las reglas deben permitir `create` implícitamente en `write`
2. Verifica que tu regla diga: `allow write: if request.auth != null;`
3. No debe decir `allow update:` solo, debe ser `write:`
4. Republica las reglas

### No aparece el control en admin

**Solución:**
1. Verifica que estés logeado como superusuario
2. Abre la consola (F12) y busca errores
3. Si hay error de importación, verifica que:
   - `lib/public-site-status.ts` existe
   - `components/admin/public-site-control.tsx` existe
4. Recarga la página

---

## 📊 Reglas Completas Actualizadas

Si necesitas copiar manualmente, aquí están:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // PRODUCTOS - LECTURA PÚBLICA, ESCRITURA PROTEGIDA
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // CATEGORÍAS - LECTURA PÚBLICA, ESCRITURA PROTEGIDA
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ⭐ NUEVO: CONFIGURACIÓN (INCLUYENDO PÁGINA PÚBLICA)
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // USUARIOS ADMIN
    match /adminUsers/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // ÓRDENES
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }

    // CONFIGURACIÓN
    match /config/{document=**} {
      allow read, write: if request.auth != null;
    }

    // REGLA POR DEFECTO
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 💾 Archivo Fuente

El archivo exacto a copiar está en:
- **Ruta**: `FIRESTORE_RULES_UPDATED.txt`
- **Ubicación**: Raíz del proyecto

---

## 🎯 Resumen

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Acceder a Firebase Console | ⬜ |
| 2 | Ir a Firestore > Rules | ⬜ |
| 3 | Copiar de `FIRESTORE_RULES_UPDATED.txt` | ⬜ |
| 4 | Pegar en editor | ⬜ |
| 5 | Publicar | ⬜ |
| 6 | Esperar 30 segundos | ⬜ |
| 7 | Verificar en admin | ⬜ |
| 8 | Probar cambios | ⬜ |

---

## 🆘 Ayuda Rápida

**¿Dónde está el botón Publish?**
→ Arriba a la derecha del editor de reglas

**¿Cuánto tarda en aplicarse?**
→ Generalmente 10-30 segundos

**¿Puedo hacer cambios mientras se propaga?**
→ No recomendado. Espera a que diga "Rules updated successfully"

**¿Las reglas antiguas se pierden?**
→ Se reemplazan completamente, no se combinan

**¿Cómo sé si funcionó?**
→ Intenta cambiar el switch en admin y mira el toast

---

**✅ Una vez completado, el control de página pública funcionará perfectamente**
