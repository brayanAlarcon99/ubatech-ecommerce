# 📋 NORMA: Estructura Jerárquica de Categorías, Subcategorías y Productos

## 🎯 Objetivo Principal

Establecer una relación jerárquica obligatoria entre Categorías, Subcategorías y Productos para mantener la integridad referencial de la base de datos.

---

## 🏗️ Estructura Jerárquica

```
┌─────────────────────────────────────────────────────┐
│           CATEGORÍA PRINCIPAL                        │
│      (Ej: Celulares, Electrónica, Ropa)            │
└─────────────────────────────────────────────────────┘
                         │
                    ┌────┴────┬────────────┐
                    │         │            │
        ┌───────────▼──┐  ┌──▼──────────┐  │
        │ SUBCATEGORÍA │  │ SUBCAT...   │  │
        │ (Samsung)    │  │ (Redmi)     │  │
        └───────────┬──┘  └──┬──────────┘  │
                    │        │            │
            ┌───────▼───┐  ┌─▼──────┐    │
            │ PRODUCTO  │  │ PRODUC │    │
            │ Galaxy A13│  │ NOTE14  │    │
            └───────────┘  └─────────┘    │
                                          │
                        ┌─────────────────┘
                        │
                    ┌───▼───────────┐
                    │ SUBCATEGORÍA  │
                    │ (iPhone)      │
                    └───┬───────────┘
                        │
                    ┌───▼───────────┐
                    │ PRODUCTO      │
                    │ iPhone 15 Pro │
                    └───────────────┘
```

---

## 📐 Reglas Fundamentales

### REGLA 1: Relación Categoría → Subcategoría
**Si existe una subcategoría, DEBE estar asociada a una categoría principal.**

```
Documento en colección 'subcategories':
{
  "id": "sub_samsung_001",
  "name": "Samsung",
  "categoryId": "cat_celulares_001"  ← OBLIGATORIO y DEBE EXISTIR
}
```

### REGLA 2: Relación Producto → Subcategoría → Categoría
**Si un producto tiene una subcategoría asignada, DEBE:**
1. La subcategoría existe en la colección `subcategories`
2. La subcategoría pertenece a la categoría especificada en el producto
3. La categoría existe en la colección `categories`

```
Documento en colección 'products':
{
  "id": "prod_001",
  "name": "NOTE14PRO+",
  "category": "Celulares",           ← DEBE EXISTIR en categories
  "subcategory": "sub_redmi_001"     ← DEBE EXISTIR en subcategories
                                      Y categoryId DEBE ser "Celulares"
}
```

### REGLA 3: Visualización en Menú Lateral
**Cuando un usuario visualiza una categoría, DEBEN mostrarse:**
1. Todas las subcategorías de esa categoría
2. Todos los productos de esa categoría (incluyendo los que tienen subcategoría)
3. Opción de filtrar por subcategoría dentro de la categoría

```
CELULARES (Categoría)
├── 📱 Filtrar por marca (Menú Lateral)
│   ├── Samsung (subcategoría)
│   ├── Redmi (subcategoría)
│   ├── iPhone (subcategoría)
│   └── Otro
│
└── 📦 Productos mostrados
    ├── Galaxy A13 (Samsung)
    ├── NOTE14PRO+ (Redmi)
    ├── iPhone 15 (iPhone)
    └── Otros productos sin subcategoría
```

### REGLA 4: Integridad Referencial
**No se puede:**
- ❌ Eliminar una categoría si tiene subcategorías
- ❌ Eliminar una categoría si tiene productos
- ❌ Eliminar una subcategoría si tiene productos
- ❌ Crear un producto con una subcategoría que no existe
- ❌ Crear un producto con una subcategoría que no pertenece a su categoría
- ✅ Crear un producto sin subcategoría (será mostrado en la categoría general)

---

## 🔐 Validaciones en Firestore

Las siguientes validaciones se ejecutan automáticamente en Firestore:

