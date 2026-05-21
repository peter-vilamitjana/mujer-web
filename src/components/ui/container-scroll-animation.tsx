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
    // Mobile: gentle grow (starts small, ends natural)
    // Desktop: starts at natural size tilted, ends slightly smaller flat —
    //          ensures the dark frame always stays visible around the mockup
    return isMobile ? [0.8, 0.88] : [1.0, 0.85];
  };

  const rotate = useTransform(smoothProgress, [0, 1], [20, 0]);
  const scale = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -50]);

  // Glow fades from vivid (tilted/dramatic) to subtle (flat/crisp)
  const glowA = useTransform(smoothProgress, [0, 1], [0.22, 0.08]);
  const glowB = useTransform(smoothProgress, [0, 1], [0.12, 0.04]);

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
        <Card rotate={rotate} translate={translate} scale={scale} glowA={glowA} glowB={glowB}>
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
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  glowA: MotionValue<number>;
  glowB: MotionValue<number>;
  children: React.ReactNode;
}) => {
  // Animated box-shadow: depth layers static, violet glow fades with scroll
  const boxShadow = useMotionTemplate`0 24px 48px -12px rgba(0,0,0,0.5), 0 9px 20px rgba(0,0,0,0.29), 0 37px 37px rgba(0,0,0,0.26), 0 84px 50px rgba(0,0,0,0.15), 0 0 72px rgba(139,92,246,${glowA}), 0 0 140px rgba(109,40,217,${glowB})`;

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow,
      }}
      className="max-w-6xl mt-6 mx-auto h-[28rem] md:h-[42rem] w-full border border-white/[0.10] p-2 md:p-5 bg-[#111113] rounded-[30px] relative overflow-hidden"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050504] md:rounded-2xl md:p-4 relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
