# 📱 GUÍA RÁPIDA: Configurar WhatsApp por Tienda

## ¿Qué se cambió?

El sistema ahora es **mucho más simple**:
- ✅ **1 campo de WhatsApp** por tienda (antes eran 2)
- ✅ **Sin fallbacks confusos** (antes fallaba a storePhone)
- ✅ **Claro**: WhatsApp para órdenes, Teléfono para contacto

---

## 🔧 Pasos para Configurar

### 1️⃣ Entrar al Panel Admin

1. Ir a: **`http://localhost:3000/admin/dashboard`** (o tu dominio)
2. **Iniciar sesión** con usuario administrador

---

### 2️⃣ Ir a Configuración de Tiendas

1. En el menú lateral, selecciona: **"Configuración de Tiendas"**
2. Verás 2 botones: `DJCELUTECNICO` y `Ubatech+Pro`

---

### 3️⃣ Configurar Tienda 1: Ubatech+Pro

1. Haz clic en botón **`Ubatech+Pro`**
2. Desplázate hasta encontrar la sección: **"Configuración de la Tienda"**
3. Busca el campo destacado en **VERDE**:
   ```
   🟢 WhatsApp para Órdenes de Compra
   ```
4. Ingresa el número con uno de estos formatos:
   - `+57 3134588107` (con +57 y espacios)
   - `573134588107` (solo dígitos)
   - `+57 (313) 4588107` (con paréntesis)
   
   **Lo importante**: Mínimo 10 dígitos, máximo 15

5. Llena los otros campos si deseas (nombre, email, teléfono, dirección)
6. Haz clic en: **"Guardar Cambios"** (botón azul abajo)
7. ✅ Verás el mensaje: "Cambios guardados exitosamente"

---

### 4️⃣ Configurar Tienda 2: DJ Celutecnico

1. Haz clic en botón **`DJCELUTECNICO`**
2. Repite los pasos 2-7 anteriores

---

## 📱 Verificar que Funciona

### Opción A: Ir al Checkout

**Para Ubatech+Pro:**
1. Ir a: `http://localhost:3000`
2. Agregar un producto al carrito
3. Hacer clic en "Ir al carrito"
4. Hacer clic en "Completar Compra"
5. Llenar el formulario
6. Hacer clic en **"Enviar por WhatsApp"**
7. ✅ Debe abrir WhatsApp con tu número

**Para DJ Celutecnico:**
1. Ir a: `http://localhost:3000/djcelutecnico`
2. Repetir pasos 2-7 anteriores

---

### Opción B: Revisar Consola (Para Técnicos)

1. Abrir **DevTools** (presionar `F12`)
2. Ir a tab **"Console"**
3. Deberías ver:
   ```
   ✅ WhatsApp number loaded successfully: 573134588107
   ```
4. ✅ Si ves este mensaje, todo está correcto

---

## ⚠️ Problemas Comunes

### Problema 1: "Number contains placeholders (xxxx)"
**Causa**: El campo tiene `xxxx` en lugar de un número real
```
❌ +57 1 xxxx xxxx
❌ +57 1 XXXX XXXX
```
**Solución**: Reemplaza con un número real:
```
✅ +57 3134588107
✅ 573134588107
```

### Problema 2: "Invalid WhatsApp number length"
**Causa**: El número tiene menos de 10 dígitos
```
❌ +57 1 234  (solo 5 dígitos)
❌ +57  (solo 2 dígitos)
```
**Solución**: Usa un número completo:
```
✅ +57 3134588107 (11 dígitos)
```

### Problema 3: No Abre WhatsApp
**Causa**: Número no guardado en admin
**Solución**:
1. Ir a admin → Configuración de Tiendas
2. Verificar que el número está guardado
3. Hacer clic en "Guardar Cambios"
4. Esperar a que muestre "Cambios guardados exitosamente"
5. Intentar nuevamente en checkout

---

## 📝 Campos por Tienda

### Campos Diferentes: ¿Para Qué?

| Campo | Uso | Dónde | Ejemplo |
|-------|-----|-------|---------|
| **WhatsApp para Órdenes** | Recibir carritos de compra | Checkout | `+57 3134588107` |
| **Teléfono** | Contacto general | Página Contacto | `+57 3134588107` |
| **Email** | Contacto general | Página Contacto | `info@tienda.com` |

**Nota**: Pueden tener el mismo valor, pero son para propósitos diferentes

---

## 🎯 Ejemplo Paso a Paso

### Configurar Ubatech+Pro (Ejemplo)

```
1. Panel Admin → Configuración de Tiendas
2. Click en "Ubatech+Pro"
3. Scroll hasta sección "Configuración de la Tienda"
4. Buscar campo GREEN: 🟢 WhatsApp para Órdenes
5. Borrar campo
6. Escribir: +57 3134588107
7. Click en "Guardar Cambios"
8. ✅ Mensaje: "Cambios guardados exitosamente"
9. Ir a checkout: http://localhost:3000/checkout
10. Agregar producto → Carrito → Completar Compra
11. Llenar formulario
12. Click "Enviar por WhatsApp"
13. ✅ Abre WhatsApp con el número configurado
```

---

## ✅ Checklist Final

- [ ] Entré al Panel Admin
- [ ] Fui a Configuración de Tiendas
- [ ] Configuré Ubatech+Pro con número de WhatsApp
- [ ] Configuré DJ Celutecnico con número de WhatsApp
- [ ] Guardé los cambios de ambas tiendas
- [ ] Probé checkout en Ubatech+Pro
- [ ] Probé checkout en DJ Celutecnico
- [ ] Ambos abrieron WhatsApp correctamente
- [ ] ✅ TODO FUNCIONANDO

---

## 🚀 Listo

Tu sistema de WhatsApp está configurado correctamente. 

**Próximos clientes que completen compra:**
1. Llenarán el formulario
2. Harán clic en "Enviar por WhatsApp"
3. ✅ Recibirás su orden en WhatsApp automáticamente

¡A vender! 🎉
