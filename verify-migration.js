#!/usr/bin/env node
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Verificar que serviceAccountKey.json existe
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ ERROR: serviceAccountKey.json no encontrado');
  console.error(`   Esperado en: ${keyPath}`);
  process.exit(1);
}

const serviceAccount = require(keyPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ubatech-a8650'
});

const db = admin.firestore();

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

async function verifySizes() {
  log('\n🔍 VERIFICANDO TAMAÑOS DE DOCUMENTOS POST-MIGRACIÓN\n', 'cyan');
  log('════════════════════════════════════════════════════════\n', 'bright');

  const snapshot = await db.collection('products').get();
  let maxSize = 0;
  let problemProducts = 0;
  let migratedCount = 0;
  let notMigratedCount = 0;
  let totalSize = 0;

  log(`📦 Analizando ${snapshot.size} productos...\n`, 'yellow');

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const size = JSON.stringify(data).length;
    const sizeKB = size / 1024;
    const sizeMB = size / 1024 / 1024;
    
    totalSize += size;
    maxSize = Math.max(maxSize, size);

    if (data.migratedToStorage) {
      migratedCount++;
    } else {
      notMigratedCount++;
    }

    // Mostrar problemas o advertencias
    if (size > 1048576) {
      log(`❌ ${data.name}: ${sizeMB.toFixed(2)} MB (PROBLEMA)`, 'red');
      problemProducts++;
    } else if (size > 512000) {
      log(`⚠️  ${data.name}: ${sizeKB.toFixed(0)} KB (Grande)`, 'yellow');
    }
  }

  log('\n════════════════════════════════════════════════════════\n', 'bright');
  log('📊 RESULTADOS:\n', 'bright');
  log(`   ✅ Productos migrados:     ${migratedCount}`, 'green');
  log(`   ⏭️  Pendientes de migrar:   ${notMigratedCount}`, 'yellow');
  log(`   📦 Documentos analizados:  ${snapshot.size}`, 'cyan');
  log(`   📈 Tamaño máximo:          ${(maxSize / 1024 / 1024).toFixed(2)} MB`, 'cyan');
  log(`   📊 Tamaño total:           ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'cyan');
  log(`   ⚠️  Documentos > 1 MB:      ${problemProducts}`, 'red');

  log('\n════════════════════════════════════════════════════════\n', 'bright');

  if (problemProducts === 0) {
    log('✅ ¡MIGRACIÓN EXITOSA! Todos los documentos están bien\n', 'green');
    log('   Todos los documentos están por debajo del límite de 1 MB', 'green');
    log('   Puedes continuar con la actualización del código\n', 'green');
  } else {
    log(`⚠️  ADVERTENCIA: ${problemProducts} producto(s) aún excedan 1 MB\n`, 'yellow');
    log('   Necesitan procesamiento manual adicional\n', 'yellow');
  }

  log('════════════════════════════════════════════════════════\n', 'bright');

  process.exit(problemProducts === 0 ? 0 : 1);
}

verifySizes().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
