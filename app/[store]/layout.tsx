import type { ReactNode } from 'react';
import ScrollToTop from '@/components/scroll-to-top';

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
