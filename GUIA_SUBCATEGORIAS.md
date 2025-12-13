# Guía Completa: Sistema de Subcategorías

## 📋 Descripción General

Se ha implementado un sistema completo de **categorías y subcategorías** en tu plataforma UbaTech. Este sistema permite organizar productos de manera jerárquica. Por ejemplo:

```
CATEGORÍA: CELULARES
├── Subcategoría: Samsung
├── Subcategoría: Apple
├── Subcategoría: Xiaomi
└── Subcategoría: Motorola
```

## 🏗️ Estructura de Base de Datos

Se han creado dos colecciones principales en Firebase:

### 1. **Colección: `categories`**
Almacena las categorías principales con los siguientes campos:
- `id`: Identificador único (generado por Firebase)
- `name`: Nombre de la categoría (ej: "Celulares", "Laptops", etc.)

### 2. **Colección: `subcategories`**
Almacena las subcategorías con los siguientes campos:
- `id`: Identificador único (generado por Firebase)
- `name`: Nombre de la subcategoría (ej: "Samsung", "Apple", etc.)
- `categoryId`: ID de la categoría padre (relación)
- `createdAt`: Fecha de creación (automática)
- `updatedAt`: Fecha de última actualización (automática)

### 3. **Colección: `products`** (modificada)
Ahora incluye un nuevo campo:
- `subcategory`: ID de la subcategoría (opcional, solo si la categoría tiene subcategorías)

## 🎯 Cómo Usar: Panel Administrativo

### Paso 1: Crear/Gestionar Categorías

1. Ve a **Panel Admin > Gestión de Categorías**
2. En la sección "Agregar Nueva Categoría", ingresa el nombre
3. Haz clic en "Agregar"

### Paso 2: Agregar Subcategorías a una Categoría

1. En la tabla de categorías, busca la categoría a la que deseas agregar subcategorías
2. Haz clic en el icono **▶** (expandir) a la izquierda del nombre
3. Se desplegará la sección de subcategorías
4. En el campo de texto "Agregar Subcategoría", escribe el nombre (ej: "Samsung")
5. Haz clic en "Agregar" o presiona **Enter**

### Paso 3: Editar Subcategorías

1. Expande la categoría como se indicó arriba
2. Busca la subcategoría a editar
3. Haz clic en el botón "Editar"
4. Modifica el nombre
5. Haz clic en "Guardar"

### Paso 4: Eliminar Subcategorías

1. Expande la categoría
2. Haz clic en el botón "Eliminar" de la subcategoría
3. Confirma la acción
4. **Nota**: No podrás eliminar una subcategoría si tiene productos asociados

## 📦 Cómo Usar: Gestión de Productos

### Crear un Producto con Subcategoría

1. Ve a **Panel Admin > Gestión de Productos**
2. Haz clic en "Agregar Producto"
3. Completa los datos básicos:
   - Nombre
   - Descripción
   - Precio
   - Stock
   - Imagen

4. **Selecciona la Categoría**:
   - Abre el dropdown "Categoría"
   - Selecciona una categoría (ej: "Celulares")

5. **Selecciona la Subcategoría** (automático):
   - Una vez selecciones la categoría, el dropdown "Subcategoría" se habilitará
   - Las subcategorías disponibles aparecerán automáticamente
   - Selecciona una subcategoría (ej: "Samsung")

6. Haz clic en "Guardar"

### Editar un Producto

1. En la grid de productos, busca el producto
2. Haz clic en "Editar"
3. Modifica categoría y/o subcategoría según sea necesario
4. Haz clic en "Guardar"

## 🛍️ Página Pública: Vista del Cliente

### Filtrado por Categoría

1. En la página principal, verás la sección "Nuestros Productos"
2. Los botones de **Categorías** aparecen en la barra sticky
3. Haz clic en una categoría para ver solo sus productos
4. Haz clic en "Todas" para ver todos los productos

### Filtrado por Subcategoría (Marcas)

**Importante**: Los filtros de subcategorías solo aparecen cuando:
- Una categoría está seleccionada
- Esa categoría tiene al menos una subcategoría

Cuando se cumplen estas condiciones:
1. Debajo de los filtros de categoría, aparecerá la sección "Marcas / Subcategorías"
2. Haz clic en una marca para filtrar por esa subcategoría
3. Haz clic en "Todas" para mostrar todos los productos de la categoría

### Ejemplo Práctico

