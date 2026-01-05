# 🔐 FIRESTORE RULES ACTUALIZADAS PARA VERCEL

## ❌ Error Actual

```
[FirebaseError]: 7 PERMISSION_DENIED: Permisos faltantes o insuficientes
```

Este error ocurre cuando las reglas de Firestore no permiten las operaciones que tu aplicación intenta realizar.

---

## ✅ SOLUCIÓN: Nuevas Reglas de Firestore

### 📋 Qué cambió

Las reglas anteriores permitían lectura pública pero con permisos insuficientes para operaciones más complejas. Las nuevas reglas incluyen:

1. ✅ **Lectura pública completa** para todas las colecciones públicas
2. ✅ **Escritura admin** con validaciones específicas
3. ✅ **Autenticación flexible** para APIs y métodos privados
4. ✅ **Validaciones jerárquicas** para productos y subcategorías

---

## 🚀 PASOS PARA IMPLEMENTAR EN FIREBASE CONSOLE

### 1. Accede a Firebase Console

```
https://console.firebase.google.com/
→ Selecciona proyecto: ubatech-a8650
```

### 2. Ve a Firestore Database

```
Base de datos en tiempo real
  → Firestore Database
    → Rules
```

### 3. Reemplaza las reglas actuales

**COPIAR COMPLETAMENTE** el contenido del archivo:
- `FIRESTORE_RULES_VERCEL.txt` (en la raíz del proyecto)

**Y pégalo** en el editor de reglas de Firebase Console.

### 4. Publica las reglas

```
Botón "Publicar" en Firebase Console
```

### 5. Espera confirmación

```
✅ Las reglas se publican en 2-5 minutos
✅ Verifica que aparezca el mensaje de éxito
```

---

## 🔍 VERIFICAR QUE FUNCIONA

### Test en Firebase Console

1. Ve a la pestaña **"Rules"** en Firestore
2. Haz clic en **"Test Rules"** (parte superior derecha)
3. Prueba una lectura:

```
Collection: products
Document: (cualquiera)
Request Type: get
Auth: none (Desautenticado)
```

**Resultado esperado**: ✅ Permitido (allow)

### Test en tu aplicación

En el navegador, abre la consola y ejecuta:

```javascript
// Test 1: Leer productos (sin autenticación)
fetch('https://tu-vercel-url/api/debug/products')
  .then(r => r.json())
  .then(console.log)

// Test 2: Leer categorías
fetch('https://tu-vercel-url/api/debug/categories')
  .then(r => r.json())
  .then(console.log)

// Test 3: Leer subcategorías
fetch('https://tu-vercel-url/api/debug/subcategories')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔐 ESTRUCTURAS DE DATOS SOPORTADAS

### Productos

```json
{
  "id": "auto",
  "name": "NOTE14PRO+",
  "category": "Celulares",           // Nombre de categoría
  "subcategory": "sub_redmi_001",    // ID de subcategoría (opcional)
  "price": 1560000,
  "stock": 1,
  "image": "url",
  "description": "...",
  "createdAt": "2025-12-13T...",
  "updatedAt": "2025-12-13T..."
}
```

### Categorías

```json
{
  "id": "auto",
  "name": "Celulares",
  "createdAt": "2025-12-13T..."
}
```

### Subcategorías

```json
{
  "id": "auto",
  "name": "Redmi",
  "categoryId": "cat_001",           // ID de categoría (requerido)
  "createdAt": "2025-12-13T...",
  "updatedAt": "2025-12-13T..."
}
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Permission denied al leer productos"

**Causa**: Las reglas no permiten lectura pública

**Solución**: 
```
Verifica que la regla de /products/ tenga:
allow read: if true;
```

### Problema 2: "Permission denied al escribir como admin"

**Causa**: El usuario no está configurado como admin

**Solución**:
```javascript
1. Ve a Firebase Console
2. Firestore Database → Data
3. Colección: adminUsers
4. Crea documento con:
   - ID: Tu UID de Firebase
   - Campo: role = "admin"

O desde código:
const adminDoc = doc(db, "adminUsers", user.uid);
await setDoc(adminDoc, { role: "admin" });
```

