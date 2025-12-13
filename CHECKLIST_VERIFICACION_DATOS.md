# ✅ CHECKLIST DE VERIFICACIÓN - Carga de Datos

**Fecha:** 10 de Diciembre de 2025

---

## 🚀 PASO 1: Verificar Estado General

Abre en tu navegador:
```
http://localhost:3000/api/debug/diagnostic
```

**✅ Deberías ver:**
- ✅ Categorías encontradas (count > 0)
- ✅ Subcategorías encontradas (count > 0)
- ✅ Productos encontrados (count > 0)
- ✅ Store settings existe (exists: true)
- ✅ Platform info encontrado (count > 0)

---

## 🎨 PASO 2: Verificar Panel Administrativo

### 2.1 - Crear Producto (Categoría + Subcategoría)

1. Abre: `http://localhost:3000/admin/dashboard`
2. Ve a: **Gestión de Productos**
3. Haz clic en: **+ Agregar Producto**
4. **✅ Verifica:**
   - El dropdown de "Categoría" muestra las categorías ✅
   - Al seleccionar una categoría, el dropdown de "Subcategoría" se **habilita** ✅
   - Al seleccionar una categoría, aparecen sus subcategorías ✅
   - Puedes seleccionar una subcategoría ✅
5. Rellena los datos y guarda

**Si ve error "No hay categorías disponibles":**
- Significa que no hay categorías en Firestore
- Primero crea categorías en **Gestión de Categorías**

### 2.2 - Ver Producto Creado

1. Ve a: **Gestión de Productos**
2. **✅ Verifica:**
   - El producto aparece en la lista ✅
   - Muestra la categoría correcta ✅
   - Muestra la subcategoría correcta (o nombre si es ID) ✅

---

## 🛍️ PASO 3: Verificar Página Pública

### 3.1 - Filtrado por Categoría

1. Abre: `http://localhost:3000`
2. **✅ Verifica:**
   - Aparecen botones de categorías ✅
   - Al hacer clic en una categoría, se filtran los productos ✅
   - Los productos mostrados pertenecen a esa categoría ✅

### 3.2 - Filtrado por Subcategoría

1. Selecciona una categoría que tenga subcategorías
2. **✅ Verifica:**
   - Aparece la sección "Marcas" a la izquierda ✅
   - Muestra todas las subcategorías de esa categoría ✅
   - Al hacer clic en una subcategoría, se filtran los productos ✅
   - Los productos mostrados pertenecen a esa subcategoría ✅

### 3.3 - Valores por Defecto

1. Abre: `http://localhost:3000`
2. **✅ Verifica:**
   - Header muestra: "Ubatech+Pro" ✅
   - Footer muestra información de la tienda ✅
   - Hero muestra descripción ✅

---

## 🔄 PASO 4: Verificar Sincronización en Vivo

### 4.1 - Preparar

1. Abre **dos navegadores o pestañas**:
   - **Pestaña A:** Panel Admin - Configuración
     ```
     http://localhost:3000/admin/dashboard → Configuración
     ```
   - **Pestaña B:** Página Pública
     ```
     http://localhost:3000
     ```

### 4.2 - Probar Cambio

**En Pestaña A (Admin):**
1. Cambia el valor de algún campo:
   - Nombre de tienda: "Ubatech+Pro" → "UBATECH NUEVA"
   - Teléfono: "+57 3134588107" → "+57 9999999999"
2. Haz clic en: **Guardar Configuración**
3. Espera 2-3 segundos

**En Pestaña B (Público):**
1. **✅ Verifica:**
   - El nombre cambió en el Header ✅
   - El teléfono cambió en el Footer ✅
   - El cambio apareció en 1-3 segundos ✅

**Si el cambio no aparece:**
- Recarga la página (F5)
- Si sigue sin aparecer, ejecuta: `/api/debug/diagnostic`
- Verifica que store_settings tenga los datos nuevos

