# REFERENCIA RÁPIDA: Sistema de Validación de Imágenes

## 🎯 ¿Qué es?
Sistema de seguridad que **valida el tamaño de imágenes cuando editas productos** para evitar que superen el límite de **1MB de Firebase**.

---

## 📍 Dónde Aparece
- ✅ En el formulario de editar/crear productos
- ✅ En tiempo real mientras cargas imágenes
- ✅ En las previsualizaciones de imágenes
- ✅ Como advertencias/errores si hay problemas

---

## 🎨 Indicadores Visuales

| Color | Significado | Acción |
|-------|-----------|--------|
| 🟢 **Verde** | Imagen OK | Continuar |
| 🟠 **Naranja** | Imagen grande (80%+) | Considerar cambiar |
| 🔴 **Rojo** | Supera límite | CAMBIAR o ELIMINAR |

---

## 📊 Información en Previsualizaciones

Cada imagen muestra:
```
┌────────────────┐
│  [Thumbnail]   │
│  # ⭐ Portada  │  ← Número y si es portada
│  0.85MB (85%)  │  ← Tamaño en MB y % del límite
└────────────────┘
```

---

## 🚨 Si Ves Error Rojo

**Significa:** Las imágenes superan 1MB

**Qué hacer:**
1. Lee el banner rojo
2. Identifica cuál imagen cambiar/eliminar
3. Actúa según recomendación:
   - 🔄 **CAMBIA** = Reemplaza por imagen más pequeña
   - 🗑️ **ELIMINA** = Quita esta imagen

**Ejemplo:**
```
• Imagen 1: 0.95MB (95% del límite)
  🗑️ ELIMINA esta imagen

• Imagen 2: 0.60MB (60% del límite)
  🔄 CAMBIA esta imagen
```

---

## ⚠️ Si Ves Advertencia Naranja

**Significa:** Hay imágenes grandes pero aún dentro del límite

**Qué hacer:**
- Optional: Considera reemplazar por versiones más pequeñas
- O continúa normalmente si está bien

---

## ✅ Si Todo Está Verde

**Significa:** Tamaño OK

**Qué hacer:**
- Puedes guardar sin problemas

---

## 💡 Soluciones Rápidas

### Problema: "Una imagen supera 1MB"
**Solución:** Elimina esa imagen (click ✕) o reemplázala

### Problema: "Total supera 1MB"
**Solución:** 
- Elimina la imagen más grande
- O reduce tamaño de varias imágenes

### Problema: "No sé cuál cambiar"
**Solución:** Lee el banner rojo, indica exactamente qué hacer

---

## 🖼️ Formato Recomendado

Para mejor rendimiento y menor tamaño:
- **Formato:** JPEG o WebP
- **Resolución:** 800x600px o similar
- **Compresión:** Media a alta
- **Tamaño:** < 250KB por imagen ideal

---

## 🔧 Herramientas Útiles

Si necesitas comprimir:
- [TinyPNG](https://tinypng.com) - PNG/JPG
- [CloudConvert](https://cloudconvert.com) - Múltiples formatos
- [ILOVEIMG](https://www.iloveimg.com) - Redimensionar

---

## 📋 Checklist Antes de Guardar

- [ ] ¿Hay error ROJO? → No, continuar
- [ ] ¿Hay advertencia NARANJA? → OK, puedo guardar
- [ ] ¿Cada imagen muestra tamaño? → Sí
- [ ] ¿Total < 1MB? → Sí = **LISTO PARA GUARDAR**

---

## 🆘 Preguntas Frecuentes

**P: ¿Puedo usar 3 imágenes?**
R: Sí, máximo 3. El total debe ser < 1MB

**P: ¿Qué pasa si intento guardar con error?**
R: Se bloquea automáticamente. Debes corregir primero.

**P: ¿Cómo sé el tamaño de mi imagen?**
R: Sistema lo muestra automáticamente en las previsualizaciones

**P: ¿Puedo usar PNG?**
R: Sí, pero JPEG es mejor (más pequeño)

**P: ¿Hay límite de resolución?**
R: No oficial, pero más pequeña = menos tamaño

---

## 📞 Soporte

Si aún hay problemas:
1. Intenta con formato JPEG
2. Reduce resolución a 800x600px
3. Usa herramienta de compresión online
4. Contacta administrador

---

**Versión:** 2.0  
**Última actualización:** 19 de Enero de 2026  
**Tipo:** Referencia de Usuario - Sistema de Seguridad
