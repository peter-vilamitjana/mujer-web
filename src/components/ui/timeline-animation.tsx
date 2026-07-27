"use client";

import React, { ElementType, useMemo } from "react";
import { motion, useInView } from "framer-motion";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement>;
  customVariants?: any;
  className?: string;
  as?: ElementType;
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as = "div",
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, margin: "-50px" });

  const MotionComponent = useMemo(() => motion(as as any), [as]);

  return (
    <MotionComponent
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants}
      custom={animationNum}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
