# 🚀 GUÍA SIMPLE: 2 Tiendas - MISMO INVENTARIO

**Objetivo**: Crear `/tienda1` y `/tienda2` que muestran LOS MISMOS productos con diferente branding.

**Tiempo**: 4-6 horas  
**Complejidad**: BAJA  
**Riesgo**: MUY BAJO

---

## 🎯 RESUMEN RÁPIDO

### Lo que CAMBIA:
- ✅ Crear 2 rutas nuevas: `/tienda1` y `/tienda2`
- ✅ Crear configuración de branding (colores, logos, nombres)
- ✅ Actualizar estilos para temas

### Lo que NO CAMBIA:
- ✅ Base de datos (CERO modificaciones)
- ✅ Panel administrativo (IGUAL)
- ✅ APIs (IGUAL)
- ✅ Carrito (IGUAL)
- ✅ Checkout (IGUAL)

---

## 📋 PLAN DE IMPLEMENTACIÓN (4-6 HORAS)

### FASE 1: Configuración (1 hora)

#### Paso 1.1: Crear archivo de configuración de tiendas

**Crear**: `lib/stores-config.ts`

```typescript
// lib/stores-config.ts
export interface StoreConfig {
  id: 'tienda1' | 'tienda2';
  name: string;
  description: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const STORES: Record<string, StoreConfig> = {
  tienda1: {
    id: 'tienda1',
    name: 'Tienda 1',
    description: 'Mi primera tienda',
    colors: {
      primary: '#3B82F6',      // Azul
      secondary: '#1F2937',    // Gris oscuro
      accent: '#10B981',       // Verde
    },
  },
  tienda2: {
    id: 'tienda2',
    name: 'Tienda 2',
    description: 'Mi segunda tienda',
    colors: {
      primary: '#EF4444',      // Rojo
      secondary: '#1F2937',    // Gris oscuro
      accent: '#F59E0B',       // Naranja
    },
  },
};

export function getStoreConfig(storeId: string): StoreConfig {
  const store = STORES[storeId];
  if (!store) {
    throw new Error(`Store not found: ${storeId}`);
  }
  return store;
}
```

#### Paso 1.2: Crear hook para usar tema de tienda

**Crear**: `lib/hooks/useStoreTheme.ts`

```typescript
// lib/hooks/useStoreTheme.ts
'use client';

import { getStoreConfig, StoreConfig } from '@/lib/stores-config';

export function useStoreTheme(storeId: string): StoreConfig {
  return getStoreConfig(storeId);
}
```

---

### FASE 2: Crear Layouts de Tiendas (1 hora)

#### Paso 2.1: Crear layout tienda1

**Crear**: `app/tienda1/layout.tsx`

```typescript
// app/tienda1/layout.tsx
import { getStoreConfig } from '@/lib/stores-config';
import type { ReactNode } from 'react';

const storeConfig = getStoreConfig('tienda1');

export const metadata = {
  title: storeConfig.name,
  description: storeConfig.description,
};

export default function Tienda1Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        '--primary-color': storeConfig.colors.primary,
        '--secondary-color': storeConfig.colors.secondary,
        '--accent-color': storeConfig.colors.accent,
      } as React.CSSProperties}
    >
      {/* Header con branding tienda1 */}
      <header style={{ backgroundColor: storeConfig.colors.primary }} className="p-4">
        <h1 className="text-white text-2xl font-bold">
          {storeConfig.name}
        </h1>
      </header>

      {/* Contenido */}
      {children}

      {/* Footer con branding tienda1 */}
      <footer style={{ backgroundColor: storeConfig.colors.secondary }} className="p-4 text-white">
        <p>&copy; 2025 {storeConfig.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
```

#### Paso 2.2: Crear layout tienda2

**Crear**: `app/tienda2/layout.tsx`

```typescript
// app/tienda2/layout.tsx
import { getStoreConfig } from '@/lib/stores-config';
import type { ReactNode } from 'react';

const storeConfig = getStoreConfig('tienda2');

export const metadata = {
  title: storeConfig.name,
  description: storeConfig.description,
};

export default function Tienda2Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        '--primary-color': storeConfig.colors.primary,
        '--secondary-color': storeConfig.colors.secondary,
        '--accent-color': storeConfig.colors.accent,
      } as React.CSSProperties}
    >
      {/* Header con branding tienda2 */}
      <header style={{ backgroundColor: storeConfig.colors.primary }} className="p-4">
        <h1 className="text-white text-2xl font-bold">
          {storeConfig.name}
        </h1>
      </header>

      {/* Contenido */}
      {children}

      {/* Footer con branding tienda2 */}
      <footer style={{ backgroundColor: storeConfig.colors.secondary }} className="p-4 text-white">
        <p>&copy; 2025 {storeConfig.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
```

