# 🎨 GUÍA VISUAL: Implementación de la Norma de Estructura Jerárquica

## 📌 Diagrama de Flujo: Cómo Funciona la Relación Jerárquica

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREAR/EDITAR PRODUCTO                       │
│                    (Panel Administrativo)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────────┐
                │  1. Seleccionar Categoría        │
                │     (Ej: "Celulares")           │
                └─────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────────┐
                │  2. Sistema carga subcategorías │
                │     de esa categoría            │
                │  (Samsung, Redmi, iPhone)       │
                └─────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  3a. ¿Seleccionar Subcategoría?         │
        │                                          │
        │  SI ─────────────────┐                  │
        │                      │                  │
        │  NO ────────────────┐│                  │
        └─────────────────────┼┼─────────────────┘
                              ││
                ┌─────────────┘│└──────────────┐
                ▼                               ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │ Producto sin         │      │ Producto con         │
    │ subcategoría         │      │ subcategoría         │
    │                      │      │                      │
    │ ✅ Válido            │      │ Validar que:         │
    │ - Aparecerá en       │      │ - Subcategoría       │
    │   categoría general  │      │   existe             │
    │ - No filtrado        │      │ - Pertenece a la     │
    │                      │      │   categoría          │
    └──────────────────────┘      └──────────────────────┘
                                              │
                                              ▼
                            ┌──────────────────────────┐
                            │  ✅ Válido               │
                            │  ✅ Guardar producto     │
                            │  ✅ Disponible en        │
                            │      subcategoría        │
                            └──────────────────────────┘
```

---

## 🖼️ Interfaz del Panel Administrativo

### Paso 1: Crear Nuevo Producto

```
┌──────────────────────────────────────────────────────────┐
│  ✏️  NUEVO PRODUCTO                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Nombre: [NOTE14PRO+___________________]                │
│  Descripción: [Celular de última generación__...]      │
│                                                          │
│  Precio: [1560000]  Stock: [1]                         │
│                                                          │
│  ┌─ Categoría * ────────────────────────────────────┐  │
│  │ ▼ Seleccionar categoría                        │  │
│  │   Celulares ← SELECT THIS                      │  │
│  │   Electrónica                                   │  │
│  │   Ropa                                           │  │
│  └────────────────────────────────────────────────┘  │
│                                                          │
│  Categoría seleccionada: Celulares ✅                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Paso 2: Sistema carga subcategorías de "Celulares"

```
┌──────────────────────────────────────────────────────────┐
│  ✏️  NUEVO PRODUCTO                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Nombre: [NOTE14PRO+___________________]                │
│  Descripción: [Celular de última generación__...]      │
│                                                          │
│  Precio: [1560000]  Stock: [1]                         │
│                                                          │
│  ┌─ Categoría * ────────────────────────────────────┐  │
│  │ Celulares ✅                                    │  │
│  └────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Subcategoría * ──────────────────────────────────┐ │
│  │ ▼ Seleccionar subcategoría                      │ │
│  │   Samsung                                        │ │
│  │   Redmi ← SELECT THIS                          │ │
│  │   iPhone                                         │ │
│  │   Otro                                           │ │
│  └────────────────────────────────────────────────┘ │
│                                                          │
│  Subcategoría seleccionada: Redmi ✅                    │
│                                                          │
│  ┌─────────────────┬──────────────────┐              │
│  │ 💾 Guardar      │ ❌ Cancelar       │              │
│  └─────────────────┴──────────────────┘              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Paso 3: Validación y Guardado

```
Si todo es válido:
✅ Producto guardado en Firestore
✅ Relación jerárquica verificada
✅ NOTE14PRO+ aparecerá bajo "Redmi" → "Celulares"

