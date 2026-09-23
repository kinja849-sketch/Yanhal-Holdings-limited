import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { LOGO_PATH } from "./logoPath";

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
  const pathRef = useRef<SVGPathElement>(null);
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

    const pathEl = pathRef.current;
    if (!pathEl) return;

    // 1. Measure and cache total path length ONCE upfront
    const totalLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${totalLength} ${totalLength}`;
    pathEl.style.strokeDashoffset = `${totalLength}px`;

    const progressProxy = { value: 0 };
    let lastPct = -1;
    let isAssetsReady = false;
    let isMotionComplete = false;
    let isExiting = false;
    let mainTween: gsap.core.Tween | null = null;

    // Efficient display updater called by GSAP on each frame
    const updateDisplay = () => {
      const p = progressProxy.value;

      // Update stroke dash offset on GPU-accelerated path
      if (pathEl) {
        pathEl.style.strokeDashoffset = `${Math.max(0, totalLength * (1 - p))}px`;
      }

      // Batch text mutations: only mutate DOM text when integer percentage changes
      const currentPct = Math.min(100, Math.round(p * 100));
      if (currentPct !== lastPct) {
        lastPct = currentPct;
        if (pctValRef.current) {
          pctValRef.current.textContent = `${currentPct}%`;
        }
        if (numValRef.current) {
          numValRef.current.textContent = p.toFixed(2);
        }
      }
    };

    // Execution when both signature motion has reached 100% and assets are ready
    const handleCompletion = () => {
      if (isExiting) return;
      isExiting = true;

      progressProxy.value = 1.0;
      updateDisplay();

      if (pathEl) {
        pathEl.style.strokeDashoffset = "0px";
      }
      if (numValRef.current) numValRef.current.textContent = "1.00";
      if (pctValRef.current) pctValRef.current.textContent = "100%";

      // Gently solidify finished gold architectural insignia
      if (markFillRef.current) {
        gsap.to(markFillRef.current, {
          opacity: 0.92,
          duration: 0.35,
          ease: "power2.out"
        });
      }

      if (loop) {
        setTimeout(() => {
          progressProxy.value = 0;
          lastPct = -1;
          isExiting = false;
          isMotionComplete = false;
          if (markFillRef.current) markFillRef.current.style.opacity = "0";
          if (pathEl) pathEl.style.strokeDashoffset = `${totalLength}px`;
          startSignatureMotion();
        }, 1800);
        return;
      }

      // AS SOON AS PRELOADER HITS 100: Trigger the website entrance immediately
      onCompleteRef.current?.();

      if (!containerRef.current) {
        setIsFinished(true);
        return;
      }

      // Smoothly dissolve preloader overlay directly into the already-rendered website
      const exitTl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
        }
      });

      exitTl
        .to([stageRef.current, counterRef.current], {
          opacity: 0,
          y: -10,
          duration: 0.25,
          ease: "power2.out"
        })
        .to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out"
          },
          "-=0.1"
        );
    };

    const checkCanExit = () => {
      if (isMotionComplete && isAssetsReady && !isExiting) {
        handleCompletion();
      }
    };

    // Unbroken, fluid signature motion from 0% to 100% starting from the silhouette
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
        }
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
        bottom: 0
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
            {/* Subtle Ghost Silhouette Gradient for background guide */}
            <linearGradient id="metallic-ghost-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#E0B9A0" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#AE917E" stopOpacity="0.10" />
            </linearGradient>

            {/* Authentic metallic architectural gold gradient for signature drafting line */}
            <linearGradient id="metallic-architectural-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" />
              <stop offset="40%" stopColor="#E0B9A0" />
              <stop offset="100%" stopColor="#AE917E" />
            </linearGradient>

            {/* Solid gold insignia fill */}
            <linearGradient id="metallic-solid-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" />
              <stop offset="50%" stopColor="#E0B9A0" />
              <stop offset="100%" stopColor="#AE917E" />
            </linearGradient>
          </defs>

          {/* Ghost Silhouette Layer: Visible from frame 0 establishing the architectural mark */}
          <path
            d={LOGO_PATH}
            fill="none"
            stroke="url(#metallic-ghost-gold)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="miter"
            strokeMiterlimit="3"
            className="pointer-events-none"
          />

          {/* Solid architectural gold fill that smoothly solidifies at 100% */}
          <path
            ref={markFillRef}
            d={LOGO_PATH}
            fill="url(#metallic-solid-gold)"
            className="opacity-0 pointer-events-none transition-opacity duration-300"
          />

          {/* Active Signature Drafting Path: Traces starting from the silhouette in signature format */}
          <path
            ref={pathRef}
            d={LOGO_PATH}
            fill="none"
            stroke="url(#metallic-architectural-gold)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="miter"
            strokeMiterlimit="3"
            className="will-change-[stroke-dashoffset]"
          />
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
