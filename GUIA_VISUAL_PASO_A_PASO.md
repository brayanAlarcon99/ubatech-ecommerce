# 🎯 GUÍA VISUAL - PASO A PASO

## PASO 1: Abre Firebase Console

### URL:
```
https://console.firebase.google.com
```

### Pantalla esperada:
```
┌──────────────────────────────────────────────────┐
│  Firebase Console                                │
│                                                  │
│  Projects                                        │
│  ├─ ubatech-a8650  ← SELECCIONA ESTE           │
│  └─ Otros...                                     │
└──────────────────────────────────────────────────┘
```

---

## PASO 2: Navega a Cloud Firestore Rules

### Ruta en Firebase:
```
Proyecto ubatech-a8650
  ↓
Cloud Firestore
  ↓
Rules (pestaña azul)
```

### Cómo se ve:
```
┌──────────────────────────────────────────────────┐
│  Cloud Firestore                                 │
│  [ Data   Rules   Indexes ]                     │
│           └── CLICK AQUÍ                         │
│                                                  │
│  Editor de reglas:                             │
│  ┌──────────────────────────────────────────┐ │
│  │ rules_version = '2';                     │ │
│  │ service cloud.firestore {                │ │
│  │   match /databases/{database}/documents  │ │
│  │     ...                                  │ │
│  │                                          │ │
│  │  [ Publish ] ← BOTÓN IMPORTANTE          │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## PASO 3: Selecciona TODO y Borra

### Atajo:
```
Ctrl + A  → Selecciona todo
Delete    → Borra todo
```

### Debería verse:
```
┌──────────────────────────────────────────────────┐
│  Editor de reglas:                             │
│  ┌──────────────────────────────────────────┐ │
│  │ (vacío)                                  │ │
│  │                                          │ │
│  │                                          │ │
│  │  [ Publish ]                             │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## PASO 4: Copia estas REGLAS EXACTAS

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Configuración pública
    match /store_settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Productos públicos
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Categorías públicas
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Órdenes privadas
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Admin users privados
    match /adminUsers/{userId} {
      allow read, write: if request.auth != null;
    }

    // Config privada
    match /config/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Default privado
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## PASO 5: Pega en Firebase Console

### Atajo:
```
Ctrl + V  → Pega las reglas
```

### Debería verse:
```
┌──────────────────────────────────────────────────┐
│  Editor de reglas:                             │
│  ┌──────────────────────────────────────────┐ │
│  │ rules_version = '2';                     │ │
│  │ service cloud.firestore {                │ │
│  │   match /databases/{database}/documents  │ │
│  │     match /store_settings/{document=**}  │ │
│  │       allow read: if true;               │ │
│  │       allow write: if request.auth != .. │ │
│  │     ...                                  │ │
│  │                                          │ │
│  │  [ Publish ] ← CLICK AQUÍ                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## PASO 6: Haz Click en Publish

### Botón:
```
┌──────────┐
│ Publish  │  ← CLICK AQUÍ
└──────────┘
```

### Notificación esperada:
```
✅ Your security rules have been published successfully.
```

### O espera a ver:
```
┌──────────────────────────────────────────┐
│ ✅ Published successfully                │
│ Rules published at: 2025-12-10 19:31:00  │
└──────────────────────────────────────────┘
```

---

## PASO 7: Recarga el navegador

### En localhost:3000:
```
Atajo: Ctrl + F5 (hard reload)
```

### Resultado esperado:
```
✅ Sitio carga sin errores
✅ Footer muestra datos
✅ Header muestra nombre tienda
✅ F12 Console sin errores rojos
```

---

## PASO 8: Verifica en F12

### Abre la consola:
```
Atajo: F12
Pestaña: Console
```

### Busca esto:
```
❌ MALO (Error):
   FirebaseError: Missing or insufficient permissions.

✅ BUENO (Sin error):
   (Consola vacía o solo logs normales)
