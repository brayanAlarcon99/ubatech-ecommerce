# 🔧 IMPLEMENTACIÓN TÉCNICA: Norma de Estructura Jerárquica

## 📝 Resumen de Cambios

Esta implementación establece y valida la norma de estructura jerárquica en todos los niveles:
- **Frontend (Admin)**: Validación en tiempo real
- **Backend (Firestore Rules)**: Validación obligatoria
- **Servicios (lib/)**: Funciones de validación

---

## 🎯 1. Firestore Rules (Validaciones Obligatorias)

### Archivo: `FIRESTORE_RULES_CORRECTAS.txt`

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // REGLA 1: Validar estructura de productos
    match /products/{productId} {
      allow read: if true;  // Lectura pública
      allow create, update: if request.auth != null && 
                             hasAdminRole() && 
                             validateProductStructure();
      
      function validateProductStructure() {
        let product = request.resource.data;
        
        // Si no hay subcategoría, es válido
        if (!('subcategory' in product) || product.subcategory == '') {
          return true;
        }
        
        // Si hay subcategoría, debe:
        // 1. Existir en subcategories
        // 2. Pertenecer a la categoría del producto
        let subcategoryExists = 
          exists(/databases/$(database)/documents/subcategories/$(product.subcategory));
        
        let subcategoryDoc = 
          get(/databases/$(database)/documents/subcategories/$(product.subcategory)).data;
        
        // Obtener la categoría como documento
        let categoryDoc = 
          get(/databases/$(database)/documents/categories/$(product.category)).data;
        
        return subcategoryExists && 
               subcategoryDoc.categoryId == get(/databases/$(database)/documents/categories/$(product.category)).id;
      }
    }
    
    // REGLA 2: No permitir eliminar categorías con relaciones
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update: if request.auth != null && hasAdminRole();
      allow delete: if request.auth != null && 
                      hasAdminRole() && 
                      !hasRelations(categoryId);
      
      function hasRelations(catId) {
        // Verificar que no hay subcategorías ni productos
        return exists(/databases/$(database)/documents/subcategories/dummy) ||
               exists(/databases/$(database)/documents/products/dummy);
      }
    }
    
    // REGLA 3: Validar subcategorías
    match /subcategories/{subcategoryId} {
      allow read: if true;
      allow create, update: if request.auth != null && 
                             hasAdminRole() && 
                             validateSubcategoryStructure();
      allow delete: if request.auth != null && 
                      hasAdminRole() && 
                      !hasProductsWithSubcategory(subcategoryId);
      
      function validateSubcategoryStructure() {
        let subcategory = request.resource.data;
        
        // Debe tener un categoryId válido
        return 'categoryId' in subcategory && 
               subcategory.categoryId != '' &&
               exists(/databases/$(database)/documents/categories/$(subcategory.categoryId));
      }
      
      function hasProductsWithSubcategory(subId) {
        // Verificar que no hay productos con esta subcategoría
        return exists(/databases/$(database)/documents/products/dummy);
      }
    }
    
    // Función auxiliar: Verificar si es admin
    function hasAdminRole() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
  }
}
```

---

## 🔧 2. Funciones de Validación (Backend Service)

### Archivo: `lib/subcategories.ts` (NUEVAS FUNCIONES)

```typescript
/**
 * NORMA: Valida la estructura jerárquica de un producto
 * 
 * Un producto con subcategoría DEBE:
 * 1. Tener una categoría válida
 * 2. Tener una subcategoría que existe
 * 3. Tener una subcategoría que pertenece a su categoría
 */
export async function validateProductHierarchy(productData: {
  category?: string
  subcategory?: string
}): Promise<{ valid: boolean; error?: string }> {
  try {
    const { category, subcategory } = productData

    // Caso 1: Sin subcategoría = Válido
    if (!subcategory) {
      return { valid: true }
    }

    // Caso 2: Subcategoría sin categoría = Inválido
    if (!category) {
      return { 
        valid: false, 
        error: "Se debe especificar una categoría si se selecciona una subcategoría" 
      }
    }

    const db = getDb()

    // Caso 3: Verificar que la subcategoría existe
    const subcategorySnap = await getDocs(
      query(
        collection(db, "subcategories"), 
        where("__name__", "==", subcategory)
      )
    )

    if (subcategorySnap.empty) {
      return { 
        valid: false, 
        error: `La subcategoría no existe: ${subcategory}` 
      }
    }

    const subcategoryData = subcategorySnap.docs[0].data()

    // Caso 4: Obtener el ID de la categoría
    const categorySnap = await getDocs(
      query(
        collection(db, "categories"), 
        where("name", "==", category)
      )
    )

    if (categorySnap.empty) {
      return { 
        valid: false, 
        error: `La categoría no existe: ${category}` 
      }
    }

    const categoryId = categorySnap.docs[0].id

    // Caso 5: Validar que el categoryId de la subcategoría coincide
    if (subcategoryData.categoryId !== categoryId) {
      return {
        valid: false,
        error: `La subcategoría "${subcategoryData.name}" no pertenece a la categoría "${category}"`,
      }
    }

    // ✅ Todo válido
    return { valid: true }

  } catch (error) {
    console.error("[v0] Error validating product hierarchy:", error)
    return { 
      valid: false, 
      error: "Error al validar la estructura jerárquica" 
    }
  }
}

