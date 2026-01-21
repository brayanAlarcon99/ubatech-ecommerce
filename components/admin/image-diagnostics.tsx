'use client'

import { useEffect, useState } from 'react'
import { getDb } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import type { Product } from '@/types'

/**
 * Herramienta de diagnóstico para verificar imágenes en Firestore
 * Muestra:
 * - Productos sin imágenes
 * - URLs inválidas
 * - Problemas de acceso a imágenes
 */
export function ImageDiagnostics() {
  const [results, setResults] = useState<{
    totalProducts: number
    productsWithoutImages: Product[]
    productsWithInvalidUrls: Product[]
    urlAccessibilityIssues: { product: Product; url: string; issue: string }[]
    loading: boolean
    error: string | null
  }>({
    totalProducts: 0,
    productsWithoutImages: [],
    productsWithInvalidUrls: [],
    urlAccessibilityIssues: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        console.log('[DIAGNOSTICS] Starting image diagnostics...')

        // Obtener todos los productos
        const db = getDb()
        const productsRef = collection(db, 'products')
        const querySnapshot = await getDocs(productsRef)
        const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product))

        console.log(`[DIAGNOSTICS] Found ${products.length} products`)

        const productsWithoutImages: Product[] = []
        const productsWithInvalidUrls: Product[] = []
        const urlAccessibilityIssues: { product: Product; url: string; issue: string }[] = []

        for (const product of products) {
          // Verificar si tiene imágenes
          const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0
          const hasImage = product.image && typeof product.image === 'string'

          if (!hasImages && !hasImage) {
            console.warn(`[DIAGNOSTICS] Product without images: ${product.name}`)
            productsWithoutImages.push(product)
            continue
          }

          // Verificar URLs
          const urlsToCheck: string[] = []
          if (hasImages && product.images) {
            urlsToCheck.push(...product.images.filter((img: string) => typeof img === 'string'))
          }
          if (hasImage && product.image) {
            urlsToCheck.push(product.image)
          }

          for (const url of urlsToCheck) {
            if (!url || typeof url !== 'string') {
              console.error(`[DIAGNOSTICS] Invalid URL type for ${product.name}:`, url)
              productsWithInvalidUrls.push(product)
              continue
            }

            // Validar formato
            try {
              new URL(url)
            } catch (e) {
              console.error(`[DIAGNOSTICS] Invalid URL format for ${product.name}:`, url)
              productsWithInvalidUrls.push(product)
              continue
            }

            // Probar accesibilidad
            try {
              const response = await fetch(url, {
                method: 'HEAD',
                headers: { Accept: 'image/*' },
              })

              if (!response.ok) {
                console.warn(`[DIAGNOSTICS] URL returned ${response.status} for ${product.name}:`, url)
                urlAccessibilityIssues.push({
                  product,
                  url,
                  issue: `HTTP ${response.status} ${response.statusText}`,
                })
              } else {
                console.log(`[DIAGNOSTICS] ✅ URL accessible for ${product.name}`)
              }
            } catch (error) {
              console.error(`[DIAGNOSTICS] Error checking URL for ${product.name}:`, error)
              urlAccessibilityIssues.push({
                product,
                url,
                issue: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          }
        }

        setResults({
          totalProducts: products.length,
          productsWithoutImages,
          productsWithInvalidUrls,
          urlAccessibilityIssues,
          loading: false,
          error: null,
        })

        console.log('[DIAGNOSTICS] Completed:', {
          totalProducts: products.length,
          productsWithoutImages: productsWithoutImages.length,
          productsWithInvalidUrls: productsWithInvalidUrls.length,
          urlAccessibilityIssues: urlAccessibilityIssues.length,
        })
      } catch (error) {
        console.error('[DIAGNOSTICS] Error:', error)
        setResults((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    runDiagnostics()
  }, [])

  if (results.loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900">Ejecutando diagnóstico...</h3>
        <p className="text-sm text-blue-700">Escaneando ${results.totalProducts} productos...</p>
      </div>
    )
  }

  if (results.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-900">Error en diagnóstico</h3>
        <p className="text-sm text-red-700">{results.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="font-semibold text-green-900">Resumen del diagnóstico</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>Total de productos: <strong>{results.totalProducts}</strong></li>
          <li>Productos sin imágenes: <strong className={results.productsWithoutImages.length > 0 ? 'text-red-600' : ''}>{results.productsWithoutImages.length}</strong></li>
          <li>URLs inválidas: <strong className={results.productsWithInvalidUrls.length > 0 ? 'text-red-600' : ''}>{results.productsWithInvalidUrls.length}</strong></li>
          <li>Problemas de acceso: <strong className={results.urlAccessibilityIssues.length > 0 ? 'text-red-600' : ''}>{results.urlAccessibilityIssues.length}</strong></li>
        </ul>
      </div>

      {results.productsWithoutImages.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-900 mb-2">Productos sin imágenes ({results.productsWithoutImages.length})</h4>
          <ul className="text-sm text-red-700 space-y-1 max-h-48 overflow-y-auto">
            {results.productsWithoutImages.map((product) => (
              <li key={product.id}>
                • {product.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.productsWithInvalidUrls.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded">
          <h4 className="font-semibold text-orange-900 mb-2">URLs inválidas ({results.productsWithInvalidUrls.length})</h4>
          <ul className="text-sm text-orange-700 space-y-1 max-h-48 overflow-y-auto">
            {results.productsWithInvalidUrls.map((product) => (
              <li key={product.id}>
                • {product.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.urlAccessibilityIssues.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-900 mb-2">Problemas de acceso ({results.urlAccessibilityIssues.length})</h4>
          <div className="text-sm text-yellow-700 space-y-2 max-h-48 overflow-y-auto">
            {results.urlAccessibilityIssues.slice(0, 10).map((issue, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-yellow-200">
                <p className="font-mono text-xs break-all">{issue.product.name}</p>
                <p className="text-xs text-yellow-600">{issue.issue}</p>
              </div>
            ))}
            {results.urlAccessibilityIssues.length > 10 && (
              <p className="text-xs text-yellow-600 italic">... y {results.urlAccessibilityIssues.length - 10} más</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