### Problema 3: "Error al crear subcategoría"

**Causa**: Falta el campo `categoryId`

**Solución**:
```javascript
// ❌ Incorrecto
await addDoc(collection(db, "subcategories"), {
  name: "Redmi"
});

// ✅ Correcto
await addDoc(collection(db, "subcategories"), {
  name: "Redmi",
  categoryId: "cat_001"  // REQUERIDO
});
```

### Problema 4: "Error al crear producto con subcategoría"

**Causa**: El ID de subcategoría no existe

**Solución**:
```javascript
// ✅ Primero crea la subcategoría
const subRef = await addDoc(collection(db, "subcategories"), {
  name: "Redmi",
  categoryId: "cat_001"
});

// Luego crea el producto
await addDoc(collection(db, "products"), {
  name: "NOTE14PRO+",
  category: "Celulares",
  subcategory: subRef.id  // Usar el ID devuelto
});
```

---

## 📊 PERMISOS POR OPERACIÓN

| Operación | Usuario | Admin | Anonimo |
|-----------|---------|-------|---------|
| Leer productos | ✅ | ✅ | ✅ |
| Crear producto | ❌ | ✅ | ❌ |
| Editar producto | ❌ | ✅ | ❌ |
| Eliminar producto | ❌ | ✅ | ❌ |
| Leer categorías | ✅ | ✅ | ✅ |
| Crear categoría | ❌ | ✅ | ❌ |
| Leer subcategorías | ✅ | ✅ | ✅ |
| Crear subcategoría | ❌ | ✅ | ❌ |
| Leer órdenes propias | ✅ | ✅ | ❌ |
| Crear orden | ✅ | ✅ | ❌ |

---

## 🔄 DESPUÉS DE ACTUALIZAR LAS REGLAS

### 1. Reinicia los servidores

```bash
# En tu terminal
npm run dev

# O en Vercel:
# → Redeploy del proyecto
```

### 2. Borra el caché del navegador

```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
→ Selecciona "Cookies y archivos almacenados"
→ Eliminar datos
```

### 3. Prueba nuevamente

Recarga tu aplicación e intenta:
- Cargar productos
- Cargar categorías
- Crear un producto (si eres admin)

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Copié las reglas del archivo FIRESTORE_RULES_VERCEL.txt
- [ ] Actualicé las reglas en Firebase Console
- [ ] Publiqué los cambios
- [ ] Esperé 5 minutos a que se propaguen
- [ ] Probé lectura de productos
- [ ] Probé lectura de categorías
- [ ] Probé lectura de subcategorías
- [ ] Verifiqué que es admin en adminUsers
- [ ] Probé crear/editar productos como admin
- [ ] Reinicié el servidor local
- [ ] Reinicié Vercel (si está deployado)
- [ ] Borré caché del navegador

---

## 🎯 RESULTADO ESPERADO

Después de implementar estas reglas:

```
✅ Lectura de datos públicos sin permisos
✅ Escritura de datos solo para admin
✅ Validación de estructura de productos
✅ Validación de estructura de subcategorías
✅ Sin errores PERMISSION_DENIED
✅ Funcionamiento en Vercel sin problemas
```

---

## 📞 SI SIGUE SIN FUNCIONAR

Si después de todos estos pasos sigue el error:

1. Verifica en Firebase Console que el proyecto es **ubatech-a8650**
2. Abre la consola del navegador (F12)
3. Ve a la pestaña **"Network"**
4. Intenta cargar productos
5. Busca peticiones a **firestore.googleapis.com**
6. Revisa el error completo en la respuesta

Luego contacta con el soporte con:
- El mensaje de error completo
- La URL de la petición
- El UID del usuario (si es necesario)

---

## 📚 REFERENCIAS

- [Documentación Firestore Rules](https://firebase.google.com/docs/firestore/security/start)
- [Guía de Seguridad Firebase](https://firebase.google.com/docs/rules)
- [Ejemplos de Reglas](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**Actualizado**: 2025-12-13  
**Versión**: 1.0  
**Estado**: Listo para Vercel ✅
