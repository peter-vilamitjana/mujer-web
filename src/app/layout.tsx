import '@/lib/shim-storage';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Manrope, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500'],
  variable: '--font-inter' 
});
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '700', '900'], 
  style: ['normal', 'italic'],
  variable: '--font-playfair' 
});
const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['500', '600'], 
  variable: '--font-manrope' 
});
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit'
});

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
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${manrope.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body selection:bg-primary/20 antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
