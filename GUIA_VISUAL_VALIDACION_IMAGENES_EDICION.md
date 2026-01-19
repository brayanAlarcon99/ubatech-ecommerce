# Guía Visual: Sistema de Validación de Imágenes en Edición

---

## 🎨 Interfaz de Usuario - Estados

### Estado 1: OK (Verde)
```
Imágenes cargadas (3/3):
┌──────────────────┬──────────────────┬──────────────────┐
│  [Imagen 1]      │  [Imagen 2]      │  [Imagen 3]      │
│  1 ⭐ Portada    │  2               │  3               │
│  0.45MB (45%)    │  0.30MB (30%)    │  0.20MB (20%)    │
│  [Verde claro]   │  [Verde claro]   │  [Verde claro]   │
└──────────────────┴──────────────────┴──────────────────┘
Total: 0.95MB ✓ (Dentro del límite)
```

### Estado 2: Advertencia (Naranja)
```
⚠️ ADVERTENCIA - Imágenes Grandes Detectadas

┌──────────────────┬──────────────────┬──────────────────┐
│  [Imagen 1]      │  [Imagen 2]      │  [Imagen 3]      │
│  1 ⭐ Portada    │  2               │  3               │
│  0.82MB (82%)    │  0.10MB (10%)    │  0.05MB (5%)     │
│  [Naranja]       │  [Gris]          │  [Gris]          │
└──────────────────┴──────────────────┴──────────────────┘

📊 Tamaño total: 0.97MB / 1MB

🖼️ Imágenes grandes detectadas:
• Imagen 1: 0.82MB (82% del límite)

💡 Considera cambiar estas imágenes por versiones más pequeñas 
   para mejor rendimiento.
```

### Estado 3: Error (Rojo)
```
🚨 ERROR DE SEGURIDAD - Límite de Firebase Excedido

┌──────────────────┬──────────────────┬──────────────────┐
│  [Imagen 1]      │  [Imagen 2]      │  [Imagen 3]      │
│  1 ⭐ Portada    │  2               │  3               │
│  0.85MB (85%)    │  0.60MB (60%)    │  ✕               │
│  [Rojo]          │  [Naranja]       │  [Eliminar]      │
└──────────────────┴──────────────────┴──────────────────┘

📊 Tamaño Total: 1.45MB (Límite: 1MB)
📷 Total de imágenes: 2/3

❌ Imágenes problemáticas:

• Imagen 1: 0.85MB (85% del límite)
  🗑️ ELIMINA esta imagen por una de menor tamaño o resolución

• Imagen 2: 0.60MB (60% del límite)
  🔄 CAMBIA esta imagen por una de menor tamaño o resolución

💡 Soluciones:
1. Usa imágenes con menor resolución o compresión
2. Usa formato WebP o JPEG en lugar de PNG
3. Utiliza herramientas online de compresión de imágenes
4. Aumenta la compresión en tu editor de imágenes
```

---

## 📱 Escenarios de Uso

### Escenario A: Reemplazar una Imagen

**Situación:** Admin edita producto y quiere cambiar la imagen principal

```
PASO 1: Abrir formulario
└─ Click en "Editar" del producto
   └─ Formulario abierto

PASO 2: Cargar nueva imagen
└─ Click en área de carga
   └─ Seleccionar imagen nueva (1.2MB)
   
PASO 3: Sistema valida
└─ Imagen es demasiado grande
   └─ ⚠️ ADVERTENCIA mostrada
   └─ 0.95MB actual + 1.2MB nueva = 2.15MB (SUPERA)

PASO 4: Admin ve recomendación
└─ "Imagen 1: 1.2MB (120% del límite) 🗑️ ELIMINA"
   └─ Admin entiende: debo quitar esta imagen

PASO 5: Solucionar
└─ Click ✕ para eliminar la nueva imagen
   └─ O reemplazar con versión comprimida
   └─ Validación se limpia

PASO 6: Guardar
└─ Click "Guardar"
   └─ ✓ Éxito
```

### Escenario B: Agregar Múltiples Imágenes

**Situación:** Admin agrega 3 imágenes a producto nuevo

```
PASO 1: Cargar primera imagen (0.7MB)
└─ ✓ Cargada: 0.7MB (70%)
   └─ Color: Gris oscuro (info neutral)

PASO 2: Cargar segunda imagen (0.5MB)
└─ ✓ Cargada: 0.5MB (50%)
   └─ Total: 1.2MB (120%) 🚨
   └─ ⚠️ ADVERTENCIA mostrada

PASO 3: Cargar tercera imagen (0.3MB)
└─ ✓ Cargada: 0.3MB (30%)
   └─ Total: 1.5MB (150%) 🚨
   └─ 🚨 ERROR mostrado (Supera límite)

PASO 4: Ver detalles
└─ Sistema indica:
   ├─ Imagen 1: 0.7MB → 🔄 CAMBIA
   ├─ Imagen 2: 0.5MB → 🗑️ ELIMINA
   └─ Imagen 3: 0.3MB → OK

PASO 5: Corregir
└─ Eliminar imagen 2 (la más grande después de la 1)
   └─ Click ✕ en Imagen 2
   └─ Total: 1MB (100%) ✓

PASO 6: Guardar
└─ ✓ Guardado exitosamente
```

### Escenario C: Intentar Guardar con Error

**Situación:** Admin intenta guardar sin revisar validación