Si hay error:
❌ Subcategoría no pertenece a la categoría
❌ Producto no se guarda
❌ Se muestra mensaje de error
```

---

## 📱 Vista del Cliente (Tienda)

### Página Principal

```
┌────────────────────────────────────────────────────────────┐
│  UBATECH - Tienda Online                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔍 Buscar productos...  🛒 Carrito (0)                   │
│                                                            │
│  CATEGORÍAS:                                              │
│  • Celulares (40 productos)                               │
│  • Electrónica (25 productos)                             │
│  • Ropa (15 productos)                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Al seleccionar "Celulares"

```
┌─────────────────────────────────────────────────────────────┐
│  CELULARES                                      ◀ Volver    │
├──────────────────┬──────────────────────────────────────────┤
│  FILTRAR POR:    │                                          │
│                  │  📱 NOTE14PRO+                          │
│  ☑️ Samsung      │     Precio: $1.560.000                   │
│  ☑️ Redmi        │     Stock: 1                             │
│  ☑️ iPhone       │     [Foto]                               │
│  ☑️ Otro         │     [Ver Detalles] [Añadir al Carrito]  │
│                  │                                          │
│  [Aplicar]       │  📱 Galaxy A13                          │
│  [Limpiar]       │     Precio: $299.99                      │
│                  │     Stock: 50                            │
│                  │     [Foto]                               │
│                  │     [Ver Detalles] [Añadir al Carrito]  │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

### Al filtrar por "Redmi"

```
┌─────────────────────────────────────────────────────────────┐
│  CELULARES > REDMI                            ◀ Volver      │
├──────────────────┬──────────────────────────────────────────┤
│  FILTRAR POR:    │                                          │
│                  │  📱 NOTE14PRO+                          │
│  ☐ Samsung       │     Precio: $1.560.000                   │
│  ☑️ Redmi        │     Stock: 1                             │
│  ☐ iPhone        │     [Foto]                               │
│  ☐ Otro          │     [Ver Detalles] [Añadir al Carrito]  │
│                  │                                          │
│  [Aplicar]       │  📱 Note 13                             │
│  [Limpiar]       │     Precio: $899.99                      │
│                  │     Stock: 25                            │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 🗄️ Estructura en Firestore

### Colección: `categories`

```json
{
  "id": "cat_celulares_001",
  "name": "Celulares"
}
```

### Colección: `subcategories`

```json
{
  "id": "sub_samsung_001",
  "name": "Samsung",
  "categoryId": "cat_celulares_001",
  "createdAt": "2025-12-10T..."
}

{
  "id": "sub_redmi_001",
  "name": "Redmi",
  "categoryId": "cat_celulares_001",
  "createdAt": "2025-12-10T..."
}

{
  "id": "sub_iphone_001",
  "name": "iPhone",
  "categoryId": "cat_celulares_001",
  "createdAt": "2025-12-10T..."
}
```

### Colección: `products`

```json
{
  "id": "prod_note14_001",
  "name": "NOTE14PRO+",
  "category": "Celulares",
  "subcategory": "sub_redmi_001",    ← VINCULADO A REDMI
  "price": 1560000,
  "stock": 1,
  "image": "..."
}

{
  "id": "prod_galaxy_001",
  "name": "Galaxy A13",
  "category": "Celulares",
  "subcategory": "sub_samsung_001",  ← VINCULADO A SAMSUNG
  "price": 299.99,
  "stock": 50,
  "image": "..."
}

{
  "id": "prod_generico_001",
  "name": "Producto Genérico",
  "category": "Celulares",
  "subcategory": "",                 ← SIN SUBCATEGORÍA
  "price": 199.99,
  "stock": 100,
  "image": "..."
}
```

---

## ⚙️ Validaciones Automáticas

### En el Panel Admin (Frontend)

