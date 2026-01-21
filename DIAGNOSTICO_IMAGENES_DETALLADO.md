# 🔍 DIAGNÓSTICO DETALLADO: POR QUÉ NO SE CARGAN LAS IMÁGENES

**Fecha:** 21 de Enero de 2026  
**Estado:** 🔴 PROBLEMA CONFIRMADO - Imágenes no cargando en PDF

---

## 1. EVIDENCIA DEL PROBLEMA

### PDF Generado Actual
El archivo PDF adjunto **Catalogo_TABLETS_1769013171943.pdf** muestra:
- **15 productos listados**
- **0 imágenes cargadas** (todas muestran "[Sin imagen]")
- Todas las demás columnas funcionan correctamente (nombre, descripción, precio)

### Conclusión Inicial
✅ El PDF se genera correctamente  
❌ Las imágenes NO se cargan  
⚠️ El problema está en `loadImage()` o en los datos de Firebase

---

## 2. ANÁLISIS DEL CÓDIGO ACTUAL

### Función: `loadImage()` (Lines 9-125)

**Estado:** Implementado con dos intentos

```typescript
// Intento 1: Fetch API (líneas 22-67)
const response = await fetch(urlWithCacheBusting, {
  method: 'GET',
  headers: { 'Accept': 'image/*' },
  mode: 'cors',
  cache: 'no-cache',
})

// Intento 2: Image Tag + Canvas (líneas 72-122)
const img = new Image()
img.crossOrigin = 'anonymous'
// ... canvas conversion logic
```

**Problema Potencial #1: El código espera `document` en Node.js**
```
Línea 89: const canvas = document.createElement('canvas')
```
❌ En **Next.js servidor**, `document` no existe  
❌ `new Image()` tampoco existe en servidor  
✅ Esto solo funciona en **cliente**

---

## 3. ARQUITECTURA DE NEXT.JS 15 - PROBLEMA CRÍTICO

### ¿Dónde se ejecuta `generateCategoryPDF()`?

El código actual **NO especifica que sea cliente o servidor**.

```typescript
export async function generateCategoryPDF(products, categoryName, options) {
  // ¿Client o Server?
```

**En Next.js 15 por defecto:** Funciones exportadas son **Server Components**

### Cuando se ejecuta en SERVIDOR:
```
document ❌ NO existe
Image ❌ NO existe  
canvas ❌ NO existe
FileReader ❌ NO existe
```

**Resultado:** Todas las llamadas fallan silenciosamente → `loadImage()` retorna `null`

---

## 4. FLUJO ACTUAL DE EJECUCIÓN

```
1. Usuario clicks "Descargar Catálogo PDF"
   ↓
2. handleDownloadCategoryPDF() en cliente (products-manager.tsx)
   ↓
3. Llama generateCategoryPDF() ← PROBLEMA: ¿Dónde se ejecuta?
   ↓
4. Para cada producto: await loadImage(url)
   ↓
5. loadImage() intenta usar:
   - fetch() ✅ OK en servidor/cliente
   - new Image() ❌ NO en servidor
   - document.createElement() ❌ NO en servidor
   ↓
6. Intento 1 FALLA
7. Intento 2 FALLA
   ↓
8. Retorna null → "[Sin imagen]"
```

---

## 5. CAUSAS RAÍZ (Orden de probabilidad)

### 🔴 CAUSA CRÍTICA #1: Ejecución en Servidor (80% probabilidad)
```typescript
// La función está en servidor, pero usa APIs del cliente
const img = new Image() // ❌ Error en servidor
document.createElement() // ❌ Error en servidor
```

**Síntoma:** Silencio total - no hay error en consola del navegador

---

### 🔴 CAUSA #2: URLs Vacías en Firebase (15% probabilidad)
```
Si en Firestore:
products[i].images = [] // Array vacío
o
products[i].images = undefined

Línea 387: if (product.images && product.images.length > 0)
→ Condición falsa
→ Nunca intenta cargar imagen
→ "[Sin imagen]"
```

---

