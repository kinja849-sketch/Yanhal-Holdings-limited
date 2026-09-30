import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "../lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { transitionManager, TransitionPayload } from "../lib/transitionManager";

// Register CustomEase and DrawSVGPlugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, DrawSVGPlugin);
  try {
    CustomEase.create("cubic-default", "0.625, 0.05, 0, 1");
    CustomEase.create("cubic-default-scribble", "0.75, 0.15, 0.15, 1");
  } catch {
    // Eases already created
  }
}

// Exact reference SVG scribble path (3222 x 3114) from https://phyusinyadanarthein.com/
const SCRIBBLE_PATH_D =
  "M299.654 453.865C505.574 319.225 711.494 184.585 836.054 109.945C960.614 35.3048 997.574 24.7448 944.014 110.385C890.454 196.025 745.254 378.185 571.454 634.385C397.654 890.585 199.654 1215.3 110.854 1382.58C22.0544 1549.86 48.4544 1549.86 77.8944 1540.62C107.334 1531.38 139.014 1512.9 367.854 1319.9C596.694 1126.9 1021.73 759.945 1255.21 555.065C1488.69 350.185 1517.73 318.505 1527.41 306.145C1537.09 293.785 1526.53 301.705 1346.85 618.625C1167.17 935.545 818.694 1561.22 635.214 1896.74C451.734 2232.26 443.814 2258.66 447.654 2268.3C451.494 2277.94 467.334 2270.02 511.134 2236.9C554.934 2203.78 626.214 2145.7 966.534 1817.46C1306.85 1489.22 1914.05 892.585 2263.81 557.505C2613.57 222.425 2687.49 166.985 2741.41 129.185C2795.33 91.3848 2827.01 72.9048 2843.33 67.3448C2859.65 61.7848 2859.65 69.7048 2849.09 96.2248C2838.53 122.745 2817.41 167.625 2584.77 544.505C2352.13 921.385 1370.37 2165.43 1139.25 2537.83C908.134 2910.23 902.854 2926.07 902.774 2939.51C902.694 2952.95 907.974 2963.51 1255.21 2613.87C1602.45 2264.23 2829.73 1017.54 2903.53 1071.46C2977.33 1125.38 2176.12 2817.04 2128 3037C2079.88 3256.96 2911.24 2018.56 3172 1793";

const THEMES = ["blue", "orange", "green", "pink", "maroonred"] as const;
type ThemeName = (typeof THEMES)[number];

let lastThemeIndex = -1;
function getNonRepeatingRandomTheme(): ThemeName {
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * THEMES.length);
  } while (newIndex === lastThemeIndex);
  lastThemeIndex = newIndex;
  return THEMES[newIndex];
}

const scribbleWidth = "31%";
const scribbleWidthStart = "8%";

export default function CinematicTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const [activeTheme, setActiveTheme] = useState<ThemeName>("blue");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = transitionManager.subscribe(
      (
        _payload: TransitionPayload,
        onCovered: () => void,
        onComplete: () => void
      ) => {
        const nextTheme = getNonRepeatingRandomTheme();
        setActiveTheme(nextTheme);
        setIsActive(true);

        const container = containerRef.current;
        const path = pathRef.current;
        const screen = screenRef.current;

        if (!container || !path || !screen) {
          onCovered();
          onComplete();
          setIsActive(false);
          return;
        }

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
          container.style.pointerEvents = "all";
          const tl = gsap.timeline({
            onComplete: () => {
              container.style.pointerEvents = "none";
              setIsActive(false);
              onComplete();
            },
          });

          tl.to(screen, { autoAlpha: 1, duration: 0.25, ease: "power2.out" })
            .add(() => {
              onCovered();
            })
            .to(screen, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });

          return;
        }

        // Exact animation sequence mirrored from phyusinyadanarthein.com (pageTransitionIn)
        gsap.killTweensOf([container, path, screen]);

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(container, { autoAlpha: 0, pointerEvents: "none" });
            setIsActive(false);
            onComplete();
          },
        });

        tl.set(container, {
          pointerEvents: "all",
          autoAlpha: 1,
        });

        tl.set(screen, {
          autoAlpha: 0,
        });

        tl.set(path, {
          strokeWidth: scribbleWidthStart,
          drawSVG: "0% 0%",
        });

        // Step 1: Scribble draws in across screen (0.8s) while expanding to 31% width
        tl.to(path, {
          duration: 0.8,
          drawSVG: "0% 100%",
          ease: "Power1.easeInOut",
        });

        tl.to(
          path,
          {
            strokeWidth: scribbleWidth,
            duration: 0.8,
            ease: "Power2.easeInOut",
          },
          "<"
        );

        // Step 2: At 0.8s (screen 100% occluded by scribble), execute destination change
        tl.add(() => {
          onCovered();
        }, 0.8);

        // Step 3: Scribble draws out over next 1.5s while thinning to 8%
        tl.to(
          path,
          {
            duration: 1.5,
            drawSVG: "100% 100%",
            ease: "Power2.easeInOut",
          },
          0.8
        );

        tl.to(
          path,
          {
            strokeWidth: scribbleWidthStart,
            duration: 1.5,
            ease: "cubic-default-scribble",
          },
          0.8
        );

        // Reset path at completion
        tl.set(path, {
          strokeWidth: "0%",
          drawSVG: "0% 0%",
        });
      }
    );

    // Safeguard: BFCache & tab visibility unlock
    const handleForceUnlock = () => {
      const container = containerRef.current;
      if (container) {
        gsap.killTweensOf(container);
        if (pathRef.current) gsap.killTweensOf(pathRef.current);
        if (screenRef.current) gsap.killTweensOf(screenRef.current);

        gsap.set(container, { autoAlpha: 0, pointerEvents: "none" });
      }
      setIsActive(false);
    };

    window.addEventListener("yanhal:transition:forceUnlock", handleForceUnlock);

    return () => {
      unsubscribe();
      window.removeEventListener(
        "yanhal:transition:forceUnlock",
        handleForceUnlock
      );
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      data-transition-theme={activeTheme}
      className="transition-container"
      style={{ opacity: 0, visibility: "hidden" }}
      aria-hidden={!isActive}
    >
      {/* Background screen */}
      <div ref={screenRef} className="transition-screen" />

      {/* SVG Scribble - exact 3222 x 3114 geometry from reference */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        viewBox="0 0 3222 3114"
        fill="none"
        preserveAspectRatio="none"
        className="transition-scribble"
      >
        <path
          ref={pathRef}
          d={SCRIBBLE_PATH_D}
          stroke="currentColor"
          strokeWidth="31%"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    document.body
  );
}
