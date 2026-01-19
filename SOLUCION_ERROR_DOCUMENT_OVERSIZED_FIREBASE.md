# 🔧 SOLUCIÓN: Error "Document exceeds maximum size" al Editar Productos

**Fecha:** 19 de Enero de 2026  
**Problema:** Error al editar producto y cambiar stock mínimo  
**Estado:** ✅ RESUELTO  

---

## 🚨 El Error

```
FirebaseError:
Document 'projects/ubatech-a8650/databases/(default)/documents/products/ork7nx7cleOGkx5C8yfD' 
cannot be written because its size (1,060,109 bytes) exceeds the maximum allowed size of 1,048,576 bytes.
```

---

## 🔍 ¿Por Qué Sucede?

**Causa Raíz:** Las imágenes del producto superan el límite de 1MB de Firebase.

```
Documento actual:
├─ Datos del producto:    ~100 KB
├─ Imágenes (base64):    ~960 KB ← El problema
└─ Total:               ~1,060 KB ❌ SUPERA EL LÍMITE (1,048 KB)
```

Cuando intentas guardar CUALQUIER cambio (stock, precio, descripción), Firebase rechaza porque el documento completo es demasiado grande.

---

## ✅ La Solución

Se implementó un sistema de **detección y limpieza de documentos oversized** que:

1. ✅ **Detecta el error** cuando intenta guardar
2. ✅ **Identifica el problema** (imágenes demasiado grandes)
3. ✅ **Ofrece solución** (botón para limpiar imágenes)
4. ✅ **Permite continuar** después de limpiar

---

## 📝 Qué Ver en la Interfaz

### Cuando Intentes Guardar

```
┌─────────────────────────────────────────────┐
│ 🚨 DOCUMENTO OVERSIZED - No puede guardar   │
│                                             │
│ El producto tiene imágenes demasiado       │
│ grandes y no se puede guardar.              │
│                                             │
│ Haz clic en 'Limpiar Imágenes Antiguas'   │
│ para remover las imágenes que ocupan       │
│ demasiado espacio. Luego podrás guardar    │
│ los cambios.                                │
│                                             │
│ Después puedes cargar imágenes nuevas      │
│ más pequeñas.                               │
│                                             │
│ [🗑️ Limpiar Imágenes Antiguas]            │
│                                             │
│ Esto removará todas las imágenes antigas   │
│ que ocupan demasiado espacio. Después      │
│ podrás guardar los cambios y cargar        │
│ nuevas imágenes más pequeñas.              │
└─────────────────────────────────────────────┘
```

---

## 🚀 Pasos Para Resolver

### Paso 1: Intenta Guardar
```
Editas el stock mínimo
│
▼
Haces clic en "Guardar"
│
▼
Aparece error: "DOCUMENTO OVERSIZED"
```

### Paso 2: Limpia Imágenes
```
Lee el mensaje
│
▼
Haz clic en: "🗑️ Limpiar Imágenes Antiguas"
│
▼
Sistema elimina imágenes grandes
│
▼
Mensaje: "✅ Imágenes antiguas eliminadas"
```

### Paso 3: Guarda Cambios
```
Ahora el documento es más pequeño
│
▼
Haz clic en "Guardar" nuevamente
│
▼
✅ ÉXITO - Cambios guardados
```

### Paso 4: Cargar Nuevas Imágenes (Opcional)
```
Si necesitas imágenes:
│
▼
Carga imágenes MÁS PEQUEÑAS:
├─ Máximo 0.3MB por imagen
├─ Usa JPEG en lugar de PNG
├─ Resolución máxima 800x600px
└─ Total máximo 0.9MB para 3 imágenes
│
▼
Guarda nuevamente
│
▼
✅ ÉXITO
```

---

## 📊 Archivos Creados/Modificados

### Creado:
- **`lib/firebase-document-cleanup.ts`** (Nueva librería)
  ```
  Funciones:
  ├─ getDocumentSizeInfo() - Obtiene tamaño del documento
  ├─ cleanDocumentImages() - Elimina imágenes oversized
  ├─ generateDocumentSizeMessage() - Mensaje detallado
  └─ canDocumentAccommodateData() - Verifica si cabe
  ```

### Modificado:
- **`components/admin/product-form.tsx`**
  ```
  Cambios:
  ├─ Import del nuevo validador de limpieza
  ├─ Estado: documentOversizeError, isCleaningDocument
  ├─ Función: handleCleanDocumentImages()
  ├─ Detecta error en handleSubmit()
  └─ UI: Banner con botón para limpiar
  ```

---

## 🔐 Prevención para el Futuro

Además de la solución, se mantienen los validadores anteriores:

