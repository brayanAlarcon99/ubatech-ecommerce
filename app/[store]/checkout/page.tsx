'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import Header from '@/components/header';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { formatPriceWithCurrency, formatPrice } from '@/lib/format-price';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const store = params.store as string;
  const { cart, total, clearCart } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  // Obtener nombre de tienda
  const getStoreName = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return 'DJ Celutecnico';
    return 'Ubatech+Pro';
  };

  // Cargar número de WhatsApp desde configuración
  useEffect(() => {
    const loadWhatsAppNumber = async () => {
      try {
        // Usar API con parámetro store para obtener configuración correcta
        const response = await fetch(`/api/settings?store=${store}&t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });

        if (response.ok) {
          const settings = await response.json();
          const rawNumber = settings.storeWhatsApp || '';

          console.log('Raw WhatsApp number from settings:', rawNumber);

          // Detectar si el número tiene placeholders (xxxx)
          if (rawNumber.toLowerCase().includes('xxxx') || rawNumber.toLowerCase().includes('xxx')) {
            console.error('Number contains placeholders (xxxx). This is a placeholder, not a real number.');
            console.warn('Please update the WhatsApp number in admin settings with a real phone number.');
            setWhatsappNumber('573187654321'); // Número por defecto
          } else {
            // Limpiar el número: remover espacios, guiones, paréntesis, pero mantener +
            let cleanNumber = rawNumber
              .replace(/\s/g, '') // Remover espacios
              .replace(/[-()]/g, '') // Remover guiones y paréntesis
              .trim();

            // Extraer solo dígitos para validación
            const digitsOnly = cleanNumber.replace(/\D/g, '');

            console.log('Cleaned WhatsApp number:', cleanNumber);
            console.log('Digits only:', digitsOnly);
            console.log('Digits length:', digitsOnly.length);

            // Validar que el número tenga al menos 10 dígitos
            if (digitsOnly.length >= 10) {
              // Si no comienza con +, agregamos el código de país de Colombia
              const finalNumber = cleanNumber.startsWith('+') ? digitsOnly : '57' + digitsOnly;
              setWhatsappNumber(finalNumber); // Guardar solo dígitos para WhatsApp API
              console.log('✅ WhatsApp number loaded successfully:', finalNumber);
            } else {
              console.error('Invalid WhatsApp number length:', digitsOnly.length, 'Number:', rawNumber);
              setWhatsappNumber('573187654321'); // Número por defecto
            }
          }
        } else {
          console.error('Failed to load settings:', response.status);
          setWhatsappNumber('573187654321');
        }
      } catch (error) {
        console.error('Error loading WhatsApp number:', error);
        setWhatsappNumber('573187654321');
      }
    };
    loadWhatsAppNumber();
  }, []);

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <Link href={`/${store}`} className="text-blue-600 hover:underline">
            Volver a tienda
          </Link>
        </main>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = () => {
    const orderItems = cart
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - ${formatPriceWithCurrency(item.price * item.quantity)}`,
      )
      .join('\n');

    const message = `
*NUEVA ORDEN DE COMPRA*

👤 *Cliente:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Teléfono:* ${formData.phone}
📍 *Dirección:* ${formData.address}

*PRODUCTOS:*
${orderItems}

💰 *Total:* ${formatPriceWithCurrency(total)}

_Enviado desde ${getStoreName(store)}_
    `.trim();

    return encodeURIComponent(message);
  };

  const handleSendToWhatsApp = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    // Simular guardado en Firebase
    setTimeout(() => {
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

      window.open(whatsappURL, '_blank');

      // Limpiar carrito
      clearCart();

      // Redirigir
      setTimeout(() => {
        router.push(`/${store}/exito`);
      }, 500);

      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href={`/${store}/carrito`}
          className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Volver al carrito
        </Link>

        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--primary)' }}>
          Completar Compra
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
              Datos de Contacto
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  style={{ borderColor: 'var(--primary)' }}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  placeholder="correo@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Teléfono/WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  placeholder="+54 9 1234 567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Dirección de Entrega</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 bg-white text-black"
                  placeholder="Calle, número, ciudad, provincia..."
                />
              </div>
            </form>
          </div>

          {/* Resumen */}
          <div className="rounded-lg p-6 h-fit" style={{ backgroundColor: 'var(--neutral-light)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
              Resumen de Orden
            </h2>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">{formatPriceWithCurrency(item.price * item.quantity)}</span>
                </div>
              ))}

              <div
                className="border-t pt-3 flex justify-between text-lg font-bold"
                style={{ borderTopColor: 'var(--primary)' }}
              >
                <span>Total:</span>
                <span style={{ color: 'var(--accent-green)' }}>{formatPriceWithCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSendToWhatsApp}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-white transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: loading ? '#ccc' : 'var(--accent-cyan)',
              }}
            >
              <MessageCircle size={20} />
              {loading ? 'Enviando...' : 'Enviar por WhatsApp'}
            </button>

            {whatsappNumber && (
              <p className="text-xs text-gray-500 mt-2 text-center bg-gray-100 p-2 rounded">
                📱 Número configurado: {whatsappNumber}
              </p>
            )}

            <p className="text-xs text-gray-600 mt-4 text-center">
              Se abrirá WhatsApp con tu orden. Completa la compra con nuestro equipo.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
