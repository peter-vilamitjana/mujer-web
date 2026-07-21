'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';

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
    return (
        <section id="promotions" className="py-20 sm:py-32 bg-surface">
            <div className="container mx-auto px-4 max-w-[1600px]">
                {/* Mobile Header */}
                <div className="md:hidden mb-12">
                    <p className="text-[9px] font-sans font-bold text-on-surface-variant tracking-[0.4em] uppercase mb-4">EXCLUSIVO ONLINE</p>
                    <h2 className="font-vogue text-4xl font-normal tracking-tight text-on-surface italic">Combos Especiales</h2>
                </div>

                {/* Desktop Header */}
                <ScrollReveal>
                    <div className="hidden md:flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-outline-subtle pb-12">
                        <div className="max-w-2xl">
                            <h3 className="font-vogue text-6xl md:text-8xl italic leading-none mb-6 text-on-surface tracking-tighter">
                                Colección <br/><span className="not-italic font-black text-on-surface/20">Curada</span>
                            </h3>
                            <p className="font-sans text-on-surface-variant text-[11px] tracking-[0.5em] uppercase font-bold">Un manifiesto de exclusividad y rigor estético.</p>
                        </div>
                        <Link href={`/salones/${tenantSlug}/book`} className="font-sans text-[10px] font-black tracking-[0.4em] uppercase border-b-2 border-on-surface pb-1 hover:opacity-50 transition-all mt-10 md:mt-0 text-on-surface">
                            VER TODO
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-stretch">
                    {promoData.map((promo, index) => (
                        <ScrollReveal key={promo.id} delay={index * 0.1}>
                            <Card className="relative flex flex-col rounded-[2.5rem] p-10 h-full bg-surface-card border border-outline-subtle hover:border-outline transition-all duration-500 group">
                                {promo.badge && (
                                    <div className="absolute top-8 right-8">
                                        <div className="bg-surface text-on-surface px-4 py-2 rounded-full border border-outline-subtle flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 text-primary" />
                                            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em]">{promo.badge}</span>
                                        </div>
                                    </div>
                                )}

                                <CardContent className="p-0 flex flex-col flex-grow relative z-10 pt-2">
                                    <div className="flex-grow">
                                        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-on-surface-variant font-bold mb-4">Combo • 0{index + 1}</p>
                                        <h4 className="font-vogue text-3xl mb-8 italic text-on-surface">{promo.subtitle}</h4>

                                        <div className="my-8 font-vogue text-5xl flex items-baseline gap-2 text-on-surface">
                                            <span className="font-sans text-2xl font-light opacity-50">{formatPriceParts(promo.price).symbol}</span>
                                            <span>{formatPriceParts(promo.price).value}</span>
                                        </div>

                                        <ul className="space-y-4 text-left my-10 border-t border-outline-subtle pt-8">
                                            {promo.services.map((service, idx) => (
                                                <li key={idx} className="flex items-center gap-4">
                                                    <div className="h-[2px] w-[2px] bg-on-surface/80 flex-shrink-0" />
                                                    <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-secondary">{service}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        <Link href={`/salones/${tenantSlug}/book`} className="w-full">
                                            <Button
                                                size="lg"
                                                className="w-full bg-surface border border-outline-subtle hover:bg-primary text-on-surface hover:text-surface uppercase tracking-[0.3em] rounded-full py-7 h-auto text-[10px] font-sans font-black transition-all duration-300 group-hover:bg-primary group-hover:text-surface"
                                            >
                                                SELECCIONAR
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
