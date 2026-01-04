'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const store = params.store as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${store}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, store]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--neutral-light)' }}
    >
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="mx-auto mb-4" style={{ color: 'var(--accent-green)' }} />

        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
          ¡Orden Enviada!
        </h1>

        <p className="text-gray-600 mb-6">
          Tu orden ha sido enviada por WhatsApp. Nuestro equipo se pondrá en contacto pronto para confirmar los
          detalles.
        </p>

        <Link
          href={`/${store}`}
          className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
