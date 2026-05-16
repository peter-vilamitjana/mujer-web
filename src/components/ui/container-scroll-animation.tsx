"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue, useSpring } from "framer-motion";

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
    restDelta: 0.001
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
    return isMobile ? [0.8, 0.9] : [1.05, 0.95];
  };

  const rotate = useTransform(smoothProgress, [0, 1], [20, 0]);
  const scale = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -50]);

  return (
    <div
      className="h-[50rem] md:h-[65rem] flex items-center justify-center relative p-2 md:p-10"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-20 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  // Glare effect based on rotation angle to simulate 3D light reflection
  const glareOpacity = useTransform(rotate, [0, 20], [0, 0.25]);
  const glareY = useTransform(rotate, [0, 20], ["100%", "-20%"]);

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "inset 0 1px 1px rgba(255,255,255,0.15), 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
      }}
      className="max-w-5xl mt-6 mx-auto h-[30rem] md:h-[40rem] w-full border border-[#444] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl relative overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 pointer-events-none z-50 rounded-[30px]"
        style={{
          opacity: glareOpacity,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
          translateY: glareY,
        }}
      />
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050504] md:rounded-2xl md:p-4 relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
