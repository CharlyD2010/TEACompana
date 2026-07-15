import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

// Configuración de la fuente oficial PT Sans para evitar parpadeos y errores de hidratación
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'TEACompaña - Educación Especial',
  description: 'Aplicación educativa para niños con TEA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TEACompaña',
  },
};

export const viewport: Viewport = {
  themeColor: '#60a5fa',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${ptSans.variable} font-body antialiased selection:bg-primary/30`}>
        <FirebaseClientProvider>
          <ServiceWorkerRegister />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
