import { motion } from "motion/react";
import React from "react";

interface AnimatedBlockProps {
  children: React.ReactNode;
  key?: React.Key;
  className?: string;
  /** Additional delay on top of stagger. Default 0 */
  delay?: number;
  /** Index within a staggered group — multiplied by 100ms */
  index?: number;
  /** Distance in px to slide up from. Default 30 */
  distance?: number;
  /** Duration in seconds. Default 0.6 */
  duration?: number;
  /** Viewport margin. Default "-40px" */
  margin?: string;
  /** as prop for semantic element */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * General-purpose scroll-reveal block.
 * Use `index` for staggered groups (cards, list items, paragraphs).
 * Animates in on scroll-in, reverses on scroll-out (once: false).
 * Respects prefers-reduced-motion automatically via Framer Motion.
 */
export default function AnimatedBlock({
  children,
  className = "",
  delay = 0,
  index = 0,
  distance = 30,
  duration = 0.6,
  margin = "-40px",
  as: Tag = "div",
}: AnimatedBlockProps) {
  const staggerDelay = delay + index * 0.1; // 100ms stagger per item

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin }}
      transition={{
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: staggerDelay,
      }}
      className={className}
    >
      {/* @ts-ignore — Tag is dynamic but always valid */}
      {children}
    </motion.div>
  );
}
