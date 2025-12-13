import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()

    // Obtener todos los productos
    const productsSnapshot = await getDocs(collection(db, "products"))
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Obtener todas las categorías
    const categoriesSnapshot = await getDocs(collection(db, "categories"))
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Obtener todas las órdenes (si existen)
    let orders: any[] = []
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"))
      orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.log("[Analytics] No orders collection found, skipping orders data")
    }

    // Obtener usuarios (si existen)
    let users: any[] = []
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.log("[Analytics] No users collection found, skipping users data")
    }

    // Calcular estadísticas
    const totalProducts = products.length
    const totalOrders = orders.length
    const totalUsers = users.length
    
    // Calcular ventas totales
    const totalSales = orders.reduce((sum: number, order: any) => {
      return sum + (order.total || 0)
    }, 0)

    // Generar datos de ventas mensuales (últimos 6 meses)
    const monthlySales = generateMonthlySalesData(orders)

    // Top 5 productos más vendidos
    const topProducts = getTopProducts(orders, products)

    // Estado de pedidos
    const ordersByStatus = getOrdersByStatus(orders)

    return NextResponse.json({
      totalSales: totalSales,
      totalOrders: totalOrders,
      totalUsers: totalUsers,
      totalProducts: totalProducts,
      monthlySales: monthlySales,
      topProducts: topProducts,
      ordersByStatus: ordersByStatus,
    })
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json(
      {
        error: "Error al obtener estadísticas",
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        monthlySales: [],
        topProducts: [],
        ordersByStatus: [],
      },
      { status: 200 }
    )
  }
}

function generateMonthlySalesData(orders: any[]) {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  const monthlySalesMap = new Map<string, { sales: number; orders: number }>()

  // Inicializar últimos 6 meses
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    monthlySalesMap.set(monthKey, { sales: 0, orders: 0 })
  }

  // Agregar datos de órdenes
  orders.forEach((order: any) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt)
      : new Date()
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`

    if (monthlySalesMap.has(monthKey)) {
      const current = monthlySalesMap.get(monthKey)!
      current.sales += order.total || 0
      current.orders += 1
    }
  })

  // Convertir a array con formato para gráfico
  return months.map((month, index) => {
    const now = new Date()
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const data = monthlySalesMap.get(monthKey) || { sales: 0, orders: 0 }

    return {
      month: month,
      sales: data.sales,
      orders: data.orders,
    }
  })
}

function getTopProducts(orders: any[], products: any[]) {
  const productSalesMap = new Map<string, number>()

  orders.forEach((order: any) => {
    const items = order.items || []
    items.forEach((item: any) => {
      const currentSales = productSalesMap.get(item.name) || 0
      productSalesMap.set(item.name, currentSales + (item.quantity || 1))
    })
  })

  // Convertir a array y ordenar
  const topProductsArray = Array.from(productSalesMap.entries())
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  // Si no hay órdenes, mostrar productos del catálogo
  if (topProductsArray.length === 0) {
    return products.slice(0, 5).map((p: any) => ({
      name: p.name || "Producto sin nombre",
      sales: 0,
    }))
  }

  return topProductsArray
}

function getOrdersByStatus(orders: any[]) {
  const statusMap = new Map<string, number>()

  // Status por defecto
  const defaultStatuses = ["Pendiente", "Procesando", "Enviado", "Entregado", "Cancelado"]
  defaultStatuses.forEach((status) => {
    statusMap.set(status, 0)
  })

  // Contar órdenes por estado
  orders.forEach((order: any) => {
    const status = order.status || "Pendiente"
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  // Convertir a array
  return Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .filter((item) => item.count > 0)
}
