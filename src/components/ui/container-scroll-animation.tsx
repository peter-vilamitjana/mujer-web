"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue, useSpring, useMotionTemplate } from "framer-motion";

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

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
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

  const scaleDimensions = () => {
    return isMobile ? [0.8, 0.88] : [1.0, 0.85];
  };

  const rotate    = useTransform(smoothProgress, [0, 1],        [20, 0]);
  const scale     = useTransform(smoothProgress, [0, 1],        scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1],        [0, -50]);

  // Violet ambient glow — vivid when tilted, nearly gone when flat
  const glowA = useTransform(smoothProgress, [0, 1], [0.22, 0.08]);
  const glowB = useTransform(smoothProgress, [0, 1], [0.12, 0.04]);

  // Glare light-sweep —————————————————————————————————————————————
  // translateY: light band starts above the card top (-65 %) and sweeps
  // downward to fully below the visible area (+100 %) as scroll completes.
  const glareY = useTransform(smoothProgress, [0, 1], ["-65%", "100%"]);

  // opacity: strong at the tilted start, decays through the sweep,
  // fully gone when the card is flat (rotateX = 0).
  const glareOpacity = useTransform(
    smoothProgress,
    [0, 0.65, 1],
    [0.80,  0.20, 0.0]
  );
  // ————————————————————————————————————————————————————————————————

  return (
    <div
      className="h-[50rem] md:h-[72rem] flex items-center justify-center relative px-4 md:px-10 py-2"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-20 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          glowA={glowA}
          glowB={glowB}
          glareY={glareY}
          glareOpacity={glareOpacity}
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

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

export const Card = ({
  rotate,
  scale,
  glowA,
  glowB,
  glareY,
  glareOpacity,
  children,
}: {
  rotate:        MotionValue<number>;
  scale:         MotionValue<number>;
  translate:     MotionValue<number>;
  glowA:         MotionValue<number>;
  glowB:         MotionValue<number>;
  glareY:        MotionValue<string>;
  glareOpacity:  MotionValue<number>;
  children:      React.ReactNode;
}) => {
  const boxShadow = useMotionTemplate`0 24px 48px -12px rgba(0,0,0,0.5), 0 9px 20px rgba(0,0,0,0.29), 0 37px 37px rgba(0,0,0,0.26), 0 84px 50px rgba(0,0,0,0.15), 0 0 72px rgba(139,92,246,${glowA}), 0 0 140px rgba(109,40,217,${glowB})`;

  return (
    <motion.div
      style={{ rotateX: rotate, scale, boxShadow }}
      className="max-w-6xl mt-6 mx-auto h-[28rem] md:h-[42rem] w-full border border-white/[0.10] p-2 md:p-5 bg-[#111113] rounded-[30px] relative overflow-hidden"
    >
      {/* Glass screen area — overflow-hidden clips the glare to rounded corners */}
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050504] md:rounded-2xl md:p-4 relative">

        {/* Dashboard content — sits below the glare */}
        <div className="relative z-10 h-full">
          {children}
        </div>

        {/* ── Glare / volumetric light-sweep ──────────────────────────── */}
        {/* Outer layer controls overall opacity (fades to 0 when card is flat) */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-20"
          style={{ opacity: glareOpacity }}
        >
          {/* Inner layer translates vertically: sweeps the light band from
              top → bottom as scroll progresses (translateY drives the sweep).
              The gradient itself: intense white at leading edge → violet mid-tone
              → fully transparent tail, mimicking angled studio lighting on glass. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0"
            style={{
              translateY: glareY,
              height: "72%",
              background: [
                "linear-gradient(to bottom,",
                "rgba(255,255,255,0.18)  0%,",   // bright white leading edge
                "rgba(167,139,250,0.10) 22%,",   // violet mid-tint (brand color)
                "rgba(255,255,255,0.04) 55%,",   // soft white falloff
                "transparent           100%)",   // clean fade-out
              ].join(" "),
            }}
          />
        </motion.div>
        {/* ────────────────────────────────────────────────────────────── */}

      </div>
    </motion.div>
  );
};