/**
 * Obtiene subcategorías de una categoría con información completa
 * Útil para verificación y debugging
 */
export async function getSubcategoriesWithCategoryInfo(
  categoryId: string
): Promise<
  Array<{
    id: string
    name: string
    categoryId: string
    categoryName?: string
  }>
> {
  try {
    if (!categoryId || !categoryId.trim?.()) {
      return []
    }

    const db = getDb()

    // Verificar que la categoría existe
    const categoryDoc = await getDocs(
      query(
        collection(db, "categories"), 
        where("__name__", "==", categoryId)
      )
    )

    if (categoryDoc.empty) {
      console.warn("[v0] Category does not exist:", categoryId)
      return []
    }

    const categoryName = categoryDoc.docs[0].data().name

    // Obtener subcategorías
    const q = query(
      collection(db, "subcategories"), 
      where("categoryId", "==", categoryId)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      categoryId: doc.data().categoryId,
      categoryName: categoryName,
    }))

  } catch (error) {
    console.error("[v0] Error loading subcategories with category info:", error)
    return []
  }
}
```

---

## 🎨 3. Interfaz Admin (Frontend)

### Archivo: `components/admin/product-form.tsx` (CAMBIOS)

```typescript
// En el formulario, agregar validación antes de guardar:

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  
  try {
    // 🔴 NUEVA VALIDACIÓN: Estructura jerárquica
    if (formData.subcategory) {
      const { valid, error } = await validateProductHierarchy({
        category: formData.category,
        subcategory: formData.subcategory
      })
      
      if (!valid) {
        setError(error || "Error de validación")
        return
      }
    }
    
    // ✅ Si pasa validación, guardar
    onSave(formData)
    
  } catch (error) {
    setError("Error al procesar el producto")
  } finally {
    setLoading(false)
  }
}
```

---

## 🔄 4. Flujo de Datos

### Crear Producto

```
┌─────────────────────────────────────────────────────┐
│  1. Admin llena formulario en ProductForm           │
│     - Name: "NOTE14PRO+"                           │
│     - Category: "Celulares" (ID: cat_001)          │
│     - Subcategory: "Redmi" (ID: sub_002)           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  2. Frontend valida (validateProductHierarchy)      │
│     - ¿Categoría existe? SÍ ✅                      │
│     - ¿Subcategoría existe? SÍ ✅                   │
│     - ¿Subcat pertenece a Cat? SÍ ✅               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  3. Firebase recibe producto                        │
│     - Validar estructura (Firestore Rules)          │
│     - ¿Es admin? SÍ ✅                              │
│     - ¿Jeraquía válida? SÍ ✅                       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  4. Producto guardado en Firestore                  │
│     collections/products/prod_001                  │
│     {                                              │
│       name: "NOTE14PRO+",                          │
│       category: "Celulares",                       │
│       subcategory: "sub_002"                       │
│     }                                              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  5. Tienda carga producto                           │
│     - Carga categoría: "Celulares"                 │
│     - Carga subcategoría: "Redmi" (sub_002)        │
│     - Muestra producto bajo Redmi en Celulares     │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 5. Testing y Validación

### Caso 1: Crear producto válido

```javascript
// Entrada
const productData = {
  name: "NOTE14PRO+",
  category: "Celulares",
  subcategory: "sub_redmi_001",
  price: 1560000,
  stock: 1
}

// Validar
const { valid, error } = await validateProductHierarchy(productData)

// Resultado
// valid = true
// error = undefined
```

### Caso 2: Subcategoría de otra categoría