```
1. Haz clic en la categoría "CELULARES"
   → Se mostrarán todos los celulares
   → Aparecerán los botones de marcas (Samsung, Apple, Xiaomi, etc.)

2. Haz clic en "Samsung"
   → Se mostrarán solo los celulares Samsung

3. Haz clic en "Todas" (en la sección de marcas)
   → Se mostrarán todos los celulares nuevamente

4. Haz clic en "Todas" (en la sección de categorías)
   → Se mostrarán todos los productos de la tienda
   → Los filtros de marcas desaparecerán
```

## 📊 Estructura Completa de Datos

```json
// Documento en colección 'categories'
{
  "id": "category_001",
  "name": "Celulares"
}

// Documento en colección 'subcategories'
{
  "id": "subcat_001",
  "name": "Samsung",
  "categoryId": "category_001",
  "createdAt": "2025-12-10T...",
  "updatedAt": "2025-12-10T..."
}

// Documento en colección 'products' (ejemplo)
{
  "id": "prod_001",
  "name": "Galaxy A13",
  "description": "Celular Samsung...",
  "price": 299.99,
  "category": "Celulares",
  "subcategory": "subcat_001",  // ID de la subcategoría
  "stock": 50,
  "image": "data:image/..."
}
```

## 🔧 Funciones Disponibles

En el archivo `lib/subcategories.ts` tienes disponibles las siguientes funciones:

- `getSubcategoriesByCategory(categoryId)` - Obtiene todas las subcategorías de una categoría
- `getAllSubcategories()` - Obtiene todas las subcategorías
- `addSubcategory(categoryId, name)` - Agrega una nueva subcategoría
- `updateSubcategory(subcategoryId, newName)` - Actualiza una subcategoría
- `deleteSubcategory(subcategoryId)` - Elimina una subcategoría
- `countProductsBySubcategory(subcategoryId)` - Cuenta productos en una subcategoría

## ⚠️ Consideraciones Importantes

1. **No se pueden eliminar categorías con productos**: Si una categoría tiene productos, primero debes reasignarlos o eliminarlos

2. **No se pueden eliminar subcategorías con productos**: Si una subcategoría tiene productos, primero debes reasignarlos o eliminarlos

3. **Las subcategorías son opcionales**: Un producto puede tener una categoría sin subcategoría

4. **Nombres únicos recomendados**: Se recomienda que los nombres de subcategorías sean únicos dentro de cada categoría para evitar confusiones

5. **Impacto en los filtros públicos**: 
   - Si eliminas una subcategoría, los productos asociados a ella no desaparecerán, pero mostrarán "-" en el panel
   - Se recomienda reasignar productos antes de eliminar

## 📝 Troubleshooting

### Problema: "No se puede eliminar la subcategoría porque contiene productos"

**Solución**: 
1. Ve a Gestión de Productos
2. Busca los productos de esa subcategoría
3. Edítalo y asigna otra subcategoría o elimina el producto
4. Regresa a Gestión de Categorías e intenta eliminar de nuevo

### Problema: La subcategoría no aparece en el dropdown

**Solución**:
1. Asegúrate de haber seleccionado una categoría
2. Verifica que la categoría tenga al menos una subcategoría
3. Recarga la página (F5)

### Problema: Los filtros de subcategoría no aparecen en la página pública

**Solución**:
1. Verifica que la categoría seleccionada tenga subcategorías
2. Asegúrate de que al menos un producto esté asignado a esa categoría
3. Recarga la página

## 🎓 Ejemplos de Uso

### Caso 1: Tienda de Electrónica

```
CATEGORÍA: LAPTOPS
├── Dell
├── HP
├── Lenovo
└── ASUS

CATEGORÍA: CELULARES
├── Samsung
├── Apple
├── Xiaomi
└── Motorola

CATEGORÍA: ACCESORIOS
├── Fundas
├── Cargadores
└── Cables
```

### Caso 2: Tienda de Ropa

```
CATEGORÍA: HOMBRES
├── Camisetas
├── Pantalones
└── Zapatos

CATEGORÍA: MUJERES
├── Vestidos
├── Pantalones
└── Zapatos
```

## ✅ Checklist de Implementación

- [x] Colecciones creadas en Firebase
- [x] Tipos TypeScript actualizados
- [x] Servicio de subcategorías implementado
- [x] Panel de administración de categorías mejorado
- [x] Formulario de productos actualizado
- [x] Gestor de productos mejorado
- [x] Página pública con filtros de subcategorías
- [x] Validaciones y restricciones implementadas

---

**Última actualización**: 10 de Diciembre de 2025
**Versión**: 1.0.0
