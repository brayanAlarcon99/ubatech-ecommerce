# ⚡ Inicio Rápido: Sistema de Subcategorías

## 🚀 Pasos Rápidos para Empezar

### 1️⃣ Panel Administrativo - Crear Categoría

1. Abre el panel admin: `http://localhost:3000/admin/dashboard`
2. Haz clic en **"Gestión de Categorías"**
3. Escribe: `CELULARES` → Haz clic en **"Agregar"**

### 2️⃣ Agregar Subcategorías (Marcas)

1. En la tabla de categorías, busca `CELULARES`
2. Haz clic en el icono **▶** para expandir
3. En el campo "Agregar Subcategoría", escribe: `Samsung` → Presiona **Enter**
4. Repite para agregar: `Apple`, `Xiaomi`, `Motorola`

### 3️⃣ Crear un Producto

1. Haz clic en **"Gestión de Productos"**
2. Haz clic en **"Agregar Producto"**
3. Completa el formulario:
   - Nombre: `Galaxy A13`
   - Descripción: `Celular Samsung...`
   - Precio: `299.99`
   - Stock: `10`
   - Categoría: `CELULARES`
   - Subcategoría: `Samsung`
4. Haz clic en **"Guardar"**

### 4️⃣ Ver en la Tienda

1. Abre: `http://localhost:3000`
2. Verás los filtros de categorías en la barra sticky
3. Haz clic en `CELULARES`
4. Aparecerán los botones de marcas: Samsung, Apple, Xiaomi, Motorola
5. Haz clic en `Samsung` para filtrar por esa marca

## 📱 Estructura en Firebase

Las colecciones se crean **automáticamente** cuando:

1. ✅ Creas la primera categoría → Se crea colección `categories`
2. ✅ Agregas la primera subcategoría → Se crea colección `subcategories`
3. ✅ Guardas un producto → Se actualiza colección `products`

**No necesitas hacer nada manual en Firebase Console.**

## 🎯 Reglas Firestore (Actualizar si es necesario)

Si tienes problemas de permisos, actualiza tus reglas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública
    match /{document=**} {
      allow read: if true;
    }
    
    // Permitir escritura solo para usuarios autenticados (admin)
    match /categories/{document=**} {
      allow write: if request.auth != null;
    }
    
    match /subcategories/{document=**} {
      allow write: if request.auth != null;
    }
    
    match /products/{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

## 🔍 Verificar que Todo Funciona

### En el Panel Admin:

- [ ] Puedo ver "Gestión de Categorías" en el menú
- [ ] Puedo crear una categoría
- [ ] Puedo expandir la categoría y agregar subcategorías
- [ ] Puedo editar y eliminar subcategorías
- [ ] Puedo crear un producto con categoría y subcategoría
- [ ] El producto muestra la subcategoría seleccionada

### En la Página Pública:

- [ ] Veo los botones de filtro de categorías
- [ ] Al hacer clic en una categoría con subcategorías, aparecen los botones de marcas
- [ ] Los filtros funcionan correctamente
- [ ] Los productos se filtran por categoría y subcategoría

## 💡 Ejemplo Completo en 5 minutos

```
1. Crear categoría: LAPTOPS
   ↓
2. Agregar subcategorías: Dell, HP, Lenovo
   ↓
3. Crear producto:
   - Nombre: XPS 15
   - Categoría: LAPTOPS
   - Subcategoría: Dell
   - Precio: $999
   - Stock: 5
   ↓
4. Ir a la tienda
   ↓
5. Haz clic en LAPTOPS → Luego en DELL
   ↓
6. ¡Ves tu producto XPS 15!
```

## 🆘 Problemas Comunes

### "La subcategoría no se creó"
- Asegúrate de que la categoría esté expandida
- Verifica que hayas escrito un nombre
- Intenta de nuevo

### "No veo el dropdown de subcategorías al crear un producto"
- Selecciona primero una **categoría**
- Recarga la página si es necesario
- Verifica que la categoría tenga subcategorías

### "Los productos viejos no muestran subcategoría"
- Es normal, fueron creados antes de tener esta función
- Edita el producto y asigna una subcategoría si es necesario

## 📚 Más Información

Para una guía completa y detallada, lee: **GUIA_SUBCATEGORIAS.md**

---

¡**Listo para empezar!** ✅
