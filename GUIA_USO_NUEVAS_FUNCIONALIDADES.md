# GUÍA DE USO - Nuevas Funcionalidades Implementadas

## 📋 Tabla de Contenidos
1. [Carritos Independientes](#carritos-independientes)
2. [Botón Scroll to Top](#botón-scroll-to-top)
3. [Páginas de Contacto](#páginas-de-contacto)
4. [Panel Administrativo - Tiendas](#panel-administrativo)

---

## 🛒 Carritos Independientes

### ¿Cómo funcionan?
Cada tienda tiene su propio carrito completamente separado. Cuando cambias de tienda, el carrito cambia automáticamente.

### URLs de Acceso
| Tienda | URL Carrito |
|--------|-------------|
| **DJCELUTECNICO** | `http://localhost:3000/djcelutecnico/carrito` |
| **Ubatech+Pro** | `http://localhost:3000/ubatech/carrito` |

### Almacenamiento
Los carritos se guardan en el navegador (`localStorage`) con claves diferentes:
- `cart_djcelutecnico` - Carrito de DJCELUTECNICO
- `cart_ubatech` - Carrito de Ubatech+Pro

### Ejemplo de Uso
1. Ve a `/djcelutecnico`
2. Agrega productos (ej: 3 productos)
3. Ve a `/ubatech`
4. El carrito aparecerá vacío ✅
5. Regresa a `/djcelutecnico`
6. Los 3 productos siguen ahí ✅

### Nota Técnica
El sistema detecta automáticamente en qué tienda estás según la URL y carga el carrito correcto.

---

## ⬆️ Botón "Scroll to Top"

### ¿Dónde aparece?
- ✅ En todas las páginas de tiendas
- ✅ En el panel administrativo
- ❌ NO aparece en otras secciones

### ¿Cuándo aparece?
- Automáticamente cuando haces scroll **más de 300px hacia abajo**
- Desaparece cuando subes nuevamente a los primeros **300px**

### Diseño
- **Ubicación:** Esquina inferior derecha (abajo a la derecha)
- **Color:** Negro semi-transparente (discreto y sutil)
- **Icono:** Flecha hacia arriba
- **Efecto:** Smooth scroll al hacer click

### Cómo Usar
1. Haz scroll hacia abajo en cualquier página de tienda
2. Cuando bajes más de 300px, aparecerá el botón
3. Click en el botón para volver al inicio suavemente

---

## 📞 Páginas de Contacto Independientes

### URLs de Acceso
| Tienda | URL Contacto |
|--------|--------------|
| **DJCELUTECNICO** | `http://localhost:3000/djcelutecnico/contacto` |
| **Ubatech+Pro** | `http://localhost:3000/ubatech/contacto` |

### ¿Qué Incluye?
Cada página de contacto tiene:
- ✅ Información de contacto específica (email, teléfono, dirección)
- ✅ Botón directo a WhatsApp
- ✅ Formulario de contacto con validación
- ✅ Colores personalizados por tienda
- ✅ Descripcción de la tienda

### Información que se Muestra
```
DJCELUTECNICO:
- Email: contacto@djcelutecnico.com
- Teléfono: +54 9 1234 5678
- Dirección: [Se edita en admin]
- Colores: Rojo (#a00009)

Ubatech+Pro:
- Email: contacto@ubatechpro.com
- Teléfono: +54 9 8765 4321
- Dirección: [Se edita en admin]
- Colores: Negro (#000000)
```

### Botón WhatsApp
Hace click en el botón WhatsApp y:
1. Se abre WhatsApp automáticamente (si está instalado)
2. Se pre-carga un mensaje: *"Hola, quisiera consultar sobre los productos de [Tienda]"*
3. El usuario puede enviar el mensaje directamente

### Formulario de Contacto
Permite que los usuarios envíen mensajes:
1. Completan nombre, email y mensaje
2. Al enviar, se recibe un email en la dirección configurada
3. Mensaje de confirmación al usuario

---

## ⚙️ Panel Administrativo - Configuración de Tiendas

### Acceso
1. Ve a `http://localhost:3000/admin/login`
2. Inicia sesión como **superusuario**
3. En el menú lateral, busca la opción **"Tiendas" (🏪)**
4. Click para abrir la configuración

### ⚠️ Restricción de Acceso
- Solo **superusuarios** pueden acceder a esta sección
- Si eres usuario regular, no verás esta opción

### ¿Qué se Puede Editar?

#### 1️⃣ Información Básica
- **Nombre de la Tienda**
- **Descripción**

#### 2️⃣ Información de Contacto
- **Email** - Para formularios de contacto
- **Teléfono** - Se muestra en página de contacto
- **Dirección** - Se muestra en página de contacto
- **WhatsApp** (opcional) - Si es diferente del teléfono

#### 3️⃣ Redes Sociales (opcional)
- **Instagram** - URL del perfil
- **Facebook** - URL del perfil

#### 4️⃣ Colores y Estilos
- **Color Principal** - Color dominante de la tienda
- **Color Secundario** - Color de acentos

### Cómo Cambiar Información de una Tienda

1. **Selecciona la tienda**
   - Haz click en el botón "DJCELUTECNICO" o "Ubatech+Pro"

2. **Edita los campos**
   - Modifica la información que desees

3. **Cambia los colores**
   - Click en el cuadro de color para abrir el selector
   - O pega el código hexadecimal directamente

4. **Guarda los cambios**
   - Click en el botón "Guardar Cambios"
   - Espera la confirmación (debería decir "✓ Cambios guardados exitosamente")

5. **Verifica los cambios**
   - Ve a la tienda pública
   - Recarga la página
   - Los cambios deberían ser visibles

### Ejemplo de Uso
```
1. Panel Admin → Tiendas
2. Selecciono: DJCELUTECNICO
3. Cambio:
   - Email: nuevoemail@djcelutecnico.com
   - Teléfono: +54 9 2222 3333
   - Color Principal: #FF0000
4. Guardo cambios
5. Voy a /djcelutecnico/contacto
6. Veo el email, teléfono y colores nuevos ✅
```

### Validación
- Los campos se validan al enviar
- Si algo falta o es inválido, recibirás un error
- Los cambios se guardan en Firestore

### Almacenamiento de Datos
Los datos se guardan en Firestore en la colección `stores`:
- Documento: `djcelutecnico`
- Documento: `ubatech`

---

## 🔄 Flujo Completo de Usuario

### Cliente - Visitante
```
1. Entra a /djcelutecnico
2. Ve productos con colores específicos
3. Agrega productos al carrito
4. Click en "Tu Carrito"
5. Ve /djcelutecnico/carrito (carrito independiente)
6. Click en "Ir a Contacto" → /djcelutecnico/contacto
7. Ve información de contacto de esa tienda
8. Hace scroll → Aparece botón "Scroll to Top"
9. Click en botón → Sube al inicio
```

### Administrador - Gestión
```
1. Entra a /admin/login (superusuario)
2. Panel → Tiendas
3. Selecciona tienda a editar
4. Cambia información (email, teléfono, colores)
5. Guarda cambios
6. Sale del admin
7. Va a la tienda pública
8. Recarga página
9. Ve los cambios reflejados
```

---

## 📊 Esquema de Datos - Firestore

### Colección: `stores`

```
stores/
├── djcelutecnico/
│   ├── id: "djcelutecnico"
│   ├── name: "DJCELUTECNICO"
│   ├── email: "contacto@djcelutecnico.com"
│   ├── phone: "+54 9 1234 5678"
│   ├── whatsapp: "+54 9 1234 5678"
│   ├── address: "Dirección..."
│   ├── logo: "/logo-djcelutecnico.jpg"
│   ├── primaryColor: "#a00009"
│   ├── secondaryColor: "#000000"
│   ├── description: "Tu tienda DJ Celutecnico"
│   ├── instagram: ""
│   ├── facebook: ""
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
└── ubatech/
    ├── id: "ubatech"
    ├── name: "Ubatech+Pro"
    ├── email: "contacto@ubatechpro.com"
    ├── phone: "+54 9 8765 4321"
    ├── whatsapp: "+54 9 8765 4321"
    ├── address: "Dirección..."
    ├── logo: "/logo-ubatech.png"
    ├── primaryColor: "#000000"
    ├── secondaryColor: "#4db8ff"
    ├── description: "Tu tienda Ubatech+Pro"
    ├── instagram: ""
    ├── facebook: ""
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

---

## ✅ Checklist de Verificación

Use esta lista para verificar que todo funciona correctamente:

### Carritos Independientes
- [ ] Agrega productos a `/djcelutecnico` 
- [ ] Verifica que el carrito tenga los productos
- [ ] Ve a `/ubatech`
- [ ] Verifica que el carrito esté vacío
- [ ] Regresa a `/djcelutecnico`
- [ ] Verifica que los productos sigan ahí

### Botón Scroll to Top
- [ ] Entra a `/djcelutecnico`
- [ ] No ves el botón (estás en el top)
- [ ] Haces scroll hacia abajo (más de 300px)
- [ ] Aparece el botón en la esquina inferior derecha
- [ ] Haces click en el botón
- [ ] Subes al inicio suavemente

### Páginas de Contacto
- [ ] Ve a `/djcelutecnico/contacto`
- [ ] Ves información de DJCELUTECNICO
- [ ] Ves el botón WhatsApp
- [ ] Ve a `/ubatech/contacto`
- [ ] Ves información de Ubatech+Pro
- [ ] Los colores son diferentes
- [ ] Llenas el formulario
- [ ] Envías un mensaje
- [ ] Reciben confirmación

### Panel Administrativo
- [ ] Entra a `/admin/dashboard`
- [ ] Ves "Tiendas" en el menú (si eres superusuario)
- [ ] Click en "Tiendas"
- [ ] Selecciona DJCELUTECNICO
- [ ] Ves la información cargada
- [ ] Cambias algo (ej: email)
- [ ] Haces click en "Guardar Cambios"
- [ ] Ves mensaje de éxito
- [ ] Ve a `/djcelutecnico/contacto`
- [ ] Verifica que el email cambió

---

## 🆘 Solución de Problemas

### El carrito de una tienda no persiste
**Causa:** localStorage está deshabilitado o hay un problema de navegador
**Solución:** 
1. Verifica que localStorage esté habilitado
2. Abre las DevTools (F12) → Aplication → Local Storage
3. Verifica que exista `cart_djcelutecnico` o `cart_ubatech`

### No veo el botón "Scroll to Top"
**Causa:** No hiciste scroll lo suficiente
**Solución:**
1. Haz scroll hacia abajo al menos 300px
2. El botón debería aparecer en la esquina inferior derecha

### No puedo acceder a "Tiendas" en admin
**Causa:** No eres superusuario
**Solución:**
1. Verifica tu rol en Firestore
2. Debe ser `role: "super"`
3. Contacta al administrador del sistema

### Los cambios en Firestore no aparecen
**Causa:** Posible problema de caché o sincronización
**Solución:**
1. Recarga la página (F5)
2. Abre DevTools → Aplication → Clear Storage
3. Recarga nuevamente

### WhatsApp no abre
**Causa:** Navegador bloquea ventanas emergentes
**Solución:**
1. Permite ventanas emergentes para este sitio
2. O instala la app de WhatsApp en tu dispositivo
3. Copia el número y envía mensaje manualmente

---

## 📞 Contacto y Soporte

Si tienes preguntas o problemas:
1. Revisa este documento
2. Verifica el archivo `IMPLEMENTACION_FUNCIONALIDADES_2025.md`
3. Contacta al equipo de desarrollo

---

**Última actualización:** 29 de Diciembre de 2025
**Versión:** 1.0
**Estado:** ✅ Implementado y Funcionando
