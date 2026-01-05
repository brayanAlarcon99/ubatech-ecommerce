# 📄 ONE-PAGER: 2 TIENDAS MISMO INVENTARIO

---

## 🎯 NECESIDAD

Crear 2 tiendas públicas (`/tienda1`, `/tienda2`) con **MISMO inventario** pero **diferente branding**.

---

## ✅ SOLUCIÓN

| Item | Detalles |
|------|----------|
| **Qué es** | 2 URLs que muestran mismo contenido con temas diferentes |
| **Cambios BD** | CERO |
| **Cambios Admin** | CERO |
| **Tiempo** | 4-6 horas |
| **Costo** | $0 |
| **Riesgo** | Muy Bajo |

---

## 📋 IMPLEMENTACIÓN

### FASE 1: Config (1h)
- Crear `lib/stores-config.ts` (colores, nombres)
- Crear hook `useStoreTheme`

### FASE 2: Layouts (1h)
- Crear `/app/tienda1/layout.tsx`
- Crear `/app/tienda2/layout.tsx`

### FASE 3: Pages (1h)
- Crear `/app/tienda1/page.tsx`
- Crear `/app/tienda2/page.tsx`

### FASE 4: Styles (1-2h)
- Actualizar CSS con variables de tema
- Agregar estilos para branding

### FASE 5: Testing (1h)
- Verificar ambas URLs
- Verificar productos aparecen
- Verificar carrito funciona

---

## 🎨 BRANDING

### Tienda 1
- Primary: #3B82F6 (Azul)
- Secondary: #1F2937 (Gris)
- Accent: #10B981 (Verde)

### Tienda 2
- Primary: #EF4444 (Rojo)
- Secondary: #1F2937 (Gris)
- Accent: #F59E0B (Naranja)

---

## ✨ VENTAJAS

✅ MÁS RÁPIDO (4-6h vs 15-22h)  
✅ BAJO RIESGO  
✅ SIN CAMBIOS EN BD  
✅ SIN CAMBIOS EN ADMIN  
✅ SIN COSTOS  
✅ Cambios en admin se ven en ambas tiendas  

---

## 📚 DOCUMENTACIÓN

- **[ACCION_INMEDIATA_2_TIENDAS_SIMPLIFICADO.md](ACCION_INMEDIATA_2_TIENDAS_SIMPLIFICADO.md)** ← Comienza aquí
- **[GUIA_SIMPLE_2_TIENDAS_MISMO_INVENTARIO.md](GUIA_SIMPLE_2_TIENDAS_MISMO_INVENTARIO.md)** ← Implementación
- **[INDICE_2_TIENDAS_MISMO_INVENTARIO.md](INDICE_2_TIENDAS_MISMO_INVENTARIO.md)** ← Índice

---

## 🚀 PRÓXIMO PASO

Lee: [ACCION_INMEDIATA_2_TIENDAS_SIMPLIFICADO.md](ACCION_INMEDIATA_2_TIENDAS_SIMPLIFICADO.md) (5 min)