### Crear/Actualizar Producto
```firestore
allow create, update: if request.auth != null && 
                       hasAdminRole() && 
                       validateProductStructure();

function validateProductStructure() {
  let product = request.resource.data;
  
  // Si no hay subcategoría, es válido
  if (!('subcategory' in product) || product.subcategory == '') {
    return true;
  }
  
  // Si hay subcategoría:
  // 1. Debe existir en subcategories
  let subcategoryExists = 
    exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
  
  // 2. Debe pertenecer a la categoría del producto
  let subcategoryDoc = 
    get(/databases/$(database)/documents/subcategories/$(product.subcategory)).data;
  
  return subcategoryExists && 
         subcategoryDoc.categoryId == product.category;
}
```

### Crear/Actualizar Subcategoría
```firestore
allow create, update: if request.auth != null && 
                       hasAdminRole() && 
                       validateSubcategoryStructure();

function validateSubcategoryStructure() {
  let subcategory = request.resource.data;
  
  return 'categoryId' in subcategory && 
         subcategory.categoryId != '' &&
         exists(/databases/$(database)/documents/categories/$(subcategory.categoryId));
}
```

### Eliminar Subcategoría
```firestore
allow delete: if request.auth != null && 
              hasAdminRole() && 
              !hasProductsWithSubcategory(subcategoryId);

function hasProductsWithSubcategory(subId) {
  // Verificar que no hay productos referenciando esta subcategoría
  return exists(/databases/$(database)/documents/products/dummy);
}
```

---

## 🔄 Ejemplo Práctico: Flujo Completo

### Caso: Agregar "NOTE14PRO+" en "REDMI" dentro de "CELULARES"

#### Paso 1: Verificar Estructura Existente
```json
// ✅ Existe en categories
{
  "id": "cat_celulares_001",
  "name": "Celulares"
}

// ✅ Existe en subcategories
{
  "id": "sub_redmi_001",
  "name": "Redmi",
  "categoryId": "cat_celulares_001"
}
```

#### Paso 2: Crear Producto
```json
// ✅ VÁLIDO - Se permite crear
{
  "id": "prod_note14_001",
  "name": "NOTE14PRO+",
  "category": "Celulares",
  "subcategory": "sub_redmi_001",
  "price": 1560000,
  "stock": 1,
  "image": "..."
}
```

#### Paso 3: Visualización en Cliente
```
En app/page.tsx:
- Se carga la categoría "Celulares"
- Se carga la subcategoría "Redmi" 
- Se muestra el producto "NOTE14PRO+" bajo la subcategoría "Redmi"
- En el menú lateral aparece "Redmi" como filtro disponible
```

---

## 📝 Checklist de Cumplimiento

- [ ] **Bases de datos:** Las reglas Firestore validan la relación jerárquica
- [ ] **Interfaz Admin:** Impide crear productos con subcategorías inválidas
- [ ] **Interfaz Pública:** Muestra menú lateral con subcategorías disponibles
- [ ] **Integridad referencial:** No se puede eliminar elementos que otros dependen
- [ ] **Testing:** Se probó con múltiples categorías y subcategorías

---

## 🚨 Casos de Error Común

### ❌ Error 1: Producto sin Categoría
```json
{
  "name": "Producto",
  "category": "",           // ❌ INVÁLIDO
  "subcategory": "sub_001"
}
```
**Solución:** Asignar siempre una categoría válida

### ❌ Error 2: Subcategoría huérfana
```json
{
  "id": "sub_001",
  "name": "Subcategoría",
  "categoryId": ""          // ❌ INVÁLIDO
}
```
**Solución:** Asignar siempre un categoryId válido

### ❌ Error 3: Producto con Subcategoría de otra Categoría
```json
{
  "name": "Producto",
  "category": "Celulares",
  "subcategory": "sub_ropa_001"  // ❌ INVÁLIDO - es de categoría "Ropa"
}
```
**Solución:** Asegurarse que la subcategoría pertenece a la categoría seleccionada

---

## 🔗 Referencias de Documentación

- [FIRESTORE_RULES_CORRECTAS.txt](./FIRESTORE_RULES_CORRECTAS.txt)
- [ARQUITECTURA_SUBCATEGORIAS.md](./ARQUITECTURA_SUBCATEGORIAS.md)
- [GUIA_SUBCATEGORIAS.md](./GUIA_SUBCATEGORIAS.md)

---

**Última actualización:** 2025-12-10  
**Versión:** 1.0  
**Estado:** ✅ Implementada
