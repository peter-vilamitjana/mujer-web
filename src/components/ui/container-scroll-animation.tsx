"use client";

import React, { useRef } from "react";
import {
  useScroll,
  useTransform,
  motion,
  MotionValue,
} from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  const rotate = useTransform(scrollY, [0, 600], [20, 0]);
  const scale = useTransform(scrollY, [0, 600], [0.9, 1]);
  const translate = useTransform(scrollY, [0, 600], [0, -80]);

  return (
    <div
      className="flex items-center justify-center relative p-2
                 md:p-20 md:h-[80rem]"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
        />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

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
      className="max-w-5xl -mt-0 mx-auto w-full border-4
                 border-[#f1c97d]/20 p-2 md:p-6
                 bg-[#111010] rounded-[2rem] shadow-2xl"
    >
      <div
        className="h-full w-full overflow-hidden rounded-2xl
                   bg-[#050504] md:rounded-2xl md:p-4"
      >
        {children}
      </div>
    </motion.div>
  );
};