### 🟡 CAUSA #3: CORS Bloqueado en Firebase Storage (5% probabilidad)
```
Incluso con fallback Image:
- Firebase Storage rechaza CORS
- Image tag falla
- Canvas nunca se ejecuta
```

---

## 6. CÓMO VERIFICAR CUÁL ES EL PROBLEMA REAL

### Verificación #1: ¿Están las imágenes en Firestore?

En **Firebase Console** → **Firestore** → **Products collection**:
```
Para cada producto, revisar el campo "images":
{
  name: "TABLET K8 PRO",
  images: [
    "https://firebasestorage.googleapis.com/..." ✅ OK
  ]
  // o
  images: [] ❌ PROBLEMA
  // o
  images: undefined ❌ PROBLEMA
}
```

**Acción:** Abre Firestore Console y verifica 3 productos

---

### Verificación #2: ¿Dónde se ejecuta el código?

Agregar log en servidor:
```typescript
export async function generateCategoryPDF(...) {
  if (typeof window === 'undefined') {
    console.log('🔴 EJECUTANDO EN SERVIDOR - Image/document NO disponibles')
  } else {
    console.log('✅ EJECUTANDO EN CLIENTE - Todas las APIs disponibles')
  }
}
```

**Acción:** Ver en consola del servidor (terminal)

---

### Verificación #3: ¿Qué dice el log actual?

Abrir navegador (F12) → Console:
```
[PDF] Product: "TABLET K8 PRO" - Attempting to load image...
[PDF] Image URL: https://firebasestorage.googleapis.com/...
[PDF] ⚠️ No image data returned for: "TABLET K8 PRO" (URL may be invalid or CORS blocked)
```

Si ves esto → Fetch o Image tag está fallando

---

## 7. SOLUCIÓN RECOMENDADA

### Opción A: Ejecutar en Cliente (RECOMENDADO)

```typescript
'use client' // ← Agregar esta línea al inicio del archivo

export async function generateCategoryPDF(...) {
  // Ahora Image, document, FileReader existen
}
```

**Ventaja:** APIs del navegador disponibles  
**Desventaja:** PDF se genera lentamente en cliente

---

### Opción B: Convertir URLs a Base64 en Servidor

Si la función debe estar en servidor, usar biblioteca que no requiere `document`:

```typescript
import fetch from 'node-fetch'
import sharp from 'sharp' // Procesar imágenes en servidor

// Sin Image, canvas, o document
const buffer = await fetch(url).then(r => r.buffer())
const base64 = buffer.toString('base64')
```

---

## 8. VERIFICACIÓN RÁPIDA (INMEDIATA)

### Paso 1: Abrir Firestore
```
Firebase Console → Firestore → Products collection
Expandir un producto → Ver campo "images"
```

### Paso 2: Ver Logs en Browser
```
F12 → Console → Generar PDF
Buscar logs [PDF]
```

### Paso 3: Verificar Tipo de Ejecución
```
Modificar pdf-generator.ts línea 10:
if (typeof window === 'undefined') {
  console.error('🔴 EN SERVIDOR - Sin acceso a Image/document')
  return null
}
```

---

## 9. TABLA RESUMEN DE SÍNTOMAS

| Síntoma | Causa Probable | Solución |
|---------|---|---|
| "[Sin imagen]" + Log vacío | Servidor (Image no existe) | Agregar `'use client'` |
| "[Sin imagen]" + "URL may be CORS blocked" | URLs vacías o CORS | Verificar Firestore + Firebase rules |
| "[Sin imagen]" + Error en consola | URL inválida | Validar URLs en Firestore |
| Imágenes a veces cargan | Intermitente/CORS | Necesita fallback mejor |

---

## 10. PRÓXIMOS PASOS

1. **INMEDIATO:** Verificar si `images` array está vacío en Firestore
2. **DESPUÉS:** Agregar `'use client'` si está en servidor
3. **LUEGO:** Revisar logs en F12 Console mientras generas PDF
4. **FINAL:** Si persiste, revisar Firebase Storage CORS rules

---

**Estado:** 🔴 Requiere diagnóstico  
**Prioridad:** ⚠️ ALTA  
**Tiempo estimado:** 5 minutos para identificar causa exacta
