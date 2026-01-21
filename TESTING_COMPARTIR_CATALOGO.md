# 🧪 GUÍA DE TESTING - Error Compartir Catálogo

**Fecha:** 21 de Enero 2026  
**Versión:** 1.0  
**Duración Estimada:** 15-20 minutos

---

## ✅ Pre-Requisitos

- [ ] Panel administrativo accesible en `localhost:3000/admin/dashboard`
- [ ] Algunas categorías con productos creadas
- [ ] DevTools disponible (F12)
- [ ] Navegador moderno (Chrome, Firefox, Safari, Edge)

---

## 🧪 Test 1: Compartir Catálogo Normal

**Objetivo:** Verificar que el PDF se genera correctamente

### Pasos:
1. Abre: `localhost:3000/admin/dashboard`
2. Ve a: "Gestión de Productos"
3. Selecciona una categoría (ej: "Celulares")
4. Haz clic en: "Compartir"
5. Espera a que se complete (5-10 segundos)

### Resultados Esperados:
- ✅ El PDF descarga sin errores
- ✅ El archivo se llama: `Catalogo_[CategoryName]_[Timestamp].pdf`
- ✅ Abre sin problemas
- ✅ Contiene productos con imágenes

### Validación:
```
- [ ] PDF descargado correctamente
- [ ] Archivo tiene nombre correcto
- [ ] PDF abre sin problemas
- [ ] Imágenes visibles en el PDF
- [ ] Precios mostrados correctamente
- [ ] Formato tabla correcto
```

### Logs Esperados en Console (F12):
```
[PDF] 📥 URL: https://firebasestorage.googleapis.com/...
[PDF] 🔄 Attempt 1: Using API endpoint (server-side fetch)
[PDF] ✅ Image loaded successfully via API endpoint
[PDF] 📦 Product #1: "iPhone 15 Pro"
[ProductsManager] 📊 Generating PDF for category "Celulares" with 15 products
[PDF] 📄 Starting PDF generation for category: "Celulares" with 15 products
[ProductsManager] ✅ PDF generated successfully
```

---

## 🧪 Test 2: Categoría Vacía

**Objetivo:** Verificar que muestra mensaje claro

### Pasos:
1. Crea una categoría sin productos o selecciona una vacía
2. Haz clic en "Compartir"

### Resultados Esperados:
- ✅ Alert: "No hay productos en esta categoría para descargar"
- ✅ Botón "Compartir" está deshabilitado
- ✅ No intenta generar PDF

### Validación:
```
- [ ] Mensaje claro mostrado
- [ ] No intenta descargar
- [ ] Botón deshabilitado correctamente
```

---

## 🧪 Test 3: Producto Sin Imagen

**Objetivo:** Verificar que muestra placeholder gris

### Pasos:
1. Crea un producto sin imagen
2. Comparte la categoría
3. Abre el PDF

### Resultados Esperados:
- ✅ PDF se genera normalmente
- ✅ Producto sin imagen tiene rectángulo gris
- ✅ "Sin imagen" mostrado
- ✅ Resto del contenido intacto

### Validación:
```
- [ ] PDF genera correctamente
- [ ] Placeholder gris visible
- [ ] Otros productos con imágenes OK
- [ ] Precios visibles
```

### Logs Esperados:
```
[PDF] ⚠️ No image data for "producto sin imagen"
[PDF] 📐 Image dimensions: 0x0
```

---

## 🧪 Test 4: Conexión Lenta (Throttling)

**Objetivo:** Verificar timeout funciona correctamente

### Pasos:
1. Abre DevTools (F12)
2. Ve a "Network" tab
3. Busca ícono de throttling (velocidad)
4. Selecciona: "Slow 4G"
5. Comparte un catálogo

### Resultados Esperados:
- ✅ Espera 10-12 segundos
- ✅ PDF se genera (puede usar placeholders)
- ✅ No cuelga el navegador
- ✅ Timeout limpio

### Validación:
```
- [ ] Operación completa en <15 segundos
- [ ] Navegador no se congela
- [ ] PDF descarga (parcial OK)
- [ ] Logs muestran timeout apropiado
```

### Logs Esperados:
```
[PDF] ⚠️ Image timeout after 12 seconds
[PDF] 📐 Image dimensions: 0x0
```

---

## 🧪 Test 5: Múltiples Descargas Consecutivas

**Objetivo:** Verificar que no hay memory leaks

### Pasos:
1. Comparte catálogo → Espera descarga
2. Comparte otra categoría → Espera descarga
3. Repite 5 veces
4. Observa memoria en DevTools

### Resultados Esperados:
- ✅ Cada descarga funciona
- ✅ Memoria no crece indefinidamente
- ✅ Limpieza de recursos apropiada
- ✅ Sin errores

### Validación:
```
- [ ] Descarga 1 OK
- [ ] Descarga 2 OK
- [ ] Descarga 3 OK
- [ ] Descarga 4 OK
- [ ] Descarga 5 OK
- [ ] Memoria estable
```