---

### FASE 3: Crear Pages de Tiendas (1 hora)

#### Paso 3.1: Crear page tienda1

**Crear**: `app/tienda1/page.tsx`

```typescript
// app/tienda1/page.tsx
// Importar componentes existentes de la página principal
// y reutilizarlos aquí (mismo contenido, diferente tema)

import { Suspense } from 'react';
// Importar tus componentes existentes aquí
// Por ejemplo: ProductList, Categories, etc.

export default async function Tienda1Page() {
  return (
    <main className="min-h-screen bg-white">
      {/* Aquí va tu contenido existente */}
      {/* Por ejemplo: tus categorías, productos, etc. */}
      
      {/* Opción 1: Si tienes un componente reutilizable */}
      {/* <StorefrontContent /> */}
      
      {/* Opción 2: Copiar el contenido de / aquí */}
      {/* Puedes copiar el contenido de tu página principal */}
      
      <section className="p-8">
        <h2 className="text-3xl font-bold mb-4">Bienvenido a Tienda 1</h2>
        <p>Aquí irá tu contenido de productos...</p>
      </section>
    </main>
  );
}
```

#### Paso 3.2: Crear page tienda2

**Crear**: `app/tienda2/page.tsx`

```typescript
// app/tienda2/page.tsx
import { Suspense } from 'react';

export default async function Tienda2Page() {
  return (
    <main className="min-h-screen bg-white">
      {/* Mismo contenido que tienda1, pero con colores diferentes */}
      
      <section className="p-8">
        <h2 className="text-3xl font-bold mb-4">Bienvenido a Tienda 2</h2>
        <p>Aquí irá tu contenido de productos...</p>
      </section>
    </main>
  );
}
```

---

### FASE 4: Actualizar Página Principal (1 hora)

#### Paso 4.1: Convertir / en landing/redirect

**Actualizar**: `app/page.tsx`

```typescript
// app/page.tsx
import Link from 'next/link';
import { getStoreConfig } from '@/lib/stores-config';

const tienda1 = getStoreConfig('tienda1');
const tienda2 = getStoreConfig('tienda2');

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Elige tu Tienda
          </h1>
          <p className="text-xl text-gray-300">
            Selecciona una de nuestras tiendas para comenzar
          </p>
        </div>

        {/* Cards de tiendas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Tienda 1 */}
          <Link href="/tienda1">
            <div
              className="rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 h-full"
              style={{
                backgroundColor: tienda1.colors.primary,
              }}
            >
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {tienda1.name}
                  </h2>
                  <p className="text-gray-100">
                    {tienda1.description}
                  </p>
                </div>
                <button className="mt-6 bg-white text-gray-900 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
                  Entrar
                </button>
              </div>
            </div>
          </Link>

          {/* Tienda 2 */}
          <Link href="/tienda2">
            <div
              className="rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 h-full"
              style={{
                backgroundColor: tienda2.colors.primary,
              }}
            >
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {tienda2.name}
                  </h2>
                  <p className="text-gray-100">
                    {tienda2.description}
                  </p>
                </div>
                <button className="mt-6 bg-white text-gray-900 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
                  Entrar
                </button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

### FASE 5: Actualizar Estilos (1-2 horas)

#### Paso 5.1: Agregar variables CSS globales

**Actualizar**: `app/globals.css`

```css
/* app/globals.css */

:root {
  --primary-color: #3B82F6;
  --secondary-color: #1F2937;
  --accent-color: #10B981;
}

/* Estilos para tienda1 (colores azules) */
[data-store="tienda1"] {
  --primary-color: #3B82F6;
  --secondary-color: #1F2937;
  --accent-color: #10B981;
}

/* Estilos para tienda2 (colores rojos) */
[data-store="tienda2"] {
  --primary-color: #EF4444;
  --secondary-color: #1F2937;
  --accent-color: #F59E0B;
}

/* Componentes pueden usar las variables */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.header {
  background-color: var(--primary-color);
}

.accent {
  color: var(--accent-color);
}
```

---

### FASE 6: Testing (1 hora)

#### Paso 6.1: Probar URLs

```bash
# Terminal
npm run dev