```

---

## PASO 9: Prueba la Sincronización

### Test en Admin:
```
1. Abre: http://localhost:3000/admin/dashboard
2. Ve a: Configuración
3. Cambia: Teléfono
4. Click: Guardar Configuración
5. Espera: 3 segundos
```

### Test en Público:
```
1. Abre otra pestaña: http://localhost:3000
2. Baja al footer
3. Verifica: Teléfono debe estar actualizado
4. ✅ LISTO
```

---

## CHECKLIST VISUAL

```
┌─ PASO 1: Firebase Console
│  ├─ [ ] Abierto
│  └─ [ ] Ves proyecto ubatech-a8650

┌─ PASO 2: Navega a Rules
│  ├─ [ ] Cloud Firestore visible
│  └─ [ ] Rules tab visible

┌─ PASO 3: Borra contenido
│  ├─ [ ] Seleccioné todo (Ctrl+A)
│  └─ [ ] Borré todo (Delete)

┌─ PASO 4: Copia reglas
│  ├─ [ ] Tengo el código arriba
│  └─ [ ] Copié (Ctrl+C)

┌─ PASO 5: Pega en Firebase
│  ├─ [ ] En el editor
│  └─ [ ] Pegué (Ctrl+V)

┌─ PASO 6: Publish
│  ├─ [ ] Ví el botón azul Publish
│  └─ [ ] ✅ "Published successfully"

┌─ PASO 7: Recarga navegador
│  ├─ [ ] Presioné Ctrl+F5
│  └─ [ ] Página recargó

┌─ PASO 8: Verifica en F12
│  ├─ [ ] Abrí consola (F12)
│  └─ [ ] ✅ Sin errores rojos

┌─ PASO 9: Prueba sincronización
│  ├─ [ ] Cambié en admin
│  ├─ [ ] Aparece en público
│  └─ [ ] ✅ FUNCIONA
```

---

## 🎥 RESUMEN EN VIDEO

Si tuvieras que verlo en un video, sería así:

```
1️⃣  Browser → Firebase Console URL
    ↓
2️⃣  Navigate → Cloud Firestore → Rules
    ↓
3️⃣  Editor → Ctrl+A → Delete (limpiar)
    ↓
4️⃣  Copy → Reglas (arriba en este documento)
    ↓
5️⃣  Paste → Ctrl+V (en editor Firebase)
    ↓
6️⃣  Click → Publish (botón azul)
    ↓
7️⃣  Wait → "Published successfully" ✅
    ↓
8️⃣  Browser → Ctrl+F5 (refresh localhost:3000)
    ↓
9️⃣  Verify → F12 Console (sin errores)
    ↓
🔟  Test → Cambia admin → Aparece público
    ↓
✅  DONE
```

---

## ⏱️ TIEMPO POR PASO

| Paso | Tiempo | Nota |
|------|--------|------|
| 1-2 | 30 seg | Navegar en Firebase |
| 3-4 | 1 min | Copiar/pegar |
| 5-6 | 2 min | Publish y esperar |
| 7-9 | 1 min | Verificar |
| **TOTAL** | **5 min** | Máximo |

---

## 🆘 AYUDA RÁPIDA

### "No veo el botón Publish"
→ El editor debe estar abierto  
→ Verifica que estés en la pestaña "Rules"

### "Me dice error al publicar"
→ Verifica que el código no tenga errores  
→ Abre/cierra llaves deben coincidir

### "Sigue mostrando error"
→ Limpia cache: Ctrl+Shift+Delete  
→ Abre incógnito: Ctrl+Shift+N  
→ Recarga: Ctrl+F5

### "Cambios no aparecen en público"
→ Espera 3 segundos después de guardar  
→ Abre otra pestaña diferente  
→ Haz Ctrl+F5 en la pestaña pública

---

**¿Listo? ¡Comienza en el PASO 1!** 🚀
