import type { Product } from "@/types"

/**
 * Normaliza los productos para garantizar que el campo 'category' contenga un ID válido
 * Los productos antiguos pueden tener el nombre de la categoría en lugar del ID
 * @param products Array de productos a normalizar
 * @param categoriesMap Mapa de ID -> nombre de categoría
 * @returns Array de productos normalizados
 */
export function normalizeProducts(
  products: Product[],
  categoriesMap: Map<string, string>
): Product[] {
  return products.map((product) => {
    // Si la categoría es un ID válido en el mapa, está normalizada
    if (categoriesMap.has(product.category)) {
      return product
    }

    // Si no es un ID válido, buscar si es un nombre
    for (const [id, name] of categoriesMap.entries()) {
      if (name === product.category) {
        // Encontramos el ID correspondiente al nombre
        return {
          ...product,
          category: id,
        }
      }
    }

    // Si no encontramos ni ID ni nombre, devolver el producto sin cambios
    // (podría ser un error o una categoría eliminada)
    return product
  })
}
