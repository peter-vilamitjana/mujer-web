import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Journal',  href: '#' },
  { label: 'Ateliers', href: '#' },
  { label: 'Archive',  href: '#' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Pinterest',  href: '#' },
];

const LEGAL_LINKS = [
  { label: 'Privacidad', href: '#' },
  { label: 'Términos',   href: '#' },
];

export default function LandingFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-8 py-20">

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-16">

          {/* Brand column */}
          <div>
            <p className="font-playfair text-2xl font-semibold text-white tracking-tight mb-4">
              Ouleeh
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[280px]">
              La plataforma de gestión para salones de belleza en Argentina. Simple, rápida y diseñada para el día a día.
            </p>
          </div>

          {/* Explorar column */}
          <div>
            <h5 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">
              Explorar
            </h5>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social column */}
          <div>
            <h5 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">
              Social
            </h5>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Ouleeh. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
