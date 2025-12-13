export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  stock: number
  image?: string
  sku?: string
  details?: string
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
}

export interface Category {
  id: string
  name: string
  subcategories?: Subcategory[]
}
