# 🗄️ GUÍA DE LIMPIEZA DE FIRESTORE

## Verificar el Estado Actual

**Ejecutar diagnóstico:**
```
GET /api/debug/diagnostic
```

Esto te mostrará:
- Total de productos
- Productos sin categoría  
- Productos sin subcategoría
- Muestra de 5 productos

---

## 📋 Checklist de Limpieza

### 1. Validar Estructura de Productos

En la colección `products`, cada documento debe tener:

```javascript
{
  id: "abc123",              // ✅ String
  name: "iPhone 15",         // ✅ String
  description: "...",        // ✅ String
  price: 999.99,            // ✅ NUMBER (NO string)
  category: "celulares",    // ✅ String (ID, NO nombre)
  subcategory: "iphone",    // ✅ String (ID, NO nombre)
  stock: 5,                 // ✅ Number
  sku: "SKU-ABC123",        // ✅ String
  details: "",              // ✅ String (vacío o descripción)
  // Opcional:
  storeId: "ubatech"        // Si existe, debe ser válido
}
```

### 2. Buscar Productos Problemáticos

**Productos sin categoría:**
```javascript
db.collection('products')
  .where('category', '==', '')
  .get()
  .then(snapshot => {
    console.log(`Encontrados: ${snapshot.size} productos sin categoría`);
    snapshot.docs.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().name}`);
    });
  });