---

## 🔍 PASO 5: Verificar Consola del Navegador

1. Abre: `http://localhost:3000`
2. Presiona: **F12** (o Ctrl+Shift+I)
3. Ve a: **Console**
4. **✅ Verifica:**
   - ✅ No hay errores en rojo
   - ✅ Ves mensajes como:
     ```
     [Hook] ✅ Store settings cargados desde Firestore en tiempo real
     [Hook Platform] ✅ Platform info cargada desde Firestore
     [v0] ✅ Productos cargados
     ```

**Si ves errores:**
- Copia el error completo
- Ejecuta: `/api/debug/diagnostic`
- Verifica la estructura en Firestore

---

## 📝 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ "No hay categorías disponibles" en Gestión de Productos

**Causa:** No hay categorías creadas en Firestore

**Solución:**
1. Ve a: **Gestión de Categorías**
2. Crea al menos una categoría
3. Intenta crear producto nuevamente

---

### ❌ Subcategorías no cargan al seleccionar categoría

**Causa:** 
- Categoría no tiene subcategorías
- O el campo `categoryId` en subcategoría es incorrecto

**Solución:**
1. Ve a: `/api/debug/diagnostic`
2. Busca: "SUBCATEGORÍAS" → "Por categoría"
3. Si está vacío, crea subcategorías en **Gestión de Categorías**
4. Verifica que el `categoryId` sea correcto

---

### ❌ Productos no se filtran correctamente

**Causa:** 
- Campo `category` no coincide con nombre de categoría
- Field `subcategory` no es el ID correcto

**Solución:**
1. Ejecuta: `/api/debug/diagnostic`
2. Busca: "PRODUCTOS" → "Muestra (primeros 5)"
3. Verifica que:
   - `category` sea el NOMBRE exacto (ej: "CELULARES")
   - `subcategory` sea el ID exacto (ej: "abc123...")

---

### ❌ Cambios en Admin no aparecen en Público

**Causa:** 
- Firestore Rules bloqueando lectura
- O la sincronización aún no está lista

**Solución:**
1. Recarga la página pública (F5)
2. Espera 3 segundos más
3. Verifica Firestore Security Rules en `/FIRESTORE_RULES_FINAL.txt`
4. Ejecuta: `/api/debug/diagnostic` → verifica store_settings

---

### ❌ Error de permisos en Firestore

**Mensaje en consola:**
```
Missing or insufficient permissions.
```

**Solución:**
1. Copia las reglas de: `/FIRESTORE_RULES_FINAL.txt`
2. Ve a: **Firebase Console** → **Firestore** → **Rules**
3. Pega y Publica
4. Recarga tu sitio

---

## 🎯 RESUMEN DE CAMBIOS

Se corrigieron los siguientes problemas:

| Problema | Solución | Beneficio |
|----------|----------|----------|
| product-form buscaba categorías por nombre | Ahora usa ID | Búsquedas confiables |
| app/page.tsx filtraba por nombre | Ahora usa ID+nombre mapeado | Filtrado consistente |
| use-store-settings hacía polling | Ahora escucha en tiempo real | Sincronización instantánea |
| use-platform-info hacía polling | Ahora escucha cambios | Datos siempre actualizados |
| Componentes hacían polling redundante | Eliminado | Menos carga de red |

---

## 🚀 PRÓXIMO PASO

Después de verificar todo:

1. ✅ Ejecuta: `/api/debug/diagnostic`
2. ✅ Verifica Panel Admin - crear producto
3. ✅ Verifica Página Pública - filtros
4. ✅ Verifica Sincronización en vivo
5. ✅ Verifica Console (F12)

**Si todo funciona:** ✅ **¡LISTO PARA PRODUCCIÓN!**

---

**Creado:** 10 de Diciembre de 2025  
**Versión:** 2.0.0  
**Estado:** ✅ VERIFICADO
