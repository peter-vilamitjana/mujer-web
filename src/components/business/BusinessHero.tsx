'use client';

import { HeroLanding } from '@/components/ui/hero-1';

export default function BusinessHero() {
  return (
    <HeroLanding
      title={
        <>
          Tu salón, <span className="italic text-purple-400">sin el caos.</span>
        </>
      }
      description="Agenda inteligente, clientes fidelizados y cobros simples — todo en una plataforma diseñada para salones de Argentina."
      announcementBanner={{
        text: "OULEEH PARA NEGOCIOS",
        linkText: "Conocé más",
        linkHref: "#como-funciona"
      }}
      callToActions={[
        {
          text: "Empezar gratis",
          href: "/business/register",
          variant: "primary"
        },
        {
          text: "Ver cómo funciona",
          href: "#como-funciona",
          variant: "secondary"
        }
      ]}
      gradientColors={{
        from: "#a855f7", // purple-500
        to: "#7e22ce" // purple-700
      }}
    />
  );
}
