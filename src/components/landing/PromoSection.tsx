'use client';
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const promoData = [
    {
        id: 1,
        subtitle: 'TRADICIONAL',
        price: 29999,
        services: ['CORTE', 'LAVADO ESPECIAL', 'BOTOX CAPILAR', 'PEINADO', 'PLANCHITA'],
        badge: null,
    },
    {
        id: 2,
        subtitle: 'TENDENCIA',
        price: 44999,
        services: ['CORTE', 'LAVADO ESPECIAL', 'COLOR DE RAÍZ', 'BRUSHING', 'PLANCHITA'],
        badge: null,
    },
    {
        id: 3,
        subtitle: 'RENOVADA',
        price: 34999,
        services: ['CORTE', 'LAVADO ESPECIAL', 'SHOCK DE KERATINA', 'BRUSHING', 'PLANCHITA'],
        badge: 'MÁS POPULAR',
    },
    {
        id: 4,
        subtitle: 'PREMIUM',
        price: 49999,
        services: ['BALAYAGE', 'BAÑO DE LUZ', 'LAVADO ESPECIAL', 'NUTRICIÓN CAPILAR', 'BRUSHING'],
        badge: 'Premium',
    },
];

const formatPriceParts = (price: number) => {
    const parts = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).formatToParts(price);
    const symbol = parts.find(p => p.type === 'currency')?.value || '$';
    const value = parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
    return { symbol, value };
}

export default function PromoSection({ tenantSlug }: { tenantSlug: string }) {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Header: fade-up simple al entrar en viewport.
    useGSAP(() => {
        if (!headerRef.current) return;
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.from(headerRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        });
        return () => mm.revert();
    }, []);

    // Tarjetas: coreografía en cascada coordinada por sección (ScrollTrigger.batch)
    // en vez de un ScrollReveal individual por tarjeta. Sin animación si el
    // usuario prefiere menos movimiento — las tarjetas quedan visibles directo.
    useGSAP(() => {
        if (!sectionRef.current) return;
        const cards = gsap.utils.toArray<HTMLElement>('[data-reveal="promo-card"]', sectionRef.current);
        if (cards.length === 0) return;

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.set(cards, { autoAlpha: 0, y: 28 });
            const triggers = ScrollTrigger.batch(cards, {
                start: 'top 85%',
                onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', overwrite: true }),
                onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 28 }),
            });
            return () => triggers.forEach((t) => t.kill());
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} id="promotions" className="py-20 sm:py-32 bg-surface">
            <div className="container mx-auto px-4 max-w-[1600px]">
                {/* Mobile Header */}
                <div className="md:hidden mb-12">
                    <p className="text-[9px] font-sans font-bold text-on-surface-variant tracking-[0.4em] uppercase mb-4">EXCLUSIVO ONLINE</p>
                    <h2 className="font-vogue text-4xl font-normal tracking-tight text-on-surface italic">Combos Especiales</h2>
                </div>

                {/* Desktop Header */}
                <div ref={headerRef} className="hidden md:flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-outline-subtle pb-12">
                    <div className="max-w-2xl">
                        <h3 className="font-vogue text-6xl md:text-8xl italic leading-none mb-6 text-on-surface tracking-tighter">
                            Colección <br/><span className="not-italic font-black text-on-surface/20">Curada</span>
                        </h3>
                        <p className="font-sans text-on-surface-variant text-[11px] tracking-[0.5em] uppercase font-bold">Un manifiesto de exclusividad y rigor estético.</p>
                    </div>
                    <Link href={`/salones/${tenantSlug}/turnos`} className="font-sans text-[10px] font-black tracking-[0.4em] uppercase border-b-2 border-on-surface pb-1 hover:opacity-50 transition-all mt-10 md:mt-0 text-on-surface">
                        VER TODO
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-stretch">
                    {promoData.map((promo, index) => (
                        <div key={promo.id} data-reveal="promo-card">
                            <Card className="relative flex flex-col rounded-[2.5rem] p-10 h-full bg-surface-card border border-outline-subtle hover:border-outline transition-all duration-500 group">
                                <CardContent className="p-0 flex flex-col flex-grow relative z-10">
                                    <div className="flex-grow">
                                        {/* Label y badge en el mismo flujo — nunca se superponen, sea cual sea el largo del texto */}
                                        <div className="flex items-center justify-between gap-3 mb-6">
                                            <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-on-surface-secondary font-bold">Combo • 0{index + 1}</p>
                                            {promo.badge && (
                                                <div className="shrink-0 bg-surface text-on-surface px-3 py-1.5 rounded-full border border-outline-subtle flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3 text-primary shrink-0" />
                                                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{promo.badge}</span>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="font-vogue text-3xl mb-8 italic text-on-surface">{promo.subtitle}</h4>

                                        {/* El precio es el protagonista de la tarjeta */}
                                        <div className="my-8 font-vogue text-4xl flex items-baseline gap-2 text-on-surface">
                                            <span className="font-sans text-xl font-light opacity-50">{formatPriceParts(promo.price).symbol}</span>
                                            <span>{formatPriceParts(promo.price).value}</span>
                                        </div>

                                        <ul className="space-y-2 text-left my-10 border-t border-outline-subtle pt-8">
                                            {promo.services.map((service, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <div className="h-[3px] w-[3px] rounded-full bg-on-surface-secondary/60 flex-shrink-0" />
                                                    <span className="font-sans text-sm text-on-surface-secondary">{service}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        <Button asChild size="lg" className="w-full bg-primary text-surface hover:bg-primary-dark rounded-full px-8 py-3 font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                                            <Link href={`/salones/${tenantSlug}/turnos`}>
                                                Seleccionar
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
