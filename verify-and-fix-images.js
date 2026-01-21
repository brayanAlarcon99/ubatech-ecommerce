#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verificar que serviceAccountKey.json existe
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ ERROR: serviceAccountKey.json no encontrado');
  console.error(`   Esperado en: ${keyPath}`);
  process.exit(1);
}

// Inicializar Firebase Admin
const serviceAccount = require(keyPath);
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

function isStorageUrl(str) {
  return typeof str === 'string' && 
    (str.includes('firebasestorage.app') || 
     str.includes('firebasestorage.googleapis.com'));
}

async function convertBase64ToStorageUrl(base64Data, productId, imageIndex) {
  try {
    // Convertir base64 a Buffer
    const base64Parts = base64Data.split(',');
    const base64String = base64Parts[1] || base64Parts[0];
    const buffer = Buffer.from(base64String, 'base64');

    // Crear ruta en Storage
    const timestamp = Date.now();
    const fileName = `products/${productId}/image-${imageIndex}-${timestamp}.jpg`;

    // Subir a Storage
    const file = bucket.file(fileName);
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          productId: productId,
          imageIndex: imageIndex,
          convertedAt: new Date().toISOString()
        }
      }
    });

    // Hacer público el archivo
    await file.makePublic();

    // Obtener URL
    const publicUrl = file.publicUrl();
    return publicUrl;
  } catch (error) {
    throw new Error(`Error converting base64 to storage URL: ${error.message}`);
  }
}

