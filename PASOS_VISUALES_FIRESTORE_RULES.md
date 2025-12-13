# 🔐 PASOS VISUALES - Actualizar Firestore Rules

## Paso 1: Abre Firebase Console
1. Ve a https://console.firebase.google.com
2. Si ves varios proyectos, asegúrate de estar en **ubatech-a8650**

![Seleccionar proyecto]

## Paso 2: Ve a Firestore Database
1. En el menú lateral izquierdo, haz clic en **Firestore Database**
2. Deberías ver una interfaz similar a esta:

```
┌─────────────────────────────────────┐
│ Firestore Database                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Data | Indexes | Backups | Rules  │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Paso 3: Haz clic en la pestaña "Rules"
1. En la barra superior, haz clic en **"Rules"** (última pestaña)
2. Verás un editor de texto con las reglas actuales

## Paso 4: Selecciona TODO el contenido
1. Usa Ctrl+A (Windows/Linux) o Cmd+A (Mac) para seleccionar todo
2. Presiona Delete o Backspace para borrar todo

## Paso 5: Copia y pega el nuevo contenido

Copia EXACTAMENTE esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar si es admin
    function hasAdminRole() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }

    // Reglas para la colección de productos (lectura pública, escritura admin)
    match /products/{document=**} {
      allow read: if true;
      allow write: if hasAdminRole();
      allow delete: if hasAdminRole();
    }
    
    // Reglas para la colección de categorías (lectura pública, escritura admin)
    match /categories/{document=**} {
      allow read: if true;
      allow write: if hasAdminRole();
      allow delete: if hasAdminRole();
    }
    
    // Reglas para la colección de subcategorías (lectura pública, escritura admin)
    match /subcategories/{document=**} {
      allow read: if true;
      allow write: if hasAdminRole();
      allow delete: if hasAdminRole();
    }
    
    // Reglas para store_settings (lectura pública, escritura admin)
    match /store_settings/{document=**} {
      allow read: if true;
      allow write: if hasAdminRole();
    }
    
    // Reglas para platform_info (lectura pública, escritura admin)
    match /platform_info/{document=**} {
      allow read: if true;
      allow write: if hasAdminRole();
    }
    
    // Reglas para administradores (lectura y escritura solo para admins autenticados)
    match /adminUsers/{document=**} {
      allow read: if hasAdminRole();
      allow write: if hasAdminRole();
      allow create: if hasAdminRole();
      allow delete: if hasAdminRole();
    }

    // Reglas para órdenes
    match /orders/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if hasAdminRole();
    }

    // Reglas para usuarios
    match /users/{document=**} {
      allow read: if request.auth != null && request.auth.uid == resource.id;
      allow write: if request.auth != null && request.auth.uid == resource.id;
      allow delete: if hasAdminRole();
    }
  }
}
```

Y pégalo en el editor.

## Paso 6: Haz clic en PUBLICAR

```
┌────────────────────────────────────────┐
│  Editor de Rules                       │
├────────────────────────────────────────┤
│  [Código aquí]                         │
│                                        │
├────────────────────────────────────────┤
│              ┌──────────┐              │
│              │ PUBLICAR │  ✓ Guardar  │
│              └──────────┘              │
└────────────────────────────────────────┘
```

1. Busca el botón **"PUBLICAR"** en la esquina inferior derecha
2. Haz clic en él

## Paso 7: Espera la confirmación

Deberías ver:
- ✅ Un mensaje que dice "Publicadas"
- ✅ Un checkmark verde
- ✅ Las reglas se actualizarán

```
✅ Publicadas correctamente
Las reglas han sido publicadas.
```

## Paso 8: Recarga la aplicación

1. En VS Code o navegador, recarga la aplicación:
   - Windows: Ctrl + R o F5
   - Mac: Cmd + R

2. Ve a localhost:3000/admin/dashboard

3. ¡Debería funcionar sin errores!

---

## ¿Qué significan las reglas?

| Sección | Lectura | Escritura | Quién |
|---------|---------|-----------|-------|
| Products | ✅ Público | 🔒 Solo admin | Todos pueden ver, solo admin puede crear |
| Categories | ✅ Público | 🔒 Solo admin | Todos pueden ver, solo admin puede crear |
| Subcategories | ✅ Público | 🔒 Solo admin | Todos pueden ver, solo admin puede crear |
| Admin Users | 🔒 Solo admin | 🔒 Solo admin | Privado |
| Orders | ✅ Autenticado | ✅ Autenticado | Solo usuarios registrados |
| Users | 🔒 Solo dueño | 🔒 Solo dueño | Cada usuario ve solo sus datos |

---

## Verificación de que funcionó

### Si ves esto, está correcto:
- ✅ No hay errores en el console del navegador
- ✅ El dashboard carga con estadísticas
- ✅ Los productos muestran categorías
- ✅ Los filtros funcionan

### Si ves errores:
- ❌ "Missing or insufficient permissions" → Las reglas no se publicaron
- ❌ "Document not found" → La colección adminUsers no existe
- ❌ Otros errores → Abre el console (F12) y copia el error

---

## Solución de Problemas

### Error: "Missing or insufficient permissions"
**Causa**: Las reglas antiguas aún están activas
**Solución**: Verifica que hayas hecho clic en PUBLICAR y que el checkmark salió

### Error: "adminUsers does not exist"
**Causa**: No existe la colección adminUsers
**Solución**: Crea manualmente la colección:
1. En Firestore, haz clic en "Crear colección"
2. Nombre: `adminUsers`
3. Agrega un documento con tu UID y un campo `role: "super"`

### El dashboard aún no carga
**Solución**: 
1. Abre F12 (Developer Tools)
2. Ve a Console
3. Busca errores en rojo
4. Copia el error completo y verifica que sea sobre permisos

---

## ✅ Listo!

Después de estos pasos:
1. El error desaparecerá
2. El dashboard cargará correctamente
3. Los productos mostrarán sus categorías
4. Todo debería funcionar perfecto

Si tienes problemas, revisa el archivo:
- `GUIA_FIRESTORE_RULES_ADMIN.md` para más detalles
- `SOLUCION_DASHBOARD_CATEGORIAS.md` para el resumen completo
