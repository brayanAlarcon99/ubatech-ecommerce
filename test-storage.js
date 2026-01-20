const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('Inicializando Firebase...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ubatech-a8650.appspot.com'
});

const bucket = admin.storage().bucket();

async function testConnection() {
  try {
    console.log('Probando conexión...');
    const file = bucket.file('_test-' + Date.now() + '.txt');
    await file.save('test');
    console.log('✅ Conexión exitosa - archivo creado');
    
    // Eliminar archivo de prueba
    await file.delete();
    console.log('✅ Archivo de prueba eliminado');
    console.log('\n¡Storage está funcionando correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetalles:', error.code, error.errors);
    process.exit(1);
  }
}

testConnection();
