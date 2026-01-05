import type { ReactNode } from 'react';
import ScrollToTop from '@/components/scroll-to-top';
import { Metadata } from 'next';

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ store: string }>;
};

export async function generateMetadata(props: StoreLayoutProps): Promise<Metadata> {
  const params = await props.params;
  const store = params.store;

  if (store === 'djcelutecnico') {
    return {
      title: 'DJCELUTECNICO - Tecnología y Accesorios',
      description: 'DJCELUTECNICO - Tu tienda de tecnología y accesorios de calidad',
      icons: {
        icon: '/dj.svg',
        apple: '/dj.svg',
      },
    };
  }

  return {
    title: 'Ubatech+Pro - Confianza & Seguridad',
    description: 'Tienda online de Ubatech+Pro con los mejores productos tech',
    icons: {
      icon: '/robot-favicon.svg',
      apple: '/robot-favicon.svg',
    },
  };
}

export default function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ store: string }>;
}) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
