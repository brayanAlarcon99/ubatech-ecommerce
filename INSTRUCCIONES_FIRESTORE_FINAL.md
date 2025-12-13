# 🔐 Configuración de Firestore Rules - Paso a Paso

## ⚠️ IMPORTANTE: Tu sintaxis actual tiene un error

Las reglas que proporcionaste tienen un `match /databases/{database}/documents` anidado incorrectamente, lo que causa errores de sintaxis.

## ✅ SOLUCIÓN - Reglas Corregidas

Copia EXACTAMENTE estas reglas en Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar si es admin
    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }

    // Reglas para la colección de productos
    match /products/{document=**} {
      allow read: if true;
      allow create, update, delete: if true;
    }
    
    // Reglas para la colección de categorías
    match /categories/{document=**} {
      allow read: if true;
      allow create, update, delete: if true;
    }
    
    // Reglas para la colección de subcategorías
    match /subcategories/{document=**} {
      allow read: if true;
      allow create, update, delete: if true;
    }
    
    // Reglas para store_settings
    match /store_settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && hasAdminRole();
    }
    
    // Reglas para platform_info
    match /platform_info/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && hasAdminRole();
    }
    
    // Reglas para adminUsers
    match /adminUsers/{document=**} {
      allow read, write: if request.auth != null && hasAdminRole();
    }

    // Reglas para carrito
    match /cart/{document=**} {
      allow read, write: if true;
    }

    // Reglas para órdenes
    match /orders/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📋 Pasos en Firebase Console

1. **Abre Firebase Console**: https://console.firebase.google.com
2. **Selecciona tu proyecto UbaTech**
3. **Ve a:** Firestore Database → Rules (pestaña "Rules")
4. **Borra TODO lo que hay actualmente**
5. **Pega las reglas corregidas de arriba**
6. **Haz clic en "Publish"** (arriba a la derecha)
7. **Espera a que se publiquen** (toma ~1 minuto)

## ✅ Después de Publicar

1. **Ve a:** http://localhost:3000/admin/init-db
2. **Haz clic en:** "Inicializar Base de Datos"
3. **Espera a que se complete** (verás "✅ Completo")
4. **Se redirigirá a:** http://localhost:3000

## 📦 Qué se creará

✅ 3 Categorías: Celulares, Electrónica, Accesorios
✅ 7 Subcategorías: Samsung, Redmi, iPhone, Laptops, Tablets, Fundas, Protectores
✅ 7 Productos: NOTE14PRO+, Galaxy A13/S23, iPhone 15, Note 13, Laptop Dell, Funda Celular

## 🎯 Resultado Final

- La página principal mostrará las categorías en la barra superior
- Selecciona "Celulares" → verás el menú lateral con subcategorías
- Selecciona "Redmi" → verás el producto NOTE14PRO+
- Al hacer clic en un producto → verás el nombre de la categoría/subcategoría (no el ID)

---

**Archivo de referencia:** `FIRESTORE_RULES_TEMP.txt`
