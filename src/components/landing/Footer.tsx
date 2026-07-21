import { Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import type { Tenant } from '@/lib/schema';

interface FooterProps {
  tenantSlug: string;
  salon: Pick<Tenant, 'name' | 'socialLinks'>;
}

export default function Footer({ tenantSlug, salon }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const instagramUrl = salon.socialLinks?.instagram || 'https://instagram.com';

  return (
    <footer className="bg-surface text-on-surface-secondary py-12 border-t border-outline-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col items-center">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-primary tracking-widest uppercase font-vogue">{salon.name}</h2>
          </div>

          <nav className="flex flex-col items-center gap-6 mb-12">
            <Link href="#servicios" className="font-sans text-xs font-semibold tracking-widest uppercase text-on-surface-secondary">Servicios</Link>
            <Link href="#promotions" className="font-sans text-xs font-semibold tracking-widest uppercase text-on-surface-secondary">Combos</Link>
            <Link href="/gift-cards" className="font-sans text-xs font-semibold tracking-widest uppercase text-on-surface-secondary">Gift Cards</Link>
            <Link href="/contacto" className="font-sans text-xs font-semibold tracking-widest uppercase text-on-surface-secondary">Contacto</Link>
          </nav>

          <div className="flex items-center gap-8 mb-12">
            <Link
              href="https://twitter.com"
              target="_blank"
              className="text-primary"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href={instagramUrl}
              target="_blank"
              className="text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>

          <div className="pt-8 w-full border-t border-outline-subtle text-center">
            <p className="font-sans text-[10px] font-medium tracking-tight text-on-surface-variant">
              © {currentYear} {salon.name}. <br />
              Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-col">
          <div className="flex justify-between items-center gap-8 mb-12">
            {/* Brand */}
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-bold text-on-surface tracking-widest uppercase font-vogue">{salon.name}</h2>
              <p className="mt-2 text-sm italic font-vogue tracking-widest uppercase opacity-50">Estilo & Belleza</p>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-sans text-xs font-semibold tracking-widest uppercase">
              <Link href="#promotions" className="hover:text-primary transition-colors duration-300">Promociones</Link>
              <Link href={`/salones/${tenantSlug}/book`} className="hover:text-primary transition-colors duration-300">Reservar Turno</Link>
              <Link href="#testimonios" className="hover:text-primary transition-colors duration-300">Testimonios</Link>
              <Link href={`/salones/${tenantSlug}/login`} className="hover:text-primary transition-colors duration-300">Mi Cuenta</Link>
            </nav>

            {/* Social */}
            <div className="flex items-center gap-6">
              <Link
                href={instagramUrl}
                target="_blank"
                className="hover:text-on-surface transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-outline-subtle flex flex-col sm:flex-row justify-between items-center gap-4 font-sans text-xs font-light tracking-widest uppercase opacity-40">
            <p>© {currentYear} {salon.name}. TODOS LOS DERECHOS RESERVADOS.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:underline underline-offset-4">Privacidad</Link>
              <Link href="#" className="hover:underline underline-offset-4">Términos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
