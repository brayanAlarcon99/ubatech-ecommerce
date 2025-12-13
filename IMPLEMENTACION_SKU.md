# Implementación de Campo SKU en Productos

## 📋 Resumen de Cambios

Se ha agregado exitosamente un campo **SKU (Stock Keeping Unit)** a todos los productos del sistema. Este campo permite almacenar un código interno único para cada producto en la base de datos.

---

## ✨ Características Agregadas

### 1. **Tipo de Dato Actualizado**
- **Archivo:** `types/index.ts`
- Se agregó el campo `sku?: string` a la interfaz `Product`
- El campo es opcional para mantener compatibilidad con productos existentes

### 2. **Formulario de Productos Mejorado**
- **Archivo:** `components/admin/product-form.tsx`
- Nuevo campo de entrada: "SKU (Código Interno)"
- Placeholder de ejemplo: `Ej: SKU-001, PRD-2024-001`
- Se puede editar al crear o modificar un producto

### 3. **Visualización de SKU**
- **Archivo:** `components/admin/products-manager.tsx`
- El SKU se muestra en la tarjeta de cada producto (cuando existe)
- Se visualiza junto a la categoría y subcategoría

### 4. **Script de Migración de Datos**
- **Archivo:** `lib/migrate-sku.ts`
- Función `migrateSKU()` que actualiza todos los productos existentes
- Genera un SKU automático basado en el ID del producto si no tiene uno
- Formato: `SKU-{primeros 8 caracteres del ID}`
- Los productos que ya tienen SKU no se modifican

### 5. **API Endpoint de Migración**
- **Ruta:** `POST /api/migrate/sku`
- Ejecuta la migración de SKU para productos existentes
- Retorna cantidad de productos actualizados
- Incluye endpoint GET para instrucciones

### 6. **Panel de Control en Configuración**
- **Archivo:** `components/admin/sku-migration-panel.tsx`
- Interfaz gráfica para ejecutar la migración desde el panel admin
- Se encuentra en la sección "Configuración"
- Muestra resultados de la migración en tiempo real
- Notificaciones visuales de éxito/error

---

## 🚀 Cómo Usar

### Opción 1: Migración desde Panel de Control (Recomendado)
1. Accede al panel admin en `localhost:3000/admin/dashboard`
2. Navega a la pestaña **"Configuración"**
3. Desplázate hasta la sección **"Migración de SKU"**
4. Haz clic en el botón **"Ejecutar Migración de SKU"**
5. El sistema actualizará todos los productos automáticamente

### Opción 2: Migración via API
```bash
# Ejecutar migración
curl -X POST http://localhost:3000/api/migrate/sku

# Consultar información
curl -X GET http://localhost:3000/api/migrate/sku
```

### Opción 3: Crear/Editar Productos con SKU
1. Abre el panel admin en `localhost:3000/admin/dashboard`
2. Ve a **Productos**
3. Haz clic en **"Agregar Producto"** o edita uno existente
4. Completa el formulario incluyendo el campo **"SKU"**
5. Ejemplo: `SKU-001`, `PRD-2024-001`, `PROD-ABC123`
6. Guarda el producto

---

## 📊 Estructura de Datos

### Interfaz Product (types/index.ts)
```typescript
export interface Product {
  id: string                    // ID único en Firestore
  name: string                  // Nombre del producto
  description: string           // Descripción
  price: number                 // Precio
  category: string              // ID de categoría
  subcategory?: string          // ID de subcategoría (opcional)
  stock: number                 // Cantidad en stock
  image?: string                // URL o base64 de imagen
  sku?: string                  // ← NUEVO: Código SKU (opcional)
}
```

### Documento en Firestore (Collection: products)
```json
{
  "id": "abc123xyz",
  "name": "iPhone 15",
  "description": "Smartphone de última generación",
  "price": 999999,
  "category": "cat-001",
  "subcategory": "subcat-001",
  "stock": 10,
  "image": "data:image/...",
  "sku": "SKU-ABC123"
}
```

---

## 🔍 Ejemplos de SKU

| Producto | SKU Recomendado |
|----------|-----------------|
| iPhone 15 | SKU-IP15-001 |
| Samsung Galaxy S24 | SKU-SAM-S24 |
| AirPods Pro | SKU-APR-PRO |
| MacBook Pro 14" | SKU-MBP-14 |
| iPad Air | SKU-IPA-AIR |

---

## ✅ Validaciones

- ✓ El campo SKU es opcional (no obligatorio)
- ✓ Se pueden dejar productos sin SKU
- ✓ La migración solo actualiza productos sin SKU
- ✓ Se mantiene compatibilidad con datos existentes
- ✓ El SKU se almacena en la base de datos Firestore

---

## 🔐 Almacenamiento en Base de Datos

### Base de Datos: Firestore
- **Colección:** `products`
- **Campo:** `sku` (tipo: String, opcional)
- **Acceso:** Todos los productos pueden tener SKU
- **Sincronización:** Se guarda automáticamente al crear/editar

### Ejemplo de Documento Firestore:
```firestore
Collection: products
Document ID: abc123xyz
{
  category: "cat-001"
  description: "Smartphone de última generación"
  id: "abc123xyz"
  image: "data:image/jpeg;base64,..."
  name: "iPhone 15"
  price: 999999
  sku: "SKU-IP15-001"
  stock: 10
  subcategory: "subcat-001"
}
```

---

## 📝 Notas Importantes

1. **Migración Única:** La migración solo necesita ejecutarse una vez
2. **Compatibilidad:** Los productos existentes funcionan con o sin SKU
3. **Editabilidad:** El SKU puede modificarse en cualquier momento
4. **Búsqueda:** Puedes usar el SKU como identificador interno único
5. **Notificaciones:** El panel muestra confirmación al completar la migración

---

## 🛠️ Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregado campo `sku?: string` |
| `components/admin/product-form.tsx` | Agregar input de SKU en formulario |
| `components/admin/products-manager.tsx` | Mostrar SKU en tarjetas de producto |
| `components/admin/settings.tsx` | Importar SKUMigrationPanel |
| `lib/migrate-sku.ts` | **Nuevo archivo** - Script de migración |
| `app/api/migrate/sku/route.ts` | **Nuevo archivo** - API endpoint |
| `components/admin/sku-migration-panel.tsx` | **Nuevo archivo** - Panel de control |

---

## 🎯 Próximos Pasos Opcionales

Si deseas expandir esta funcionalidad:

1. **Búsqueda por SKU:** Agregar filtro de búsqueda por código SKU
2. **Importación:** Crear sistema para importar SKUs en bulk
3. **Códigos de Barras:** Integrar generación de códigos QR/barras
4. **Reportes:** Crear reportes de inventario con SKU
5. **Integración:** Conectar con sistemas ERP externos

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener dos productos con el mismo SKU?**
R: Sí, técnicamente puedes, pero se recomienda que cada SKU sea único.

**P: ¿Qué pasa si no ejecuto la migración?**
R: Los productos existentes funcionarán normalmente. Puedes ejecutar la migración cuando lo necesites.

**P: ¿Cómo cambio el SKU de un producto?**
R: Edita el producto desde "Productos" y actualiza el campo SKU.

**P: ¿Se eliminan los SKU existentes?**
R: No, la migración solo agrega SKU a productos que no lo tienen.

---

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Verifica que los cambios estén correctamente integrados
- Ejecuta la migración desde el panel de configuración
- Consulta los logs de la consola del navegador si hay errores
