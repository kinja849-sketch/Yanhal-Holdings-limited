import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { LOGO_PATHS, LOGO_PATH } from "./logoPath";

interface PreloaderProps {
  onComplete?: () => void;
  loop?: boolean;
}

export default function Preloader({ onComplete, loop = false }: PreloaderProps) {
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const numValRef = useRef<HTMLSpanElement>(null);
  const pctValRef = useRef<HTMLSpanElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const markFillRef = useRef<SVGPathElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Strictly preserve top scroll state
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const els = pathRefs.current.filter((el): el is SVGPathElement => el !== null);
    if (els.length !== LOGO_PATHS.length) return;

    // 1. Measure and cache total path lengths ONCE upfront
    // Initialize every drawable path with:
    // fill: none; stroke-dasharray: len; stroke-dashoffset: len; opacity: 0;
    const pathLengths = els.map((el) => {
      const len = el.getTotalLength();
      el.style.fill = "none";
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}px`;
      el.style.opacity = "0";
      return len;
    });

    const totalLength = pathLengths.reduce((acc, l) => acc + l, 0);

    // Compute consecutive distance segments for each path along the continuous drafting stroke
    let accum = 0;
    const segments = pathLengths.map((len, idx) => {
      const startDist = accum;
      accum += len;
      return {
        index: idx,
        el: els[idx],
        length: len,
        startDist,
        endDist: accum,
        startP: startDist / totalLength,
        endP: accum / totalLength,
      };
    });

    // 2. Build the GSAP master timeline for the continuous sequential drafting sequence
    const masterTl = gsap.timeline({ paused: true });
    segments.forEach((seg) => {
      const dur = seg.length / totalLength;
      const start = seg.startP;

      // Reveal only the currently drawing path immediately when its stroke begins
      masterTl.set(seg.el, { opacity: 1 }, start > 0 ? start : 0.0001);
      masterTl.fromTo(
        seg.el,
        { strokeDashoffset: seg.length },
        { strokeDashoffset: 0, duration: dur, ease: "none" },
        start
      );
    });

    const progressProxy = { value: 0 };
    let lastPct = -1;
    let isAssetsReady = false;
    let isMotionComplete = false;
    let isExiting = false;
    let mainTween: gsap.core.Tween | null = null;

    // Efficient display updater called by GSAP on each frame
    const updateDisplay = () => {
      const p = progressProxy.value;
      const clampedP = Math.max(0, Math.min(1, p));

      if (clampedP === 0) {
        // Frame 0 / 0%: 100% invisible logo area, no ghost outline, no dots
        els.forEach((el, i) => {
          el.style.opacity = "0";
          el.style.strokeDashoffset = `${pathLengths[i]}px`;
        });
        if (markFillRef.current) {
          markFillRef.current.style.opacity = "0";
        }
      } else {
        masterTl.progress(clampedP);

        // Deterministic high-precision segment enforcement:
        // - Future paths: opacity 0
        // - Past paths: opacity 1, strokeDashoffset 0
        // - Active path: opacity 1, strokeDashoffset = remaining
        const targetDist = clampedP * totalLength;
        segments.forEach((seg) => {
          if (targetDist < seg.startDist) {
            seg.el.style.opacity = "0";
            seg.el.style.strokeDashoffset = `${seg.length}px`;
          } else if (targetDist >= seg.endDist) {
            seg.el.style.opacity = "1";
            seg.el.style.strokeDashoffset = "0px";
          } else {
            seg.el.style.opacity = "1";
            const remaining = seg.length - (targetDist - seg.startDist);
            seg.el.style.strokeDashoffset = `${Math.max(0, remaining)}px`;
          }
        });
      }

      // Batch text mutations: only mutate DOM text when integer percentage changes
      const currentPct = Math.min(100, Math.round(clampedP * 100));
      if (currentPct !== lastPct) {
        lastPct = currentPct;
        if (pctValRef.current) {
          pctValRef.current.textContent = `${currentPct}%`;
        }
        if (numValRef.current) {
          numValRef.current.textContent = clampedP.toFixed(2);
        }
      }
    };

    // Initial state: 0% completely invisible
    updateDisplay();

    // Execution when both signature motion has reached 100% and assets are ready
    const handleCompletion = () => {
      if (isExiting) return;
      isExiting = true;

      progressProxy.value = 1.0;
      updateDisplay();

      // Ensure every original path has stroke-dashoffset: 0 and full intended opacity
      els.forEach((el) => {
        el.style.strokeDashoffset = "0px";
        el.style.opacity = "1";
      });
      if (numValRef.current) numValRef.current.textContent = "1.00";
      if (pctValRef.current) pctValRef.current.textContent = "100%";

      // Gently solidify finished gold architectural insignia
      if (markFillRef.current) {
        gsap.to(markFillRef.current, {
          opacity: 0.92,
          duration: 0.35,
          ease: "power2.out",
        });
      }

      if (loop) {
        setTimeout(() => {
          progressProxy.value = 0;
          lastPct = -1;
          isExiting = false;
          isMotionComplete = false;
          if (markFillRef.current) markFillRef.current.style.opacity = "0";
          els.forEach((el, i) => {
            el.style.opacity = "0";
            el.style.strokeDashoffset = `${pathLengths[i]}px`;
          });
          startSignatureMotion();
        }, 1800);
        return;
      }

      // Hold that completed 100% state briefly before transitioning out and revealing the website
      gsap.delayedCall(0.3, () => {
        onCompleteRef.current?.();

        if (!containerRef.current) {
          setIsFinished(true);
          return;
        }

        // Smoothly dissolve preloader overlay directly into the already-rendered website
        const exitTl = gsap.timeline({
          onComplete: () => {
            setIsFinished(true);
          },
        });

        exitTl
          .to([stageRef.current, counterRef.current], {
            opacity: 0,
            y: -10,
            duration: 0.25,
            ease: "power2.out",
          })
          .to(
            containerRef.current,
            {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            "-=0.1"
          );
      });
    };

    const checkCanExit = () => {
      if (isMotionComplete && isAssetsReady && !isExiting) {
        handleCompletion();
      }
    };

    // Unbroken, fluid signature drafting motion from 0% to 100%
    const startSignatureMotion = () => {
      progressProxy.value = 0;
      updateDisplay();

      mainTween = gsap.to(progressProxy, {
        value: 1.0,
        duration: 3.0,
        ease: "power2.inOut",
        onUpdate: updateDisplay,
        onComplete: () => {
          isMotionComplete = true;
          handleCompletion();
        },
      });
    };

    // Start signature motion immediately from 0.00 / 0%
    startSignatureMotion();

    // Monitor real asset readiness (fonts + window load event)
    let fontsReady = false;
    let windowLoaded = false;

    const checkAllAssets = () => {
      if (fontsReady && windowLoaded) {
        isAssetsReady = true;
        checkCanExit();
      }
    };

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          fontsReady = true;
          checkAllAssets();
        })
        .catch(() => {
          fontsReady = true;
          checkAllAssets();
        });
    } else {
      fontsReady = true;
    }

    if (document.readyState === "complete") {
      windowLoaded = true;
      checkAllAssets();
    } else {
      const onLoad = () => {
        windowLoaded = true;
        checkAllAssets();
        window.removeEventListener("load", onLoad);
      };
      window.addEventListener("load", onLoad);
    }

    // Safety timeout ensuring the preloader exits even if 3rd party assets or network stalls
    const safetyTimeout = setTimeout(() => {
      isAssetsReady = true;
      checkCanExit();
    }, 4500);

    return () => {
      mainTween?.kill();
      masterTl.kill();
      clearTimeout(safetyTimeout);
    };
  }, [loop]);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] w-screen h-[100dvh] pointer-events-auto select-none flex flex-col items-center justify-center text-[#FAF8F5] bg-[#080809] overflow-hidden will-change-[opacity]"
      style={{
        background: "radial-gradient(circle at 50% 50%, #1e1b18 0%, #080809 85%)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      aria-live="polite"
      aria-label="Yanhal Signature Architectural Preloader"
    >
      {/* Background-free Stage with GPU-composited ambient glow */}
      <div
        ref={stageRef}
        className="relative w-[320px] sm:w-[400px] md:w-[460px] h-[350px] sm:h-[440px] md:h-[500px] flex items-center justify-center pointer-events-none"
      >
        {/* Hardware-accelerated ambient glow cached on GPU texture layer */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#E0B9A0]/12 blur-3xl pointer-events-none -z-10 transform-gpu" />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 477 523"
          className="w-full h-full overflow-visible transform-gpu"
        >
          <defs>
            {/* Authentic metallic architectural gold gradient for signature drafting line */}
            <linearGradient id="metallic-architectural-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" />
              <stop offset="40%" stopColor="#E0B9A0" />
              <stop offset="100%" stopColor="#AE917E" />
            </linearGradient>

            {/* Solid gold insignia fill that solidifies at 100% */}
            <linearGradient id="metallic-solid-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" />
              <stop offset="50%" stopColor="#E0B9A0" />
              <stop offset="100%" stopColor="#AE917E" />
            </linearGradient>
          </defs>

          {/* Solid architectural gold fill that smoothly solidifies when drawing completes at 100% */}
          <path
            ref={markFillRef}
            d={LOGO_PATH}
            fill="url(#metallic-solid-gold)"
            style={{ opacity: 0 }}
            className="pointer-events-none transition-opacity duration-300"
          />

          {/* Ordered sequential drafting paths forming a single continuous drafting stroke */}
          <g id="preloader-drafting-paths">
            {LOGO_PATHS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="url(#metallic-architectural-gold)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="miter"
                strokeMiterlimit="3"
                style={{ opacity: 0 }}
                className="will-change-[stroke-dashoffset,opacity]"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Minimal Space Mono Counter incrementing from 0.00 to 1.00 and 0% to 100% in lockstep */}
      <div
        ref={counterRef}
        className="mt-6 sm:mt-8 flex items-center gap-3 font-mono text-xs sm:text-sm tracking-[0.28em] text-[#E0B9A0] tabular-nums"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        <span ref={numValRef} className="font-bold text-[#FAF8F5]">
          0.00
        </span>
        <span className="text-[#AE917E]">&bull;</span>
        <span ref={pctValRef} className="text-[#E0B9A0] font-semibold">
          0%
        </span>
      </div>
    </div>
  );
}
