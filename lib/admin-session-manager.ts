import { getDb } from "@/lib/firebase"
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore"

// Generar un identificador único de dispositivo basado en características del navegador
export function generateDeviceId(): string {
  const deviceInfo = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
    timezone: new Date().getTimezoneOffset().toString(),
    timestamp: Date.now(),
    random: Math.random().toString(36).substr(2, 9)
  }
  
  // Crear un hash simple del dispositivo
  const deviceString = JSON.stringify(deviceInfo)
  let hash = 0
  for (let i = 0; i < deviceString.length; i++) {
    const char = deviceString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a entero de 32 bits
  }
  
  return `device_${Math.abs(hash).toString(16)}_${Date.now()}`
}

// Obtener o crear deviceId en localStorage
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let deviceId = localStorage.getItem('admin_device_id')
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem('admin_device_id', deviceId)
  }
  return deviceId
}

// Estructura de datos de sesión
export interface AdminSession {
  userId: string
  deviceId: string
  deviceName?: string
  lastActivity: Timestamp
  createdAt: Timestamp
  isActive: boolean
  ipAddress?: string
  userAgent?: string
}

// Registrar una nueva sesión de admin
export async function registerAdminSession(
  userId: string, 
  deviceName?: string
): Promise<string> {
  const deviceId = getOrCreateDeviceId()
  
  const sessionData: AdminSession = {
    userId,
    deviceId,
    deviceName: deviceName || `Dispositivo ${new Date().toLocaleDateString('es-ES')}`,
    lastActivity: serverTimestamp() as Timestamp,
    createdAt: serverTimestamp() as Timestamp,
    isActive: true,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  }
  
  // Guardar sesión en Firestore bajo adminSessions
  const sessionRef = doc(getDb(), 'adminSessions', `${userId}_${deviceId}`)
  await setDoc(sessionRef, sessionData)
  
  // Cerrar todas las otras sesiones del mismo usuario
  await closeOtherSessions(userId, deviceId)
  
  return deviceId
}

// Cerrar todas las otras sesiones del mismo usuario
async function closeOtherSessions(userId: string, currentDeviceId: string): Promise<void> {
  try {
    const sessionsRef = collection(getDb(), 'adminSessions')
    const q = query(sessionsRef, where('userId', '==', userId), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    for (const sessionDoc of querySnapshot.docs) {
      const session = sessionDoc.data() as AdminSession
      // Cerrar solo si no es el dispositivo actual
      if (session.deviceId !== currentDeviceId) {
        await updateDoc(doc(getDb(), 'adminSessions', sessionDoc.id), {
          isActive: false,
          closedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error closing other sessions:', error)
  }
}

// Validar si la sesión actual sigue activa
export async function validateAdminSession(userId: string): Promise<boolean> {
  try {
    const deviceId = getOrCreateDeviceId()
    const sessionRef = doc(getDb(), 'adminSessions', `${userId}_${deviceId}`)
    const sessionDoc = await getDoc(sessionRef)
    
    if (!sessionDoc.exists()) {
      return false
    }
    
    const session = sessionDoc.data() as AdminSession
    return session.isActive === true
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}

// Obtener todas las sesiones activas del usuario
export async function getActiveSessionsForUser(userId: string): Promise<AdminSession[]> {
  try {
    const sessionsRef = collection(getDb(), 'adminSessions')
    const q = query(
      sessionsRef, 
      where('userId', '==', userId),
      where('isActive', '==', true)
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => doc.data() as AdminSession)
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return []
  }
}

// Cerrar una sesión específica por deviceId
export async function closeSessionByDeviceId(userId: string, deviceId: string): Promise<void> {
  try {
    const sessionRef = doc(getDb(), 'adminSessions', `${userId}_${deviceId}`)
    await updateDoc(sessionRef, {
      isActive: false,
      closedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error closing session:', error)
    throw error
  }
}

// Actualizar actividad de sesión
export async function updateSessionActivity(userId: string): Promise<void> {
  try {
    const deviceId = getOrCreateDeviceId()
    const sessionRef = doc(getDb(), 'adminSessions', `${userId}_${deviceId}`)
    await updateDoc(sessionRef, {
      lastActivity: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating session activity:', error)
  }
}

// Limpiar sesiones inactivas (más de 30 días)
export async function cleanupOldSessions(): Promise<void> {
  try {
    const sessionsRef = collection(getDb(), 'adminSessions')
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const q = query(
      sessionsRef,
      where('lastActivity', '<', Timestamp.fromDate(thirtyDaysAgo))
    )
    
    const querySnapshot = await getDocs(q)
    
    for (const sessionDoc of querySnapshot.docs) {
      await deleteDoc(doc(getDb(), 'adminSessions', sessionDoc.id))
    }
  } catch (error) {
    console.error('Error cleaning up old sessions:', error)
  }
}
