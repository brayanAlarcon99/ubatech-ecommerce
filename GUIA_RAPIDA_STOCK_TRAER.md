# 📦 GUÍA RÁPIDA: Sistema de Stock a Traer

## ¿Qué cambió?

### Antes (Sistema Antiguo):
```
Panel Admin: Stock Actual + Stock Mínimo
Página Pública: Muestra stock real de BD (0, 5, 100, etc.)
```

### Ahora (Sistema Nuevo):
```
Panel Admin: Solo "Stock a Traer" (cantidad esperada)
Página Pública: SIEMPRE muestra 20 disponibles
```

---

## 🔑 Conceptos Clave

### "Stock a Traer"
Es la **cantidad que esperas recibir** de tu proveedor.

**Ejemplo:**
- Solicitas: 100 iPhones al proveedor
- Estableces en admin: "Stock a Traer = 100"
- El sistema registra que hay 100 pendientes

### Cuando Llega el Stock
Cuando recibes las primeras 30 unidades:

1. Vas al panel admin
2. Abres el producto → "Stock"
3. Ingresas: 30
4. Sistema hace:
   - Stock Actual: 0 → 30 ✅
   - Stock a Traer: 100 → 70 ⭐

**Resultado:** Recibiste 30 de 100, faltan 70 por recibir

### En la Página Pública
El cliente **SIEMPRE ve 20 disponibles**, sin importar nada.

---

## 📋 Tareas Operativas

### 1️⃣ Crear un Nuevo Producto

```
Gestión Productos → Nuevo Producto

Nombre: Samsung Galaxy S24
Precio: $1,200,000
Categoría: Celulares

STOCK POR TIENDA:
├─ DJCELUTECNICO:
│  └─ Stock a Traer: 50    ← Espero recibir 50
├─ Ubatech+Pro:
│  └─ Stock a Traer: 30    ← Espero recibir 30

Guardar ✅
```

### 2️⃣ Registrar Stock Recibido

```
Panel → Producto → Botón "Stock"

Tienda DJCELUTECNICO:
└─ Cantidad a agregar: [30] ← Llegaron 30

Tienda Ubatech+Pro:
└─ Cantidad a agregar: [0]  ← Aún no llegan

Agregar Stock ✅

RESULTADO:
├─ Stock Actual: 0 → 30
├─ Stock a Traer: 50 → 20  ← Faltan 20 por recibir
└─ Estado: ⚠️ Aún pendiente
```

### 3️⃣ Ver Productos Pendientes

```
Gestión Productos → Categoría "Fuera de Stock"

Muestra solo productos donde "Stock a Traer > 0"

Ejemplo:
├─ Samsung Galaxy S24
│  └─ Stock a Traer:
│     ├─ DJCELUTECNICO: 20 pendientes
│     └─ Ubatech+Pro: 30 pendientes
├─ iPhone 15
│  └─ Stock a Traer:
│     └─ DJCELUTECNICO: 15 pendientes
```

### 4️⃣ Descargar Reporte PDF

```
Botón "Descargar Productos"

Genera: "Reporte de Productos con Stock a Traer"

Contenido:
├─ Samsung Galaxy S24
│  ├─ DJCELUTECNICO: a traer 20 unidades
│  └─ Ubatech+Pro: a traer 30 unidades
├─ iPhone 15
│  └─ DJCELUTECNICO: a traer 15 unidades

Ideal para: Enviar a proveedores como pedido
```

---

## 🎯 Casos de Uso

### Caso 1: Producto Nuevo
```
1. Admin crea producto con "Stock a Traer: 100"
2. Espera la entrega del proveedor
3. Cuando llega: Agrega 25 unidades
4. Sistema actualiza: Stock a Traer = 75
5. Cliente SIEMPRE ve "Disponible: 20"
6. Repite hasta llenar los 100
```

