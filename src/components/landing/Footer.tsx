import { Instagram } from 'lucide-react';
import Link from 'next/link';
import type { Tenant } from '@/lib/schema';

interface FooterProps {
  tenantSlug: string;
  salon: Pick<Tenant, 'name' | 'socialLinks'>;
}

export default function Footer({ tenantSlug, salon }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const instagramUrl = salon.socialLinks?.instagram || 'https://instagram.com';

  // Solo destinos reales de esta página — nada de anclas/rutas muertas
  // (antes había #servicios, #testimonios, /gift-cards, /contacto sin destino).
  const navLinks = [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Combos', href: '#promotions' },
    { label: 'Reseñas', href: '#reviews' },
    { label: 'Reservar Turno', href: `/salones/${tenantSlug}/turnos` },
    { label: 'Mi Cuenta', href: `/salones/${tenantSlug}/login` },
  ];

  return (
    <footer className="bg-surface text-on-surface-secondary py-12 border-t border-outline-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold text-primary tracking-widest uppercase font-vogue">{salon.name}</h2>
            <p className="mt-2 text-sm italic font-vogue tracking-widest uppercase opacity-50">Estilo & Belleza</p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col md:flex-row items-center gap-6 md:gap-8 font-sans text-xs font-semibold tracking-widest uppercase">
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-primary transition-colors duration-300">
                {label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          {/* p-3 -m-3: agranda el área táctil a 44px sin mover el ícono visualmente */}
          <div className="flex items-center gap-6">
            <Link
              href={instagramUrl}
              target="_blank"
              className="p-3 -m-3 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-subtle flex flex-col sm:flex-row justify-between items-center gap-4 font-sans text-xs font-light tracking-widest uppercase opacity-40 text-center sm:text-left">
          <p>© {currentYear} {salon.name}. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:underline underline-offset-4">Privacidad</Link>
            <Link href="#" className="hover:underline underline-offset-4">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
