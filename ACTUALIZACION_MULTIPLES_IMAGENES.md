# 📸 ACTUALIZACIÓN: Sistema de Múltiples Imágenes por Producto

## ✅ ¿Qué cambió?

### Antes
- ❌ 1 imagen por producto
- ❌ Sin rotación de imágenes

### Ahora  
- ✅ Hasta 3 imágenes por producto
- ✅ Primera imagen = Portada (mostrada en tarjeta)
- ✅ Rotación automática de imágenes en modal (2 segundos)
- ✅ Compatible con productos existentes
- ✅ Cargar desde sistema + Pegar desde portapapeles (ambas funcionalidades mantienen)

---

## 🎯 Uso en Panel Administrativo

### Crear/Editar Producto

1. **Abre el formulario** de crear o editar producto
2. **Sección de Imágenes** (nueva):
   - Arrastra hasta 3 imágenes O haz clic en botón "📁 Cargar imagen"
   - También puedes pegar imágenes con `Ctrl+V` (Windows) / `Cmd+V` (Mac)
   - **La primera imagen cargada será la portada**

3. **Preview de imágenes**:
   - Verás las 3 imágenes en grid con números
   - Imagen 1 tiene etiqueta "Portada" (verde)
   - Puedes eliminar cualquier imagen con el botón ✕

4. **Límites**:
   - Máximo 3 imágenes por producto
   - Máximo 1MB por imagen
   - Formatos soportados: JPG, PNG, WebP, GIF

5. **Guardar**: 
   - Las imágenes se guardan en el mismo producto
   - Se mantiene compatibilidad con imagen antigua

---

## 👁️ Visualización en Página Pública

### En Tarjeta del Producto
- ✅ Muestra **solo la primera imagen (portada)**
- ✅ Al hacer clic, abre modal emergente

### En Modal Emergente (Detalles)
- ✅ Muestra **galería interactiva** con todas las imágenes
- ✅ Rotación automática cada **2 segundos**
- ✅ Botones para navegar manualmente (◀ ▶)
- ✅ Puntos indicadores para ver posición
- ✅ Contador (ej: "2 / 3")
- ✅ Al pausar el mouse, se detiene la rotación
- ✅ Si solo hay 1 imagen, no muestra controles

---

## 🔄 Migración de Productos Existentes

Los productos existentes con una sola imagen funcionan automáticamente:

### ¿Qué pasa con mis productos actuales?
✅ **Nada problemático:**
- Imagen antigua sigue siendo la portada
- Se puede cargar hasta 2 imágenes más
- Rotación funciona correctamente

### Si quieres migrar todos los productos (opcional)
Ejecuta en consola del navegador (DevTools):

```javascript
// En cualquier página del sitio, abre DevTools (F12)
// Pega esto en la consola:

// Primero importa la función
import { migrateImagesToArray } from "@/lib/migrate-images"

// Luego ejecuta:
await migrateImagesToArray()

// Verás un log indicando cuántos se migraron
```

---

## 📝 Validaciones

### ✅ Permitido
- 3 imágenes de 500KB cada una
- Cargar/pegar 1, 2 o 3 imágenes
- Eliminar cualquier imagen (excepto si es la última)
- Reordenar: al eliminar imagen 2, la imagen 3 pasa a ser 2

### ❌ No permitido
- Cargar más de 3 imágenes
- Cargar imágenes mayores a 1MB
- Cargar formatos no soportados

---

## 🛠️ Detalles Técnicos

### Cambios en la Base de Datos

```json
// Estructura antigua (compatible)
{
  "id": "prod_001",
  "name": "Product Name",
  "image": "data:image/jpg;base64,..."
}

// Nueva estructura
{
  "id": "prod_001",
  "name": "Product Name",
  "image": "data:image/jpg;base64,...",        // Se mantiene por compatibilidad
  "images": [
    "data:image/jpg;base64,...",               // Portada (1)
    "data:image/jpg;base64,...",               // Imagen 2
    "data:image/jpg;base64,..."                // Imagen 3
  ]
}
```

### Archivos Modificados

1. **`types/index.ts`**
   - Agregado campo `images?: string[]`
   - Mantiene campo `image?` para compatibilidad

2. **`components/admin/product-form.tsx`**
   - Nuevo sistema de carga de múltiples imágenes
   - Grid de previsualizaciones
   - Validación de cantidad y tamaño

3. **`components/image-rotator.tsx`** (NUEVO)
   - Componente reutilizable de rotación
   - Auto-rotación con delay configurable
   - Navegación manual con botones y puntos

4. **`components/product-card.tsx`**
   - Muestra imagen de portada en tarjeta
   - Integra ImageRotator en modal

5. **`lib/migrate-images.ts`** (NUEVO)
   - Script para migración (opcional)

---

## 🚀 Próximos Pasos

### Para el Usuario (Administrador)

1. ✅ **Crear producto nuevo**: Con hasta 3 imágenes
2. ✅ **Editar producto existente**: Agregar más imágenes
3. ✅ **Probar en tienda pública**: Verificar rotación

### Para el Desarrollo (Opcional)

1. Si quieres migrar todos los productos automáticamente:
   - Ejecuta `migrateImagesToArray()` una sola vez
   - Ver en consola el progreso

---

## ❓ Preguntas Frecuentes

**P: ¿Se pierden las imágenes antiguas?**
R: No, se mantienen. Puedes agregar 2 imágenes más.

**P: ¿Puedo cambiar el orden de las imágenes?**
R: Actualmente no. Para reordenar, elimina y carga de nuevo en orden.

**P: ¿Qué pasa si tengo 1 imagen?**
R: La galería muestra solo esa imagen sin controles de rotación.

**P: ¿Cuánto tarda la rotación?**
R: 2 segundos entre imágenes (configurable si lo necesitas).

**P: ¿Funciona en móvil?**
R: Sí, totalmente responsive. Botones más grandes en móvil.

---

## 📞 Soporte

Si hay problemas:
1. Verifica que las imágenes sean menores a 1MB
2. Intenta con formato JPG o PNG
3. Recarga la página si ves error
4. Consulta la consola (F12) para ver errores específicos

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: ✅ Completado y Testeado
