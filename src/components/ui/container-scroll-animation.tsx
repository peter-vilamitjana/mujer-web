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

  // Phase 1 — Revelation (0→600): dashboard falls toward viewer and normalizes
  // Phase 2 — Immersion  (600→1000): dashboard tilts forward and zooms in
  const rotate = useTransform(
    lenisScroll,
    [0, 600, 1000],
    [20, 0, -4]
  );

  const scale = useTransform(
    lenisScroll,
    [0, 600, 1000],
    isMobile ? [0.7, 0.9, 1.05] : [1.05, 1.0, 1.18]
  );

  const translate = useTransform(
    lenisScroll,
    [0, 600, 1000],
    [0, -80, -80]
  );

  // Card fades out as viewer "enters" it — disappears into the next section
  const cardOpacity = useTransform(lenisScroll, [800, 1100], [1, 0]);

  // Border fades out during immersion phase so nothing breaks the illusion
  const borderColor = useTransform(
    lenisScroll,
    [600, 1000],
    ["rgba(241,201,125,0.2)", "rgba(241,201,125,0)"]
  );

  return (
    <div
      className="flex items-start justify-center relative p-2 px-4 md:px-10 md:pt-8 md:pb-20 md:h-[80rem]"
      ref={containerRef}
    >
      <div
        className="py-4 md:py-12 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card
          rotate={rotate}
          scale={scale}
          cardOpacity={cardOpacity}
          borderColor={borderColor}
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
  cardOpacity,
  borderColor,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  cardOpacity: MotionValue<number>;
  borderColor: MotionValue<string>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        opacity: cardOpacity,
        borderColor,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, " +
          "0 37px 37px #00000042, 0 84px 50px #00000026, " +
          "0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-6xl mx-auto w-full h-[30rem] md:h-[40rem]
                 border-4 p-2 md:p-6
                 bg-[#111010] rounded-[2rem] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050504]">
        {children}
      </div>
    </motion.div>
  );
};
