import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

// GET: Obtener todas las sesiones activas del usuario actual
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Obtener instancias de Firebase Admin
    const auth = getAdminAuth()
    const db = getAdminDb()
    
    // Verificar el token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Obtener todas las sesiones activas del usuario
    const snapshot = await db
      .collection('adminSessions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get()

    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastActivity: doc.data().lastActivity?.toDate?.() || null,
      createdAt: doc.data().createdAt?.toDate?.() || null
    }))

    return NextResponse.json({
      sessions,
      count: sessions.length
    })
  } catch (error: any) {
    console.error('[Sessions API] Error getting sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting sessions' },
      { status: 500 }
    )
  }
}

// POST: Validar sesión actual o cerrar sesión remota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, deviceId } = body
    const token = request.headers.get('authorization')?.split('Bearer ')[1]

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Obtener instancias de Firebase Admin
    const auth = getAdminAuth()
    const db = getAdminDb()
    
    // Verificar el token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    if (action === 'validate') {
      // Validar que la sesión actual sigue activa
      const sessionId = `${userId}_${deviceId}`
      const sessionRef = db.collection('adminSessions').doc(sessionId)
      const sessionDoc = await sessionRef.get()

      if (!sessionDoc.exists) {
        return NextResponse.json({
          valid: false,
          message: 'Session not found'
        }, { status: 200 })
      }

      const session = sessionDoc.data()
      
      if (!session || !session.isActive) {
        return NextResponse.json({
          valid: false,
          message: 'Session was closed. Please log in again.',
          reason: 'closed_remotely'
        }, { status: 200 })
      }

      return NextResponse.json({
        valid: true,
        message: 'Session is active'
      })
    } 
    
    if (action === 'close-remote') {
      // Cerrar una sesión remota específica
      if (!deviceId) {
        return NextResponse.json(
          { error: 'deviceId is required' },
          { status: 400 }
        )
      }

      const sessionId = `${userId}_${deviceId}`
      
      // No permitir cerrar la sesión actual
      const currentDeviceId = request.headers.get('x-device-id')
      if (currentDeviceId === deviceId) {
        return NextResponse.json(
          { error: 'Cannot close your current session this way. Use logout instead.' },
          { status: 400 }
        )
      }

      // Actualizar la sesión
      const sessionRef = db.collection('adminSessions').doc(sessionId)
      await sessionRef.update({
        isActive: false,
        closedAt: new Date(),
        closedBy: 'remote'
      })

      return NextResponse.json({
        message: 'Session closed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[Sessions API] Error in POST:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing request' },
      { status: 500 }
    )
  }
}

// DELETE: Cerrar sesión actual
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1]
    const deviceId = request.headers.get('x-device-id')

    if (!token || !deviceId) {
      return NextResponse.json(
        { error: 'Token and deviceId required' },
        { status: 401 }
      )
    }

    // Obtener instancias de Firebase Admin
    const auth = getAdminAuth()
    const db = getAdminDb()
    
    // Verificar el token
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const sessionId = `${userId}_${deviceId}`

    // Cerrar la sesión
    const sessionRef = db.collection('adminSessions').doc(sessionId)
    await sessionRef.update({
      isActive: false,
      closedAt: new Date(),
      closedBy: 'user'
    })

    return NextResponse.json({
      message: 'Session closed successfully'
    })
  } catch (error: any) {
    console.error('[Sessions API] Error closing session:', error)
    return NextResponse.json(
      { error: error.message || 'Error closing session' },
      { status: 500 }
    )
  }
}
