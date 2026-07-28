'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function CTAFinalSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // 5-step orchestrated timeline — all entrances coordinated, looping FM effects run independently.
  useGSAP(() => {
    if (shouldReduce) return;

    const titleEl = sectionRef.current?.querySelector<HTMLElement>('.cta-title');
    if (!titleEl) return;
    
    gsap.set(titleEl, { opacity: 1 });

    const split = new SplitText(titleEl, { type: 'words,chars' });

    split.words.forEach((word) => {
      const w = word as HTMLElement;
      w.style.overflow = 'hidden';
      w.style.display = 'inline-block';
      w.style.verticalAlign = 'bottom';
    });

    const chars = split.chars as HTMLElement[];

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.cta-final',
        start: 'top 70%',
        once: true,
      },
      onComplete: () => split.revert(),
    });

    // 2 — headline chars come up from below with blur clearing
    tl.fromTo(
      chars,
      { yPercent: 110, opacity: 0, filter: 'blur(6px)' },
      {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: 0.02,
        ease: 'power3.out',
      },
      '-=1',
    );

    // 3 — body copy fades in
    tl.fromTo(
      '.cta-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4',
    );

    // 4 — CTA button bounces in
    tl.fromTo(
      '.cta-button',
      { opacity: 0, scale: 0.85, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' },
      '-=0.3',
    );

    // 5 — badge row fades up
    tl.fromTo(
      '.cta-badges',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3',
    );
  }, { scope: sectionRef, dependencies: [shouldReduce] });

  return (
    <section
      ref={sectionRef}
      className="cta-final relative z-10 bg-[#09090b] overflow-hidden"
    >
      {/* Ambient background glows */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden" 
        aria-hidden="true"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <div className="absolute top-0 h-[600px] w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
          <SparklesComp
            density={400}
            direction="bottom"
            speed={1}
            color="#FFFFFF"
            className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          />
        </div>
        
        <div className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0">
          <div className="w-full relative">
            <div
              className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full will-change-transform"
              style={{
                border: "200px solid #8350e8",
                filter: "blur(92px)",
                WebkitFilter: "blur(92px)",
              }}
            />
          </div>
        </div>

        <div
          className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
          style={{
            backgroundImage: "radial-gradient(circle at center, #8350e8 0%, transparent 70%)",
            opacity: 0.6,
          }}
        />
      </div>

      <div className="relative z-10 py-36 px-6 text-center max-w-3xl mx-auto">

        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-8">
          Empezá hoy
        </p>

        {/* Headline — SplitText splits chars, GSAP reveals them in step 2 */}
        <h2
          className="cta-title font-semibold text-[clamp(3.5rem,8vw,6rem)] leading-[1.05] tracking-tight mb-8"
          aria-label="Ouleeh"
          style={{
            ...(shouldReduce ? {} : { opacity: 0 }),
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
          }}
        >
          Ouleeh
        </h2>

        {/* Body — GSAP step 3 */}
        <p
          className="cta-subtitle text-zinc-400 text-[clamp(1rem,2vw,1.15rem)] leading-[1.75] mb-12"
          style={shouldReduce ? undefined : { opacity: 0 }}
        >
          Gratis para siempre en el plan base.{' '}
          <span className="text-zinc-500">Sin permanencia, sin letra chica.</span>
        </p>

        {/* CTA button — GSAP step 4 */}
        <div
          className="cta-button flex flex-col items-center gap-5"
          style={shouldReduce ? undefined : { opacity: 0 }}
        >
          <div className="relative group">
            {!shouldReduce && (
              <motion.div
                className="absolute -inset-[3px] rounded-full pointer-events-none"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,255,255,0.10)',
                    '0 0 45px rgba(255,255,255,0.22)',
                    '0 0 20px rgba(255,255,255,0.10)',
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <Link
              href="/business/register"
              className="relative overflow-hidden inline-flex items-center gap-3.5 px-12 py-5 rounded-full
                bg-white text-zinc-950 font-bold text-sm tracking-wide min-h-[52px]
                shadow-[0_0_50px_rgba(255,255,255,0.20)] hover:shadow-[0_0_80px_rgba(255,255,255,0.35)]
                hover:bg-zinc-50 active:scale-[0.97] transition-all duration-200 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Registrá tu salón gratis en Ouleeh"
            >
              {!shouldReduce && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 w-1/3 rounded-full"
                  style={{
                    background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.60) 50%, transparent 100%)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '350%' }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
              )}
              Registrá tu salón gratis
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 shrink-0"
                aria-hidden="true"
              />
            </Link>
          </div>

          <p className="text-zinc-600 text-xs tracking-wide">
            Sin tarjeta de crédito · Configuración en 5 minutos
          </p>
        </div>

        {/* Badge row — GSAP step 5 */}
        <div
          className="cta-badges mt-16 flex flex-wrap items-center justify-center gap-2.5"
          aria-hidden="true"
          style={shouldReduce ? undefined : { opacity: 0 }}
        >
          {[
            { text: 'Hecho para Argentina', prefix: '🇦🇷' },
            { text: 'MercadoPago nativo',   prefix: null },
            { text: 'WhatsApp nativo',      prefix: null },
            { text: 'Dark mode premium',    prefix: null },
          ].map(({ text, prefix }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 px-4 py-1.5 rounded-full
                backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]
                hover:border-white/[0.14] hover:text-zinc-400 transition-colors duration-200"
            >
              {prefix && <span className="text-sm leading-none">{prefix}</span>}
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
