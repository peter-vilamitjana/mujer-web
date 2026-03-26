import { Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer({ tenantSlug }: { tenantSlug: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white md:bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-100 md:border-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col items-center">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[#9D6EFE] tracking-widest uppercase font-serif">MUJER</h2>
          </div>

          <nav className="flex flex-col items-center gap-6 mb-12">
            <Link href="#servicios" className="text-xs font-semibold tracking-widest uppercase text-zinc-600">Servicios</Link>
            <Link href="#promotions" className="text-xs font-semibold tracking-widest uppercase text-zinc-600">Combos</Link>
            <Link href="/gift-cards" className="text-xs font-semibold tracking-widest uppercase text-zinc-600">Gift Cards</Link>
            <Link href="/contacto" className="text-xs font-semibold tracking-widest uppercase text-zinc-600">Contacto</Link>
          </nav>

          <div className="flex items-center gap-8 mb-12">
            <Link
              href="https://twitter.com"
              target="_blank"
              className="text-[#9D6EFE]"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="text-[#9D6EFE]"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>

          <div className="pt-8 w-full border-t border-zinc-100 text-center">
            <p className="text-[10px] font-medium tracking-tight text-zinc-300">
              © {currentYear} MUJER Studio Beauty Center. <br />
              Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-col">
          <div className="flex justify-between items-center gap-8 mb-12">
            {/* Brand */}
            <div className="flex flex-col items-start text-zinc-400">
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase font-serif">MUJER</h2>
              <p className="mt-2 text-sm italic font-serif tracking-widest uppercase opacity-50">Estilo & Belleza</p>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold tracking-widest uppercase">
              <Link href="#promotions" className="hover:text-primary transition-colors duration-300">Promociones</Link>
              <Link href={`/salones/${tenantSlug}/book`} className="hover:text-primary transition-colors duration-300">Reservar Turno</Link>
              <Link href="#testimonios" className="hover:text-primary transition-colors duration-300">Testimonios</Link>
              <Link href={`/salones/${tenantSlug}/login`} className="hover:text-primary transition-colors duration-300">Mi Cuenta</Link>
            </nav>

            {/* Social */}
            <div className="flex items-center gap-6">
              <Link
                href="https://instagram.com"
                target="_blank"
                className="hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light tracking-widest uppercase opacity-40">
            <p>© {currentYear} MUJER. TODOS LOS DERECHOS RESERVADOS.</p>
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
