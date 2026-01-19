# ⚡ RESUMEN RÁPIDO: Solución al Error de Firebase

---

## 🚨 EL ERROR

```
"Document exceeds maximum allowed size of 1,048,576 bytes"
```

**Causa:** Las imágenes del producto superan 1MB de Firebase

---

## ✅ LA SOLUCIÓN (3 pasos)

### 1️⃣ Intenta Guardar
```
Editas stock mínimo → Haces clic "Guardar"
```

### 2️⃣ Ves el Mensaje
```
🚨 DOCUMENTO OVERSIZED
[🗑️ Limpiar Imágenes Antiguas]
```

### 3️⃣ Resuelves
```
Haz clic en "Limpiar Imágenes Antiguas"
↓
Imágenes se eliminan
↓
Ahora puedes guardar
```

---

## 🔧 LO QUE SE HIZO

**Archivo Nuevo:**
- `lib/firebase-document-cleanup.ts` - Limpia documentos oversized

**Archivo Modificado:**
- `components/admin/product-form.tsx` - Detecta error y ofrece solución

---

## 📖 DOCUMENTACIÓN

→ [SOLUCION_ERROR_DOCUMENT_OVERSIZED_FIREBASE.md](SOLUCION_ERROR_DOCUMENT_OVERSIZED_FIREBASE.md)

---

## 🎯 PRÓXIMAS VECES

Carga imágenes más pequeñas:
- Máximo 0.3MB por imagen
- Usa JPEG en lugar de PNG
- Resolución máxima 800x600px

---

**Status:** ✅ RESUELTO
