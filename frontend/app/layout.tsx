import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'UpperSilver — Moda Premium para Hombre y Mujer',
  description:
    'Descubre la colección exclusiva de UpperSilver. Ropa y accesorios de alta calidad para hombres y mujeres que definen tendencia.',
  keywords: ['moda', 'ropa', 'hombre', 'mujer', 'boutique', 'UpperSilver'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
