# 🔥 Solución: Error "Missing or insufficient permissions" en Firestore

## 🔴 El Problema

Cuando intentas acceder a la tienda pública o cambiar el estado en el panel admin, ves este error:

```
FirebaseError: Missing or insufficient permissions.
```

Esto ocurre en la consola del navegador.

## ❌ Causa Raíz

Las **reglas de Firestore no han sido actualizadas** con la nueva configuración para la colección `settings`.

Sin las reglas correctas, ni siquiera los usuarios autenticados pueden leer/escribir en la colección `settings`.

---

## ✅ Solución: Actualizar Reglas Firestore

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** en el menú izquierdo

### Paso 2: Abre el Editor de Reglas

1. Haz clic en la pestaña **"Rules"** (Reglas)
2. Verás el editor con el código actual

### Paso 3: Reemplaza las Reglas

Tienes dos opciones:

#### **Opción A: Copiar todo (RECOMENDADO)**

1. Abre el archivo: `FIRESTORE_RULES_UPDATED.txt`
2. Copia **TODO** el contenido (desde `rules_version` hasta el último `}`)
3. En Firebase Console, selecciona TODO el código actual (Ctrl+A)
4. Pega el nuevo código
5. Haz clic en **"Publish"**

#### **Opción B: Agregar solo la sección faltante**

Si prefieres solo agregar la nueva sección:

Busca esta sección en tus reglas actuales:
```firestore
// ✅ CONFIGURACIÓN GENERAL
match /config/{document=**} {
  allow read, write: if request.auth != null;
}
```

**Antes de esa sección**, agrega esto:

```firestore
// ✅ CONFIGURACIÓN GENERAL (INCLUYENDO ESTADO DE PÁGINA PÚBLICA)
match /settings/{document=**} {
  // Permitir lectura a todos para verificar estado de página pública
  allow read: if true;
  // Permitir escritura solo a usuarios autenticados (super usuarios)
  allow write: if request.auth != null;
}
```

Luego haz clic en **"Publish"**.

---

## 🔍 Verificar que Funcionó

### Test 1: Lectura Pública (sin estar logeado)

```bash
1. Abre DevTools (F12)
2. Abre una pestaña privada/incógnito
3. Navega a https://tutienda.com/
4. Revisa la consola
5. Debería cargar SIN error de permisos
```

### Test 2: Escritura Autenticada (como admin)

```bash
1. Inicia sesión como superusuario
2. Ve a /admin/dashboard
3. En "Control de Página Pública", haz click en el switch
4. Debería guardar SIN error de permisos
5. Verás toast verde: "Éxito"
```

### Test 3: Verificar en Firestore

```bash
1. Firebase Console
2. Firestore Database
3. Busca colección: "settings"
4. Documento: "public_site_status"
5. Deberías ver los campos actualizados:
   - isPublic: true/false
   - lastUpdatedAt: (número)
   - lastUpdatedBy: (ID de usuario)
```

---

## 📊 Reglas Completas (si quieres reemplazar todo)

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

    // ⭐ NUEVO: CONFIGURACIÓN (PÁGINA PÚBLICA)
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

## 🔴 Si Sigue Sin Funcionar

### 1. Verifica que Publicaste los Cambios

- Deberías ver: **"Rules updated successfully"** (en verde)
- Si ves rojo, hay error en la sintaxis

### 2. Espera 30 Segundos

Las reglas toman tiempo en propagarse. Espera y recarga la página.

### 3. Limpia Caché del Navegador

- Presiona: `Ctrl+Shift+Delete` (Windows) o `Cmd+Shift+Delete` (Mac)
- Selecciona: "Todas" las cookies y datos del sitio
- Recarga la página

### 4. Verifica la Sintaxis

Si ves un error al publicar, busca:
- Falta de llaves `{}`
- Comillas mal cerradas
- Falta de punto y coma `;`

### 5. Contacta al Admin

Si nada funciona, revisa que:
- Estés en el proyecto correcto en Firebase
- Tengas permisos para editar reglas
- Las reglas anteriores no tenían restricciones extra

---

## ⏱️ Timeline

```
Tu acción                  →    Resultado
Publicas reglas           →    Actualizadas en Firebase
                          →    Esperan 10-30 segundos
                          →    Se propagan globalmente
Recarga la página         →    Nueva verificación
                          →    Debería funcionar
```

---

## 📝 Checklist de Resolución

- [ ] Abriste Firebase Console
- [ ] Fuiste a Firestore > Rules
- [ ] Copiaste las reglas nuevas
- [ ] Publicaste los cambios
- [ ] Viste "Rules updated successfully"
- [ ] Esperaste 30 segundos
- [ ] Limpiaste caché del navegador
- [ ] Recargaste la página
- [ ] Probaste acceder a la tienda
- [ ] Probaste cambiar el control de admin
- [ ] Verificaste en Firestore
- [ ] ¡Funcionó! ✅

---

## 🎯 Resumen

| Problema | Causa | Solución |
|----------|-------|----------|
| Error de permisos en tienda | Reglas sin `settings` | Actualizar reglas |
| No guarda cambios en admin | Permisos de escritura | Actualizar reglas |
| Funciona a veces | Caché del navegador | Limpiar caché |
| Sigue sin funcionar | Sintaxis incorrecta | Revisar reglas |

---

**Una vez actualices las reglas, todo debería funcionar correctamente** ✨
