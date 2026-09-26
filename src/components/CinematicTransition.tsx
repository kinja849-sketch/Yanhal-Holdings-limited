import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "../lib/gsap";
import {
  transitionManager,
  TransitionPayload,
  YANHAL_TRANSITION_THEMES,
  TransitionTheme,
} from "../lib/transitionManager";

export default function CinematicTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [activeTheme, setActiveTheme] = useState<TransitionTheme>(YANHAL_TRANSITION_THEMES.default);
  const [destinationLabel, setDestinationLabel] = useState<string>("YANHAL HOLDINGS");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Subscribe to transitionManager
    const unsubscribe = transitionManager.subscribe(
      (payload: TransitionPayload, onCovered: () => void, onComplete: () => void) => {
        const theme = payload.theme || YANHAL_TRANSITION_THEMES.default;
        const label = payload.label || "YANHAL HOLDINGS";

        setActiveTheme(theme);
        setDestinationLabel(label);
        setIsActive(true);

        const container = containerRef.current;
        const path = pathRef.current;
        const logo = logoRef.current;
        const backdrop = backdropRef.current;

        if (!container || !path || !logo || !backdrop) {
          onCovered();
          onComplete();
          setIsActive(false);
          return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
          container.style.pointerEvents = "all";
          const tl = gsap.timeline({
            onComplete: () => {
              container.style.pointerEvents = "none";
              setIsActive(false);
              onComplete();
            },
          });

          tl.to(backdrop, { opacity: 1, duration: 0.25, ease: "power2.out" })
            .to(logo, { opacity: 1, duration: 0.15, ease: "power1.out" }, "-=0.1")
            .add(() => { onCovered(); })
            .to(logo, { opacity: 0, duration: 0.15, ease: "power1.in" }, "+=0.1")
            .to(backdrop, { opacity: 0, duration: 0.25, ease: "power2.in" });

          return;
        }

        // Exact Reference Scribble Sweep Transition Mechanics
        container.style.pointerEvents = "all";

        let pathLength = 12000;
        try {
          if (path.getTotalLength) {
            pathLength = path.getTotalLength();
          }
        } catch {
          pathLength = 12000;
        }

        // Reset elements before entrance
        gsap.killTweensOf([container, path, logo, backdrop]);
        gsap.set(container, { autoAlpha: 1 });
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(logo, { autoAlpha: 0, scale: 0.9, y: 15 });

        // Initialize SVG Scribble: Starts at 0% length (offset = pathLength) and thin stroke (8%)
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          strokeWidth: "8%",
          opacity: 1,
        });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(container, { autoAlpha: 0 });
            container.style.pointerEvents = "none";
            setIsActive(false);
            onComplete();
          },
        });

        // Step 1: Draw in across the screen (0.8s) while expanding stroke width to 31%
        // Exactly matches reference: Power1.easeInOut for draw, Power2.easeInOut for strokeWidth
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 0.85,
          ease: "power1.inOut",
        }, 0)
        .to(path, {
          strokeWidth: "31%",
          duration: 0.85,
          ease: "power2.inOut",
        }, 0);

        // Backdrop ensures absolute 100% solid opacity coverage at peak
        tl.to(backdrop, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.inOut",
        }, 0.6);

        // Step 2: Signature Yanhal Logo & Destination Tag reveal at 0.4s with tactile scale
        tl.to(logo, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: "power3.out",
        }, 0.4);

        // Step 3: At peak occlusion (0.85s), perform destination change underneath
        tl.add(() => {
          onCovered();
        }, 0.85);

        // Step 4: Logo departs at 1.0s
        tl.to(logo, {
          autoAlpha: 0,
          scale: 1.04,
          y: -10,
          duration: 0.25,
          ease: "power2.in",
        }, 1.0);

        // Step 5: Path draws out smoothly (0% 100% -> 100% 100%) while stroke shrinks back to 8%
        // Duration 1.2s matching reference drawSVG 100% 100% ease Power2.easeInOut
        tl.to(path, {
          strokeDashoffset: -pathLength,
          duration: 1.15,
          ease: "power2.inOut",
        }, 0.95)
        .to(path, {
          strokeWidth: "8%",
          duration: 1.15,
          ease: "power1.inOut",
        }, 0.95)
        .to(backdrop, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        }, 1.05);
      }
    );

    // Safeguard: BFCache & tab visibility unlock
    const handleForceUnlock = () => {
      const container = containerRef.current;
      if (container) {
        gsap.killTweensOf(container);
        if (pathRef.current) gsap.killTweensOf(pathRef.current);
        if (logoRef.current) gsap.killTweensOf(logoRef.current);
        if (backdropRef.current) gsap.killTweensOf(backdropRef.current);

        gsap.set(container, { autoAlpha: 0 });
        container.style.pointerEvents = "none";
      }
      setIsActive(false);
    };

    window.addEventListener("yanhal:transition:forceUnlock", handleForceUnlock);

    return () => {
      unsubscribe();
      window.removeEventListener("yanhal:transition:forceUnlock", handleForceUnlock);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      className="transition-container fixed inset-0 w-full h-[100dvh] pointer-events-none z-[9999] overflow-hidden"
      style={{ opacity: 0, visibility: "hidden" }}
      aria-hidden={!isActive}
    >
      {/* Background full-coverage color mask in destination Yanhal palette */}
      <div
        ref={backdropRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundColor: activeTheme.primary,
          opacity: 0,
        }}
      />

      {/* SVG Full-Viewport Scribble Draw & Wipe Layer - Exact geometry from reference */}
      <svg
        className="transition-scribble absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 3222 3114"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="yanhal-transition-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={activeTheme.accent} />
            <stop offset="50%" stopColor={activeTheme.secondary} />
            <stop offset="100%" stopColor={activeTheme.primary} />
          </linearGradient>
        </defs>

        {/* Master full-screen sweeping scribble path that blankets the screen */}
        <path
          ref={pathRef}
          d="M299.654 453.865C505.574 319.225 711.494 184.585 836.054 109.945C960.614 35.3048 997.574 24.7448 944.014 110.385C890.454 196.025 745.254 378.185 571.454 634.385C397.654 890.585 199.654 1215.3 110.854 1382.58C22.0544 1549.86 48.4544 1549.86 77.8944 1540.62C107.334 1531.38 139.014 1512.9 367.854 1319.9C596.694 1126.9 1021.73 759.945 1255.21 555.065C1488.69 350.185 1517.73 318.505 1527.41 306.145C1537.09 293.785 1526.53 301.705 1346.85 618.625C1167.17 935.545 818.694 1561.22 635.214 1896.74C451.734 2232.26 443.814 2258.66 447.654 2268.3C451.494 2277.94 467.334 2270.02 511.134 2236.9C554.934 2203.78 626.214 2145.7 966.534 1817.46C1306.85 1489.22 1914.05 892.585 2263.81 557.505C2613.57 222.425 2687.49 166.985 2741.41 129.185C2795.33 91.3848 2827.01 72.9048 2843.33 67.3448C2859.65 61.7848 2859.65 69.7048 2849.09 96.2248C2838.53 122.745 2817.41 167.625 2584.77 544.505C2352.13 921.385 1370.37 2165.43 1139.25 2537.83C908.134 2910.23 902.854 2926.07 902.774 2939.51C902.694 2952.95 907.974 2963.51 1255.21 2613.87C1602.45 2264.23 2829.73 1017.54 2903.53 1071.46C2977.33 1125.38 2176.12 2817.04 2128 3037C2079.88 3256.96 2911.24 2018.56 3172 1793"
          stroke="url(#yanhal-transition-grad)"
          strokeWidth="31%"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Centered Yanhal Signature Identity & Destination Reveal */}
      <div
        ref={logoRef}
        className="transition-logo absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center select-none"
        style={{ opacity: 0 }}
      >
        {/* Architectural Emblem with Ambient Backlight Glow */}
        <div className="relative mb-3 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full blur-2xl scale-125 opacity-40 animate-pulse"
            style={{ backgroundColor: activeTheme.accent }}
          />
          <img
            src="/yanhal-emblem.svg"
            alt="Yanhal Emblem"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(224,185,160,0.55)] relative z-10"
            style={{ aspectRatio: "300 / 386" }}
          />
        </div>

        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-display font-bold tracking-[0.24em] text-sm sm:text-base uppercase"
            style={{ color: activeTheme.text }}
          >
            YANHAL <span style={{ color: activeTheme.accent }}>HOLDINGS</span>
          </span>
        </div>

        {/* Destination Status Pill */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-2xl"
          style={{
            borderColor: `${activeTheme.accent}50`,
            backgroundColor: `${activeTheme.primary}95`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: activeTheme.accent }}
          />
          <span
            className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-bold"
            style={{ color: activeTheme.accent }}
          >
            {destinationLabel}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
