# ⚡ QUICK START: Firebase Storage Uploads

**Tiempo de lectura:** 2 minutos  
**Tiempo de testing:** 15 minutos  

---

## 🚀 Empezar Ahora

### 1. Verificar que todo está en lugar
```bash
# En terminal
cd D:\ubatech

# Verificar archivos
ls lib/image-storage.ts  # Debe existir
ls components/admin/product-form.tsx  # Debe estar actualizado
```

### 2. Abrir Admin Panel
```
URL: http://localhost:3000/admin  (o tu URL)
User: Tu usuario admin
```

### 3. Crear Nuevo Producto
```
1. Click "Nuevo Producto"
2. Llenar Nombre, Descripción, Precio
3. Seleccionar Categoría
4. Pegar imagen: Ctrl+V (o Drag & Drop)
5. Click "Guardar"
```

### 4. Ver Progreso
```
Durante upload:
  "Subiendo imágenes... 📤"
  "Subiendo imagen 1 de 1..."

Después de guardar:
  ✅ Producto aparece en lista
  ✅ Imagen visible
```

---

## 🔍 Verificar en Firebase

### En Firestore
```
Console: https://console.firebase.google.com
1. Proyecto: ubatech-a8650
2. Firestore → products → [nuevo producto]
3. Campo "images" debe contener:
   ["https://firebasestorage.googleapis.com/..."]
```

### En Storage
```
Console: https://console.cloud.google.com
1. Proyecto: ubatech-a8650
2. Storage → ubatech-a8650.firebasestorage.app
3. Carpeta: products/ → [productId]/ → image-0.jpg
```

---

## ✅ Testing Checklist

- [ ] Crear producto con 1 imagen
- [ ] Ver progreso durante upload
- [ ] Imagen aparece en lista
- [ ] URL en Firestore es de Storage (no Base64)
- [ ] Crear producto con 3 imágenes
- [ ] Editar producto antiguo + agregar imagen
- [ ] Intentar imagen > 1MB → debe rechazarse
- [ ] Presionar Cancelar durante upload → debe funcionar

---

## 🐛 Si algo no funciona

### Error: "Storage bucket does not exist"
```
Solución:
1. Ir a https://console.firebase.google.com
2. Verificar que Storage existe
3. Si no, crear uno nuevo
```

### Imagen no aparece después guardar
```
Solución:
1. F12 → Console
2. Ver si hay errores de Network
3. Si falta URL, revisar Storage
```

### Upload muy lento (> 10 segundos)
```
Normal: 2-5 segundos
Lento: Revisar conexión internet
```

---

## 📊 Performance Esperado

| Acción | Tiempo |
|--------|--------|
| Pegar imagen | Inmediato |
| Upload 500KB | 2-5 seg |
| Upload 3 imágenes | 6-15 seg |
| Guardar producto | < 2 seg (post-upload) |

---

## 📞 Necesitas Ayuda?

Ver: [GUIA_TESTING_STORAGE_UPLOADS.md](GUIA_TESTING_STORAGE_UPLOADS.md)

---

¡Listo! Comienza el testing. 🚀
