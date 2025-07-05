'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Scissors, Asterisk } from 'lucide-react';
import Link from 'next/link';

const combos = [
  {
    number: "01",
    title: "PROMO TRADICIONAL",
    price: "29.999",
    services: [
      "CORTE",
      "LAVADO ESPECIAL",
      "BOTOX CAPILAR",
      "PEINADO",
      "PLANCHITA",
    ],
    isPopular: false,
    isExclusive: false,
  },
  {
    number: "03",
    title: "PROMO RENOVADA",
    price: "34.999",
    services: [
      "CORTE",
      "LAVADO ESPECIAL",
      "SHOCK DE KERATINA",
      "BRUSHING",
      "PLANCHITA",
    ],
    isPopular: true,
    isExclusive: false,
  },
  {
    number: "02",
    title: "PROMO TENDENCIA",
    price: "44.999",
    services: [
      "CORTE",
      "LAVADO ESPECIAL",
      "COLOR DE RAÍZ",
      "BRUSHING",
      "PLANCHITA",
    ],
    isPopular: false,
    isExclusive: false,
  },
  {
    number: "04",
    title: "PROMO EXCLUSIVA",
    price: "49.999",
    services: [
      "BALAYAGE",
      "BAÑO DE LUZ",
      "LAVADO ESPECIAL",
      "NUTRICIÓN CAPILAR",
      "BRUSHING",
    ],
    isPopular: false,
    isExclusive: true,
  },
];

export default function Combos() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-foreground/80">
            Combos Especiales
          </h2>
          <div className="flex justify-center items-center my-4 max-w-xs mx-auto">
            <div className="flex-grow border-t border-gray-300"></div>
            <Scissors className="h-5 w-5 mx-4 text-muted-foreground" />
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Reservá tu turno y olvidate de esperar. <br className="sm:hidden" />
            Podés pagar online con todas las tarjetas!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {combos.map((combo) => (
            <Card
              key={combo.title}
              className={cn(
                "flex flex-col text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative bg-card pt-2",
                {
                  "border-2 border-primary shadow-lg": combo.isExclusive,
                  "shadow-xl": combo.isPopular,
                  "border border-dashed": !combo.isPopular && !combo.isExclusive,
                }
              )}
            >
              {combo.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1.5 rounded-md shadow-lg">
                    Más Populares
                </div>
              )}
              <div className="p-8 flex flex-col flex-grow">
                <div className="mt-4">
                  <p className="text-lg font-bold tracking-widest text-foreground/70">{combo.number}. PROMO</p>
                  <h3 className="text-2xl font-light tracking-wider uppercase text-foreground/90">{combo.title}</h3>
                </div>
                <div className="my-6">
                    <p className="text-sm text-muted-foreground">Desde</p>
                    <p className="text-5xl font-bold text-primary">${combo.price}</p>
                </div>
                <ul className="space-y-3 text-left flex-grow">
                    {combo.services.map((service, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <Asterisk className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{service}</span>
                        </li>
                    ))}
                </ul>
                <Link href="/turnos" className="mt-8">
                  <Button
                    size="lg"
                    variant={combo.isPopular || combo.isExclusive ? 'default' : 'outline'}
                    className="w-full uppercase tracking-widest font-bold"
                  >
                    Seleccionar
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