### Caso 2: Producto Existente (Reabastecimiento)
```
1. Tienes: Stock a Traer = 0
2. Solicitas: 50 unidades nuevas
3. Admin edita: Stock a Traer = 50
4. Cuando llega: Agrega 50 unidades
5. Sistema: Stock a Traer = 0 (completado)
```

### Caso 3: Entrega Parcial
```
1. Stock a Traer: 100 (Pediste 100)
2. Proveedor envía: 40 (No todos a la vez)
3. Admin agrega: 40 unidades
4. Stock a Traer: 60 (Esperas 60 más)
5. Proveedor envía: 35
6. Admin agrega: 35 unidades
7. Stock a Traer: 25 (Casi completo)
```

---

## ⚠️ Errores Comunes

### ❌ "¿Por qué el stock no se actualiza?"
**Causa:** El "Stock a Traer" es solo para admin, no afecta página pública.
**Solución:** La página pública siempre muestra 20.

### ❌ "¿Dónde enseño que tengo 5000 unidades en bodega?"
**Respuesta:** El sistema NO necesita esa info.
- "Stock a Traer" = Lo que FALTA por llegar
- Página pública SIEMPRE = 20 disponibles
- Base de datos = Solo registra incrementos

### ❌ "¿Qué pasa si agrego más de lo que tengo a traer?"
**Posibilidad:** El campo no tiene límite, puedes sobrepasar.
**Recomendación:** Agrega solo lo que recibiste realmente.

---

## 📊 Tabla de Equivalencias

| Contexto | Antiguo | Nuevo |
|----------|---------|-------|
| Panel Admin | Stock Mínimo | Stock a Traer |
| Lógica | ¿Cuánto falta para llegar al mínimo? | ¿Cuánto espero recibir? |
| Página Pública | Muestra stock real (0-100+) | **SIEMPRE 20** |
| PDF | "Productos con stock bajo" | "Productos con stock a traer" |
| Acción "Agregar" | Suma al stock | Suma stock + Resta a traer |

---

## 🚀 Tips y Trucos

### 📌 Tip 1: Monitorea el PDF regularmente
```
Descarga el PDF cada semana para ver:
- Qué productos aún esperan stock
- Cuánto falta por recibir por tienda
- Prioridades de reorden
```

### 📌 Tip 2: Usa el filtro "Fuera de Stock"
```
Haz clic en "Fuera de Stock" para ver:
- Solo productos con "Stock a Traer > 0"
- No confundas con agotados (no existen en esta versión)
```

### 📌 Tip 3: Stock Actual es informativo
```
"Stock Actual" muestra cuánto HAS AGREGADO
├─ No limitado por "Stock a Traer"
├─ Puedes agregar más del esperado
└─ El sistema lo permite
```

### 📌 Tip 4: La página pública es consistente
```
No importa qué hagas en admin:
- Cliente SIEMPRE ve 20 disponibles
- SIEMPRE puede agregar máximo 20 al carrito
- NUNCA verá "Agotado"
```

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si no llena "Stock a Traer"?**
A: Queda en 0, y no aparecerá en el filtro "Fuera de Stock".

**P: ¿Puedo cambiar "Stock a Traer" después?**
A: Sí, edita el producto en cualquier momento.

**P: ¿El cliente ve "Stock a Traer"?**
A: No, es información solo para admin.

**P: ¿Qué pasa si agrego más stock que "Stock a Traer"?**
A: El sistema lo permite, "Stock a Traer" se convierte en negativo (no recomendado).

**P: ¿Cómo reseteo todo a cero?**
A: Edita el producto, pon "Stock a Traer = 0" y listo.

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| No veo productos en "Fuera de Stock" | Crea productos con "Stock a Traer > 0" |
| PDF no contiene productos | Asegúrate de tener "Stock a Traer > 0" en algún producto |
| Cliente no puede comprar | Página pública siempre permite compra (máx 20) |
| Stock Actual se reinicia | Verifica que estés agregando correctamente |

---

**¡Cualquier duda, contacta al equipo técnico!**
