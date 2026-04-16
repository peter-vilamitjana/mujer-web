import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="py-32 bg-brand-bg border-t border-glass-border theme-transition">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="md:col-span-2">
            <h2 className="font-vogue text-5xl font-black tracking-tighter uppercase mb-10 text-brand-primary">Ouleeh</h2>
            <p className="text-brand-primary/30 text-[10px] tracking-[0.4em] uppercase font-bold leading-loose max-w-sm font-inter">
              La vanguardia de la belleza y el bienestar curado. Una publicación digital para la mujer contemporánea.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] tracking-[0.5em] uppercase font-black mb-10 text-brand-primary font-inter">Explorar</h5>
            <ul className="space-y-4">
              <li><Link className="text-brand-primary/40 hover:text-brand-primary text-[10px] tracking-[0.2em] font-bold uppercase transition-colors font-inter" href="#">Journal</Link></li>
              <li><Link className="text-brand-primary/40 hover:text-brand-primary text-[10px] tracking-[0.2em] font-bold uppercase transition-colors font-inter" href="#">Ateliers</Link></li>
              <li><Link className="text-brand-primary/40 hover:text-brand-primary text-[10px] tracking-[0.2em] font-bold uppercase transition-colors font-inter" href="#">Archive</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] tracking-[0.5em] uppercase font-black mb-10 text-brand-primary font-inter">Social</h5>
            <ul className="space-y-4">
              <li><Link className="text-brand-primary/40 hover:text-brand-primary text-[10px] tracking-[0.2em] font-bold uppercase transition-colors font-inter" href="#">Instagram</Link></li>
              <li><Link className="text-brand-primary/40 hover:text-brand-primary text-[10px] tracking-[0.2em] font-bold uppercase transition-colors font-inter" href="#">Pinterest</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-glass-border gap-8 theme-transition">
          <p className="text-[9px] tracking-[0.5em] uppercase text-brand-primary/20 font-bold font-inter">© {new Date().getFullYear()} Ouleeh. Excellence in Curation.</p>
          <div className="flex gap-12">
            <Link className="text-brand-primary/20 hover:text-brand-primary transition-colors text-[9px] tracking-[0.3em] font-bold uppercase font-inter" href="#">Privacy</Link>
            <Link className="text-brand-primary/20 hover:text-brand-primary transition-colors text-[9px] tracking-[0.3em] font-bold uppercase font-inter" href="#">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
