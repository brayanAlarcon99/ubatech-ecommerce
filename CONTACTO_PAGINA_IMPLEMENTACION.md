# 📬 Página de Contacto - Contactenos

## ¿Qué se implementó?

Se creó una nueva página de **Contacto** (`/contactenos`) que permite a los clientes enviar mensajes directamente desde la tienda online. Esta página **carga automáticamente el email de soporte desde la información de la plataforma**.

## 📁 Archivos Creados/Modificados

### 1. **Página de Contacto** ✅
📍 `app/contactenos/page.tsx`

**Funcionalidades:**
- Formulario de contacto con campos:
  - Nombre completo (requerido)
  - Email de soporte (pre-llenado automáticamente desde `platform_info`)
  - Teléfono (opcional)
  - Asunto (requerido)
  - Mensaje (requerido)
- Información de contacto directo (email, teléfono, ubicación)
- Validación de campos requeridos
- Mensaje de confirmación después del envío
- Manejo de errores

**Características clave:**
```typescript
// El email se pre-llena automáticamente
useEffect(() => {
  if (!platformLoading && platformInfo.supportEmail) {
    setFormData((prev) => ({
      ...prev,
      email: platformInfo.supportEmail,
    }))
  }
}, [platformInfo, platformLoading])
```

### 2. **API de Contacto** ✅
📍 `app/api/send-contact-email/route.ts`

**Funcionalidades:**
- Endpoint POST para procesar formularios de contacto
- Validación de campos requeridos
- Validación de formato de email
- Logging de mensajes recibidos
- Respuesta JSON estructurada

**Uso:**
```
POST /api/send-contact-email
Body: {
  name: string,
  email: string,
  phone?: string,
  subject: string,
  message: string,
  recipientEmail: string
}
```

### 3. **Footer Actualizado** ✅
📍 `components/footer.tsx`

**Cambios:**
- Agregado link "📬 Envíanos un mensaje" en la sección de Contacto
- Redirige a `/contactenos`
- Estilos consistentes con el diseño existente

## 🚀 Cómo Funciona

### Flujo de Usuario:

1. **Usuario visita `/contactenos`**
   - Ve información de contacto directo (email, teléfono, ubicación)
   - Ve un formulario de contacto

2. **Campo de Email pre-llenado**
   - El componente carga `platformInfo` usando el hook `usePlatformInfo()`
   - El campo email se pre-llena con `platformInfo.supportEmail`
   - Valor por defecto: `support@ubatech.com`

3. **Usuario completa el formulario**
   - Escribe su nombre, asunto y mensaje
   - Opcionalmente agrega su teléfono

4. **Usuario envía el mensaje**
   - Se validan los campos requeridos
   - Se envía a `/api/send-contact-email`
   - API valida y procesa el mensaje
   - Se muestra mensaje de confirmación

5. **Mensaje recibido**
   - Se registra en consola del servidor (logs)
   - Está listo para integración con servicio de email real

## 🔧 Integración Disponible

El API está listo para integrar servicios de email como:
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Nodemailer**
- **Resend**

### Ejemplo de Integración (SendGrid):

```typescript
import { mail } from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  // ... validaciones ...
  
  mail.setApiKey(process.env.SENDGRID_API_KEY!);
  
  await mail.send({
    to: recipientEmail,
    from: 'noreply@ubatech.com',
    subject: `Nuevo mensaje de ${name}: ${subject}`,
    html: `<p>${message}</p><p>Contacto: ${email} | ${phone}</p>`,
  });
  
  return NextResponse.json({ success: true });
}
```

## 📱 Acceso a la Página

- **URL:** `/contactenos` o `localhost:3000/contactenos`
- **Link:** Disponible en el footer bajo "Contacto" → "📬 Envíanos un mensaje"

## 🎨 Diseño

La página usa:
- Variables CSS personalizadas (colores de la plataforma)
- Iconos de `lucide-react` (Mail, Phone, MapPin)
- Responsive design (mobile, tablet, desktop)
- Estilos consistentes con el resto de la tienda

## 📊 Data Flow

```
┌─────────────────────────────────────────────┐
│ 1. Usuario visita /contactenos              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 2. Component carga usePlatformInfo()        │
│    - Fetch desde Firestore collection:      │
│      "platform_info"                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 3. Email field pre-se llena con             │
│    platformInfo.supportEmail                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 4. Usuario completa formulario              │
│    y hace click en "Enviar Mensaje"         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 5. Fetch POST a /api/send-contact-email    │
│    con datos del formulario                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 6. API valida y procesa                     │
│    - Valida campos requeridos               │
│    - Valida formato de emails               │
│    - Registra en servidor                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ 7. Retorna respuesta exitosa                │
│    Muestra "Mensaje enviado" al usuario     │
└─────────────────────────────────────────────┘
```

## 🔒 Seguridad

- ✅ Validación de campos en cliente y servidor
- ✅ Validación de formato de email
- ✅ Protección contra campos vacíos
- ✅ Error handling robusto
- ✅ Logs para auditoría

## 📝 Próximos Pasos (Opcionales)

1. **Integrar servicio de email real** (SendGrid, Mailgun, etc.)
2. **Guardar mensajes en Firestore** para historial
3. **Enviar confirmación automática al usuario**
4. **Notificar al admin por cada nuevo mensaje**
5. **Panel de administración para ver mensajes**
6. **Validación CAPTCHA** para evitar spam

## ✅ Estado

- ✅ Página de contacto creada
- ✅ Formulario con validaciones
- ✅ Email pre-llenado desde platform_info
- ✅ API para procesar formularios
- ✅ Link en footer
- ⏳ Integración de envío de emails (a implementar según necesidad)

---

**Fecha:** 11 Diciembre 2025  
**Versión:** 1.0  
**Estado:** Listo para usar / Listo para integración de email
