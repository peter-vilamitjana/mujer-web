'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ScrollReveal';
import { useCatalog } from '@/hooks/useCatalog';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
}

const formatPriceParts = (price: number) => {
    const parts = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).formatToParts(price);
    const symbol = parts.find(p => p.type === 'currency')?.value || '$';
    const value = parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
    return { symbol, value };
}

export default function PromoSection() {
    const { promotions, loading } = useCatalog();

    // Sort accordingly if needed, or rely on catalog service query
    const sortedPromotions = [...promotions].sort((a, b) => a.price - b.price);

    if (loading) {
        return (
            <section id="promotions" className="py-20 sm:py-28 bg-[#F2F2F7]/50 min-h-[600px] flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </section>
        )
    }

    if (promotions.length === 0) return null;

    return (
        <section id="promotions" className="py-20 sm:py-28 bg-[#F2F2F7]/50">
            <div className="container mx-auto px-4">
                {/* Mobile Header */}
                <div className="md:hidden mb-8">
                    <p className="text-[10px] font-bold text-[#9D6EFE] tracking-[0.2em] mb-2">EXCLUSIVO ONLINE</p>
                    <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">Combos Especiales</h2>
                </div>

                {/* Desktop Header */}
                <ScrollReveal>
                    <div className="hidden md:block text-center mb-16">
                        <div className="inline-block text-primary">
                            <Scissors className="h-8 w-8" />
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-4">Nuestros Combos Especiales</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Combos pensados para darte una experiencia completa de renovación y cuidado, a un precio especial que te va a encantar.</p>
                    </div>
                </ScrollReveal>

                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-8 flex gap-4 snap-x snap-mandatory hide-scrollbar">
                    {sortedPromotions.map((promo, index) => (
                        <div key={promo.id} className="min-w-[280px] snap-center">
                            <Card className={cn(
                                "relative flex flex-col rounded-[2.5rem] p-8 h-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.03] transition-all duration-300",
                                {
                                    'ring-1 ring-[#9D6EFE]/20': promo.type === 'popular' || promo.type === 'premium'
                                }
                            )}>
                                {promo.badge && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#9D6EFE] rounded-full shadow-sm">
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest leading-none block">{promo.badge}</span>
                                    </div>
                                )}
                                <CardContent className="p-0 flex flex-col h-full">
                                    <h3 className="font-serif text-xl font-bold text-foreground mb-4">{promo.title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium mb-6 leading-relaxed">
                                        {promo.services.join(', ')}
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex flex-col mb-4">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Desde</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-black">{formatPrice(promo.price)}</span>
                                                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white">
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                    {sortedPromotions.map((promo, index) => (
                        <ScrollReveal key={promo.id} delay={index * 0.1}>
                            <Card className={cn(
                                "relative flex flex-col rounded-2xl text-center transition-all duration-500 transform hover:translate-y-[-4px] group p-8 h-full",
                                {
                                    'bg-card shadow-lg hover:shadow-primary/20 border-border/50': promo.type === 'standard',
                                    'bg-[#F5F3FF] border-[#DDD6FE] shadow-md hover:shadow-violet-300/30': promo.type === 'warm',
                                    'bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-[#E9D5FF] shadow-lg text-[#4C1D95] hover:shadow-purple-300/40': promo.type === 'popular',
                                    'bg-[linear-gradient(339deg,#020024_0%,#540979_53%,#9D00FF_100%)] text-white shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)] border-0 ring-2 ring-white/10 lg:scale-105 z-20 hover:shadow-[0_0_80px_-10px_rgba(139,92,246,0.8)]': promo.type === 'premium'
                                }
                            )}>
                                {promo.type === 'popular' && (
                                    <div className="absolute inset-0 rounded-2xl transition-all duration-500 [box-shadow:inset_0_0_20px_rgba(168,85,247,0.1)] group-hover:[box-shadow:inset_0_0_30px_rgba(168,85,247,0.2)]" />
                                )}

                                {promo.type === 'premium' && (
                                    <div className="absolute inset-0 rounded-2xl transition-all duration-500 [box-shadow:inset_0_0_60px_rgba(139,92,246,0.3),inset_0_0_20px_rgba(139,92,246,0.2)] group-hover:[box-shadow:inset_0_0_80px_rgba(139,92,246,0.5),inset_0_0_30px_rgba(167,139,250,0.3)]" />
                                )}

                                {promo.type === 'premium' && (
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                                        <div className="absolute -top-[30%] -left-[30%] w-[160%] h-[160%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                                        <div className="absolute top-[20%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.1)_0%,transparent_60%)] animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                                        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_0%,transparent_40%,rgba(139,92,246,0.03)_100%)]" />
                                    </div>
                                )}

                                {promo.badge && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                        <div className={cn(
                                            "text-xs font-semibold uppercase px-4 py-1.5 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110",
                                            {
                                                'bg-primary text-primary-foreground': promo.type === 'popular',
                                                'bg-white text-black font-bold tracking-tight shadow-[0_0_15px_rgba(255,255,255,0.5)]': promo.type === 'premium'
                                            }
                                        )}>
                                            {promo.badge}
                                        </div>
                                    </div>
                                )}
                                <CardContent className="p-0 flex flex-col flex-grow relative z-10">
                                    <div className="flex-grow">
                                        <p className={cn(
                                            "font-serif text-2xl font-normal tracking-wide uppercase mt-1",
                                            (promo.type === 'premium') ? 'text-white/90 font-thin' : promo.type === 'popular' ? 'text-primary font-normal' : 'text-foreground'
                                        )}>{promo.title}</p>
                                        <div className={cn(
                                            "my-6 font-semibold text-4xl flex items-baseline justify-center gap-2 transition-transform duration-500 group-hover:scale-110",
                                            {
                                                'text-primary': promo.type === 'standard',
                                                'text-[#7C3AED]': promo.type === 'warm',
                                                'text-[#6D28D9]': promo.type === 'popular',
                                                'text-white': promo.type === 'premium'
                                            }
                                        )}>
                                            <span className="font-sans text-2xl opacity-80">{formatPriceParts(promo.price).symbol}</span>
                                            <span className="font-serif tracking-tight">{formatPriceParts(promo.price).value}</span>
                                        </div>
                                        <ul className="space-y-3 text-left my-8">
                                            {promo.services.map((service, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all duration-300 group-hover:scale-150",
                                                        {
                                                            'bg-muted-foreground': promo.type === 'standard',
                                                            'bg-[#A78BFA]': promo.type === 'warm' || promo.type === 'popular',
                                                            'bg-primary': promo.type === 'premium'
                                                        }
                                                    )} />
                                                    <span className={cn(
                                                        "text-sm uppercase font-medium",
                                                        {
                                                            'text-muted-foreground': promo.type === 'standard' || promo.type === 'popular',
                                                            'text-[#5B21B6]': promo.type === 'warm',
                                                            'text-gray-300': promo.type === 'premium'
                                                        }
                                                    )}>{service}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-auto pt-8">
                                        <Link href="/login" className="w-full">
                                            <Button
                                                size="lg"
                                                variant={(promo.type === 'premium') ? 'default' : 'outline'}
                                                className={cn("w-full uppercase tracking-wider rounded-full py-7 font-bold transition-all duration-500 active:scale-95 focus-visible:ring-offset-2",
                                                    {
                                                        'border-primary/20 hover:bg-primary/5': promo.type === 'standard',
                                                        'bg-transparent border-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/5': promo.type === 'warm',
                                                        'bg-white text-primary hover:bg-white/90 shadow-[0_0_30px_rgba(139,92,246,0.6)]': promo.type === 'premium',
                                                        'bg-primary text-white hover:bg-primary/90 shadow-md': promo.type === 'popular',
                                                    }
                                                )}>
                                                Seleccionar
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
