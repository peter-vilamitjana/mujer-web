import '@/lib/shim-storage';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Mujer | Estilismo y Belleza',
  description: 'Gestioná tu salón de forma sencilla y elegante.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
