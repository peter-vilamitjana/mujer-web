"use client";

import React, { useRef } from "react";
import {
  useTransform,
  motion,
  MotionValue,
  useMotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";

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

  // Lenis manages a virtual scroll — window.scrollY stays at 0.
  // We sync Lenis scroll position into a MotionValue so framer-motion
  // can derive transforms from the real (virtual) scroll offset.
  const lenisScroll = useMotionValue(0);

  useLenis(({ scroll }) => {
    lenisScroll.set(scroll);
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate    = useTransform(lenisScroll, [0, 600], [20, 0]);
  const scale     = useTransform(lenisScroll, [0, 600], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(lenisScroll, [0, 600], [0, -80]);

  return (
    <div
      className="flex items-start justify-center relative p-2 md:p-20 md:h-[80rem]"
      ref={containerRef}
    >
      <div
        className="py-4 md:py-12 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
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
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, " +
          "0 37px 37px #00000042, 0 84px 50px #00000026, " +
          "0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mx-auto w-full h-[30rem] md:h-[40rem]
                 border-4 border-[#f1c97d]/20 p-2 md:p-6
                 bg-[#111010] rounded-[2rem] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050504]">
        {children}
      </div>
    </motion.div>
  );
};
