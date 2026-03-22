"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Reveal({ children, direction = "up", delay = 0, className }: RevealProps) {
  const initial = direction === "left"
    ? { opacity: 0, x: -50 }
    : direction === "right"
    ? { opacity: 0, x: 50 }
    : { opacity: 0, y: 36 };

  const animate = direction === "left" || direction === "right"
    ? { opacity: 1, x: 0 }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
