'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
}

export const ScrollReveal = ({
    children,
    width = "100%",
    delay = 0,
    direction = "up",
    className
}: ScrollRevealProps) => {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    return (
        <div className={className} style={{ position: "relative", width, overflow: "visible" }}>
            <motion.div
                variants={{
                    hidden: {
                        opacity: 0,
                        ...directions[direction]
                    },
                    visible: {
                        opacity: 1,
                        x: 0,
                        y: 0
                    },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    duration: 0.5,
                    delay,
                    ease: "easeOut"
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
