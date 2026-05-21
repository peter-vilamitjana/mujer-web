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

  // Scale strategy:
  // Desktop [1.05 → 0.80]: the +0.05 at start compensates for the perspective
  // foreshortening that makes the tilted card appear narrower than its CSS width;
  // 0.80 at the flat end guarantees a 20% visual margin on all sides, so the
  // dark background always frames the card — no edge-touching at any viewport.
  //
  // Mobile [0.82 → 0.72]: always decreasing (never grows), so the card feels
  // like it's "landing" into the frame, not expanding toward the edges.
  const scaleDimensions = () => {
    return isMobile ? [0.82, 0.72] : [1.05, 0.80];
  };

  const rotate    = useTransform(smoothProgress, [0, 1], [20, 0]);
  const scale     = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -50]);

  // Violet ambient glow — vivid when tilted, nearly gone when flat
  const glowA = useTransform(smoothProgress, [0, 1], [0.22, 0.08]);
  const glowB = useTransform(smoothProgress, [0, 1], [0.12, 0.04]);

  // Glare light-sweep: band starts above card (-65%) and sweeps to below (+100%)
  const glareY = useTransform(smoothProgress, [0, 1], ["-65%", "100%"]);
  const glareOpacity = useTransform(
    smoothProgress,
    [0, 0.65, 1],
    [0.80, 0.20, 0.0]
  );

  return (
    // overflow-x-hidden: belt-and-suspenders — clips any sub-pixel bleed from
    // the scale transform before it can affect the page's horizontal scroll.
    // pb-20 md:pb-28: constant bottom padding so the dark background is always
    // visible below the card; py-2 at the top was suppressing that breathing room.
    <div
      className="h-[52rem] md:h-[76rem] flex items-center justify-center relative
        px-6 md:px-12 pt-2 pb-20 md:pb-28 overflow-x-hidden"
      ref={containerRef}
    >
      {/* perspective: 1200px — subtler vanishing point so the tilt feels elegant,
          not exaggerated. 1000px felt too aggressive on wide monitors. */}
      <div
        className="py-10 md:py-20 w-full relative"
        style={{ perspective: "1200px" }}
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
    // max-w-5xl (64rem / 1024px) instead of max-w-6xl: tighter natural CSS width
    // means the 3D transform operates on a smaller base. At final scale 0.80 on
    // desktop, the visual width ≈ 820px — well inside any standard viewport, with
    // the dark section background always visible on both sides as a frame.
    // h-[38rem] md:h-[40rem]: slightly reduced from 42rem so the card never clips
    // at the top/bottom even on shorter displays (1024px height laptops).
    <motion.div
      style={{ rotateX: rotate, scale, boxShadow }}
      className="max-w-5xl mt-6 mx-auto h-[26rem] md:h-[40rem] w-full border border-white/[0.10] p-2 md:p-5 bg-[#111113] rounded-[30px] relative overflow-hidden"
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