### Verificación de Memoria:
1. DevTools → Performance
2. Record 30 segundos
3. Observa gráfico de memoria
4. ✅ Debe volver a bajar después de cada descarga

---

## 🧪 Test 6: Reporte de Stock Bajo

**Objetivo:** Verificar funcionalidad de "Descargar PDF" (out-of-stock)

### Pasos:
1. Establece stock bajo en algunos productos
2. Haz clic en "Descargar PDF" (productos con stock bajo)
3. Espera descarga

### Resultados Esperados:
- ✅ PDF descarga correctamente
- ✅ Título: "Reporte de Productos con Stock Bajo"
- ✅ Muestra productos bajo stock
- ✅ Indica cantidad faltante por tienda

### Validación:
```
- [ ] PDF descargado
- [ ] Título correcto
- [ ] Productos listados
- [ ] Cantidad faltante mostrada
- [ ] Imágenes cargadas o placeholders
```

---

## 🧪 Test 7: Navegadores Diferentes

**Objetivo:** Verificar compatibilidad cross-browser

### Prueba en:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (si disponible)
- [ ] Edge

### Para cada navegador:
1. Abre admin
2. Comparte catálogo
3. Verifica:
   - ✅ PDF descarga
   - ✅ Formato correcto
   - ✅ Imágenes visibles
   - ✅ Sin errores en console

---

## 🧪 Test 8: Dispositivos Diferentes

**Objetivo:** Verificar en dispositivos reales

### En Desktop:
- [ ] Chrome: OK
- [ ] Firefox: OK
- [ ] Safari: OK
- [ ] Edge: OK

### En Móvil (si posible):
- [ ] iPhone: ¿Descarga?
- [ ] Android: ¿Descarga?
- [ ] Tablet: ¿Muestra bien?

---

## 📊 Tabla de Resultados

Copia esta tabla y marca ✅ o ❌:

```
| Test | Esperado | Actual | Status |
|------|----------|--------|--------|
| 1. Compartir Normal | PDF descarga | ✅ | PASS |
| 2. Categoría Vacía | Mensaje claro | ✅ | PASS |
| 3. Sin Imagen | Placeholder | ✅ | PASS |
| 4. Conexión Lenta | Timeout limpio | ✅ | PASS |
| 5. Múltiples Descargas | Sin memory leaks | ✅ | PASS |
| 6. Stock Bajo | PDF genera | ✅ | PASS |
| 7. Chrome | OK | ✅ | PASS |
| 8. Firefox | OK | ✅ | PASS |
```

---

## 🔍 Debugging Tips

### Si el PDF no descarga:
1. Abre Console (F12)
2. Busca logs `[ProductsManager]` o `[PDF]`
3. ¿Ves `❌ Error`?
4. Copia el mensaje de error

### Si ves placeholder gris donde debería haber imagen:
1. Check log: `[PDF] ⚠️ Image timeout`
2. Puede ser conexión lenta (normal)
3. O URL inválida (verificar en Firestore)

### Si el navegador se congela:
1. Abre DevTools inmediatamente (F12)
2. Tab "Network" para ver requests
3. ¿Hay request pendiente?
4. ¿Cuál es el URL?

### Si hay error de Memory:
1. DevTools → Memory
2. Toma snapshot
3. Busca listeners sin remover
4. Debería decir "cleaned up" en logs

---

## 📝 Template para Reportar Problemas

Si encuentras un problema, copia esto:

```
## Bug Report: Compartir Catálogo

**Fecha/Hora:** [Date/Time]
**Navegador:** [Chrome/Firefox/Safari/Edge]
**Versión OS:** [Windows/Mac/Linux]

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
...

**Resultado actual:**
...

**Logs (Console F12):**
[Paste logs aquí]

**Screenshot:** 
[Attach if possible]
```

---

## ✅ Checklist Final

- [ ] Test 1 PASS: Compartir Normal
- [ ] Test 2 PASS: Categoría Vacía  
- [ ] Test 3 PASS: Sin Imagen
- [ ] Test 4 PASS: Conexión Lenta
- [ ] Test 5 PASS: Múltiples Descargas
- [ ] Test 6 PASS: Stock Bajo
- [ ] Test 7 PASS: Navegadores
- [ ] Test 8 PASS: Dispositivos (si aplica)
- [ ] Documentación leída
- [ ] Listo para producción

---

## 🎯 Conclusión

Si todos los tests pasan:

✅ **La solución está correcta y lista para producción**

Si algo falla:

❌ Reporta el problema con:
1. Qué test falló
2. Qué esperabas
3. Qué pasó en realidad
4. Logs de console

---

**Testing completado:** [Date]  
**Testeador:** [Name]  
**Aprobado por:** [Name]

---

**Nota:** Este documento debe completarse ANTES de hacer deploy a producción.
