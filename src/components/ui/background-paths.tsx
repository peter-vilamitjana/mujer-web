"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

// ── Capa de paths animados ──────────────────────────────────────────────────
// Usa pathLength (draw-in/out) + opacity, nunca pathOffset (causa reset-flash).
// Easing por fase: easeOut al entrar, easeIn al salir → fluido sin cortes.
// Delay escalonado sin Math.random() para evitar hydration mismatch.

const PATH_COUNT = 20;

function FloatingPaths({ position }: { position: number }) {
  const prefersReduced = useReducedMotion();

  const paths = Array.from({ length: PATH_COUNT }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width:      0.3 + i * 0.04,
    maxOpacity: 0.07 + i * 0.012,
    duration:   22 + (i % 8) * 4,
    delay:      (i * 1.7) % 16,
    repeatDelay:(i % 4) * 2,
  }));

  // Sin animaciones: mostrar subset estático como fallback visual
  if (prefersReduced) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg
          className="w-full h-full text-[#0a0a0a] dark:text-white"
          viewBox="0 0 696 316"
          fill="none"
          aria-hidden="true"
        >
          {paths.slice(0, 10).map((p) => (
            <path
              key={p.id}
              d={p.d}
              stroke="currentColor"
              strokeWidth={p.width}
              strokeOpacity={p.maxOpacity * 0.6}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-[#0a0a0a] dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden="true"
        style={{ willChange: "contents" }}
      >
        {paths.map((p) => (
          <motion.path
            key={p.id}
            d={p.d}
            stroke="currentColor"
            strokeWidth={p.width}
            strokeLinecap="round"
            // draw-in 0→55%, hold brief, fade-out 55→100%
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity:    [0, p.maxOpacity, 0],
            }}
            transition={{
              duration:    p.duration,
              times:       [0, 0.55, 1],
              ease:        ["easeOut", "easeIn"],
              repeat:      Infinity,
              delay:       p.delay,
              repeatDelay: p.repeatDelay,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Variantes de animación coordinadas ─────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeUpVariant = {
  hidden:  { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)" },
};

// ── Componente principal ────────────────────────────────────────────────────
export function BackgroundPaths({
  title = "Background Paths",
  subtitle,
  cta,
  stats,
}: {
  title?: string;
  subtitle?: string;
  cta?: {
    label: string;
    href: string;
    secondary?: { label: string; href: string };
  };
  stats?: Array<{ value: string; label: string }>;
}) {
  const words = title.split(" ");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#050505]">

      {/* ── Capa 1: Glows de profundidad ── */}
      {/* Glow verde sutil top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-5%",
          width: "60%",
          height: "70%",
          background: "radial-gradient(ellipse at top right, rgba(34,197,94,0.06) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      {/* Glow blanco central — eleva el contenido visualmente */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      {/* Glow bottom-left frío */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "0",
          left: "-10%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(ellipse at bottom left, rgba(255,255,255,0.015) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* ── Capa 2: Paths animados ── */}
      <div className="absolute inset-0 z-10">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* ── Capa 3: Vignette de bordes — oscurece perimetro para dar foco central ── */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(5,5,5,0.35) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Capa 4: Contenido ── */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-6 md:px-10 text-center pt-24 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >

          {/* Badge */}
          <motion.div
            variants={fadeUpVariant}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full
              bg-black/[0.06] dark:bg-white/[0.06]
              border border-black/[0.1] dark:border-white/[0.1]
              backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.38em] text-[#0a0a0a]/55 dark:text-white/45 font-inter">
              Elite Business Solution
            </span>
          </motion.div>

          {/* ── Headline letra a letra ── */}
          {/* Nota: cada letra usa spring individual para rebote natural */}
          <h1 className="font-vogue text-6xl sm:text-8xl md:text-[7.5rem] leading-[0.86] tracking-tight">
            {words.map((word, wIdx) => (
              <span key={wIdx} className="inline-block mr-[0.2em] last:mr-0">
                {word.split("").map((letter, lIdx) => (
                  <motion.span
                    key={`${wIdx}-${lIdx}`}
                    initial={{ y: 60, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      delay:     0.35 + wIdx * 0.1 + lIdx * 0.025,
                      type:      "spring",
                      stiffness: 100,
                      damping:   30,
                      mass:      0.8,
                    }}
                    className={`inline-block text-transparent bg-clip-text ${
                      wIdx === words.length - 1
                        ? "bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a]/70 dark:from-white dark:to-white/70"
                        : "bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a]/90 dark:from-white dark:to-white/90"
                    }`}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle — contraste fijo respecto a versión anterior */}
          {subtitle && (
            <motion.p
              variants={fadeUpVariant}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              className="text-base md:text-lg leading-relaxed max-w-lg mx-auto font-inter font-light
                text-[#0a0a0a]/65 dark:text-white/52"
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          {cta && (
            <motion.div
              variants={fadeUpVariant}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {/* CTA primario — glass con borde degradado */}
              <div className="group relative p-px rounded-2xl
                bg-gradient-to-b from-black/15 to-white/15 dark:from-white/15 dark:to-black/15
                shadow-lg hover:shadow-xl transition-shadow duration-300
                hover:shadow-green-500/10"
              >
                <Link
                  href={cta.href}
                  className="flex items-center gap-3 rounded-[1.1rem] px-8 py-4
                    font-inter font-black text-[10px] uppercase tracking-widest
                    backdrop-blur-md
                    bg-white/96 hover:bg-white dark:bg-black/96 dark:hover:bg-black
                    text-[#0a0a0a] dark:text-white
                    border border-black/10 dark:border-white/12
                    transition-all duration-300
                    group-hover:-translate-y-0.5
                    group-hover:shadow-[0_0_28px_rgba(34,197,94,0.18)]
                    cursor-pointer whitespace-nowrap"
                >
                  <span className="transition-opacity duration-200 opacity-90 group-hover:opacity-100">
                    {cta.label}
                  </span>
                  <span className="opacity-55 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </Link>
              </div>

              {/* CTA secundario */}
              {cta.secondary && (
                <Link
                  href={cta.secondary.href}
                  className="px-8 py-4 rounded-2xl backdrop-blur-sm
                    border border-black/12 dark:border-white/10
                    text-[#0a0a0a]/58 dark:text-white/45
                    text-[10px] font-bold uppercase tracking-widest font-inter
                    hover:border-black/25 hover:text-[#0a0a0a]/82
                    dark:hover:border-white/22 dark:hover:text-white/72
                    transition-all duration-300 cursor-pointer"
                >
                  {cta.secondary.label}
                </Link>
              )}
            </motion.div>
          )}

          {/* Social proof */}
          {stats && stats.length > 0 && (
            <motion.div
              variants={fadeUpVariant}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.3 }}
              className="flex items-center gap-8 pt-1"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="font-vogue text-2xl md:text-3xl text-[#0a0a0a] dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.22em] font-inter mt-1
                      text-[#0a0a0a]/45 dark:text-white/35">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-8 bg-black/12 dark:bg-white/12" />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Fine print */}
          <motion.p
            variants={fadeUpVariant}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.55 }}
            className="text-[10px] font-inter italic text-[#0a0a0a]/32 dark:text-white/22"
          >
            Sin contratos. Sin tarjeta de crédito. Onboarding en 10 minutos.
          </motion.p>

        </motion.div>
      </div>

      {/* ── Capa 5: Fade bottom — transición suave hacia la siguiente sección ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0) 30%, rgba(5,5,5,0.6) 80%, rgba(5,5,5,1) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Versión light mode */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-40 pointer-events-none dark:hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,1) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50
          flex flex-col items-center gap-2 opacity-25"
        aria-hidden="true"
      >
        <span className="text-[8px] uppercase tracking-[0.38em] font-inter text-[#0a0a0a] dark:text-white">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-7 bg-[#0a0a0a] dark:bg-white"
        />
      </motion.div>

    </div>
  );
}
