"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    duration: 20 + (i % 7) * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-[#0a0a0a] dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.04 + path.id * 0.008}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "Background Paths",
  subtitle,
  cta,
  stats,
}: {
  title?: string;
  subtitle?: string;
  cta?: { label: string; href: string; secondary?: { label: string; href: string } };
  stats?: Array<{ value: string; label: string }>;
}) {
  const words = title.split(" ");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#050505]">
      {/* Animated paths — two mirrored layers */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/[0.08]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#0a0a0a]/40 dark:text-white/35 font-inter">
              Elite Business Solution
            </span>
          </motion.div>

          {/* Headline — letter-by-letter spring animation */}
          <h1 className="font-vogue text-6xl sm:text-8xl md:text-[7.5rem] leading-[0.86] tracking-tight">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.4 + wordIndex * 0.12 + letterIndex * 0.035,
                      type: "spring",
                      stiffness: 140,
                      damping: 22,
                    }}
                    className={`inline-block text-transparent bg-clip-text ${
                      wordIndex === words.length - 1
                        ? "bg-gradient-to-r from-[#0a0a0a]/45 to-[#0a0a0a]/20 dark:from-white/35 dark:to-white/12"
                        : "bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a]/80 dark:from-white dark:to-white/80"
                    }`}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-base md:text-lg text-[#0a0a0a]/45 dark:text-white/35 font-light leading-relaxed max-w-lg mx-auto font-inter"
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.45, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <div className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link
                  href={cta.href}
                  className="flex items-center gap-3 rounded-[1.1rem] px-8 py-4 font-inter font-black text-[10px] uppercase tracking-widest
                    backdrop-blur-md bg-white/95 hover:bg-white dark:bg-black/95 dark:hover:bg-black
                    text-[#0a0a0a] dark:text-white border border-black/10 dark:border-white/10
                    transition-all duration-300 group-hover:-translate-y-0.5 hover:shadow-md
                    dark:hover:shadow-black/50 cursor-pointer whitespace-nowrap"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    {cta.label}
                  </span>
                  <span className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </Link>
              </div>

              {cta.secondary && (
                <Link
                  href={cta.secondary.href}
                  className="px-8 py-4 rounded-2xl border border-black/12 dark:border-white/10
                    text-[#0a0a0a]/50 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest font-inter
                    hover:border-black/25 hover:text-[#0a0a0a]/80 dark:hover:border-white/22 dark:hover:text-white/70
                    transition-all duration-300 cursor-pointer backdrop-blur-md"
                >
                  {cta.secondary.label}
                </Link>
              )}
            </motion.div>
          )}

          {/* Social proof stats */}
          {stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="flex items-center gap-8 pt-2"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="font-vogue text-2xl md:text-3xl text-[#0a0a0a] dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.22em] text-[#0a0a0a]/28 dark:text-white/20 font-inter mt-1">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Fine print */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-[10px] font-inter italic text-[#0a0a0a]/22 dark:text-white/15"
          >
            Sin contratos. Sin tarjeta de crédito. Onboarding en 10 minutos.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20"
        aria-hidden="true"
      >
        <span className="text-[8px] uppercase tracking-[0.35em] font-inter text-[#0a0a0a] dark:text-white">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-[#0a0a0a] dark:bg-white"
        />
      </motion.div>
    </div>
  );
}
