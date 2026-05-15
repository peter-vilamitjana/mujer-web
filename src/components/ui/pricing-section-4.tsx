"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {VerticalCutReveal} from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

const plans = [
  {
    key: "free",
    name: "Gratis",
    description: "Para salones que recién arrancan y quieren ordenar su operación sin costo.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Empezar gratis",
    buttonHref: "/business/register",
    buttonVariant: "outline" as const,
    includes: [
      "Incluye:",
      "Agenda inteligente (hasta 50 turnos/mes)",
      "Gestión de clientes básica",
      "1 profesional",
      "1 sucursal",
      "Soporte por email",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    description: "La solución completa para salones en crecimiento que quieren potenciar sus ingresos.",
    price: 14900,
    yearlyPrice: 119900,
    buttonText: "Empezar con Pro",
    buttonHref: "/business/register",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Todo lo de Gratis, más:",
      "Turnos ilimitados · Staff ilimitado",
      "Booking público en marketplace",
      "Cobros online con MercadoPago",
      "Notificaciones WhatsApp automáticas",
      "Sync Google Calendar",
      "Reportes y rendimiento",
      "Soporte prioritario",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    description: "Para cadenas y franquicias con múltiples sucursales que necesitan control total.",
    price: 34900,
    yearlyPrice: 279900,
    buttonText: "Hablar con ventas",
    buttonHref: "https://wa.me/549XXXXXXXXXX",
    buttonVariant: "outline" as const,
    includes: [
      "Todo lo de Pro, más:",
      "Multi-sucursal ilimitado",
      "Analytics avanzado y comparativas",
      "Gestor de comisiones por sucursal",
      "Integración con sistemas de facturación",
      "SLA garantizado",
      "Onboarding personalizado",
    ],
  },
];

const revealVariants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10  rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-purple-600 border-purple-600 bg-gradient-to-t from-purple-500 to-purple-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Mensual</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full  rounded-full border-4 shadow-sm shadow-purple-600 border-purple-600 bg-gradient-to-t from-purple-500 to-purple-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Anual <span className="text-[10px] text-purple-300 font-bold">-30%</span></span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection6() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const togglePricingPeriod = useCallback(
    (value: string) => setIsYearly(Number.parseInt(value) === 1),
    []
  );

  return (
    <div
      className="relative z-10 min-h-screen mx-auto bg-[#09090b] overflow-x-hidden pt-24"
      ref={pricingRef}
    >
      {/* Seamless transition fade from the previous section */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#09090b] to-transparent z-10 pointer-events-none" />
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0  h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] "
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px] "></div>
        <SparklesComp
          density={400}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full will-change-transform"
            style={{
              border: "200px solid #8350e8",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
            data-border="true"
            data-framer-name="Ellipse 1"
          ></div>
        </div>
      </TimelineContent>

      <article className="text-center mb-6 pt-32 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-medium text-white">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center "
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Planes pensados para salones reales
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-300"
        >
          Sin comisiones por turno. Precio fijo en pesos. Cancelá cuando quieras.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at center, #8350e8 0%, transparent 70%)
      `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="grid md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 sm:px-6">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative text-white border-neutral-800 h-full flex flex-col ${
                plan.popular
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#8350e8] z-20"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Más elegido
                  </span>
                </div>
              )}
              <CardHeader className="text-left">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-semibold">Gratis</span>
                  ) : (
                    <>
                      <span className="text-lg font-medium text-gray-400">$</span>
                      <NumberFlow
                        format={{ style: 'decimal', minimumFractionDigits: 0 }}
                        value={isYearly ? Math.round(plan.yearlyPrice / 12) : plan.price}
                        className="text-4xl font-semibold"
                      />
                      <span className="text-gray-300 text-sm ml-1">ARS/mes</span>
                    </>
                  )}
                </div>
                {plan.price > 0 && isYearly && (
                  <p className="text-[11px] text-purple-400 mt-1">
                    ${plan.yearlyPrice.toLocaleString('es-AR')} ARS/año
                  </p>
                )}
                <p className="text-sm text-gray-300 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col flex-1">
                <a
                  href={plan.buttonHref}
                  className={cn(
                    "w-full mb-6 p-4 text-base font-semibold rounded-xl text-center block transition-all",
                    plan.popular
                      ? "bg-gradient-to-t from-purple-500 to-purple-600 shadow-lg shadow-purple-800 border border-purple-500 text-white hover:opacity-90"
                      : "bg-gradient-to-t from-neutral-950 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-800 text-white hover:opacity-80"
                  )}
                >
                  {plan.buttonText}
                </a>

                <div className="space-y-3 pt-4 border-t border-neutral-700 flex-1">
                  <h4 className="font-medium text-sm text-gray-400 mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="h-2 w-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