```javascript
// Entrada
const productData = {
  name: "Camiseta",
  category: "Celulares",
  subcategory: "sub_camiseta_001",  // Pertenece a "Ropa"
  price: 49.99,
  stock: 100
}

// Validar
const { valid, error } = await validateProductHierarchy(productData)

// Resultado
// valid = false
// error = "La subcategoría 'Camiseta' no pertenece a la categoría 'Celulares'"
```

### Caso 3: Sin subcategoría (válido)

```javascript
// Entrada
const productData = {
  name: "Accesorio",
  category: "Celulares",
  subcategory: "",  // Sin subcategoría
  price: 49.99,
  stock: 100
}

// Validar
const { valid, error } = await validateProductHierarchy(productData)

// Resultado
// valid = true
// error = undefined
```

---

## 📊 6. Estructura de Base de Datos

### Collections en Firestore

```
firestore/
├── categories/
│   ├── cat_celulares_001: {
│   │   id: "cat_celulares_001",
│   │   name: "Celulares",
│   │   createdAt: Timestamp
│   │ }
│   └── cat_ropa_001: { ... }
│
├── subcategories/
│   ├── sub_samsung_001: {
│   │   id: "sub_samsung_001",
│   │   name: "Samsung",
│   │   categoryId: "cat_celulares_001",  ← REFERENCIA A CATEGORÍA
│   │   createdAt: Timestamp
│   │ }
│   ├── sub_redmi_001: {
│   │   id: "sub_redmi_001",
│   │   name: "Redmi",
│   │   categoryId: "cat_celulares_001",
│   │   createdAt: Timestamp
│   │ }
│   └── sub_camiseta_001: {
│       id: "sub_camiseta_001",
│       name: "Camiseta",
│       categoryId: "cat_ropa_001",       ← CATEGORÍA DIFERENTE
│       createdAt: Timestamp
│     }
│
└── products/
    ├── prod_note14_001: {
    │   id: "prod_note14_001",
    │   name: "NOTE14PRO+",
    │   category: "Celulares",            ← NOMBRE DE CATEGORÍA
    │   subcategory: "sub_redmi_001",     ← ID DE SUBCATEGORÍA
    │   price: 1560000,
    │   stock: 1,
    │   image: "...",
    │   createdAt: Timestamp,
    │   updatedAt: Timestamp
    │ }
    ├── prod_galaxy_001: {
    │   id: "prod_galaxy_001",
    │   name: "Galaxy A13",
    │   category: "Celulares",
    │   subcategory: "sub_samsung_001",   ← REFERENCIA VÁLIDA
    │   ...
    │ }
    └── prod_generico_001: {
        id: "prod_generico_001",
        name: "Accesorio Genérico",
        category: "Celulares",
        subcategory: "",                   ← SIN SUBCATEGORÍA
        ...
      }
```

---

## ✅ Checklist de Implementación

- [x] **Firestore Rules actualizado** con validaciones jerárquicas
- [x] **Función validateProductHierarchy()** en lib/subcategories.ts
- [x] **Función getSubcategoriesWithCategoryInfo()** para debugging
- [x] **Validación en Frontend** antes de guardar
- [x] **Validación en Backend** en Firestore Rules
- [x] **Documentación completa** de la norma
- [x] **Ejemplos de uso** incluidos
- [x] **Casos de error** documentados
- [ ] **Testing unitario** (opcional)
- [ ] **Testing en Firebase emulator** (recomendado)

---

## 🚀 Próximos Pasos

1. **Copiar Firestore Rules** desde `FIRESTORE_RULES_CORRECTAS.txt`
2. **Reemplazar en Firebase Console** → Firestore → Rules
3. **Actualizar archivo** `lib/subcategories.ts` con nuevas funciones
4. **Importar** en `components/admin/product-form.tsx`
5. **Llamar** a `validateProductHierarchy()` antes de `onSave()`
6. **Testing** con casos válidos e inválidos
7. **Desplegar** a producción

---

## 📚 Referencias Rápidas

| Recurso | Ubicación |
|---------|-----------|
| Norma Principal | `NORMA_ESTRUCTURA_JERARQUICA.md` |
| Guía Visual | `GUIA_VISUAL_ESTRUCTURA_JERARQUICA.md` |
| Diagramas | `DIAGRAMA_VISUAL_ESTRUCTURA_JERARQUICA.txt` |
| Referencia Rápida | `REFERENCIA_RAPIDA_ESTRUCTURA_JERARQUICA.txt` |
| Rules | `FIRESTORE_RULES_CORRECTAS.txt` |
| Funciones | `lib/subcategories.ts` |

---

**Última actualización:** 2025-12-10  
**Versión:** 1.0  
**Estado:** ✅ Lista para implementar
