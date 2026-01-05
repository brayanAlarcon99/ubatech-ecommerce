# REFERENCIA RÁPIDA - Nuevas Funcionalidades

## 📍 URLs Rápidas

### Tiendas Principales
```
DJCELUTECNICO:    http://localhost:3000/djcelutecnico
Ubatech+Pro:      http://localhost:3000/ubatech
Home:             http://localhost:3000/
```

### Carritos
```
DJCELUTECNICO:    http://localhost:3000/djcelutecnico/carrito
Ubatech+Pro:      http://localhost:3000/ubatech/carrito
```

### Contacto
```
DJCELUTECNICO:    http://localhost:3000/djcelutecnico/contacto
Ubatech+Pro:      http://localhost:3000/ubatech/contacto
```

### Admin
```
Login:            http://localhost:3000/admin/login
Dashboard:        http://localhost:3000/admin/dashboard
Tiendas (Admin):  http://localhost:3000/admin/dashboard → Sección "Tiendas"
```

### API
```
Inicializar:      POST http://localhost:3000/api/stores/init
```

---

## 🎨 Colores por Tienda

| Tienda | Primario | Secundario | Uso |
|--------|----------|-----------|-----|
| **DJCELUTECNICO** | `#a00009` (Rojo) | `#000000` (Negro) | Botones, headers |
| **Ubatech+Pro** | `#000000` (Negro) | `#4db8ff` (Azul) | Botones, headers |

---

## 💾 LocalStorage

```javascript
// Ver carritos guardados
localStorage.getItem('cart_djcelutecnico')  // DJCELUTECNICO
localStorage.getItem('cart_ubatech')        // Ubatech+Pro

// Limpiar un carrito
localStorage.removeItem('cart_djcelutecnico')
localStorage.removeItem('cart_ubatech')

// Limpiar todo
localStorage.clear()
```

---

## 📋 Datos en Firestore

### Colección: `stores`

```javascript
// Documento: djcelutecnico
{
  "id": "djcelutecnico",
  "name": "DJCELUTECNICO",
  "email": "contacto@djcelutecnico.com",
  "phone": "+54 9 1234 5678",
  "address": "...",
  "primaryColor": "#a00009",
  "secondaryColor": "#000000",
  "description": "Tu tienda DJ Celutecnico",
  "whatsapp": "+54 9 1234 5678",
  "instagram": "",
  "facebook": ""
}

// Documento: ubatech
{
  "id": "ubatech",
  "name": "Ubatech+Pro",
  "email": "contacto@ubatechpro.com",
  "phone": "+54 9 8765 4321",
  "address": "...",
  "primaryColor": "#000000",
  "secondaryColor": "#4db8ff",
  "description": "Tu tienda Ubatech+Pro",
  "whatsapp": "+54 9 8765 4321",
  "instagram": "",
  "facebook": ""
}
```

---

## 🔧 Comandos Útiles

```bash
# Compilar
npm run build

# Desarrollo
npm run dev

# Linting
npm run lint

# Verificar tipos
npx tsc --noEmit
```

---

## 👤 Acceso Admin

```
URL:      http://localhost:3000/admin/login
Usuario:  [Tu email]
Password: [Tu contraseña]
Rol:      super (para ver sección "Tiendas")
```

---

## 🆚 Diferencias por Tienda

| Aspecto | DJCELUTECNICO | Ubatech+Pro |
|---------|---------------|------------|
| **URL** | `/djcelutecnico` | `/ubatech` |
| **Carrito** | `/djcelutecnico/carrito` | `/ubatech/carrito` |
| **LocalStorage** | `cart_djcelutecnico` | `cart_ubatech` |
| **Contacto** | `/djcelutecnico/contacto` | `/ubatech/contacto` |
| **Color Principal** | `#a00009` | `#000000` |
| **Color Secundario** | `#000000` | `#4db8ff` |
| **Email** | `contacto@djcelutecnico.com` | `contacto@ubatechpro.com` |
| **Teléfono** | `+54 9 1234 5678` | `+54 9 8765 4321` |
| **Productos** | Compartidos ✅ | Compartidos ✅ |
| **Categorías** | Compartidas ✅ | Compartidas ✅ |

---

## ⚡ Características Rápidas

### Carritos
- ✅ Independientes por tienda
- ✅ Sincronización automática
- ✅ Datos persistentes
- ✅ Separación completa

### Botón Scroll to Top
- ✅ Aparece después de 300px
- ✅ Ubicado abajo a la derecha
- ✅ Scroll suave
- ✅ Discreto y sutil

### Contacto
- ✅ Información específica por tienda
- ✅ Formulario validado
- ✅ Integración WhatsApp
- ✅ Email automático
- ✅ Colores personalizados

### Admin - Tiendas
- ✅ Editar información
- ✅ Cambiar colores
- ✅ Gestionar contacto
- ✅ Redes sociales
- ✅ Solo superusuarios

---

## 🐛 Debugging

```javascript
// En DevTools Console

// Ver tienda actual
const pathname = window.location.pathname
console.log('Tienda:', pathname.includes('djcelutecnico') ? 'DJCELUTECNICO' : 'Ubatech+Pro')

// Ver carrito actual
const store = pathname.includes('djcelutecnico') ? 'djcelutecnico' : 'ubatech'
console.log('Carrito:', JSON.parse(localStorage.getItem(`cart_${store}`)))

// Limpiar carrito actual
localStorage.removeItem(`cart_${store}`)

// Ver todos los items de localStorage
console.table(localStorage)
```

---

## 📞 Contacto Rápido

### DJCELUTECNICO
📧 **Email:** contacto@djcelutecnico.com  
📱 **Teléfono:** +54 9 1234 5678  
💬 **WhatsApp:** [Click en página]  
🏪 **Tienda:** `/djcelutecnico`  
📋 **Contacto:** `/djcelutecnico/contacto`  

### Ubatech+Pro
📧 **Email:** contacto@ubatechpro.com  
📱 **Teléfono:** +54 9 8765 4321  
💬 **WhatsApp:** [Click en página]  
🏪 **Tienda:** `/ubatech`  
📋 **Contacto:** `/ubatech/contacto`  

---

## ✅ Checklist Rápido

- [ ] Carritos separados funcionan
- [ ] Botón Scroll a Top aparece
- [ ] Páginas contacto diferenciadas
- [ ] Admin sección Tiendas visible
- [ ] WhatsApp integrado
- [ ] Colores correctos
- [ ] Datos en Firestore

---

## 📚 Documentos

1. **COMIENZA_AQUI_NUEVAS_FUNCIONALIDADES.md** ← Empezar aquí
2. **GUIA_USO_NUEVAS_FUNCIONALIDADES.md** ← Instrucciones detalladas
3. **REFERENCIA_TECNICA_IMPLEMENTACION.md** ← Técnico
4. **RESUMEN_FINAL_IMPLEMENTACION.md** ← Resumen ejecutivo
5. **IMPLEMENTACION_FUNCIONALIDADES_2025.md** ← Detalles técnicos
6. **REFERENCIA_RAPIDA.md** ← Este documento 👈

---

## 🎯 Estado: ✅ COMPLETADO

Versión: 1.0  
Fecha: 29 Diciembre 2025  
Build: ✅ Exitoso  
Errores: 0  
Funcionalidades: 4  

🚀 **Listo para producción**

---

*Última actualización: 29 de Diciembre de 2025*
