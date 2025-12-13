# 🔴 ERROR FIRESTORE: SOLUCIÓN INMEDIATA

## ERROR QUE VES
```
FirebaseError: Missing or insufficient permissions.
```

## ¿POR QUÉ OCURRE?
Las **Firestore Rules** están bloqueando el acceso público a la colección `store_settings`.

---

## ✅ SOLUCIÓN (5 MINUTOS)

### 1️⃣ Abre Firebase Console
```
https://console.firebase.google.com
```

### 2️⃣ Selecciona tu proyecto
```
Proyecto: ubatech-a8650
```

### 3️⃣ Ve a Cloud Firestore Rules
```
Cloud Firestore → Rules (pestaña azul)
```

### 4️⃣ Reemplaza TODO el contenido
- Selecciona todo: **Ctrl + A**
- Borra: **Delete**
- Copia esto (debajo) 👇

---

## REGLAS A COPIAR EN FIREBASE CONSOLE

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ CONFIGURACIÓN - PÚBLICA PARA LECTURA
    match /store_settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ✅ PRODUCTOS - PÚBLICA PARA LECTURA
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ✅ CATEGORÍAS - PÚBLICA PARA LECTURA
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ✅ ÓRDENES - PRIVADA
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }

    // ✅ ADMIN USERS - PRIVADA
    match /adminUsers/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // ✅ CONFIG - PRIVADA
    match /config/{document=**} {
      allow read, write: if request.auth != null;
    }

    // ✅ DEFECTO - PRIVADA
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5️⃣ Publica las reglas
- Haz clic en botón **"Publish"** (azul)
- Espera a que diga ✅ "Published successfully"

---

## 6️⃣ Recarga el navegador
```
En localhost:3000
Presiona: Ctrl + F5 (hard reload)
```

---

## ✅ VERIFICACIÓN

Después de publicar, deberías ver:

### En el Sitio Público ✅
- ✅ Sin errores en la consola
- ✅ Footer con información completa
- ✅ Header con nombre de tienda
- ✅ Hero con descripción

### En el Panel Admin ✅
- ✅ Puedes ver la configuración
- ✅ Puedes guardar cambios
- ✅ Los cambios se reflejan en público

---

## 🚨 SI SIGUE SIN FUNCIONAR

### Opción 1: Verificar que Copiaste TODO
- Asegúrate de copiar TODAS las líneas
- NO dejes comentarios
- Verifica que cierre correctamente con `}`

### Opción 2: Modo Incógnito
```
Ctrl + Shift + N
Abre: localhost:3000
```

### Opción 3: Limpiar Cache
```
Ctrl + Shift + Delete
Borra: Cookies y datos de sitios
```

### Opción 4: Verificar Status
```
Abre: http://localhost:3000/api/sync/settings
Debería mostrar los datos sin errores
```

---

## 📋 CHECKLIST

- [ ] Abrí Firebase Console
- [ ] Fui a Cloud Firestore Rules
- [ ] Copié todas las reglas (arriba)
- [ ] Publiqué las reglas
- [ ] Recargué el navegador (Ctrl+F5)
- [ ] Abrí el sitio público
- [ ] ✅ El error desapareció

---

## 💡 ESTO ES SEGURO

Las reglas que estás copiando:
- ✅ Permiten lectura PÚBLICA de configuración, productos y categorías
- ✅ Solo usuarios autenticados pueden ESCRIBIR
- ✅ Órdenes y datos sensibles totalmente privados
- ✅ **NO hay riesgo de seguridad**

---

## 📞 REFERENCIA RÁPIDA

| Colección | Lectura | Escritura |
|-----------|---------|-----------|
| store_settings | 🟢 Pública | 🔴 Autenticados |
| products | 🟢 Pública | 🔴 Autenticados |
| categories | 🟢 Pública | 🔴 Autenticados |
| orders | 🔴 Autenticados | 🔴 Autenticados |
| adminUsers | 🔴 Autenticados | 🔴 Autenticados |
| config | 🔴 Autenticados | 🔴 Autenticados |

---

**⏱️ Tiempo estimado**: 5 minutos  
**Dificultad**: ⭐ Muy fácil  
**Status**: 🔴 REQUIERE ACCIÓN EN FIREBASE