```
PASO 1: Cargar 2 imágenes grandes
└─ Imagen 1: 0.95MB
   Imagen 2: 0.75MB
   Total: 1.70MB 🚨

PASO 2: Click "Guardar"
└─ handleSubmit() ejecuta
   └─ validateImagesForEdit() detecta problema
   └─ BLOQUEA guardado

PASO 3: Error mostrado
└─ 🚨 ERROR DE SEGURIDAD
   └─ "Tamaño Total: 1.70MB (Límite: 1MB)"
   └─ "Imagen 1: 0.95MB → 🔄 CAMBIA"
   └─ "Imagen 2: 0.75MB → 🗑️ ELIMINA"

PASO 4: Admin lee soluciones
└─ Entiende qué hacer
   └─ Decide eliminar Imagen 2
   └─ O reducir tamaño de ambas

PASO 5: Corregir y reintentar
└─ Elimina Imagen 2
   └─ Total: 0.95MB ✓
   └─ Click "Guardar"
   └─ ✓ Éxito
```

---

## 🔢 Validaciones Técnicas

### Validación de Tamaño Individual

```typescript
Imagen detectada: 0.95MB

Evaluación:
├─ Es oversized? NO (< 1MB)
├─ En advertencia? SÍ (> 0.8MB = 80%)
├─ Acción: CAMBIAR
└─ Color: NARANJA

Visualización:
┌────────────┐
│ [Preview]  │
│ 1          │
│ 0.95MB     │ ← NARANJA
│ (95%)      │
└────────────┘
```

### Validación de Conjunto Total

```typescript
Imágenes cargadas: 2
├─ Imagen 1: 0.7MB
└─ Imagen 2: 0.8MB

Suma total: 1.5MB

Evaluación:
├─ Excede límite? SÍ (1.5MB > 1MB)
├─ Porcentaje: 150%
├─ Problema: 0.5MB adicionales
└─ Error: MOSTRAR BLOQUEANTE

Recomendación:
├─ Imagen 1: 0.7MB → 70% → CAMBIAR
├─ Imagen 2: 0.8MB → 80% → ELIMINAR
└─ Solución: Eliminar Imagen 2 = 0.7MB ✓
```

---

## 💻 Ejemplos de Código

### Usar el Validador

```typescript
import { validateImagesForEdit, getImageSizeInfo } from '@/lib/image-size-validator'

// Validar conjunto completo
const validation = validateImagesForEdit(imagePreviews)

if (validation.exceedsLimit) {
  console.log('LIMITE EXCEDIDO')
  console.log('Total:', validation.totalSizeMB + 'MB')
  console.log('Error:', validation.errorMessage)
  
  validation.oversizedImages.forEach(img => {
    console.log(`Imagen ${img.index}: ${img.sizeMB}MB`)
    console.log(`Recomendación: ${img.recommendation}`)
  })
}

// Info de imagen individual
const sizeInfo = getImageSizeInfo(imagePreviews[0])
console.log(`Tamaño: ${sizeInfo.sizeMB}MB`)
console.log(`Porcentaje: ${sizeInfo.percentage}%`)
console.log(`¿Oversized? ${sizeInfo.isOversized}`)
```

### En Componente React

```typescript
const [imageSizeError, setImageSizeError] = useState<string | null>(null)

useEffect(() => {
  if (imagePreviews.length > 0) {
    const validation = validateImagesForEdit(imagePreviews)
    
    if (validation.exceedsLimit) {
      setImageSizeError(validation.errorMessage)
    } else {
      setImageSizeError(null)
    }
  }
}, [imagePreviews])

// En JSX:
{imageSizeError && (
  <div className="p-4 bg-red-100 border-2 border-red-500 rounded">
    <pre className="whitespace-pre-wrap text-sm">
      {imageSizeError}
    </pre>
  </div>
)}
```

---

## 📊 Matriz de Decisión

### ¿Qué hacer si supera límite?

```
Tamaño Imagen  │ Acción          │ Color
───────────────┼─────────────────┼──────────
< 0.7MB        │ ✓ OK            │ Verde
0.7 - 0.8MB    │ ⚠️ Advertencia  │ Naranja
0.8 - 1MB      │ ⚠️ Advertencia  │ Naranja
> 1MB          │ 🚨 Error        │ Rojo

Caso: 2 imágenes
       Img1: 0.7MB (70%)  ← OK
       Img2: 0.6MB (60%)  ← OK
       Total: 1.3MB       ← EXCEDE

Decisión: Debes eliminar o reducir una imagen
├─ Opción 1: Elimina Img2 → Total: 0.7MB ✓
├─ Opción 2: Reduce Img1 a 0.4MB → Total: 1.0MB ✓
└─ Opción 3: Reduce ambas a 0.5MB → Total: 1.0MB ✓
```

---

## 🎯 Checklist para Admin

### Antes de Guardar Producto:

- [ ] ¿Hay banner ROJO de error? → **NO proceder hasta resolver**
- [ ] ¿Hay banner NARANJA de advertencia? → Considera optimizar
- [ ] ¿Cada preview muestra tamaño en MB? → **Sí, verificar **todos**
- [ ] ¿Tamaño total < 1MB? → **Sí = Listo para guardar**
- [ ] ¿Imagen principal es clara y de buena calidad? → **Verificar visualmente**

### Solución Rápida de Problemas:

| Problema | Solución Rápida |
|----------|-----------------|
| 1 imagen > 1MB | Eliminar (✕) o reemplazar |
| 2+ imágenes total > 1MB | Eliminar la más grande |
| Todas imágenes grandes | Usar herramienta de compresión |
| No sé qué hacer | Leer banner rojo, seguir recomendaciones |

---

**Versión:** 2.0  
**Actualizado:** 19 de Enero de 2026  
**Categoría:** Guía de Usuario - Sistema de Validación de Imágenes
