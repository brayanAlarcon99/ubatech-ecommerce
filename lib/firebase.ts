import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import type { FirebaseApp } from "firebase/app"
import type { Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB6Yczsu4sF8cjD4H1Jz2KU4TO9f0biCoQ",
  authDomain: "ubatech-a8650.firebaseapp.com",
  projectId: "ubatech-a8650",
  storageBucket: "ubatech-a8650.firebasestorage.app",
  messagingSenderId: "609393850830",
  appId: "1:609393850830:web:567d90bdc33dd65fe2d39f",
  measurementId: "G-G2DW96480G",
}

let app: FirebaseApp = (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
let db: Firestore | null = null

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }

  const initFirestore = () => {
    try {
      db = getFirestore(app)
      console.log("[v0] Firestore initialized successfully")
      return db
    } catch (error) {
      console.warn("[v0] Firestore not ready yet, will retry on access")
      return null
    }
  }

  db = initFirestore()
} catch (error) {
  console.error("[v0] Firebase initialization error:", error)
}

export const getDb = () => {
  if (!db) {
    try {
      db = getFirestore(getApp())
    } catch (error) {
      console.error("[v0] Failed to get Firestore instance:", error)
      throw new Error("Firestore is not available. Please ensure Firestore Database is created in Firebase Console.")
    }
  }
  return db
}

export { app }
export default db
