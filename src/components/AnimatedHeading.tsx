import React, { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
}

/**
 * Editorial-grade heading reveal with Luke Baffait word blur-reveal
 * and 3D perspective glide on scroll.
 */
export default function AnimatedHeading({
  children,
  className = "",
  delay = 0,
  distance = 25,
  duration = 0.8,
}: AnimatedHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: distance,
          filter: "blur(10px)",
          rotateX: -10,
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          rotateX: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: containerRef, dependencies: [delay, distance, duration] }
  );

  return (
    <div className="perspective-[1200px] [transform-style:preserve-3d]">
      <div
        ref={containerRef}
        className={`will-change-[transform,opacity,filter] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
