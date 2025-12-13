#!/usr/bin/env node

/**
 * Script de Verificación Rápida - Formato de Precios
 * 
 * Ejecutar con: node verify-prices.js
 * Este script verifica que todos los archivos tengan la función correcta
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  {
    path: 'lib/format-price.ts',
    mustContain: ['formatPrice', 'formatPriceWithCurrency', 'es-ES']
  },
  {
    path: 'components/product-card.tsx',
    mustContain: ['formatPriceWithCurrency', 'from "@/lib/format-price"']
  },
  {
    path: 'components/admin/products-manager.tsx',
    mustContain: ['formatPriceWithCurrency', 'from "@/lib/format-price"']
  },
  {
    path: 'app/carrito/page.tsx',
    mustContain: ['formatPriceWithCurrency', 'from "@/lib/format-price"']
  },
  {
    path: 'app/checkout/page.tsx',
    mustContain: ['formatPriceWithCurrency', 'from "@/lib/format-price"']
  }
];

console.log('🔍 VERIFICANDO FORMATO DE PRECIOS...\n');

let allPassed = true;

filesToCheck.forEach((file) => {
  const filePath = path.join(__dirname, file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${file.path}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const missingItems = [];
  
  file.mustContain.forEach((item) => {
    if (!content.includes(item)) {
      missingItems.push(item);
    }
  });
  
  if (missingItems.length === 0) {
    console.log(`✅ ${file.path}`);
  } else {
    console.log(`❌ ${file.path}`);
    console.log(`   Falta: ${missingItems.join(', ')}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ VERIFICACIÓN COMPLETADA CON ÉXITO');
  console.log('\nTodos los archivos tienen el formato correcto.');
  console.log('\nPróximos pasos:');
  console.log('1. npm run dev');
  console.log('2. Abrir http://localhost:3000');
  console.log('3. Verificar que los precios muestren formato: $X.XXX');
} else {
  console.log('❌ VERIFICACIÓN FALLIDA');
  console.log('\nPor favor, revisa los archivos faltantes arriba.');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');