# Abrir navegador
# http://localhost:3000              → Landing page
# http://localhost:3000/tienda1      → Tienda 1 (tema azul)
# http://localhost:3000/tienda2      → Tienda 2 (tema rojo)
```

#### Paso 6.2: Verificar

- [ ] `/tienda1` muestra productos (tema azul)
- [ ] `/tienda2` muestra productos (tema rojo)
- [ ] Carrito funciona en ambas
- [ ] Admin sigue igual
- [ ] Cambios en admin aparecen en ambas tiendas

---

## ⚙️ CONFIGURACIÓN AVANZADA (OPCIONAL)

### Agregar logos a tiendas

**Actualizar**: `lib/stores-config.ts`

```typescript
export const STORES: Record<string, StoreConfig> = {
  tienda1: {
    id: 'tienda1',
    name: 'Tienda 1',
    description: 'Mi primera tienda',
    logo: '/logos/tienda1-logo.png', // Agregar path
    colors: { ... },
  },
  tienda2: {
    id: 'tienda2',
    name: 'Tienda 2',
    description: 'Mi segunda tienda',
    logo: '/logos/tienda2-logo.png', // Agregar path
    colors: { ... },
  },
};
```

**Actualizar layout para mostrar logo**:

```typescript
<header style={{ backgroundColor: storeConfig.colors.primary }} className="p-4 flex items-center gap-4">
  {storeConfig.logo && (
    <img src={storeConfig.logo} alt={storeConfig.name} className="h-10" />
  )}
  <h1 className="text-white text-2xl font-bold">
    {storeConfig.name}
  </h1>
</header>
```

---

## 🎨 PERSONALIZACIÓN DE COLORES

Para cambiar colores de una tienda, edita `lib/stores-config.ts`:

```typescript
tienda1: {
  colors: {
    primary: '#3B82F6',      // Cambiar este
    secondary: '#1F2937',    // Cambiar este
    accent: '#10B981',       // Cambiar este
  },
},
```

**Colores sugeridos**:

| Color | Hex | Uso |
|-------|-----|-----|
| Azul | #3B82F6 | Primary |
| Rojo | #EF4444 | Primary |
| Verde | #10B981 | Accent |
| Naranja | #F59E0B | Accent |
| Gris | #1F2937 | Secondary |

---

## 📚 ESTRUCTURA DE ARCHIVOS (ANTES Y DESPUÉS)

### ANTES
```
app/
├── page.tsx          ← Página única
├── layout.tsx
├── admin/
│   └── ...
```

### DESPUÉS
```
app/
├── page.tsx          ← Ahora es landing/selector
├── layout.tsx
├── tienda1/          ← NUEVO
│   ├── layout.tsx
│   └── page.tsx
├── tienda2/          ← NUEVO
│   ├── layout.tsx
│   └── page.tsx
├── admin/
│   └── ...           ← SIN CAMBIOS
lib/
├── stores-config.ts  ← NUEVO
├── hooks/
│   └── useStoreTheme.ts  ← NUEVO
```

---

## ✅ CHECKLIST FINAL

- [ ] Archivo `lib/stores-config.ts` creado
- [ ] Archivo `lib/hooks/useStoreTheme.ts` creado
- [ ] Carpeta `app/tienda1/` con layout y page
- [ ] Carpeta `app/tienda2/` con layout y page
- [ ] `app/page.tsx` actualizado como landing
- [ ] Estilos CSS actualizados (variables)
- [ ] Testing local completado
- [ ] Ambas tiendas muestran productos
- [ ] Carrito funciona en ambas
- [ ] Admin sin cambios
- [ ] Deploy a producción

---

## 🚀 DEPLOY

```bash
# Verificar cambios
npm run build

# Si no hay errores
git add .
git commit -m "feat: agregar tienda1 y tienda2 con mismo inventario"

# Deploy a Vercel (si usas Vercel)
git push origin main

# Si usas otro hosting
# Seguir instrucciones de tu hosting
```

---

## 📞 SOPORTE

Si algo no funciona:

1. Verificar nombres de archivo y rutas
2. Verificar que estilos CSS estén correctos
3. Revisar console del navegador (F12) para errores
4. Verificar que imports tengan rutas correctas

---

**Tiempo total: 4-6 horas**  
**Resultado: 2 tiendas públicas con MISMO inventario**  
**Costo: $0**

¡Listo! 🎉