async function verifyAndFixImages() {
  log('\n🔍 VERIFICACIÓN Y CORRECCIÓN DE IMÁGENES EN FIRESTORE\n', 'cyan');
  log('════════════════════════════════════════════════════════\n', 'bright');

  const startTime = Date.now();

  try {
    // Obtener todos los productos
    log('📦 Obteniendo lista de productos...', 'yellow');
    const snapshot = await db.collection('products').get();
    log(`✅ Total de productos encontrados: ${snapshot.size}\n`, 'green');

    if (snapshot.empty) {
      log('⚠️  No hay productos en la base de datos', 'yellow');
      process.exit(0);
    }

    const report = {
      total: 0,
      withImages: 0,
      allStorageUrls: 0,
      allBase64: 0,
      mixed: 0,
      noImages: 0,
      fixed: 0,
      errors: 0,
      details: []
    };

    const products = snapshot.docs;

    // Analizar y corregir cada producto
    for (let index = 0; index < products.length; index++) {
      const doc = products[index];
      const product = doc.data();
      const productId = doc.id;
      
      report.total++;

      // Mostrar progreso
      const progressBar = Math.round((index / products.length) * 20);
      const progress = '█'.repeat(progressBar) + '░'.repeat(20 - progressBar);
      process.stdout.write(`\r[${progress}] ${index + 1}/${products.length}`);

      // Si no hay imágenes, registrar
      if (!product.images || product.images.length === 0) {
        report.noImages++;
        report.details.push({
          id: productId,
          name: product.name || 'Sin nombre',
          status: 'sin_imagenes',
          imageCount: 0
        });
        continue;
      }

      report.withImages++;
      const imageData = product.images;
      let base64Count = 0;
      let storageUrlCount = 0;
      let newImages = [];
      let hasError = false;

      // Analizar cada imagen
      for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];

        if (isBase64(image)) {
          base64Count++;
          // Intentar convertir a Storage URL
          try {
            const storageUrl = await convertBase64ToStorageUrl(image, productId, i);
            newImages.push(storageUrl);
            report.fixed++;
          } catch (error) {
            newImages.push(image); // Mantener original si falla
            report.errors++;
            hasError = true;
          }
        } else if (isStorageUrl(image)) {
          storageUrlCount++;
          newImages.push(image);
        } else {
          // Formato desconocido
          newImages.push(image);
        }
      }

      // Determinar estado del producto
      let status = 'desconocido';
      if (base64Count === 0 && storageUrlCount === imageData.length) {
        status = 'storage_urls';
      } else if (base64Count === imageData.length && storageUrlCount === 0) {
        status = 'base64';
      } else if (base64Count > 0 && storageUrlCount > 0) {
        status = 'mixto';
      }

      report.details.push({
        id: productId,
        name: product.name || 'Sin nombre',
        status: status,
        imageCount: imageData.length,
        base64Count: base64Count,
        storageUrlCount: storageUrlCount,
        converted: status === 'base64' ? base64Count : 0,
        hasError: hasError
      });

      // Registrar en categorías
      if (status === 'storage_urls') {
        report.allStorageUrls++;
      } else if (status === 'base64') {
        report.allBase64++;
      } else if (status === 'mixto') {
        report.mixed++;
      }

      // Actualizar en Firestore si se hicieron cambios
      if (base64Count > 0 && newImages.length === imageData.length) {
        try {
          await db.collection('products').doc(productId).update({
            images: newImages,
            migratedToStorage: true,
            migrationDate: new Date()
          });
        } catch (error) {
          report.errors++;
        }
      }
    }

    console.log('\n'); // Nueva línea después de la barra de progreso

    // Mostrar resumen
    log('\n════════════════════════════════════════════════════════\n', 'bright');
    log('📊 RESUMEN DE VERIFICACIÓN\n', 'bright');
    log(`   📦 Total de productos:           ${report.total}`, 'cyan');
    log(`   📷 Productos con imágenes:       ${report.withImages}`, 'cyan');
    log(`   ✅ Con URLs de Storage:          ${report.allStorageUrls}`, 'green');
    log(`   ❌ Con base64 (sin convertir):   ${report.allBase64}`, 'red');
    log(`   ⚠️  Mixtos (Storage + base64):   ${report.mixed}`, 'yellow');
    log(`   ⏭️  Sin imágenes:                 ${report.noImages}`, 'yellow');
    log(`\n   🔧 Imágenes convertidas:         ${report.fixed}`, 'green');
    log(`   💥 Errores encontrados:         ${report.errors}`, 'red');

    // Detalles de productos problemáticos
    if (report.allBase64 > 0 || report.mixed > 0 || report.errors > 0) {
      log('\n════════════════════════════════════════════════════════\n', 'bright');
      log('📋 PRODUCTOS QUE NECESITAN ATENCIÓN\n', 'bright');

      const problematicos = report.details.filter(d => 
        d.status === 'base64' || d.status === 'mixto' || d.hasError
      );

      problematicos.forEach((producto, idx) => {
        if (producto.status === 'base64') {
          log(`${idx + 1}. ${producto.name}`, 'red');
          log(`   ID: ${producto.id}`, 'yellow');
          log(`   Estado: Base64 (NO CONVERTIDO)`, 'red');
          log(`   Imágenes base64: ${producto.base64Count}/${producto.imageCount}`, 'red');
        } else if (producto.status === 'mixto') {
          log(`${idx + 1}. ${producto.name}`, 'yellow');
          log(`   ID: ${producto.id}`, 'yellow');
          log(`   Estado: Mixto (algunos base64, algunos Storage)`, 'yellow');
          log(`   Base64: ${producto.base64Count}, Storage URLs: ${producto.storageUrlCount}`, 'yellow');
        }
        if (producto.hasError) {
          log(`   ⚠️  Algunos errores durante conversión`, 'red');
        }
        log('');
      });
    }

    // Resumen de estado general
    log('════════════════════════════════════════════════════════\n', 'bright');
    if (report.allBase64 === 0 && report.mixed === 0 && report.errors === 0) {
      log('🎉 ¡TODO ESTÁ CORRECTO!\n', 'green');
      log('✅ Todos los productos tienen imágenes en Firebase Storage URLs\n', 'green');
    } else if (report.fixed > 0 && report.errors === 0 && report.allBase64 === 0 && report.mixed === 0) {
      log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n', 'green');
      log(`${report.fixed} imágenes fueron convertidas de base64 a Storage URLs\n`, 'green');
    } else {
      log('⚠️  BASE DE DATOS NECESITA ATENCIÓN\n', 'yellow');
      if (report.allBase64 > 0) {
        log(`${report.allBase64} producto(s) con imágenes en base64`, 'red');
      }
      if (report.mixed > 0) {
        log(`${report.mixed} producto(s) con formato mixto`, 'yellow');
      }
      if (report.errors > 0) {
        log(`${report.errors} error(es) encontrado(s)`, 'red');
      }
      log('\n💡 Ejecuta nuevamente este script para intentar convertir los restantes\n', 'yellow');
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    log(`⏱️  Tiempo total: ${duration}s\n`, 'yellow');
    log('════════════════════════════════════════════════════════\n', 'bright');

  } catch (error) {
    log('\n❌ ERROR EN LA VERIFICACIÓN\n', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar verificación
verifyAndFixImages().then(() => {
  log('Cerrando conexión...', 'yellow');
  process.exit(0);
}).catch((error) => {
  log(`\n❌ Error no capturado: ${error.message}`, 'red');
  process.exit(1);
});
