"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getAuth } from "firebase/auth"
import { adminService, type AdminUser } from "@/lib/services/adminService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    setLoading(true)
    try {
      const admins = await adminService.getAllAdmins()
      setUsers(admins)
    } catch (error) {
      console.error("Error al obtener administradores:", error)
      setError("Error al obtener administradores")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDeleteAdmin = async (userId: string) => {
    setError("")
    setSuccess("")
    try {
      const result = await adminService.deleteAdmin(userId)
      if (result.success) {
        setUsers(users.filter((u) => u.id !== userId))
        setSuccess(result.message)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error al eliminar administrador:", error)
      setError("Error al eliminar administrador")
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsCreating(true)

    try {
      if (!newEmail || !newPassword) {
        setError("Completa email y contraseña")
        setIsCreating(false)
        return
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        setError("Email inválido")
        setIsCreating(false)
        return
      }

      // Validar contraseña (mínimo 6 caracteres)
      if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setIsCreating(false)
        return
      }

      // Obtener email del usuario actual para auditoría
      const auth = getAuth()
      const currentUserEmail = auth.currentUser?.email || "admin@system"

      // Crear administrador usando el servicio
      const result = await adminService.createAdmin(newEmail, newPassword, currentUserEmail)

      if (result.success) {
        setSuccess(result.message)
        setNewEmail("")
        setNewPassword("")
        // Recargar lista de administradores
        await fetchAdminUsers()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setError("Error inesperado al crear administrador")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
        Administración de Usuarios
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
            Gestión de Administradores
          </h2>
          <p className="text-sm text-gray-600 mb-4">Solo el super usuario puede crear y eliminar administradores</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email del nuevo administrador"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              style={{ borderColor: "var(--accent-turquoise)" }}
              disabled={isCreating}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
              style={{ borderColor: "var(--accent-turquoise)" }}
              disabled={isCreating}
            />
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              style={{ backgroundColor: "var(--accent-green)" }}
              disabled={loading || isCreating}
            >
              {isCreating ? "Creando..." : "Crear administrador"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <button
            onClick={() => setError("")}
            className="absolute top-2 right-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <button
            onClick={() => setSuccess("")}
            className="absolute top-2 right-2 text-green-700 hover:text-green-900"
          >
            ×
          </button>
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black"
            style={{ borderColor: "var(--accent-turquoise)" }}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "var(--primary)" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--primary-dark)" }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-white">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-white">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-white">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-black">{user.email}</td>
                    <td className="px-6 py-4 text-black">{user.role}</td>
                    <td className="px-6 py-4 text-black">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "super" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors">
                              Eliminar
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>¿Eliminar administrador?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará el usuario y todos sus datos.</AlertDialogDescription>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => user.id && handleDeleteAdmin(user.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredUsers.length === 0 && !loading && <div className="text-center py-8 text-black">No hay administradores registrados</div>}
      </div>
    </div>
  )
}
