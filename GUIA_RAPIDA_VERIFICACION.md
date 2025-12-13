# 🔍 GUÍA RÁPIDA: Verificar que Todo Funciona

**⏱️ Tiempo:** 5 minutos  
**📋 Requisitos:** Tu app ejecutándose en localhost:3000  

---

## ✅ PASO 1: Verificar Datos en Firestore (30 segundos)

```
URL: http://localhost:3000/api/debug/diagnostic
```

**Copypaste en tu navegador ↑**

### ¿Qué esperar?

```json
{
  "success": true,
  "data": {
    "categories": { "count": 3 },        // ✅ Debe ser > 0
    "subcategories": { "count": 8 },     // ✅ Debe ser > 0
    "products": { "count": 15 },         // ✅ Debe ser > 0
    "storeSettings": { "exists": true }, // ✅ Debe ser true
    "platformInfo": { "count": 1 }       // ✅ Puede ser 0 o 1
  }
}
```

**Si algo dice 0 o false:**
- ❌ Crea datos en Firestore primero
- Ve a: Panel Admin → Gestión de Categorías

---

## ✅ PASO 2: Crear Producto (1 minuto)

```
URL: http://localhost:3000/admin/dashboard
```

### Sigue estos pasos:

1. **Ve a:** Gestión de Productos
2. **Haz clic en:** "+ Agregar Producto"
3. **Rellena:**
   - Nombre: "Samsung Galaxy A14"
   - Precio: 299.99
   - Stock: 50
4. **Selecciona categoría:** (cualquiera que exista)

### ⭐ MOMENTO CRÍTICO:

5. **¿Apareció dropdown de "Subcategoría"?**
   - ✅ **SÍ** → Funciona correctamente
   - ❌ **NO** → Ver "Solucionar problemas" abajo

6. **¿Se cargaron subcategorías?**
   - ✅ **SÍ** → Selecciona una
   - ❌ **NO** → La categoría no tiene subcategorías

7. **Haz clic en:** Guardar

### ✅ Resultado esperado:

Producto aparece en la lista con:
- ✅ Nombre correcto
- ✅ Categoría correcta
- ✅ Subcategoría mostrada

---

## ✅ PASO 3: Filtrar en Página Pública (1 minuto)

```
URL: http://localhost:3000
```

### Sigue estos pasos:

1. **Ve a:** Sección "Nuestros Productos"
2. **Haz clic en:** Una categoría

### ⭐ VERIFICAR:

3. **¿Aparecen productos de esa categoría?**
   - ✅ **SÍ** → Funciona
   - ❌ **NO** → Ver "Solucionar problemas"

4. **¿Aparece sección "Marcas" a la izquierda?**
   - ✅ **SÍ** → La categoría tiene subcategorías
   - ❌ **NO** → La categoría no tiene subcategorías

5. **Haz clic en:** Una marca

### ✅ Resultado esperado:

- ✅ Productos filtrados por esa marca
- ✅ Solo productos de esa subcategoría

---

## ✅ PASO 4: Sincronización en Vivo (2 minutos)

### Preparar:

**Abre 2 pestañas:**

**Pestaña A (Admin - Configuración):**
```
http://localhost:3000/admin/dashboard
→ Ve a: Configuración
```

**Pestaña B (Público):**
```
http://localhost:3000
```

### Hacer cambio:

**En Pestaña A:**
1. Cambia "Nombre de tienda": "Ubatech+Pro" → "TEST123"
2. Haz clic en: "Guardar Configuración"
3. Espera 2 segundos

**En Pestaña B:**
1. Mira el Header (arriba)
2. ¿Cambió a "TEST123"?

### ✅ Resultado esperado:

- ✅ El cambio aparece en 1-3 segundos
- ✅ NO necesitas refrescar

---

## ❌ Solucionar Problemas

### Problema 1: "No hay categorías disponibles"

**Significa:** No hay categorías en Firestore

**Solución:**
1. Panel Admin → Gestión de Categorías
2. Crea al menos 1 categoría
3. Intenta crear producto nuevamente

---

### Problema 2: Dropdown de subcategoría no se habilita

**Significa:** La categoría seleccionada no tiene subcategorías

**Solución:**
1. Panel Admin → Gestión de Categorías
2. Expande la categoría
3. Agrega al menos 1 subcategoría
4. Intenta crear producto nuevamente

---

### Problema 3: Filtros no funcionan

**Significa:** Productos no están asociados a esa categoría

**Solución:**
1. Ejecuta: `/api/debug/diagnostic`
2. Busca "PRODUCTOS" → "Muestra (primeros 5)"
3. Verifica que `category` sea exacto al nombre de categoría
4. Crea productos nuevos con categoría correcta

---

### Problema 4: Sincronización lenta

**Significa:** Admin → Público tarda más de 5 segundos

**Solución:**
1. Recarga página pública (F5)
2. Ejecuta: `/api/debug/diagnostic`
3. Verifica que store_settings tenga datos nuevos

---

## 🔍 Verificar Console (Opcional)

**Presiona:** F12 en navegador  
**Ve a:** Console

**Deberías ver:**
```
✅ [Hook] Store settings cargados desde Firestore en tiempo real
✅ [Hook Platform] Platform info cargada desde Firestore
```

**NO deberías ver:**
```
❌ [Firebase] Missing or insufficient permissions
❌ Cannot read property...
```

---

## 📋 Resumen de Cambios

Lo que se corrigió:

| Área | Antes | Después |
|------|-------|---------|
| **Crear Producto** | ❌ Subcategorías no cargaban | ✅ Carga automática |
| **Filtros Públicos** | ❌ Inconsistentes | ✅ Consistentes |
| **Sincronización** | ⏱️ 10+ segundos | ⚡ 1-3 segundos |
| **Red** | 📊 Polling cada 5s | 📊 Solo cambios |

---

## 🎯 TL;DR (Muy Corto)

1. Abre: `/api/debug/diagnostic` → ✅ Verifica count > 0
2. Crea producto → ✅ Subcategorías cargan
3. Filtra en público → ✅ Funciona
4. Sincronización → ✅ 1-3 segundos

**Si todo dice ✅:** ¡LISTO! 🚀

---

**Creado:** 10 de Diciembre de 2025
