import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

export default function FluidLineLoop() {
  const lineRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const linePath = lineRef.current;
    const servicesPanel = document.getElementById("panel-services");
    const industrialPanel = document.getElementById("panel-feature-industrial");

    if (!linePath || !servicesPanel || !industrialPanel) return;

    const lineLen = linePath.getTotalLength();
    gsap.set(linePath, {
      strokeDasharray: lineLen,
      strokeDashoffset: lineLen,
    });

    // Animate the line drawing continuously through Section 05 and Section 06
    gsap.to(linePath, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: servicesPanel,
        endTrigger: industrialPanel,
        start: "top 60%",
        end: "bottom 95%",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 1440 2900"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Luminous Electric Crimson to Molten Amber Radiant Gradient */}
          <linearGradient id="fluidLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF381E" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#FF5A36" stopOpacity="1" />
            <stop offset="65%" stopColor="#FF2A00" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E83B14" stopOpacity="0.9" />
          </linearGradient>

          {/* Intense Dual-Stage Ambient Glow Filter */}
          <filter id="fluidGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Purposeful Fluid Drawing Loop across Services and Structural Performance */}
        <path
          ref={lineRef}
          d="
            M -50, 140
            C 420, 60   920, 220   840, 560
            C 760, 920   160, 880   320, 1260
            C 480, 1620 1220, 1480 1060, 1920
            C 920, 2320  340, 2260  520, 2600
            C 640, 2780  260, 2860  -60, 2920
          "
          fill="none"
          stroke="url(#fluidLineGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#fluidGlow)"
        />
      </svg>
    </div>
  );
}