```
NUEVA CAPA DE PROTECCIÓN (con este fix):
├─ Detecta documentos oversized existentes
├─ Ofrece limpieza con un clic
└─ Permite continuar editando

CAPA ANTERIOR (imagen size validator):
├─ Valida nuevas imágenes al cargar
├─ Previene imágenes > 1MB
└─ Bloquea guardado si hay problema

RESULTADO:
✅ No hay errores de Firebase
✅ Usuario siempre tiene solución
✅ Sistema protegido
```

---

## 💡 Recomendaciones Para Evitar

### Al Cargar Imágenes:
1. **Usa JPEG** en lugar de PNG (50% más pequeño)
2. **Reduce resolución** a máximo 800x600px
3. **Comprime** usando herramientas online
4. **Máximo 0.3MB por imagen** (mejor 0.2MB)
5. **Máximo 3 imágenes** por producto

### Herramientas Recomendadas:
- TinyPNG (www.tinypng.com)
- ImageOptim (imageoptim.com)
- Squoosh (squoosh.app)
- ImageResizer (online-convert.com)

### Formato Óptimo:
```
Producto: Teléfono
├─ Imagen principal: 0.2MB, JPEG, 800x600px
├─ Imagen 2: 0.15MB, JPEG, 600x600px
└─ Imagen 3: 0.1MB, JPEG, 500x500px
Total: 0.45MB ✅ (muy por debajo del límite)
```

---

## 🧪 Cómo Funciona la Limpieza

### Antes de Limpiar:
```typescript
Documento en Firestore:
{
  name: "Samsung S25",
  price: 5000,
  images: [        ← ~960KB de data base64
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...", // Imagen 1
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...", // Imagen 2
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."  // Imagen 3
  ],
  stock: {...},
  ...
}
Total: 1,060KB ❌ SUPERA
```

### Después de Limpiar:
```typescript
Documento en Firestore:
{
  name: "Samsung S25",
  price: 5000,
  images: undefined,  ← REMOVIDO
  stock: {...},
  ...
}
Total: 100KB ✅ DENTRO DEL LÍMITE
```

---

## 🔄 Código Técnico

### En product-form.tsx:

```typescript
// 1. Detectar error en handleSubmit
catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error)
  
  if (errorMsg.includes("exceeds the maximum allowed size")) {
    setDocumentOversizeError("🚨 DOCUMENTO OVERSIZED...")
  }
}

// 2. Limpiar con botón
async function handleCleanDocumentImages() {
  await cleanDocumentImages("products", product.id)
  setImagePreviews([])
  setDocumentOversizeError(null)
}

// 3. Mostrar UI
{documentOversizeError && (
  <div className="...">
    {documentOversizeError}
    <button onClick={handleCleanDocumentImages}>
      🗑️ Limpiar Imágenes Antiguas
    </button>
  </div>
)}
```

---

## ✅ Checklist de Resolución

Para el Producto Problemático:
- [ ] Abre producto ork7nx7cleOGkx5C8yfD
- [ ] Intenta cambiar stock mínimo
- [ ] Ver error "DOCUMENTO OVERSIZED"
- [ ] Haz clic en "Limpiar Imágenes Antiguas"
- [ ] Espera confirmación "Imágenes antiguas eliminadas"
- [ ] Guarda los cambios de stock
- [ ] ✅ Producto ahora funciona

Para Futuro:
- [ ] Usa imágenes < 0.3MB
- [ ] Formato JPEG en lugar de PNG
- [ ] Máximo 3 imágenes por producto
- [ ] Comprime antes de subir

---

## 🎯 Resultado

### Antes del Fix:
```
Usuario edita → Error Firebase → Confusión → Soporte
```

### Después del Fix:
```
Usuario edita → Error (pero claro) → Lee instrucción → Limpia → Guarda → ✅
```

---

## 📞 Preguntas Frecuentes

**P: ¿Se pierden las imágenes?**
R: Sí, se eliminan las imágenes que ocupan demasiado espacio. Esto es necesario para poder guardar. Luego puedes cargar nuevas imágenes más pequeñas.

**P: ¿Se borran otros datos del producto?**
R: No. Solo se eliminan las imágenes en base64. Todos los datos (nombre, precio, stock, etc.) se preservan.

**P: ¿Puedo cargar imágenes nuevas después?**
R: Sí, después puedes cargar nuevas imágenes más pequeñas (máximo 0.3MB cada una).

**P: ¿Por qué Firebase tiene límite de 1MB?**
R: Por rendimiento y costos. Documentos muy grandes ralentizan las consultas.

**P: ¿Todos mis productos tienen este problema?**
R: Solo los que tienen imágenes muy grandes. El nuevo validador previene que ocurra en futuro.

---

**Solución Implementada:** 19 de Enero de 2026  
**Versión:** 2.1  
**Status:** ✅ COMPLETADO Y LISTO