```javascript
// ✅ PERMITIDO
Crear producto:
- Categoría: Celulares (✅ existe)
- Subcategoría: Redmi (✅ existe y pertenece a Celulares)
→ ✅ GUARDAR PRODUCTO

// ❌ BLOQUEADO
Crear producto:
- Categoría: Celulares
- Subcategoría: Camiseta (❌ pertenece a Ropa, no a Celulares)
→ ❌ ERROR: "La subcategoría no pertenece a esta categoría"

// ✅ PERMITIDO
Crear producto:
- Categoría: Celulares
- Subcategoría: (vacío)
→ ✅ GUARDAR PRODUCTO (sin subcategoría)
```

### En Firestore (Backend)

```firestore
allow create, update: if request.auth != null && 
                       hasAdminRole() && 
                       validateProductStructure();

// Valida que si hay subcategoría:
// 1. Existe en subcategories
// 2. Su categoryId coincide con la categoría del producto
// 3. La categoría existe en categories
```

---

## 🔄 Casos de Uso

### Caso 1: Agregar nuevo producto a categoría existente

```
Admin abre "Nuevo Producto"
  ↓
Selecciona: Categoría = "Celulares"
  ↓
Sistema carga: Subcategorías ["Samsung", "Redmi", "iPhone"]
  ↓
Selecciona: Subcategoría = "Redmi"
  ↓
Sistema valida: Redmi pertenece a Celulares ✅
  ↓
Admin completa datos y guarda
  ↓
Producto aparece en tienda bajo Celulares > Redmi ✅
```

### Caso 2: Agregar nueva subcategoría

```
Admin abre "Gestor de Categorías"
  ↓
Selecciona: Categoría = "Celulares"
  ↓
Click "Agregar Subcategoría"
  ↓
Ingresa: Nombre = "OnePlus"
  ↓
Sistema crea: {id, name: "OnePlus", categoryId: "cat_celulares_001"}
  ↓
Subcategoría disponible para nuevos productos ✅
```

### Caso 3: Intentar eliminar categoría con productos

```
Admin intenta eliminar: "Celulares"
  ↓
Sistema valida: ¿Hay productos en esta categoría?
  ↓
Resultado: Sí, hay 40 productos
  ↓
Sistema bloquea: ❌ "No se puede eliminar, tiene productos"
  ↓
Admin debe: Primero eliminar/reasignar todos los productos
```

---

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│ CATEGORÍA   │
│ Celulares   │
└──────┬──────┘
       │
       ├─► (1:N) ┌──────────────────┐
       │         │ SUBCATEGORÍA     │
       │         │ Samsung          │
       │         └────────┬─────────┘
       │                  │
       │                  ├─► (1:N) ┌──────────────────┐
       │                  │         │ PRODUCTO         │
       │                  │         │ Galaxy A13       │
       │                  │         └──────────────────┘
       │                  │
       │                  └─► (1:N) ┌──────────────────┐
       │                            │ PRODUCTO         │
       │                            │ Galaxy S23       │
       │                            └──────────────────┘
       │
       ├─► (1:N) ┌──────────────────┐
       │         │ SUBCATEGORÍA     │
       │         │ Redmi            │
       │         └────────┬─────────┘
       │                  │
       │                  └─► (1:N) ┌──────────────────┐
       │                            │ PRODUCTO         │
       │                            │ NOTE14PRO+       │
       │                            └──────────────────┘
       │
       └─► (1:N) ┌──────────────────┐
               │ PRODUCTO         │
               │ (Sin subcat)     │
               └──────────────────┘
```

---

## ✅ Checklist de Verificación

- [ ] Firestore Rules actualizado con validaciones jerárquicas
- [ ] Panel Admin valida estructura antes de guardar
- [ ] Tienda pública muestra menú lateral con subcategorías
- [ ] Filtros funcionan correctamente por subcategoría
- [ ] No se pueden eliminar categorías/subcategorías con productos
- [ ] Todos los productos tienen categoría válida
- [ ] Las subcategorías de productos existen y pertenecen a su categoría
- [ ] Mensajes de error son claros y orientados al usuario

---

**Última actualización:** 2025-12-10  
**Versión:** 1.0  
**Estado:** ✅ Implementada
