#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verificar que serviceAccountKey.json existe
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ ERROR: serviceAccountKey.json no encontrado');
  console.error(`   Esperado en: ${keyPath}`);
  console.error('\n📝 Para obtenerlo:');
  console.error('   1. Ir a: https://console.firebase.google.com');
  console.error('   2. Seleccionar proyecto: ubatech-a8650');
  console.error('   3. Settings ⚙️ → Service Accounts');
  console.error('   4. "Generate New Private Key"');
  console.error('   5. Guardar como: serviceAccountKey.json en D:\\ubatech\\');
  process.exit(1);
}

// Inicializar Firebase Admin
const serviceAccount = require(keyPath);

// Usar el storageBucket del JSON de forma explícita
const projectId = serviceAccount.project_id;
const storageBucket = `${projectId}.firebasestorage.app`;

console.log(`📦 Proyecto: ${projectId}`);
console.log(`💾 Bucket: ${storageBucket}\n`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storageBucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testStorageConnection() {
  try {
    const testFile = bucket.file('_test/connection-test-' + Date.now() + '.txt');
    await testFile.save('test content');
    await testFile.delete();
    return true;
  } catch (error) {
    return false;
  }
}

async function migrateToStorage() {
  log('\n🚀 INICIANDO MIGRACIÓN DE IMÁGENES A FIREBASE STORAGE\n', 'cyan');
  log('════════════════════════════════════════════════════════\n', 'bright');

  const startTime = Date.now();

  try {
    // Probar conexión primero
    log('🧪 Probando conexión a Firebase Storage...', 'yellow');
    const storageOk = await testStorageConnection();
    if (!storageOk) {
      log(`❌ Error conectando a Storage\n`, 'red');
      log('   Verifica que Storage esté habilitado en Firebase Console', 'yellow');
      log('   y que las credenciales sean correctas\n', 'yellow');
      process.exit(1);
    }
    log('✅ Conexión a Storage correcta\n', 'green');

    // Obtener todos los productos
    log('📦 Obteniendo lista de productos...', 'yellow');
    const snapshot = await db.collection('products').get();
    log(`✅ Total de productos encontrados: ${snapshot.size}\n`, 'green');

    if (snapshot.empty) {
      log('⚠️  No hay productos para migrar', 'yellow');
      process.exit(0);
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let totalImagesProcessed = 0;

    const products = snapshot.docs;

    // Procesar cada producto
    for (let index = 0; index < products.length; index++) {
      const doc = products[index];
      const product = doc.data();
      const productId = doc.id;

      // Mostrar progreso
      const progressBar = Math.round((index / products.length) * 20);
      const progress = '█'.repeat(progressBar) + '░'.repeat(20 - progressBar);
      log(`[${progress}] ${index + 1}/${products.length} - ${product.name || 'Sin nombre'}`, 'cyan');

      // Si no hay imágenes, saltar
      if (!product.images || product.images.length === 0) {
        skipCount++;
        continue;
      }

      const newImages = [];
      let hasErrors = false;

      // Procesar cada imagen del producto
      for (let i = 0; i < product.images.length; i++) {
        const imageData = product.images[i];

        // Si ya es URL de Storage, mantenerla
        if (!imageData.startsWith('data:')) {
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
                imageIndex: i,
                migratedAt: new Date().toISOString()
              }
            }
          });

          // Hacer público el archivo
          await file.makePublic();

          // Obtener URL
          const publicUrl = file.publicUrl();
          newImages.push(publicUrl);
          totalImagesProcessed++;

        } catch (error) {
          log(`      ❌ Error en imagen ${i + 1}: ${error.message}`, 'red');
          newImages.push(imageData); // Mantener original si falla
          hasErrors = true;
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

        if (!hasErrors) {
          successCount++;
        }

      } catch (error) {
        log(`      ❌ Error actualizando Firestore: ${error.message}`, 'red');
        errorCount++;
      }
    }

    // Resumen final
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    log('\n════════════════════════════════════════════════════════\n', 'bright');
    log('📊 RESUMEN DE MIGRACIÓN\n', 'bright');
    log(`   ✅ Productos migrados:    ${successCount}`, 'green');
    log(`   ⏭️  Productos omitidos:    ${skipCount}`, 'yellow');
    log(`   ❌ Errores encontrados:   ${errorCount}`, 'red');
    log(`   📷 Total imágenes:        ${totalImagesProcessed}`, 'cyan');
    log(`   ⏱️  Tiempo total:          ${duration}s\n`, 'yellow');

    if (errorCount === 0) {
      log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!\n', 'green');
      log('📊 Estado: Todos los productos están en Firebase Storage\n', 'green');
      
      log('Próximos pasos:', 'bright');
      log('1. Ejecutar: node verify-migration.js');
      log('2. Verificar en Firebase Console → Storage');
      log('3. Actualizar código: product-form.tsx');
      log('4. Probar la aplicación\n');
    } else {
      log('⚠️  MIGRACIÓN COMPLETADA CON ALGUNOS ERRORES\n', 'yellow');
      log('Puedes re-ejecutar el script para reintentar:\n', 'yellow');
      log('   node migrate-to-storage.js\n');
    }

    log('════════════════════════════════════════════════════════\n', 'bright');

  } catch (error) {
    log('\n❌ ERROR FATAL EN LA MIGRACIÓN\n', 'red');
    log(error.message, 'red');
    log('\nDetalles técnicos:', 'yellow');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateToStorage().then(() => {
  log('Cerrando conexión...', 'yellow');
  process.exit(0);
}).catch((error) => {
  log(`\n❌ Error no capturado: ${error.message}`, 'red');
  process.exit(1);
});
