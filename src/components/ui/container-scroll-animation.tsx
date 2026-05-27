"use client";
import React, { useRef } from "react";
import {
  useScroll, useTransform, motion,
  MotionValue, useMotionTemplate,
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const rotate    = useTransform(scrollYProgress, [0, 0.3, 1], [20, 20, 0]);
  const scale     = useTransform(scrollYProgress, [0, 0.3, 1], isMobile ? [0.7, 0.7, 0.9] : [1.05, 1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0, -100]);

  // Ambient glow — vivid at max tilt, nearly gone when flat
  const glowA = useTransform(scrollYProgress, [0, 1], [0.30, 0.08]);
  const glowB = useTransform(scrollYProgress, [0, 1], [0.18, 0.04]);

  // Floor glow — card projects violet light on the surface below
  const floorGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0.26, 0.12, 0.04]);

  // Top-edge specular — bright bevel when tilted, fades when flat
  const topEdge = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 0.42, 0.12]);

  // Glare light-sweep
  const glareY       = useTransform(scrollYProgress, [0, 1], ["-65%", "100%"]);
  const glareOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [0.85, 0.20, 0.0]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
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
      className="div max-w-5xl mx-auto text-center"
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
  rotate:       MotionValue<number>;
  scale:        MotionValue<number>;
  translate:    MotionValue<number>;
  glowA:        MotionValue<number>;
  glowB:        MotionValue<number>;
  floorGlow:    MotionValue<number>;
  topEdge:      MotionValue<number>;
  glareY:       MotionValue<string>;
  glareOpacity: MotionValue<number>;
  children:     React.ReactNode;
}) => {
  const boxShadow = useMotionTemplate`0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003, 0 0 80px rgba(139,92,246,${glowA}), 0 0 160px rgba(109,40,217,${glowB})`;

  return (
    <div className="relative max-w-5xl mt-8 mx-auto">

      {/* Floor glow — card projects violet light on the surface below */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-16 inset-x-12 h-32 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(139,92,246,0.38) 0%, rgba(109,40,217,0.16) 40%, transparent 70%)",
          opacity: floorGlow,
          filter: "blur(32px)",
        }}
      />

      {/* Outer card frame */}
      <motion.div
        style={{ rotateX: rotate, scale, boxShadow }}
        className="w-full h-[30rem] md:h-[40rem]
          border-4 border-[#6C6C6C] p-2 md:p-6
          bg-[#222222] rounded-[30px] shadow-2xl relative overflow-visible"
      >
        {/* Top specular edge — bright glass bevel when tilted */}
        <motion.div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-[2px] rounded-t-[30px] pointer-events-none z-30"
          style={{
            background:
              "linear-gradient(to right, transparent 4%, rgba(255,255,255,0.20) 25%, rgba(255,255,255,0.44) 50%, rgba(255,255,255,0.20) 75%, transparent 96%)",
            opacity: topEdge,
          }}
        />

        {/* Inner screen */}
        <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900 relative">

          {/* macOS chrome title bar */}
          <div
            className="h-9 shrink-0 flex items-center px-4 border-b border-white/[0.05] relative select-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center gap-2">
              {TRAFFIC.map(({ bg }) => (
                <div key={bg} className="w-3 h-3 rounded-full" style={{ backgroundColor: bg }} />
              ))}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="flex items-center gap-1.5 h-5 px-3 rounded-md bg-white/[0.05] border border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                <span className="text-[9px] text-zinc-600 tracking-tight select-none">
                  ouleeh.com/dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 relative overflow-hidden">
            <div className="relative z-10 h-full">
              {children}
            </div>

            {/* Glare / volumetric light-sweep */}
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
                    "rgba(255,255,255,0.20)  0%,",
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
    </div>
  );
};
