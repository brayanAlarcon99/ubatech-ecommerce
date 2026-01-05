# 🎬 PASO A PASO - CÓMO PROBAR LAS 2 TIENDAS

## 🚀 INICIO

### Paso 1: Arrancar el servidor
```bash
cd d:\ubatech
npm run dev
```

Espera hasta ver:
```
✓ Ready in 2.5s
```

---

## 📍 LANDING PAGE (/)

### Paso 2: Abre en navegador
```
http://localhost:3000
```

### Esperado:
- [ ] Página carga sin errores
- [ ] Título: "Elige tu tienda"
- [ ] 2 tarjetas grandes
  - [ ] Tarjeta 1: Fondo NEGRO, texto "UbaTech"
  - [ ] Tarjeta 2: Fondo ROJO, texto "DJ Celutecnico"
- [ ] Cada tarjeta tiene botón "Ir a [tienda]"

### Si hay error:
```
Error: Cannot find module '@/lib/config/stores'
```
→ Reiniciar servidor (Ctrl+C y npm run dev)

---

## 🏪 TIENDA 1: UBATECH

### Paso 3: Click en tarjeta "UbaTech"
```
Resultado esperado: http://localhost:3000/ubatech
```

### Verificar:

#### Header
- [ ] Logo visible
- [ ] Nombre tienda: "UbaTech" (o configurado)
- [ ] Botón Carrito funciona (rojo/azul)
- [ ] **NUEVO**: Dropdown "UbaTech" (selector tienda)

#### Colores
- [ ] Títulos principales: NEGRO
- [ ] Botones categoría: NEGRO cuando activos
- [ ] Botones carrito: Azul
- [ ] Texts: Gris oscuro
- [ ] **NO debe haber rojo** en esta tienda

#### Contenido
- [ ] Productos cargan correctamente
- [ ] Grid de productos visible (4 columnas en desktop)
- [ ] Categorías funcionan (click filtra)
- [ ] Búsqueda funciona
- [ ] Si hay subcategorías, sidebar izquierdo visible

#### Botones de Producto
- [ ] "Agregar al carrito" visible
- [ ] Click abre detalles/agrega al carrito
- [ ] Colores coherentes (negro/azul)

---

## 🏪 TIENDA 2: DJ CELUTECNICO

### Paso 4: Cambiar a DJ Celutecnico (Método 1 - Dropdown Header)
```
Acción: Click en "UbaTech" (text en header)
Resultado: Dropdown muestra 2 opciones
  - UbaTech
  - DJ Celutecnico

Click en "DJ Celutecnico"
```

### Esperado:
```
URL cambia a: http://localhost:3000/djcelutecnico
```

### Verificar:

#### Cambios de Color
- [ ] Todos los elementos NEGROS ahora son ROJOS
  - [ ] Títulos principales: ROJO
  - [ ] Botones activos: ROJO
  - [ ] Acentos: Rojo oscuro
- [ ] **NO debe haber negro** en esta tienda (excepto texto)

#### Header
- [ ] Dropdown ahora muestra "DJ Celutecnico" seleccionado
- [ ] Botón carrito mantiene estilo (azul)

#### Contenido
- [ ] **MISMOS productos** que en UbaTech
- [ ] **MISMA cantidad** de productos
- [ ] Búsqueda funciona
- [ ] Categorías filtran igual

#### Comprobación de Inventario Idéntico
1. Anotar 3 productos visibles en UbaTech
   - Ejemplo: iPhone 13, Samsung S21, Xiaomi 12
2. Cambiar a DJ Celutecnico
3. Verificar que esos mismos productos están

---

## 🛒 CARRITO - TESTING FLUJO COMPLETO

### Paso 5: En UbaTech (/ubatech)
```
1. Click en producto cualquiera
2. Click en "Agregar al carrito"
3. Click en botón "Carrito" en header
```

### Esperado:
```
URL: http://localhost:3000/ubatech/carrito
Colores: NEGRO (mismo que tienda)
Contenido: Producto agregado visible
```

### Verificar:
- [ ] "Volver a tienda" lleva a `/ubatech` (negro)
- [ ] Item tiene botones +/- para cantidad
- [ ] Botón "Continuar compra" presente
- [ ] Resumen de orden visible
- [ ] Total correcto

### Paso 6: Cambiar a DJ Celutecnico
```
Click en dropdown tienda
Seleccionar "DJ Celutecnico"
```

### Esperado:
```
Redirige a home de DJ Celutecnico (/djcelutecnico)
```

### Verificar:
- [ ] Colores ahora son ROJOS
- [ ] **CARRITO MANTIENE ITEMS** (si implementación lo permite)
  - Si está compartido globalmente: Items persisten
  - Si está separado: Carrito vacío en DJ

### Paso 7: Ir a carrito en DJ
```
Click en botón Carrito en header
```

### Esperado:
```
URL: http://localhost:3000/djcelutecnico/carrito
Colores: ROJO
```

### Verificar:
- [ ] "Volver a tienda" lleva a `/djcelutecnico` (rojo)
- [ ] Items están allí (si carrito es global)
- [ ] Colores son rojos
- [ ] Funcionalidad igual que en UbaTech

---

## 💳 CHECKOUT

### Paso 8: Desde carrito de UbaTech
```
Click en "Continuar con la compra"
```

### Esperado:
```
URL: http://localhost:3000/ubatech/checkout
Colores: NEGRO
Formulario visible
```

### Verificar:
- [ ] Campos: Nombre, Email, Teléfono, Dirección
- [ ] Botón "Enviar por WhatsApp" visible
- [ ] "Volver al carrito" lleva a `/ubatech/carrito`
- [ ] Formulario se completa sin errores

