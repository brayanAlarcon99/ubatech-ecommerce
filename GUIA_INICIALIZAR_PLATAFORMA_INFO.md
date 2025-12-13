# 🚀 GUÍA: Inicializar Colección platform_info en Firestore

## Opción 1: Usar la Consola de Firebase (Recomendado - Más Fácil)

### Pasos:

1. **Accede a Firebase Console**
   - Ve a: https://console.firebase.google.com/
   - Selecciona tu proyecto: `ubatech-a8650`

2. **Navega a Firestore Database**
   - En el menú izquierdo, haz clic en "Firestore Database"

3. **Crea una Nueva Colección**
   - Haz clic en "+ Crear colección"
   - Nombre de colección: `platform_info`
   - Haz clic en "Siguiente"

4. **Crea el Documento**
   - ID del documento: `platform_info`
   - Haz clic en "Guardar"

5. **Agrega los Campos**
   - Haz clic en "+ Agregar campo"
   - Agrega los siguientes campos con sus valores:

   | Campo | Tipo | Valor |
   |-------|------|-------|
   | `version` | String | `1.0.0` |
   | `lastUpdate` | String | `Diciembre 2025` |
   | `supportEmail` | String | `support@ubatech.com` |
   | `description` | String | `Plataforma de compras online especializada en productos tecnológicos innovadores` |
   | `updatedAt` | Timestamp | Ahora (fecha/hora actual) |

6. **Guarda el Documento**
   - Haz clic en "Guardar"

✅ ¡Colección creada exitosamente!

---

## Opción 2: Usar la API de Inicialización

### Pasos:

1. **Abre tu aplicación**
   - Asegúrate de estar en `http://localhost:3000` o tu URL de desarrollo

2. **Haz una solicitud POST**
   
   Opción A - Usando curl en terminal:
   ```bash
   curl -X POST http://localhost:3000/api/admin/init-platform-info \
     -H "Authorization: Bearer admin" \
     -H "Content-Type: application/json"
   ```

   Opción B - Usando el navegador (consola JavaScript):
   ```javascript
   fetch('/api/admin/init-platform-info', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer admin',
       'Content-Type': 'application/json'
     }
   })
   .then(res => res.json())
   .then(data => console.log(data))
   ```

3. **Verifica el resultado**
   - Si es exitoso, verás: `{"success": true, "message": "Colección platform_info inicializada correctamente"}`

---

## Opción 3: Usar Node.js Script

### Pasos:

1. **Crea un archivo temporal** (opcional):
   ```bash
   # Este script ya existe en lib/init-platform-info.ts
   ```

2. **Ejecuta el script** desde tu proyecto:
   ```bash
   node -r ts-node/register lib/init-platform-info.ts
   ```

3. **Descomenta la línea** en el archivo si quieres ejecutarlo

---

## Verificación

Después de inicializar, verifica que todo funcionó correctamente:

### En Firebase Console:
```
Firestore Database
  └── Collections
      └── platform_info
          └── platform_info
              ├── version: "1.0.0"
              ├── lastUpdate: "Diciembre 2025"
              ├── supportEmail: "support@ubatech.com"
              ├── description: "Plataforma de compras online..."
              └── updatedAt: (timestamp)
```

### En tu aplicación:
1. Inicia sesión como súper usuario
2. Ve a Panel Admin → Configuración
3. Desplázate a "Información de la Plataforma"
4. Deberías ver los datos precargados en los campos

---

## Estructura JSON Esperada

```json
{
  "version": "1.0.0",
  "lastUpdate": "Diciembre 2025",
  "supportEmail": "support@ubatech.com",
  "description": "Plataforma de compras online especializada en productos tecnológicos innovadores",
  "updatedAt": "2025-12-10T15:30:45.123Z"
}
```

---

## Solución de Problemas

### Problema: "Error al conectar con Firestore"
**Solución**: Verifica que tu proyecto de Firebase esté configurado correctamente en `lib/firebase.ts`

### Problema: "No autorizado" en la API
**Solución**: Asegúrate de agregar el encabezado `Authorization` en tu solicitud

### Problema: Los datos no aparecen en el panel
**Solución**: 
- Limpia la caché del navegador (Ctrl+Shift+Delete)
- Recarga la página (F5)
- Verifica que seas súper usuario

### Problema: "collection not initialized"
**Solución**: La colección debe crearse manualmente o usar una de las opciones anteriores para inicializarla

---

## ¿Qué Hacer Después?

Después de inicializar correctamente:

1. ✅ Verifica que el footer muestre el año dinámico
2. ✅ Inicia sesión como súper usuario
3. ✅ Edita la información de la plataforma desde Configuración
4. ✅ Guarda los cambios
5. ✅ Verifica que aparezca en el Dashboard
6. ✅ Comprueba que se sincronice en tiempo real

---

## Contacto y Soporte

Si encuentras problemas:
- 📧 Email: support@ubatech.com
- 🐛 Revisa los logs del navegador (F12 → Console)
- 📝 Consulta la documentación completa en `PLATAFORMA_INFO_DOCUMENTACION.md`

---

## ¡Listo!

Una vez inicializado, tu sistema estará completamente operativo. 
Los súper usuarios podrán editar la información y verla en tiempo real en los paneles administrativos.
