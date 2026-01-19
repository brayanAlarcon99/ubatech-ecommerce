/**
 * Test Suite: Image Size Validator
 * Valida que el sistema de validación de imágenes funcione correctamente
 */

import { validateImagesForEdit, getImageSizeInfo, getImageRemovalRecommendation } from '@/lib/image-size-validator'

// Datos de prueba simulados
const createTestBase64 = (sizeInMB: number): string => {
  // Base64 es ~33% más grande que datos binarios
  // 1MB en base64 ≈ 1.33MB en base64
  const targetBase64Size = sizeInMB * 1024 * 1024 * (4 / 3) // Aproximado
  const padding = 'A'.repeat(Math.floor(targetBase64Size))
  return `data:image/jpeg;base64,${padding}`
}

// Test Cases
const TestCases = {
  // ✅ TEST 1: Imagen pequeña (OK)
  test1_SingleSmallImage: () => {
    console.log('\n🧪 TEST 1: Single Small Image (0.5MB)')
    const images = [createTestBase64(0.5)]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB,
      exceedsLimit: result.exceedsLimit,
      oversizedImages: result.oversizedImages
    })
    
    assert(result.isValid === true, 'Should be valid')
    assert(result.exceedsLimit === false, 'Should not exceed limit')
    assert(result.oversizedImages.length === 0, 'Should have no oversized images')
    console.log('✅ PASS')
  },

  // ⚠️ TEST 2: Imagen en advertencia (80-100%)
  test2_WarningImage: () => {
    console.log('\n🧪 TEST 2: Warning Image (0.85MB - 85%)')
    const images = [createTestBase64(0.85)]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB,
      oversizedImages: result.oversizedImages
    })
    
    assert(result.isValid === true, 'Should be valid (not oversized)')
    assert(result.exceedsLimit === false, 'Should not exceed limit')
    assert(result.oversizedImages.length === 1, 'Should have 1 oversized warning')
    assert(result.oversizedImages[0].recommendation === 'change', 'Should recommend change')
    console.log('✅ PASS')
  },

  // 🚨 TEST 3: Imagen oversized (> 100%)
  test3_OversizedImage: () => {
    console.log('\n🧪 TEST 3: Oversized Image (1.2MB - 120%)')
    const images = [createTestBase64(1.2)]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      exceedsLimit: result.exceedsLimit,
      oversizedImages: result.oversizedImages
    })
    
    assert(result.isValid === false, 'Should be invalid')
    assert(result.exceedsLimit === true, 'Should exceed limit')
    assert(result.oversizedImages.length === 1, 'Should have 1 oversized image')
    assert(result.oversizedImages[0].recommendation === 'remove', 'Should recommend remove')
    console.log('✅ PASS')
  },

  // 📷 TEST 4: Múltiples imágenes válidas
  test4_MultipleValidImages: () => {
    console.log('\n🧪 TEST 4: Multiple Valid Images (0.3 + 0.3 + 0.3 = 0.9MB)')
    const images = [
      createTestBase64(0.3),
      createTestBase64(0.3),
      createTestBase64(0.3)
    ]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB.toFixed(2),
      oversizedImages: result.oversizedImages
    })
    
    assert(result.isValid === true, 'Should be valid')
    assert(result.totalSizeMB <= 1, 'Total should be <= 1MB')
    assert(result.oversizedImages.length === 0, 'Should have no warnings')
    console.log('✅ PASS')
  },

  // 🚨 TEST 5: Múltiples imágenes que exceden límite
  test5_MultipleExceedLimit: () => {
    console.log('\n🧪 TEST 5: Multiple Images Exceed Limit (0.7 + 0.6 = 1.3MB)')
    const images = [
      createTestBase64(0.7),
      createTestBase64(0.6)
    ]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB.toFixed(2),
      exceedsLimit: result.exceedsLimit,
      oversizedImages: result.oversizedImages.map(img => ({
        index: img.index,
        sizeMB: img.sizeMB,
        percentage: img.percentage,
        recommendation: img.recommendation
      }))
    })
    
    assert(result.isValid === false, 'Should be invalid')
    assert(result.exceedsLimit === true, 'Should exceed limit')
    assert(result.oversizedImages.length > 0, 'Should have oversized images detected')
    console.log('✅ PASS')
  },

  // 🔢 TEST 6: getImageSizeInfo function
  test6_ImageSizeInfo: () => {
    console.log('\n🧪 TEST 6: Get Image Size Info')
    const image = createTestBase64(0.75)
    const sizeInfo = getImageSizeInfo(image)
    
    console.log('Result:', {
      sizeMB: sizeInfo.sizeMB.toFixed(2),
      sizeKB: sizeInfo.sizeKB.toFixed(2),
      isOversized: sizeInfo.isOversized,
      percentage: sizeInfo.percentage.toFixed(1) + '%'
    })
    
    assert(sizeInfo.sizeMB > 0, 'Should have size')
    assert(sizeInfo.isOversized === false, 'Should not be oversized')
    assert(sizeInfo.percentage > 70 && sizeInfo.percentage < 80, 'Should be ~75%')
    console.log('✅ PASS')
  },

  // 🗑️ TEST 7: Recommendation for removal
  test7_RemovalRecommendation: () => {
    console.log('\n🧪 TEST 7: Get Removal Recommendation')
    const oversizedImages = [
      { index: 1, sizeMB: 0.5 },
      { index: 2, sizeMB: 1.2 },
      { index: 3, sizeMB: 0.9 }
    ]
    
    const recommendation = getImageRemovalRecommendation(oversizedImages)
    
    console.log('Result:', {
      recommendIndex: recommendation,
      reason: `Image ${recommendation} is the largest`
    })
    
    assert(recommendation === 2, 'Should recommend removing image 2 (largest)')
    console.log('✅ PASS')
  },

  // ⚠️ TEST 8: Error message generation
  test8_ErrorMessageGeneration: () => {
    console.log('\n🧪 TEST 8: Error Message Generation')
    const images = [
      createTestBase64(0.85),
      createTestBase64(0.6)
    ]
    const result = validateImagesForEdit(images)
    
    console.log('Error Message Generated:')
    console.log(result.errorMessage)
    
    assert(result.errorMessage !== null, 'Should have error message')
    assert(result.errorMessage?.includes('🚨'), 'Should include emoji')
    assert(result.errorMessage?.includes('Imagen 1'), 'Should mention Imagen 1')
    assert(result.errorMessage?.includes('Imagen 2'), 'Should mention Imagen 2')
    console.log('✅ PASS')
  },

  // ✅ TEST 9: Empty array
  test9_EmptyArray: () => {
    console.log('\n🧪 TEST 9: Empty Array')
    const result = validateImagesForEdit([])
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB,
      oversizedImages: result.oversizedImages
    })
    
    assert(result.isValid === true, 'Should be valid')
    assert(result.totalSizeMB === 0, 'Total should be 0')
    assert(result.oversizedImages.length === 0, 'Should have no oversized')
    console.log('✅ PASS')
  },

  // 📊 TEST 10: Boundary case - exactly 1MB
  test10_ExactlyOneMB: () => {
    console.log('\n🧪 TEST 10: Exactly 1MB')
    const images = [createTestBase64(1.0)]
    const result = validateImagesForEdit(images)
    
    console.log('Result:', {
      isValid: result.isValid,
      totalSizeMB: result.totalSizeMB.toFixed(2),
      exceedsLimit: result.exceedsLimit
    })
    
    // Nota: Por los márgenes de error de Base64, esto podría variar
    // pero debería estar muy cerca de 1MB
    assert(result.totalSizeMB >= 0.98 && result.totalSizeMB <= 1.02, 'Should be ~1MB')
    console.log('✅ PASS')
  }
}

// Helper function
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`)
  }
}

// Ejecutor de tests
export function runAllTests() {
  console.log('🚀 Starting Image Size Validator Test Suite')
  console.log('='.repeat(50))

  let passed = 0
  let failed = 0

  Object.entries(TestCases).forEach(([testName, testFn]) => {
    try {
      testFn()
      passed++
    } catch (error) {
      failed++
      console.log(`\n❌ FAIL - ${testName}`)
      console.error(error instanceof Error ? error.message : error)
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(50))

  return {
    passed,
    failed,
    total: passed + failed,
    success: failed === 0
  }
}

// Export for use in components
export { TestCases }
