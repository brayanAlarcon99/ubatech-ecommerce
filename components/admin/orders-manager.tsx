"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { formatPriceWithCurrency } from "@/lib/format-price"

interface Order {
  id: string
  customerName: string
  email: string
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: string
  items: number
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const db = getDb()
      const ordersSnapshot = await getDocs(collection(db, "orders"))
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const db = getDb()
      await updateDoc(doc(db, "orders", orderId), { status: newStatus })
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o)))
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--primary-dark)" }}>
        Gestión de Pedidos
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--primary-dark)" }}>
          Todos los Pedidos
        </h2>
        <p className="text-sm text-gray-600 mb-4">Administra y supervisa todos los pedidos de los clientes</p>
        
        <input
          type="text"
          placeholder="Buscar por ID o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black bg-white mb-4"
          style={{ borderColor: "var(--accent-turquoise)" }}
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "var(--primary)" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--primary-dark)" }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-white">ID Pedido</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Artículos</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Total</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Fecha</th>
                  <th className="px-6 py-4 text-right font-semibold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-black">{order.id}</td>
                    <td className="px-6 py-4 text-black">{order.customerName}</td>
                    <td className="px-6 py-4 text-black">{order.email}</td>
                    <td className="px-6 py-4 text-black">{order.items}</td>
                    <td className="px-6 py-4 text-black">{formatPriceWithCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-black">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <select
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        value={order.status}
                        className="text-sm border border-gray-300 rounded px-3 py-1 text-black focus:outline-none focus:ring-2"
                        style={{ borderColor: "var(--accent-turquoise)" }}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && <div className="text-center py-8 text-black">No hay pedidos registrados</div>}
      </div>
    </div>
  )
}
