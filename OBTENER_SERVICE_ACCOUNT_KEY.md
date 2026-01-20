# 🔐 OBTENER serviceAccountKey.json - GUÍA PASO A PASO

## 📍 UBICACIÓN CORRECTA

El archivo debe guardarse aquí:
```
D:\ubatech\serviceAccountKey.json
```

---

## 🚀 PASOS PARA OBTENERLO

### PASO 1: Ir a Firebase Console

1. Abre tu navegador
2. Ve a: **https://console.firebase.google.com**
3. Inicia sesión con tu cuenta Google (si no estás logueado)

### PASO 2: Seleccionar el Proyecto

1. En Firebase Console, verás una lista de proyectos
2. Busca y selecciona: **ubatech-a8650**
3. Deberías ver el dashboard del proyecto

### PASO 3: Ir a Service Accounts

1. Busca el ícono de **⚙️ Configuración** (arriba a la derecha)
2. Haz click en él
3. En el menú, busca: **Service Accounts**
4. Haz click en **Service Accounts**

### PASO 4: Generar Nueva Clave

1. Deberías estar en la pestaña: **Service Accounts**
2. Busca el botón: **Generate New Private Key** (o "Generar nueva clave privada")
3. Haz click en él
4. Aparecerá un diálogo confirmando

### PASO 5: Confirmar y Descargar

1. Confirma que quieres generar la clave
2. El archivo se descargará automáticamente
3. Por defecto se llama algo como: `ubatech-a8650-xxxxx.json`

### PASO 6: Cambiar Nombre del Archivo

1. Navega a donde se descargó (probablemente **Descargas**)
2. Haz click derecho en el archivo
3. Selecciona: **Renombrar**
4. Cambia el nombre a: **serviceAccountKey.json** (exactamente así)

### PASO 7: Mover a D:\ubatech

1. Corta (Ctrl+X) el archivo renombrado
2. Abre: D:\ubatech\ en el Explorador
3. Pega (Ctrl+V) el archivo ahí

### PASO 8: Verificar

En PowerShell, ejecuta:
```powershell
cd D:\ubatech
ls serviceAccountKey.json
```

Deberías ver algo como:
```
    Directory: D:\ubatech

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---           1/19/2026 10:30 AM           2547 serviceAccountKey.json
```

---

## ⚠️ IMPORTANTE - SEGURIDAD

```
❌ NUNCA compartas este archivo
❌ NUNCA lo subas a GitHub (ya está protegido en .gitignore)
❌ NUNCA lo envíes por email o chat
❌ NUNCA lo publiques en redes sociales

✅ Mantenlo privado en tu computadora
✅ Trata como contraseña importante
✅ Necesario solo para la migración
```

---

## ✅ CUANDO ESTÉ LISTO

Una vez tengas el archivo en `D:\ubatech\serviceAccountKey.json`:

### En PowerShell:
```powershell
cd D:\ubatech
node migrate-to-storage.js
```

Verás algo como:
```
🚀 INICIANDO MIGRACIÓN DE IMÁGENES A FIREBASE STORAGE

════════════════════════════════════════════════════════

📦 Obteniendo lista de productos...
✅ Total de productos encontrados: 5000

[████████████████░░░░] 2500/5000 - iPhone 14 Pro
```

**NO CIERRES LA VENTANA** hasta que termine (10-30 minutos).

---

## 🆘 PROBLEMAS

### "No encuentro el ícono de ⚙️"
- Está en la esquina superior derecha de Firebase Console
- Si no lo ves, recarga la página (F5)

### "No veo Service Accounts"
- Asegúrate de estar en **Settings → Service Accounts**
- No es **Authentication**, es **Service Accounts**

### "El archivo descargado tiene nombre diferente"
- Es normal, Firefox/Chrome dan nombres diferentes
- Solo renómbralo a: `serviceAccountKey.json`

### "Dice que el archivo ya existe"
- Significa que ya generaste una clave antes
- Puedes usar la que descargues ahora o generar nueva

---

## 📸 VISTA RÁPIDA DEL ARCHIVO

El archivo JSON tiene este aspecto (NO COMPARTAS):

```json
{
  "type": "service_account",
  "project_id": "ubatech-a8650",
  "private_key_id": "xxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@ubatech-a8650.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 📋 CHECKLIST

```
[ ] Abrí Firebase Console
[ ] Seleccioné proyecto: ubatech-a8650
[ ] Fui a: ⚙️ Settings → Service Accounts
[ ] Hice click en: Generate New Private Key
[ ] Descargué el archivo JSON
[ ] Renombré a: serviceAccountKey.json
[ ] Moví a: D:\ubatech\
[ ] Verifiqué que existe: ls serviceAccountKey.json
[ ] Listo para ejecutar: node migrate-to-storage.js
```

---

## 🎬 ¡ADELANTE!

Una vez tengas el archivo:

```powershell
cd D:\ubatech
node migrate-to-storage.js
```

¡La migración comenzará automáticamente!
