"use client"

import React, { useState, useEffect } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore"
import { getSubcategoriesByCategory, addSubcategory, updateSubcategory, deleteSubcategory, countProductsBySubcategory } from "@/lib/subcategories"
import type { Subcategory } from "@/types"

interface Category {
  id: string
  name: string
  productCount?: number
  subcategories?: Subcategory[]
  showSubcategories?: boolean
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para subcategorías
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      setError(null)
      const db = getDb()
      const snapshot = await getDocs(collection(db, "categories"))
      const cats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const categoryName = doc.data().name
          // Contar productos en esta categoría (solo si el nombre existe)
          let productCount = 0
          if (categoryName) {
            const productsQuery = query(collection(db, "products"), where("category", "==", categoryName))
            const productsSnapshot = await getDocs(productsQuery)
            productCount = productsSnapshot.size
          }
          
          // Cargar subcategorías
          const subcategories = await getSubcategoriesByCategory(doc.id)
          
          return {
            id: doc.id,
            name: categoryName,
            productCount: productCount,
            subcategories: subcategories,
            showSubcategories: false,
          }
        })
      )
      setCategories(cats)
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
      setError("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      const db = getDb()
      await addDoc(collection(db, "categories"), { name: newCategory })
      setNewCategory("")
      await loadCategories()
    } catch (error) {
      console.error("[v0] Error adding category:", error)
      setError("Error al agregar categoría")
    }
  }

  async function handleEditCategory() {
    if (!editingId || !editingName.trim()) return

    try {
      const db = getDb()
      await updateDoc(doc(db, "categories", editingId), { name: editingName })
      setEditingId(null)
      setEditingName("")
      await loadCategories()
    } catch (error) {
      console.error("[v0] Error updating category:", error)
      setError("Error al actualizar categoría")
    }
  }

  async function handleAddSubcategory(categoryId: string) {
    if (!newSubcategoryName.trim()) return

    try {
      await addSubcategory(categoryId, newSubcategoryName)
      setNewSubcategoryName("")
      await loadCategories()
      setError(null)
    } catch (error) {
      console.error("[v0] Error adding subcategory:", error)
      setError("Error al agregar subcategoría")
    }
  }

  async function handleEditSubcategory() {
    if (!editingSubcategoryId || !editingSubcategoryName.trim()) return

    try {
      await updateSubcategory(editingSubcategoryId, editingSubcategoryName)
      setEditingSubcategoryId(null)
      setEditingSubcategoryName("")
      await loadCategories()
      setError(null)
    } catch (error) {
      console.error("[v0] Error updating subcategory:", error)
      setError("Error al actualizar subcategoría")
    }
  }

  async function handleDeleteSubcategory(subcategoryId: string) {
    if (!confirm("¿Está seguro de que desea eliminar esta subcategoría?")) return

    try {
      await deleteSubcategory(subcategoryId)
      await loadCategories()
      setError(null)
    } catch (error) {
      console.error("[v0] Error deleting subcategory:", error)
      setError(error instanceof Error ? error.message : "Error al eliminar subcategoría")
    }
  }

  async function handleDeleteCategory(id: string) {
    const category = categories.find((c) => c.id === id)
    
    // Verificar si la categoría tiene productos
    if (category && category.productCount && category.productCount > 0) {
      setError(
        `No se puede eliminar la categoría "${category.name}" porque contiene ${category.productCount} producto(s). Primero debe eliminar o reasignar los productos de esta categoría.`
      )
      return
    }

    if (!confirm("¿Está seguro de que desea eliminar esta categoría?")) return

    try {
      const db = getDb()
      await deleteDoc(doc(db, "categories", id))
      setError(null)
      await loadCategories()
    } catch (error) {
      console.error("[v0] Error deleting category:", error)
      setError("Error al eliminar la categoría")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
        Gestión de Categorías
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
            Agregar Nueva Categoría
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nombre de la categoría"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              style={{ borderColor: "var(--accent-turquoise)" }}
            />
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: "var(--accent-green)" }}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--primary-dark)" }}>
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Nombre
                </th>
                <th className="px-6 py-4 text-center font-semibold text-white w-20">
                  Productos
                </th>
                <th className="px-6 py-4 text-right font-semibold text-white">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Fila de la categoría */}
                  <tr className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-black"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                            className="text-gray-500 hover:text-gray-700 px-2"
                            title={expandedCategoryId === category.id ? "Contraer" : "Expandir"}
                          >
                            {expandedCategoryId === category.id ? "▼" : "▶"}
                          </button>
                          <span className="text-black font-medium">{category.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-black">{category.productCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={handleEditCategory}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditingName("")
                            }}
                            className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(category.id)
                              setEditingName(category.name)
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={(category.productCount ?? 0) > 0}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              (category.productCount ?? 0) > 0
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                            title={
                              category.productCount && category.productCount > 0
                                ? `No se puede eliminar: contiene ${category.productCount} producto(s)`
                                : "Eliminar categoría"
                            }
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Filas de subcategorías */}
                  {expandedCategoryId === category.id && (
                    <>
                      {/* Formulario para agregar subcategoría */}
                      <tr className="bg-gray-50 border-t border-gray-200">
                        <td colSpan={3} className="px-6 py-4">
                          <div className="ml-8 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700">Agregar Subcategoría</h3>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newSubcategoryName}
                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                placeholder="Nombre de la subcategoría (ej: Samsung, Apple, etc.)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddSubcategory(category.id)
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddSubcategory(category.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                              >
                                Agregar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Lista de subcategorías */}
                      {category.subcategories && category.subcategories.length > 0 ? (
                        category.subcategories.map((subcategory) => (
                          <tr key={subcategory.id} className="bg-blue-50 border-t border-gray-200 hover:bg-blue-100">
                            <td className="px-6 py-3 pl-16">
                              {editingSubcategoryId === subcategory.id ? (
                                <input
                                  type="text"
                                  value={editingSubcategoryName}
                                  onChange={(e) => setEditingSubcategoryName(e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm bg-white"
                                />
                              ) : (
                                <span className="text-black text-sm">{subcategory.name}</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="text-black text-sm">-</span>
                            </td>
                            <td className="px-6 py-3 text-right flex gap-2 justify-end">
                              {editingSubcategoryId === subcategory.id ? (
                                <>
                                  <button
                                    onClick={handleEditSubcategory}
                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSubcategoryId(null)
                                      setEditingSubcategoryName("")
                                    }}
                                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingSubcategoryId(subcategory.id)
                                      setEditingSubcategoryName(subcategory.name)
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="bg-blue-50 border-t border-gray-200">
                          <td colSpan={3} className="px-6 py-3 pl-16 text-gray-500 text-sm">
                            No hay subcategorías aún
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && <div className="text-center py-8 text-black">No hay categorías aún</div>}
      </div>
    </div>
  )
}
