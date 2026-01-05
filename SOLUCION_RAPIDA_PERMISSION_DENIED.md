# ⚡ GUÍA RÁPIDA - Solucionar Error PERMISSION_DENIED en Vercel

## 🔴 El Error

```
❌ Error inicializando datos: [Error [FirebaseError]: 7 PERMISSION_DENIED: Permisos faltantes o insuficientes.]
```

---

## ✅ SOLUCIÓN RÁPIDA (5 MINUTOS)

### PASO 1: Obtén las nuevas reglas

Abre el archivo: **`FIRESTORE_RULES_VERCEL.txt`** (en la raíz del proyecto)

Copia TODO el contenido.

### PASO 2: Ve a Firebase Console

```
https://console.firebase.google.com/
→ Proyecto: ubatech-a8650
→ Firestore Database
→ Pestaña: Rules
```

### PASO 3: Reemplaza y publica

1. **Selecciona todo** el texto actual en el editor de reglas (Ctrl+A)
2. **Pega** las nuevas reglas (Ctrl+V)
3. **Haz clic** en el botón azul: "Publicar"
4. **Espera** a que aparezca el mensaje verde: ✅ "Se publicaron las reglas"

### PASO 4: Verifica que funciona

En tu navegador (F12 → Consola), ejecuta:

```javascript
fetch('https://tu-vercel-url/api/debug/firestore-diagnostics')
  .then(r => r.json())
  .then(console.log)
```

**Resultado esperado**: Todos los tests deben pasar ✅

---

## 🎯 QURO FUNCIONAN LAS NUEVAS REGLAS

### ✅ Permite:

1. **Lectura pública** de:
   - `products` (productos)
   - `categories` (categorías)
   - `subcategories` (subcategorías)
   - `store_settings` (configuración)
   - `platform_info` (info de plataforma)
   - `settings` (configuración)

2. **Escritura de admin** en:
   - Todos los datos anteriores (solo usuarios admin)

3. **Órdenes** autenticadas:
   - Usuarios normales pueden leer/escribir sus órdenes
   - Usuarios admin pueden leer/escribir todas

### ❌ Deniega:

1. Cualquier operación sin permisos necesarios
2. Escritura de usuarios normales en datos admin
3. Operaciones en colecciones no permitidas

---

## 🔍 VERIFICAR QUE TODO ESTÁ CORRECTO

### Test 1: Firebase Console

```
Firestore Database
→ Rules
→ Click "Test Rules" (arriba a la derecha)
→ Selecciona:
   - Collection: products
   - Document: (cualquiera)
   - Request Type: get
   - Auth: None
→ Resultado esperado: ✅ Allow
```

### Test 2: API Endpoint

```
GET /api/debug/firestore-diagnostics
```

Todos los tests deben mostrar ✅

### Test 3: Cargar datos

```javascript
// En consola del navegador
fetch('https://tu-url/api/products')
  .then(r => r.json())
  .then(d => console.log(d))
```

Debe devolver los productos sin error.

---

## 🚨 SI SIGUE SIN FUNCIONAR

### Checklist:

- [ ] ¿Esperaste 5 minutos después de publicar?
- [ ] ¿Refrescaste la página? (Ctrl+F5)
- [ ] ¿Borraste caché? (Ctrl+Shift+Delete)
- [ ] ¿Redeploy en Vercel? (Settings → Redeploy)
- [ ] ¿Las nuevas reglas se ven en Firebase Console?

### Si aún no funciona:

1. Abre la **consola del navegador** (F12)
2. Observa el error exacto
3. Documenta:
   - El mensaje de error completo
   - La operación que lo causa
   - Tu UID (si es necesario)

---

## 📋 ESTRUCTURA DE DATOS REQUERIDA

Para que funcione correctamente, tus datos en Firestore deben estar así:

### Colección: `products`
```json
{
  "id": "auto",
  "name": "NOTE14PRO+",
  "category": "Celulares",
  "subcategory": "sub_redmi_001",
  "price": 1560000,
  "stock": 1,
  "image": "url"
}
```

### Colección: `categories`
```json
{
  "id": "auto",
  "name": "Celulares"
}
```

### Colección: `subcategories`
```json
{
  "id": "auto",
  "name": "Redmi",
  "categoryId": "cat_001"
}
```

---

## 👨‍💻 PARA ADMIN: Dar permisos de administrador

Si quieres crear/editar productos, necesitas ser admin:

### Opción 1: Firebase Console

```
Firestore Database
→ Collections
→ NEW COLLECTION: "adminUsers"
→ Document ID: Tu UID de Firebase
→ Field: role = "admin"
```

### Opción 2: Desde código

```javascript
import { getAuth } from 'firebase/auth'
import { getDb } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

const auth = getAuth()
const db = getDb()
const user = auth.currentUser

if (user) {
  const adminRef = doc(db, 'adminUsers', user.uid)
  await setDoc(adminRef, { role: 'admin' })
  console.log('✅ Te hiciste admin!')
}
```

---

## 📂 ARCHIVOS RELACIONADOS

| Archivo | Descripción |
|---------|-------------|
| `FIRESTORE_RULES_VERCEL.txt` | Las nuevas reglas (copiar aquí) |
| `IMPLEMENTACION_FIRESTORE_VERCEL.md` | Guía completa con detalles |
| `lib/firebase-diagnostics.ts` | Script de diagnóstico |
| `app/api/debug/firestore-diagnostics/route.ts` | Endpoint para verificar |

---

## ⏱️ TIMELINE

```
0 min:   Copias las nuevas reglas
5 min:   Publicas en Firebase
10 min:  Se propagan los cambios
15 min:  Pruebas y verificas ✅
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Perderé mis datos?**  
R: No, solo cambias las reglas de acceso, no los datos.

**P: ¿Cuánto tiempo tarda en propagarse?**  
R: 2-5 minutos en la mayoría de casos.

**P: ¿Necesito reiniciar la app?**  
R: Sí, recarga la página en el navegador.

**P: ¿Qué pasa si me equivoco?**  
R: Puedes volver a reemplazar las reglas en cualquier momento.

**P: ¿Funciona en Vercel?**  
R: Sí, estas reglas están optimizadas para Vercel.

---

## 🎉 RESULTADO FINAL

Después de completar estos pasos:

✅ Sin errores PERMISSION_DENIED  
✅ Lectura de datos públicos funciona  
✅ Escritura de datos solo para admin  
✅ Compatibilidad con Vercel  
✅ Seguridad Firestore correcta  

---

**Último actualizado**: 2025-12-13  
**Versión**: 1.0  
**Tiempo de implementación**: 5 minutos  
**Nivel de dificultad**: ⭐ Muy Fácil
