"use client";
import React, { useRef } from "react";
import {
  useScroll, useTransform, motion,
  MotionValue, useSpring, useMotionTemplate,
} from "framer-motion";

// macOS traffic-light buttons
const TRAFFIC = [
  { bg: "#FF5F57" },
  { bg: "#FFBD2E" },
  { bg: "#28C840" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ContainerScroll
// ─────────────────────────────────────────────────────────────────────────────

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // More liquid spring — feels like Apple product page momentum
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scale strategy:
  // Desktop [1.05 → 0.82]: slight overshoot compensates perspective foreshortening.
  // Final 0.82 keeps ~18% margin on each side so the dark bg always frames the card.
  // Mobile [0.82 → 0.72]: always decreasing — card "lands" into the frame.
  const scaleDimensions = () => (isMobile ? [0.82, 0.72] : [1.05, 0.82]);

  // 28° start → more dramatic, cinematic tilt (Apple-style product reveal)
  const rotate    = useTransform(smoothProgress, [0, 1], [28, 0]);
  const scale     = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -50]);

  // Ambient violet glow — vivid at max tilt, nearly gone when flat
  const glowA = useTransform(smoothProgress, [0, 1], [0.32, 0.08]);
  const glowB = useTransform(smoothProgress, [0, 1], [0.20, 0.04]);

  // Floor glow — simulates the card projecting light on the surface below it
  const floorGlow = useTransform(smoothProgress, [0, 0.5, 1], [0.28, 0.14, 0.05]);

  // Top-edge specular — bright glass bevel when tilted, almost gone when flat
  const topEdge = useTransform(smoothProgress, [0, 0.5, 1], [0.88, 0.45, 0.14]);

  // Glare sweep: enters from above (-65%) and exits below (+100%)
  const glareY       = useTransform(smoothProgress, [0, 1], ["-65%", "100%"]);
  const glareOpacity = useTransform(smoothProgress, [0, 0.65, 1], [0.88, 0.22, 0.0]);

  return (
    // pb-20 md:pb-32: generous bottom padding so the floor-glow never clips
    <div
      className="h-[56rem] md:h-[84rem] flex items-center justify-center relative
        px-6 md:px-12 pt-2 pb-20 md:pb-32 overflow-x-hidden"
      ref={containerRef}
    >
      {/* perspective: 1400px — subtler vanishing point, feels more realistic
          1200px was slightly aggressive; 1400px gives that Apple "gentle tilt" look. */}
      <div
        className="py-10 md:py-20 w-full relative"
        style={{ perspective: "1400px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          glowA={glowA}
          glowB={glowB}
          floorGlow={floorGlow}
          topEdge={topEdge}
          glareY={glareY}
          glareOpacity={glareOpacity}
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

export const Card = ({
  rotate,
  scale,
  glowA,
  glowB,
  floorGlow,
  topEdge,
  glareY,
  glareOpacity,
  children,
}: {
  rotate:        MotionValue<number>;
  scale:         MotionValue<number>;
  translate:     MotionValue<number>;
  glowA:         MotionValue<number>;
  glowB:         MotionValue<number>;
  floorGlow:     MotionValue<number>;
  topEdge:       MotionValue<number>;
  glareY:        MotionValue<string>;
  glareOpacity:  MotionValue<number>;
  children:      React.ReactNode;
}) => {
  // Multi-layer shadow stack — depth + ambient violet glow
  // Layers: contact shadow · mid-field shadow · ambient shadow · outer ambient
  //         inner rim · outer rim · violet halo · violet ambient
  const boxShadow = useMotionTemplate`inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(255,255,255,0.07), 0 1px 1px rgba(0,0,0,0.35), 0 8px 16px rgba(0,0,0,0.40), 0 24px 48px -8px rgba(0,0,0,0.60), 0 56px 80px -16px rgba(0,0,0,0.40), 0 96px 120px -24px rgba(0,0,0,0.22), 0 0 80px rgba(139,92,246,${glowA}), 0 0 180px rgba(109,40,217,${glowB})`;

  return (
    // Entrance wrapper — card sharpens into focus on mount while already tilted.
    // No opacity/y offset: the tilt is visible from frame 1, just initially soft.
    <motion.div
      initial={{ filter: "blur(18px)" }}
      animate={{ filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-5xl mt-6 mx-auto"
    >
      {/* ── Floor glow ──────────────────────────────────────────────────────── */}
      {/* Simulates the product casting violet light on the surface below it.   */}
      {/* Apple product pages always have this under-card ambient reflection.   */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-16 inset-x-12 h-32 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(139,92,246,0.40) 0%, rgba(109,40,217,0.18) 40%, transparent 70%)",
          opacity: floorGlow,
          filter: "blur(32px)",
        }}
      />

      {/* ── Outer card frame ─────────────────────────────────────────────── */}
      {/* bg-[#111113]: slightly lighter than pure black so the inner screen   */}
      {/* stands out as a distinct darker plane — genuine depth layering.      */}
      {/* p-[6px]: slim Apple-style bezel (reduced from previous p-5).         */}
      <motion.div
        style={{ rotateX: rotate, scale, boxShadow }}
        className="w-full h-[28rem] md:h-[44rem]
          border border-white/[0.08] p-[5px] md:p-[7px]
          bg-[#111113] rounded-[28px] relative overflow-visible"
      >
        {/* Top specular edge — mimics the physical glass bevel on Apple devices. */}
        {/* Rendered OUTSIDE the inner screen clip so it sits on the frame rim.   */}
        <motion.div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-[2px] rounded-t-[28px] pointer-events-none z-30"
          style={{
            background:
              "linear-gradient(to right, transparent 4%, rgba(255,255,255,0.22) 25%, rgba(255,255,255,0.48) 50%, rgba(255,255,255,0.22) 75%, transparent 96%)",
            opacity: topEdge,
          }}
        />

        {/* ── Inner screen ─────────────────────────────────────────────────── */}
        <div className="h-full w-full flex flex-col overflow-hidden rounded-[22px] bg-[#0d0d0f] relative">

          {/* ── macOS chrome title bar ──────────────────────────────────────── */}
          {/* Height: h-9 (36px) — matches the SolucionesSection window chrome   */}
          {/* for visual consistency across the business page sections.          */}
          <div
            className="h-9 shrink-0 flex items-center px-4 border-b border-white/[0.05] relative select-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-2">
              {TRAFFIC.map(({ bg }) => (
                <div
                  key={bg}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>

            {/* URL / title bar — centered */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="flex items-center gap-1.5 h-5 px-3 rounded-md bg-white/[0.05] border border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                <span className="text-[9px] text-zinc-600 tracking-tight select-none">
                  ouleeh.com/dashboard
                </span>
              </div>
            </div>
          </div>

          {/* ── Content area ─────────────────────────────────────────────────── */}
          <div className="flex-1 relative overflow-hidden">

            {/* Dashboard content — sits below the glare */}
            <div className="relative z-10 h-full">
              {children}
            </div>

            {/* ── Glare / volumetric light-sweep ─────────────────────────────── */}
            {/* Outer layer drives overall opacity (fades to 0 when card is flat). */}
            {/* Inner layer translates: sweeps the light band from top → bottom.   */}
            {/* gradient: white leading edge → violet mid-tone → transparent tail, */}
            {/* mimicking angled studio lighting hitting glass at a low angle.      */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-20"
              style={{ opacity: glareOpacity }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-0 top-0"
                style={{
                  translateY: glareY,
                  height: "72%",
                  background: [
                    "linear-gradient(to bottom,",
                    "rgba(255,255,255,0.22)  0%,",
                    "rgba(167,139,250,0.10) 22%,",
                    "rgba(255,255,255,0.04) 55%,",
                    "transparent           100%)",
                  ].join(" "),
                }}
              />
            </motion.div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