### Paso 9: Desde carrito de DJ
```
Cambiar a DJ Celutecnico
Ir a carrito
Click en "Continuar compra"
```

### Esperado:
```
URL: http://localhost:3000/djcelutecnico/checkout
Colores: ROJO
```

### Verificar:
- [ ] Funcionalidad idéntica a UbaTech
- [ ] Colores son rojos
- [ ] "Volver al carrito" lleva a `/djcelutecnico/carrito`

---

## ✅ PÁGINA DE ÉXITO

### Paso 10: Completar checkout (SIN enviar WhatsApp)
```
Opción 1: Click "Enviar por WhatsApp" (abre WhatsApp)
Opción 2: Simular con código en consola
```

### En caso de completar:
```
URL: http://localhost:3000/[store]/exito
Mensaje: "¡Orden Enviada!"
Botón: "Volver a la tienda"
```

### Verificar:
- [ ] En `/ubatech/exito`: Colores NEGRO
- [ ] En `/djcelutecnico/exito`: Colores ROJO
- [ ] Mensaje de confirmación visible
- [ ] Redirección automática después de 5 seg
- [ ] Botón funciona y lleva a tienda correcta

---

## 🔄 NAVEGACIÓN ENTRE TIENDAS

### Paso 11: Testing cambio rápido
```
1. Ir a /ubatech
2. Cambiar a /djcelutecnico (dropdown)
3. Verificar colores ROJO
4. Cambiar a /ubatech (dropdown)
5. Verificar colores NEGRO
```

### Verificar:
- [ ] Cambio es instantáneo
- [ ] Colores actualizan correctamente
- [ ] URL cambia
- [ ] No hay errores en consola
- [ ] Carrito persiste (si es global)

---

## 🎨 VERIFICACIÓN DE COLORES

### Colores esperados

#### UbaTech
```
Primario:   #000000 (Negro)
Acento:     #3B82F6 (Azul claro)
Fondo:      #F9FAFB (Gris claro)
Texto:      #1F2937 (Gris oscuro)
Borde:      #E5E7EB (Gris frontera)
```

#### DJ Celutecnico
```
Primario:   #FF0000 (Rojo puro)
Acento:     #FF1744 (Rojo oscuro)
Fondo:      #F9FAFB (Gris claro)
Texto:      #1F2937 (Gris oscuro)
Borde:      #E5E7EB (Gris frontera)
```

### Usar DevTools para verificar
```
1. Press F12 (Developer Tools)
2. Click elemento a inspeccionar
3. Ver computed style → color/background-color
4. Comparar con valores esperados
```

---

## ❌ TROUBLESHOOTING

### Error: "Cannot GET /ubatech"
**Causa**: Next.js no ha detectado las rutas dinámicas
**Solución**: 
```bash
npm run dev  # Reiniciar servidor
```

### Error: "useStore debe usarse dentro de StoreProvider"
**Causa**: Falta StoreProvider en layout
**Solución**: Verificar `app/layout.tsx` tiene:
```tsx
<StoreProvider>
  <CartProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </CartProvider>
</StoreProvider>
```

### Colores no cambian
**Causa**: Componentes no usan `useStoreTheme()`
**Solución**: En componentes, usar:
```tsx
import { useStoreTheme } from '@/hooks/useStoreTheme';
const { primaryColor } = useStoreTheme();
```

### Dropdown no aparece en Header
**Causa**: Header no actualizado
**Solución**: Revisar que `components/header.tsx` tiene código nuevo

### Carrito vacío entre tiendas
**Causa**: Carrito está separado por tienda
**Solución**: NORMAL por diseño actual (puede cambiarse si es necesario)

---

## ✅ CHECKLIST FINAL

- [ ] Landing carga correctamente
- [ ] UbaTech tiene colores NEGROS
- [ ] DJ Celutecnico tiene colores ROJOS
- [ ] Dropdown de tienda en header funciona
- [ ] Cambio de tienda es fluido
- [ ] Productos son idénticos en ambas
- [ ] Carrito funciona en ambas tiendas
- [ ] Checkout accesible en ambas
- [ ] Página éxito funciona en ambas
- [ ] SIN errores en consola (excepto warnings normales)
- [ ] Navegación es rápida
- [ ] Diseño responsivo en móvil

---

## 🎬 VIDEOS DE PRUEBA RECOMENDADOS

1. **Testing básico** (5 min)
   - Landing → UbaTech → DJ Celutecnico → volver

2. **Cambio de colores** (3 min)
   - Navegar lentamente viendo cambios de color

3. **Flujo completo** (10 min)
   - Agregar producto → Carrito → Checkout → Éxito

4. **Responsive** (3 min)
   - Probar en mobile, tablet, desktop

---

## 📸 SCREENSHOTS RECOMENDADOS

Capturar:
1. Landing page - 2 tarjetas
2. UbaTech - Tema negro
3. DJ Celutecnico - Tema rojo
4. Header dropdown - Selector tienda
5. Carrito - En ambas tiendas
6. Checkout - En ambas tiendas
7. Éxito - En ambas tiendas

---

## 📊 RESULTADO ESPERADO

**✅ TODAS LAS FUNCIONES OPERATIVAS**

Si todo funciona según este documento:
- Implementación: ✅ EXITOSA
- Listo para: ✅ PRODUCCIÓN
- Testing: ✅ COMPLETADO

---

## 🚀 PRÓXIMO PASO

Si todo pasa:
```
→ Proceder con DEPLOYMENT a producción
```

Si hay problemas:
```
→ Revisar TESTING_2_TIENDAS.md (soluciones detalladas)
```

---

**Creado**: Diciembre 2025
**Duración esperada del testing**: 15-20 minutos
**Complejidad**: Baja
