import Link from 'next/link';
import { Search, MapPin, ArrowRight, Scissors, User, Hand, Eye, Leaf } from 'lucide-react';
import { getPublicSalons } from '@/lib/services/marketplace.service';
import PublicHeader from '@/components/marketplace/PublicHeader';
import PublicSalonCard from '@/components/marketplace/PublicSalonCard';

export default async function HomePage() {
  const salonsRaw = await getPublicSalons();
  const featuredSalons = salonsRaw.slice(0, 4);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* NAV */}
      <PublicHeader />

      {/* HERO SECTION */}
      <section className="relative h-[921px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            alt="Modern Luxury Salon" 
            className="w-full h-full object-cover scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0ZENyykVTzYq4ds7iy1kc9gI7O9lPjyO7ioTqgeBIp98EmuUFlY53WEX187Y4FotI_pel9_GBcxblrRVLJQzqNUo4qUh1TC0OsrN-fxENwd752fd5vzaObDjmbek29AKZVQg81iolxNHfsmEGJTCnkWFXt9hV_lq7EaVpYAC-aabQmUSp82TQpfwDKpeQRRDYgIkGht2C56PyEyqExyjaMsgFNF02hDKzg2o3AwC5ItMd5StgDd4uVDj5Jp5OF8paGb6xVVqPVCw"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 text-center">
          <h1 className="font-headline text-white text-5xl md:text-7xl font-semibold mb-12 tracking-tight drop-shadow-lg">
            Sentite radiante, <br/> agendá tu momento.
          </h1>

          {/* Search Box */}
          <div className="bg-white/95 glass-effect rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 ambient-shadow max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-6 gap-3 w-full border-b md:border-b-0 md:border-r border-outline-variant/20">
              <Search className="w-5 h-5 text-outline" strokeWidth={2} />
              <input 
                className="w-full py-4 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60 font-body outline-none" 
                placeholder="¿Qué servicio buscás hoy? (Corte, Color, Uñas...)" 
                type="text"
              />
            </div>
            <div className="flex-1 flex items-center px-6 gap-3 w-full">
              <MapPin className="w-5 h-5 text-outline" strokeWidth={2} />
              <input 
                className="w-full py-4 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60 font-body outline-none" 
                placeholder="Selector de Ubicación" 
                type="text"
              />
            </div>
            <button className="w-full md:w-auto bg-on-surface text-white p-4 md:p-5 rounded-full hover:bg-primary transition-colors flex items-center justify-center">
              <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-20 px-8 bg-surface">
        <div className="max-w-screen-xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Scissors, label: 'Hair' },
            { icon: User, label: 'Barber' },
            { icon: Hand, label: 'Nails' },
            { icon: Eye, label: 'Lashes' },
            { icon: Leaf, label: 'Spa' },
          ].map(cat => (
            <div key={cat.label} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                <cat.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SALONES DESTACADOS */}
      <section className="py-28 px-8 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4 block">Red de Calidad</span>
              <h2 className="font-headline text-4xl md:text-5xl font-medium text-on-surface">Salones Destacados</h2>
            </div>
            <Link href="/explore" className="hidden md:block font-body text-primary font-semibold hover:underline">
              Ver todos los salones
            </Link>
          </div>

          {featuredSalons.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline/30">
              <p className="text-on-surface-variant font-medium">No encontramos salones actualmente destacados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredSalons.map(salon => (
                <PublicSalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN B2B */}
      <section className="py-20 px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border-2 border-secondary/20 bg-surface-container-lowest p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-headline text-3xl md:text-5xl font-semibold text-on-surface mb-6">¿Tenés un salón? Sumate a la red MujerApp</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                Digitalizá tu agenda, gestioná tus clientes y expandí tu alcance con la plataforma líder en servicios de belleza y bienestar.
              </p>
              <Link href="/business">
                <button className="px-10 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-container transition-colors shadow-lg">
                  Comenzar ahora
                </button>
              </Link>
            </div>
            <div className="relative z-10 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt="Salon Owner with Tablet" 
                className="w-80 h-80 object-cover rounded-lg shadow-2xl rotate-3" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtPKf_hQNVcGldbZIzc8nsdexfG_w_yKwCbkR19XHFGsyiqWyL-RcWrb9bWHQWK0x1wPsJobHO1cB2TqIgl5FYvh6C3lyFTuF4iBcE5cZHSgwKRiztQk4XOqLwCSdab1PgfCDSoSdvHAIqS0bcXkojMFMOnHUQw3gX_glab1ElzDtbVpV-HmYYLdWrN0BEp6vr_MpLHbNv3gB19PGaDbjpNt62JKdSO1neAHmnk_LdljIxOdambTXqqHge74Vr5bdrGn9P5icNIyk"
              />
            </div>
            {/* Abstract Accent */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 px-8 tonal-shift from-surface-container-low">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <span className="text-xl font-black text-[#191c1d] dark:text-white uppercase tracking-widest font-label">MujerApp</span>
            <p className="font-label text-xs uppercase tracking-widest text-zinc-500 leading-loose">
              © {new Date().getFullYear()} MujerApp. Sumate a la red de salones. <br/> La elegancia es una actitud.
            </p>
          </div>
          <div className="flex flex-col gap-4 font-label text-xs uppercase tracking-widest">
            <h4 className="text-on-surface font-bold mb-2">Compañía</h4>
            <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="/business">¿Tenés un salón?</Link>
            <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="/business">Centro de ayuda</Link>
            <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="/business">Sobre nosotros</Link>
          </div>
          <div className="flex flex-col gap-4 font-label text-xs uppercase tracking-widest">
            <h4 className="text-on-surface font-bold mb-2">Social</h4>
            <div className="flex gap-6">
              <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="#">Instagram</Link>
              <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="#">Facebook</Link>
              <Link className="text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors duration-200" href="#">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
