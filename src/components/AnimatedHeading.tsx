import { motion } from "motion/react";
import React from "react";

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance in px to slide up from. Default 30 */
  distance?: number;
  /** Duration in ms. Default 600 */
  duration?: number;
}

/**
 * Editorial-grade heading reveal — 3D perspective flip-up matching
 * the Milano reference, with refined ease-in-out and 30px slide.
 * Respects prefers-reduced-motion.
 */
export default function AnimatedHeading({
  children,
  className = "",
  delay = 0,
  distance = 30,
  duration = 0.6,
}: AnimatedHeadingProps) {
  return (
    <div className="perspective-[1200px] [transform-style:preserve-3d]">
      <motion.div
        initial={{ opacity: 0, y: distance, rotateX: -12 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{
          duration,
          ease: [0.25, 0.46, 0.45, 0.94], // ease-in-out
          delay,
          // Respect prefers-reduced-motion — Framer reads this automatically
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
