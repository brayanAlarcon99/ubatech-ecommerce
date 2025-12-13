/**
 * Script de diagnóstico para verificar la configuración de Firebase
 * Ejecutar en la consola del navegador mientras estés en la página de administrador
 */

async function diagnosticoFirebase() {
  console.clear()
  console.log("🔍 === DIAGNÓSTICO DE FIREBASE ===\n")

  try {
    // 1. Verificar Firebase inicializado
    console.log("1️⃣  Verificando Firebase...")
    const { getApps } = await import("firebase/app")
    const apps = getApps()
    console.log(`   ✅ Firebase inicializado: ${apps.length} app(s)`)
    if (apps.length > 0) {
      console.log(`   📱 App: ${apps[0].name}`)
    }

    // 2. Verificar Firestore
    console.log("\n2️⃣  Verificando Firestore...")
    const { getFirestore, collection, getDocs } = await import("firebase/firestore")
    const db = getFirestore()
    console.log("   ✅ Firestore conectado")

    // 3. Verificar colección adminUsers
    console.log("\n3️⃣  Leyendo colección 'adminUsers'...")
    const adminUsersRef = collection(db, "adminUsers")
    const snapshot = await getDocs(adminUsersRef)
    console.log(`   ✅ Administradores encontrados: ${snapshot.size}`)
    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`      - ${data.email} (${data.role})`)
    })

    // 4. Verificar Authentication
    console.log("\n4️⃣  Verificando Firebase Authentication...")
    const { getAuth } = await import("firebase/auth")
    const auth = getAuth()
    console.log(`   ✅ Auth inicializado`)
    if (auth.currentUser) {
      console.log(`   👤 Usuario actual: ${auth.currentUser.email}`)
      console.log(`   🔑 UID: ${auth.currentUser.uid}`)
    } else {
      console.log("   ⚠️  No hay usuario autenticado")
    }

    // 5. Verificar localStorage
    console.log("\n5️⃣  Verificando localStorage...")
    const adminToken = localStorage.getItem("adminAuthToken")
    const adminEmail = localStorage.getItem("adminEmail")
    console.log(`   Admin Token: ${adminToken ? "✅ Existe" : "❌ No existe"}`)
    console.log(`   Admin Email: ${adminEmail ? `✅ ${adminEmail}` : "❌ No existe"}`)

    console.log("\n✨ Diagnóstico completado")
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
  }
}

// Ejecutar el diagnóstico
diagnosticoFirebase()