```

**Productos con precio como string (problema):**
```javascript
db.collection('products')
  .get()
  .then(snapshot => {
    const badPrices = snapshot.docs.filter(doc => 
      typeof doc.data().price === 'string'
    );
    console.log(`Encontrados: ${badPrices.length} productos con precio string`);
    badPrices.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().name} = ${doc.data().price}`);
    });
  });
```

### 3. Colecciones a Revisar

| Colección | Docs Min | Estado | Notas |
|-----------|----------|--------|-------|
| `products` | 5+ | ✅ Crítica | Backbone del sitio |
| `categories` | 3+ | ✅ Crítica | Min: celulares, electrónica, etc |
| `subcategories` | 5+ | ✅ Crítica | Min: Samsung, iPhone, Laptops |
| `stores` | 2+ | ✅ Importante | ubatech + djcelutecnico |
| `store_settings` | 2 | ✅ Importante | Configuración por tienda |
| `platform_info` | 1 | ✅ Importante | Info global |
| `adminUsers` | 1+ | ⚠️ Revisar | Solo admin activo |
| `orders` | 0+ | ✅ Normal | Se llena con órdenes |

### 4. Limpiar Datos Obsoletos

**Eliminar documentos de prueba:**
```javascript
const testNames = [
  'Test Product',
  'Demo Item', 
  'Prueba',
  'Producto Temporal'
];

testNames.forEach(name => {
  db.collection('products')
    .where('name', '==', name)
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        console.log(`Eliminar: ${doc.id} - ${name}`);
        // doc.ref.delete(); // Descomenta para eliminar
      });
    });
});
```

**Normalizar campos null:**
```javascript
db.collection('products')
  .where('details', '==', null)
  .get()
  .then(snapshot => {
    snapshot.docs.forEach(doc => {
      console.log(`Normalizar details en: ${doc.id}`);
      // doc.ref.update({ details: '' }); // Descomenta para actualizar
    });
  });
```

### 5. Verificar Relaciones

**Validar que todas las categorías de productos existen:**
```javascript
async function validateCategories() {
  const products = await db.collection('products').get();
  const categories = await db.collection('categories').get();
  
  const categoryIds = new Set(categories.docs.map(d => d.id));
  const invalidProducts = [];
  
  products.docs.forEach(doc => {
    const catId = doc.data().category;
    if (catId && !categoryIds.has(catId)) {
      invalidProducts.push({
        id: doc.id,
        name: doc.data().name,
        badCategory: catId
      });
    }
  });
  
  if (invalidProducts.length > 0) {
    console.log('Productos con categoría inválida:');
    console.table(invalidProducts);
  } else {
    console.log('✅ Todas las categorías son válidas');
  }
}
```

---

## 🔧 Operaciones de Limpieza

### A. Normalizar Precios (String → Number)

```javascript
async function fixPrices() {
  const batch = db.batch();
  const products = await db.collection('products').get();
  let count = 0;
  
  products.docs.forEach(doc => {
    const data = doc.data();
    if (typeof data.price === 'string') {
      // Convertir string a número
      const price = parseFloat(data.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) {
        batch.update(doc.ref, { price: price });
        count++;
      }
    }
  });
  
  console.log(`Fijando ${count} precios...`);
  await batch.commit();
  console.log('✅ Precios fijados');
}
```

### B. Normalizar Details (null → "")

```javascript
async function fixDetails() {
  const batch = db.batch();
  const products = await db.collection('products').get();
  let count = 0;
  
  products.docs.forEach(doc => {
    const data = doc.data();
    if (data.details === null || data.details === undefined) {
      batch.update(doc.ref, { details: '' });
      count++;
    }
  });
  
  console.log(`Fijando ${count} campos details...`);
  await batch.commit();
  console.log('✅ Details fijados');
}
```

### C. Eliminar Campos No Usados

```javascript
async function removeUnusedFields() {
  const batch = db.batch();
  const products = await db.collection('products').get();
  
  const fieldsToRemove = ['legacyId', 'tempField', 'migrationNote'];
  let count = 0;
  
  products.docs.forEach(doc => {
    const data = doc.data();
    const updateObj = {};
    
    fieldsToRemove.forEach(field => {
      if (field in data) {
        updateObj[field] = firebase.firestore.FieldValue.delete();
        count++;
      }
    });
    
    if (Object.keys(updateObj).length > 0) {
      batch.update(doc.ref, updateObj);
    }
  });
  
  console.log(`Eliminando ${count} campos...`);
  await batch.commit();
  console.log('✅ Campos no usados eliminados');
}
```

---

## 📊 Auditoría Completa

```javascript
async function auditDatabase() {
  console.log('🔍 Auditando Firestore...\n');
  
  // 1. Productos
  const products = await db.collection('products').get();
  const productsNoCategory = products.docs.filter(d => !d.data().category);
  const productsStringPrice = products.docs.filter(d => typeof d.data().price === 'string');
  
  console.log(`📦 PRODUCTOS: ${products.size} total`);
  console.log(`  - Sin categoría: ${productsNoCategory.size} ⚠️`);
  console.log(`  - Precio como string: ${productsStringPrice.size} ⚠️`);
  
  // 2. Categorías
  const categories = await db.collection('categories').get();
  console.log(`\n📁 CATEGORÍAS: ${categories.size} total`);
  
  // 3. Subcategorías
  const subcategories = await db.collection('subcategories').get();
  console.log(`📂 SUBCATEGORÍAS: ${subcategories.size} total`);
  
  // 4. Tiendas
  const stores = await db.collection('stores').get();
  console.log(`🏪 TIENDAS: ${stores.size} total`);
  
  // 5. Usuarios Admin
  const admins = await db.collection('adminUsers').get();
  console.log(`👤 ADMIN USERS: ${admins.size} total`);
  
  // 6. Órdenes
  const orders = await db.collection('orders').get();
  console.log(`📋 ÓRDENES: ${orders.size} total`);
  
  console.log('\n✅ Auditoría completada');
}
```

---

## ⚠️ Antes de Eliminar Datos

**SIEMPRE:**
1. ✅ Hacer backup de Firestore (descargar JSON)
2. ✅ Probar operaciones en datos de prueba primero
3. ✅ Verificar que el código no depende de campos que vas a eliminar
4. ✅ Documentar los cambios

---

## 📌 Datos Seguros de Eliminar

- ❌ Documentos con `name` como "Test", "Demo", "Prueba"
- ❌ Campos `legacyId` o `tempField` no usados
- ❌ Órdenes vacías o incompletas (sin items)
- ❌ Productos sin `category` válida

## 🛑 NUNCA Eliminar

- ✅ Documentos en `categories` o `subcategories` (aunque estén vacíos)
- ✅ Configuración de `stores`
- ✅ Documentos en `adminUsers` (incluso inactivos)
- ✅ El documento `platform_info`

---

## 🎯 Pasos Recomendados

1. **Ejecutar `/api/debug/diagnostic`** para ver estado
2. **Validar estructura** con script de auditoría
3. **Normalizar precios** si alguno es string
4. **Limpiar documentos de prueba**
5. **Verificar relaciones** entre colecciones
6. **Eliminar campos obsoletos** si no se usan

---

**Última verificación:** 15 de Enero, 2026  
**Status:** ✅ Listo para limpiar
