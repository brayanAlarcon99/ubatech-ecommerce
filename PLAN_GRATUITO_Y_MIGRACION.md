# 🎉 PLAN GRATUITO FIREBASE STORAGE + GUÍA DE MIGRACIÓN

## 📋 ÍNDICE
1. [Plan Gratuito Detalles](#plan-gratuito)
2. [Cómo Activar](#activar)
3. [Límites y Cuotas](#límites)
4. [Guía de Migración](#migración)
5. [Scripts y Herramientas](#scripts)
6. [Verificación](#verificación)

---

## PLAN GRATUITO DETALLES {#plan-gratuito}

### ¿Qué Incluye?

```
┌─────────────────────────────────────────────────────────┐
│         FIREBASE STORAGE - PLAN GRATUITO (Spark)        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ALMACENAMIENTO:                                         │
│  ✅ 5 GB/mes GRATIS (renovables cada mes)              │
│  └─ Después del quinto: Se congela (no se borra)      │
│                                                         │
│ DESCARGAS (Egress):                                    │
│  ✅ 1 GB/mes GRATIS                                   │
│  └─ Después: Pagas $0.12/GB (opcional)                │
│                                                         │
│ OPERACIONES:                                           │
│  ✅ Incluidas sin cargo (upload/download/list)       │
│                                                         │
│ UBICACIÓN:                                             │
│  ✅ us-central1 (gratis) o regional (también gratis)  │
│                                                         │
│ DURACIÓN:                                              │
│  ✅ Ilimitada (mientras uses Google Cloud)            │
│  ✅ Sin tarjeta de crédito requerida                  │
│  ✅ Sin conversión automática a pago                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ¿Qué NO Incluye?

```
❌ No incluye (Firestore Database):
   Eso es otro servicio, tiene su propio plan gratuito

❌ No incluye (Cloud Functions):
   Necesario si quieres procesar imágenes automáticamente
   (pero no es obligatorio)

✅ Lo que sí puedes hacer sin pagar:
   - Subir imágenes ilimitadas
   - Descargar 1 GB/mes
   - Listar, mover, eliminar archivos
   - Establecer reglas de seguridad
   - Usar CDN global
```

### Tu Caso: ¿Cuánto Costaría?

**5,000 productos con 4 imágenes cada uno:**

```
ALMACENAMIENTO:
├─ Total: 20,000 × 300 KB = 6 GB
├─ Plan gratuito: 5 GB ✅
├─ Diferencia: 1 GB
└─ Costo: GRATIS (dentro de límite)

DESCARGAS (10 vistas/mes por imagen):
├─ Total: 20,000 × 10 = 200,000 descargas
├─ Datos: 200,000 × 300 KB = 60 GB
├─ Plan gratuito: 1 GB ✅
├─ Diferencia: 59 GB
├─ Costo: (59 × $0.12) = $7.08/mes
└─ Total: 7.08 × 12 = $85/año

RESULTADO:
├─ Plan gratuito cubre: Almacenamiento (5 GB)
├─ Pequeño pago: Descargas ($85/año)
├─ TOTAL: ~$85/año O practicamente GRATIS
```

**CONCLUSIÓN: El plan gratuito cubre casi todo. Solo pagarías por descargas excesivas.**

---

## CÓMO ACTIVAR {#activar}

### Paso 1: Abrir Firebase Console

```
1. Ir a: https://console.firebase.google.com
2. Hacer login con tu cuenta Google
3. Seleccionar proyecto: ubatech-a8650
```

### Paso 2: Habilitar Storage

**Si ya está habilitado:**
```
Firebase Console → Storage
└─ Ya deberías ver tu bucket
```

**Si NO está habilitado:**
```
1. Firebase Console → Storage (en el menú izquierdo)
2. Click: "Get Started"
3. Seleccionar regla de seguridad:
   └─ Seleccionar: "Start in test mode" (para desarrollo)
4. Seleccionar ubicación:
   └─ Dejar por defecto: us-central1
5. Click: "Create"
6. ¡Listo! Storage está habilitado
```

### Paso 3: Verificar Plan Gratuito

```
Firebase Console → Storage → Settings
├─ Ubicación: us-central1 ✅
├─ Plan: Deberías ver "Spark (Free)" o similar
└─ Límites: 5 GB almacenamiento, 1 GB descargas/mes
```

### Paso 4: Configurar Reglas de Seguridad

**Por defecto en test mode (permisivo):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Para producción (recomendado):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de imágenes
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## LÍMITES Y CUOTAS {#límites}

### Tabla de Límites

```
┌──────────────────────────────┬──────────────┬──────────────┐
│ Característica               │ Plan Gratuito│ Plan Pago    │
├──────────────────────────────┼──────────────┼──────────────┤
│ Almacenamiento               │ 5 GB/mes     │ Ilimitado    │
│ Descargas                    │ 1 GB/mes     │ Ilimitado    │
│ Tamaño máximo por archivo    │ 5 TB         │ 5 TB         │
│ Cantidad de archivos         │ Ilimitada    │ Ilimitada    │
│ Operaciones API              │ Incluidas    │ Incluidas    │
│ Tarjeta de crédito           │ No necesaria │ Requerida    │
│ Conversión automática        │ No           │ N/A          │
└──────────────────────────────┴──────────────┴──────────────┘
```

### Cuota Diaria

```
Plan Gratuito (Spark):
├─ 5 GB de almacenamiento/mes
├─ 1 GB de descargas/mes
└─ Si excedes: Simplemente pagas (sin bloqueo)

Plan Pago (Blaze):
├─ Ilimitado (pagas solo lo que uses)
├─ Facturación por minuto
└─ Puedes establecer presupuesto máximo
```

### ¿Qué Pasa Si Excedo los Límites?

```
ALMACENAMIENTO (5 GB):
├─ Si excedes: Se congela la escritura
├─ Los datos existentes: Se mantienen
├─ Para continuar: Actualiza a plan pago O elimina datos
└─ Tiempo: Puedes mantenerlo indefinidamente sin pagar

DESCARGAS (1 GB):
├─ Si excedes: Pagas la cantidad adicional
├─ No se bloquea: Las descargas continúan
├─ Facturación: Automática al final del mes
└─ Costo: $0.12/GB (muy barato)
```

---

## GUÍA DE MIGRACIÓN {#migración}

### Fase 1: PREPARACIÓN (1 día)

#### 1.1 Backup de Firestore
```powershell
# Opción A: Console (Recomendado para primera vez)
# Firestore Database → Datos → Exportar colección

# Opción B: CLI
firebase firestore:export --export-path=backup-2025-01-19
```

#### 1.2 Crear Carpeta en Storage
```
Firebase Console → Storage
├─ Crear carpeta: "products"
│  └─ Dentro: "product-id-1", "product-id-2", etc.
└─ Estructura final:
   /products/
   ├─ product-1/
   │  ├─ image-0.jpg
   │  ├─ image-1.jpg
   │  └─ image-2.jpg
   └─ product-2/
      └─ ...
```

#### 1.3 Descargar serviceAccountKey.json
```
1. Firebase Console → Settings ⚙️
2. Service Accounts
3. "Generate New Private Key"
4. Guardar en: D:\ubatech\serviceAccountKey.json
5. Nunca compartir este archivo
```

### Fase 2: MIGRACIÓN AUTOMÁTICA (1 día)

#### 2.1 Script de Migración

**Crear: D:\ubatech\migrate-to-storage.js**

```javascript
#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ubatech-a8650.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function migrateToStorage() {
  console.log('🚀 Iniciando migración de imágenes a Firebase Storage...\n');

  try {
    const snapshot = await db.collection('products').get();
    console.log(`📦 Total de productos: ${snapshot.size}\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
      const product = doc.data();
      const productId = doc.id;

      if (!product.images || product.images.length === 0) {
        skipCount++;
        continue;
      }

      console.log(`🔄 Procesando: ${product.name}`);

      const newImages = [];

      for (let i = 0; i < product.images.length; i++) {
        const imageData = product.images[i];

        // Si ya es URL, mantenerla
        if (!imageData.startsWith('data:')) {
          console.log(`   ✅ Imagen ${i + 1}: Ya es URL`);
          newImages.push(imageData);
          continue;
        }

        try {
          // Convertir base64 a Buffer
          const base64Parts = imageData.split(',');
          const base64String = base64Parts[1] || base64Parts[0];
          const buffer = Buffer.from(base64String, 'base64');

          // Crear ruta en Storage
          const timestamp = Date.now();
          const fileName = `products/${productId}/image-${i}-${timestamp}.jpg`;

          // Subir a Storage
          const file = bucket.file(fileName);
          await file.save(buffer, {
            metadata: {
              contentType: 'image/jpeg',
              metadata: {
                productId: productId,
                productName: product.name,
                imageIndex: i
              }
            }
          });

          // Hacer público el archivo
          await file.makePublic();

          // Obtener URL
          const publicUrl = file.publicUrl();
          newImages.push(publicUrl);

          console.log(`   ✅ Imagen ${i + 1}: Subida a Storage`);

        } catch (error) {
          console.error(`   ❌ Error en imagen ${i + 1}:`, error.message);
          newImages.push(imageData); // Mantener original si falla
          errorCount++;
        }
      }

      // Actualizar Firestore con URLs
      try {
        await db.collection('products').doc(productId).update({
          images: newImages,
          migratedToStorage: true,
          migrationDate: new Date()
        });

        console.log(`   ✅ Documento actualizado\n`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error actualizando documento:`, error.message);
        errorCount++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN\n');
    console.log(`   ✅ Productos migrados: ${successCount}`);
    console.log(`   ⏭️  Productos omitidos: ${skipCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 ¡Migración completada exitosamente!');
      console.log('📊 Todos los productos están en Storage');
    } else {
      console.log('⚠️ Migración completada con algunos errores');
      console.log('🔄 Puedes re-ejecutar el script para reintentar\n');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

migrateToStorage().then(() => {
  console.log('Cerrando conexión...');
  process.exit(0);
});
```

#### 2.2 Ejecutar la Migración

```powershell
# En D:\ubatech, PowerShell:

# 1. Instalar dependencias si falta firebase-admin
npm install firebase-admin

# 2. Ejecutar script
node migrate-to-storage.js

# 3. Esperar a que termine (10-30 minutos según cantidad)
```

**Salida esperada:**
```
🚀 Iniciando migración de imágenes a Firebase Storage...

📦 Total de productos: 5000

🔄 Procesando: iPhone 14 Pro
   ✅ Imagen 1: Subida a Storage
   ✅ Imagen 2: Subida a Storage
   ✅ Imagen 3: Subida a Storage
   ✅ Imagen 4: Subida a Storage
   ✅ Documento actualizado

... [más productos]

============================================================
📊 RESUMEN DE MIGRACIÓN

   ✅ Productos migrados: 5000
   ⏭️  Productos omitidos: 0
   ❌ Errores: 0
============================================================

🎉 ¡Migración completada exitosamente!
```

### Fase 3: ACTUALIZAR CÓDIGO (1 día)

#### 3.1 Crear Librería image-storage.ts

**D:\ubatech\lib\image-storage.ts:**

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { getApp } from "firebase/app"

export async function uploadProductImage(
  productId: string,
  file: File,
  imageIndex: number
): Promise<string> {
  const storage = getStorage(getApp())
  const timestamp = Date.now()
  const fileName = `products/${productId}/image-${imageIndex}-${timestamp}.jpg`
  const storageRef = ref(storage, fileName)

  // Subir archivo
  await uploadBytes(storageRef, file)

  // Obtener URL pública
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl || !imageUrl.includes('firebasestorage')) {
      return
    }

    const storage = getStorage(getApp())
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.warn('Error deleting image:', error)
  }
}

export function isBase64Image(data: string): boolean {
  return typeof data === 'string' && data.startsWith('data:')
}
```

#### 3.2 Actualizar product-form.tsx

**Cambios en components/admin/product-form.tsx:**

```tsx
// ANTES (Con base64):
import { compressImage } from "@/lib/image-compression"

const handleImageUpload = async (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    setFormData({
      ...formData,
      images: [...formData.images, e.target.result]
    })
  }
  reader.readAsDataURL(file)
}

// DESPUÉS (Con Storage):
import { uploadProductImage } from "@/lib/image-storage"

const handleImageUpload = async (file: File) => {
  try {
    const productId = editingProduct?.id || 'new'
    const imageIndex = formData.images.length
    
    // Subir a Storage
    const imageUrl = await uploadProductImage(productId, file, imageIndex)
    
    // Guardar URL en formData
    setFormData({
      ...formData,
      images: [...formData.images, imageUrl]
    })
    
    console.log('✅ Imagen subida a Storage')
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    setError('Error al subir imagen')
  }
}
```

### Fase 4: TESTING (1 día)

#### 4.1 Verificar Migración

```powershell
# 1. Verificar que las imágenes están en Storage
firebase storage:ls gs://ubatech-a8650.appspot.com/products

# 2. Verificar que Firestore tiene URLs
# Firebase Console → Firestore → Seleccionar documento
# └─ Campo "images" debe tener URLs tipo:
#    https://firebasestorage.googleapis.com/v0/b/...

# 3. Probar la aplicación
npm run dev
# └─ Abrir: http://localhost:3000
# └─ Ir a: Admin → Productos
# └─ Verificar que las imágenes se cargan
```

#### 4.2 Checklist de Verificación

```
✅ Las imágenes aparecen en Storage Console
✅ Los documentos Firestore tienen URLs
✅ Las imágenes se cargan en la aplicación
✅ Puedo subir nuevas imágenes
✅ Puedo eliminar imágenes
✅ El rendimiento es rápido
✅ Las URLs son públicas
✅ El tamaño del documento Firestore < 100 KB
```

---

## SCRIPTS Y HERRAMIENTAS {#scripts}

### Script Helper: Verificar Migración

**D:\ubatech\verify-migration.js:**

```javascript
#!/usr/bin/env node
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ubatech-a8650'
});

const db = admin.firestore();

async function verifySizes() {
  console.log('🔍 Verificando tamaños de documentos...\n');

  const snapshot = await db.collection('products').get();
  let maxSize = 0;
  let problemProducts = 0;

  for (const doc of snapshot.docs) {
    const size = JSON.stringify(doc.data()).length;
    if (size > 1048576) {
      console.log(`❌ ${doc.data().name}: ${(size/1024/1024).toFixed(2)} MB`);
      problemProducts++;
    } else if (size > 512000) {
      console.log(`⚠️  ${doc.data().name}: ${(size/1024).toFixed(0)} KB`);
    }
    maxSize = Math.max(maxSize, size);
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Documentos revisados: ${snapshot.size}`);
  console.log(`   Tamaño máximo: ${(maxSize/1024/1024).toFixed(2)} MB`);
  console.log(`   Problemas: ${problemProducts}`);

  if (problemProducts === 0) {
    console.log('\n✅ ¡MIGRACIÓN EXITOSA! Todos los documentos están bien\n');
  }
}

verifySizes().catch(console.error);
```

**Ejecutar:**
```powershell
node verify-migration.js
```

---

## VERIFICACIÓN {#verificación}

### Checklist Final

```
ANTES DE PASAR A PRODUCCIÓN:

Storage:
  [ ] Firebase Storage está habilitado
  [ ] Las imágenes están en /products/
  [ ] Las imágenes son accesibles públicamente
  [ ] El tamaño total < 5 GB (plan gratuito)

Firestore:
  [ ] Los documentos tienen URLs no base64
  [ ] Todos los documentos < 100 KB
  [ ] Campo "images" contiene URLs HTTPS
  [ ] Campo "migratedToStorage" = true

Código:
  [ ] product-form.tsx usa uploadProductImage()
  [ ] Las nuevas imágenes se suben a Storage
  [ ] Las imágenes antiguas se muestran correctamente
  [ ] No hay errores en consola

Testing:
  [ ] Cargar página de productos
  [ ] Las imágenes se cargan rápido
  [ ] Agregar nuevo producto con imagen
  [ ] Editar producto existente
  [ ] Eliminar producto (eliminar imágenes de Storage)
  [ ] Cambiar imagen de un producto

Rendimiento:
  [ ] Page load < 2 segundos
  [ ] Imágenes cargan < 500ms
  [ ] Sin errores CORS
  [ ] Sin advertencias en DevTools
```

---

## PREGUNTAS FRECUENTES

**P: ¿Perderé datos en la migración?**
R: No. El script es seguro y hace backup. Las imágenes antiguas se mantienen.

**P: ¿Qué pasa si excedo 5 GB gratis?**
R: Se congela la escritura. Puedes:
  1. Eliminar archivos antiguos
  2. Actualizar a plan pago (desde $7/mes)
  3. Mantener indefinidamente sin pagar

**P: ¿Puedo revertir a base64?**
R: Técnicamente sí, pero no recomendado. Storage es superior.

**P: ¿Las imágenes se eliminarán automáticamente?**
R: No. Se mantienen indefinidamente hasta que las elimines manualmente.

**P: ¿Cuánto tiempo toma la migración?**
R: 5000 productos: ~10-30 minutos

**P: ¿Necesito tarjeta de crédito?**
R: No para plan gratuito. Sí si quieres exceder límites automáticamente.

---

## TIEMPO ESTIMADO

```
Preparación:     1 día  (backup, setup)
Migración:       1 día  (ejecutar script, verificar)
Actualización:   1 día  (actualizar código)
Testing:         1 día  (pruebas y QA)
─────────────────────────
TOTAL:          4 días (1 semana laboral)
```

---

## RESUMEN: PLAN GRATUITO

✅ **5 GB almacenamiento/mes** - Cubre tu caso
✅ **1 GB descargas/mes** - Basado en vistas
✅ **Sin tarjeta de crédito** - Opcional
✅ **Ilimitado en cantidad de archivos** - Escalable
✅ **CDN global incluido** - Rápido en todo el mundo
✅ **Sin conversión automática** - No pagas sin querer

**Tu caso:** Prácticamente GRATIS dentro del plan gratuito 🎉

---

**Próximo paso:** Sigue la guía de migración fase por fase.
