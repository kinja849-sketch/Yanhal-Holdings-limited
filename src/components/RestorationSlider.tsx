import React, { useRef, useState, useEffect } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import SoundSticker from "./SoundSticker";

// Baseline heights of the 7 bars matching the visual reference
const S = [0.38, 0.58, 0.32, 0.78, 0.46, 0.42, 0.24];

// Order of vertical rise stagger: Center peak first (3), radiating outward
const F: number[] = [];
[3, 2, 4, 1, 5, 0, 6].forEach((barIdx, step) => {
  F[barIdx] = 0.035 * step;
});

// Order of lateral gap merge stagger: Center gaps close first
const M: number[] = [];
[2, 3, 1, 4, 0, 5].forEach((gapIdx, step) => {
  M[gapIdx] = 0.022 * step;
});

// Locked Aroclux Yanhal Palette Gradients for the 7 architectural pill tints
const YANHAL_TINTS = [
  "linear-gradient(180deg, #E0B9A0 0%, #AE917E 100%)", // Peach Gold to Sandstone
  "linear-gradient(180deg, #AE917E 0%, #867163 100%)", // Sandstone to Warm Bronze
  "linear-gradient(180deg, #FAF8F5 0%, #E0B9A0 100%)", // Ivory to Peach Gold
  "linear-gradient(180deg, #E0B9A0 0%, #2D2926 100%)", // Center Peak: Peach Gold to Espresso
  "linear-gradient(180deg, #AE917E 0%, #E0B9A0 100%)",
  "linear-gradient(180deg, #867163 0%, #AE917E 100%)",
  "linear-gradient(180deg, #FAF8F5 0%, #AE917E 100%)",
];

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const mapRange = (val: number, inMin: number, inMax: number) =>
  clamp((val - inMin) / (inMax - inMin));

export default function RestorationSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  const rectsRef = useRef<(SVGRectElement | null)[]>([]);
  const tintsRef = useRef<(HTMLDivElement | null)[]>([]);

  const videoVisionRef = useRef<HTMLVideoElement>(null);
  const videoLegacyRef = useRef<HTMLVideoElement>(null);

  const [activeMedia, setActiveMedia] = useState<"after" | "before">("after");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeMediaRef = useRef<"after" | "before">("after");
  const isPlayingAudioRef = useRef(false);

  activeMediaRef.current = activeMedia;
  isPlayingAudioRef.current = isPlayingAudio;

  const [yearDisplay] = useState(() => {
    const days = Math.floor((Date.now() - new Date("2024-01-01").getTime()) / 86400000);
    return `Est. 2024 · ${days} days active`;
  });

  // Master Sound Engine: Strictly enforces that only ONE audio track plays at any time
  const applyAudioState = (media: "after" | "before", audioEnabled: boolean) => {
    const vVision = videoVisionRef.current;
    const vLegacy = videoLegacyRef.current;
    if (!vVision || !vLegacy) return;

    if (!audioEnabled) {
      // Audio is OFF: strictly mute and zero volume on BOTH videos
      vVision.muted = true;
      vVision.volume = 0;
      vLegacy.muted = true;
      vLegacy.volume = 0;
    } else {
      // Audio is ON: strictly mute inactive video first, unmute ONLY active video
      if (media === "after") {
        // 1. Silenced immediately
        vLegacy.muted = true;
        vLegacy.volume = 0;
        // 2. Activated with full volume
        vVision.muted = false;
        vVision.volume = 1;
        const playPromise = vVision.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        // 1. Silenced immediately
        vVision.muted = true;
        vVision.volume = 0;
        // 2. Activated with full volume
        vLegacy.muted = false;
        vLegacy.volume = 1;
        const playPromise = vLegacy.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    }
  };

  const handleMediaSwitch = (media: "after" | "before") => {
    activeMediaRef.current = media;
    setActiveMedia(media);
    applyAudioState(media, isPlayingAudioRef.current);
  };

  const toggleAudio = () => {
    const nextState = !isPlayingAudioRef.current;
    isPlayingAudioRef.current = nextState;
    setIsPlayingAudio(nextState);
    applyAudioState(activeMediaRef.current, nextState);
  };

  // Safe cleanup on component unmount
  useEffect(() => {
    return () => {
      if (videoVisionRef.current) {
        videoVisionRef.current.muted = true;
        videoVisionRef.current.volume = 0;
        videoVisionRef.current.pause();
      }
      if (videoLegacyRef.current) {
        videoLegacyRef.current.muted = true;
        videoLegacyRef.current.volume = 0;
        videoLegacyRef.current.pause();
      }
    };
  }, []);

  // Coordinated GSAP ScrollTrigger Scrubbing with exact dkton.at mathematical algorithm
  useGSAP(
    () => {
      const container = containerRef.current;
      const typo = typographyRef.current;
      const hud = hudRef.current;
      const progressLine = progressLineRef.current;
      if (!container) return;

      let stageW = container.clientWidth;
      let stageH = container.clientHeight;

      const updateDimensions = () => {
        if (!container) return;
        stageW = container.clientWidth;
        stageH = container.clientHeight;
      };

      updateDimensions();

      // Render the 7 bars and choreography given exact scroll progress k in [0, 1]
      const renderFrame = (k: number, time = 0) => {
        if (!stageW || !stageH) return;

        // Step 1: Rise progress (k: 0 -> 0.40)
        const riseProgress = mapRange(k, 0, 0.40);
        // Step 2: Full view expansion (k: 0.40 -> 0.68)
        const fullViewProgress = smoothstep(mapRange(k, 0.40, 0.68));

        // Spatial metrics matching dkton.at
        const outerMargin = 0.03 * stageW;
        const barGap = 0.012 * stageW;
        const baseBarW = (stageW - 2 * outerMargin - 6 * barGap) / 7;
        const bottomBleed = outerMargin * (1 - fullViewProgress);
        const baselineY = stageH - bottomBleed;

        let currentX =
          outerMargin *
          (1 - smoothstep(mapRange(k, 0.40 + M[0], 0.40 + M[0] + 0.15)));

        for (let n = 0; n < 7; n++) {
          // Idle gentle equalizer breathing at rest
          const idlePulse =
            (1 - mapRange(k, 0, 0.12)) *
            0.02 *
            Math.sin(0.0012 * time + 1.85 * n);
          const baseH = S[n] + idlePulse;

          const barRiseT = smoothstep(
            mapRange(riseProgress, F[n], F[n] + 0.65)
          );
          const interpolatedH = lerp(baseH, 1 + bottomBleed / stageH, barRiseT);

          const prevGapM = n === 0 ? null : M[n - 1];
          const nextGapM = n === 6 ? null : M[n];

          const leftMerge = smoothstep(
            prevGapM === null
              ? mapRange(k, 0.40 + M[0], 0.40 + M[0] + 0.15)
              : mapRange(k, 0.40 + prevGapM, 0.40 + prevGapM + 0.15)
          );
          const rightMerge = smoothstep(
            nextGapM === null
              ? mapRange(k, 0.40 + M[5], 0.40 + M[5] + 0.15)
              : mapRange(k, 0.40 + nextGapM, 0.40 + nextGapM + 0.15)
          );

          const currentBarH = Math.max(
            interpolatedH * stageH,
            fullViewProgress * (stageH + bottomBleed)
          );
          const currentBarW =
            baseBarW +
            (n === 0 ? outerMargin * leftMerge : 0.5 * barGap * leftMerge) +
            (n === 6 ? outerMargin * rightMerge : 0.5 * barGap * rightMerge);

          // Subpixel anti-aliasing overlap between adjacent bars to eliminate any 1px hairline rendering slit
          const overlap = (n < 6 ? 1.5 : 0) * Math.max(leftMerge, rightMerge);

          // Corner radius transitions from pill (baseBarW / 2) to 0 at full view
          const cornerRadius =
            (baseBarW / 2) * (1 - Math.max(leftMerge, rightMerge));

          const rectEl = rectsRef.current[n];
          if (rectEl) {
            rectEl.setAttribute("x", currentX.toFixed(1));
            rectEl.setAttribute("y", (baselineY - currentBarH).toFixed(1));
            rectEl.setAttribute("width", (currentBarW + overlap).toFixed(1));
            rectEl.setAttribute(
              "height",
              Math.max(0, currentBarH + bottomBleed + 2).toFixed(1)
            );
            rectEl.setAttribute("rx", cornerRadius.toFixed(1));
            rectEl.setAttribute("ry", cornerRadius.toFixed(1));
          }

          // Tint overlay per bar
          const tintEl = tintsRef.current[n];
          if (tintEl) {
            const tintOpacity = 0.88 * (1 - barRiseT);
            tintEl.style.opacity = tintOpacity.toFixed(3);
            if (tintOpacity > 0.005) {
              tintEl.style.display = "block";
              tintEl.style.width = (currentBarW + overlap).toFixed(1) + "px";
              tintEl.style.height =
                Math.max(0, currentBarH + bottomBleed + 2).toFixed(1) + "px";
              tintEl.style.borderRadius = cornerRadius.toFixed(1) + "px";
              tintEl.style.transform = `translate3d(${currentX.toFixed(
                1
              )}px, ${(baselineY - currentBarH).toFixed(1)}px, 0)`;
            } else {
              tintEl.style.display = "none";
            }
          }

          currentX += currentBarW + (n < 6 ? barGap * (1 - rightMerge) : 0);
        }

        // Typography Choreography
        if (typo) {
          const typoFadeProgress = mapRange(k, 0.02, 0.32);
          const typoOpacity = (1 - smoothstep(typoFadeProgress)).toFixed(3);
          const typoTranslateY = (-45 * smoothstep(typoFadeProgress)).toFixed(1);
          const typoBlur = (6 * smoothstep(typoFadeProgress)).toFixed(1);

          typo.style.opacity = typoOpacity;
          typo.style.transform = `translate3d(0, ${typoTranslateY}px, 0)`;
          typo.style.filter = `blur(${typoBlur}px)`;
          typo.style.pointerEvents = Number(typoOpacity) > 0.3 ? "auto" : "none";
        }

        // HUD Controls at Full View (k >= 0.58)
        if (hud) {
          const hudFadeProgress = smoothstep(mapRange(k, 0.58, 0.70));
          hud.style.opacity = hudFadeProgress.toFixed(3);
          hud.style.transform = `translate3d(0, ${(
            15 *
            (1 - hudFadeProgress)
          ).toFixed(1)}px, 0)`;
          hud.style.pointerEvents = hudFadeProgress > 0.4 ? "auto" : "none";
        }

        // Progress line
        if (progressLine) {
          progressLine.style.transform = `scaleX(${k.toFixed(3)})`;
        }
      };

      // Initial frame render at k = 0
      renderFrame(0, 0);

      // Master GSAP ScrollTrigger with Pinning
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=220%",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        refreshPriority: 10,
        onUpdate: (self) => {
          renderFrame(self.progress, performance.now());
        },
        onRefresh: (self) => {
          updateDimensions();
          renderFrame(self.progress, performance.now());
        },
        onLeave: () => {
          isPlayingAudioRef.current = false;
          setIsPlayingAudio(false);
          applyAudioState(activeMediaRef.current, false);
        },
        onLeaveBack: () => {
          isPlayingAudioRef.current = false;
          setIsPlayingAudio(false);
          applyAudioState(activeMediaRef.current, false);
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="arts-of-rebirth"
      className="relative w-full h-screen min-h-[640px] bg-[#080809] text-[#FAF8F5] overflow-hidden select-none flex flex-col justify-center items-center"
      style={{ willChange: "transform" }}
    >
      {/* Dynamic SVG ClipPath with 7 Rects in userSpaceOnUse */}
      <svg
        className="absolute w-0 h-0 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="rebirthPegelClip" clipPathUnits="userSpaceOnUse">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect
                key={i}
                ref={(el) => {
                  rectsRef.current[i] = el;
                }}
              />
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* ── 1. The Art of Rebirth Typography Block (Centered Monumental Title) ── */}
      <div
        ref={typographyRef}
        className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 sm:px-8 pointer-events-none select-none will-change-transform pb-24 sm:pb-36"
      >
        <span className="text-[#E0B9A0] font-display text-[9px] sm:text-[11px] md:text-xs tracking-[0.45em] sm:tracking-[0.55em] uppercase leading-none block font-bold mb-3 sm:mb-5 drop-shadow-[0_0_12px_rgba(224,185,160,0.35)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]" />
          RESTORATION SERIES &bull; 09
        </span>

        <h2 className="font-display text-4xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tighter uppercase leading-[0.92] font-black drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-6xl">
          THE ART OF <br />
          <span className="text-[#E0B9A0] italic font-normal tracking-tight">
            REBIRTH
          </span>
        </h2>

        <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-light max-w-xl mx-auto mt-4 sm:mt-6 px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          At Yanhal Holdings Ltd, transformation is not just about changing how a space looks —
          it is about restoring its purpose, improving functionality, and extending its value.
        </p>

        <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-5 text-[8.5px] sm:text-[9.5px] font-display uppercase tracking-widest text-[#E0B9A0]/70">
          <span className="flex items-center gap-1.5 text-white/90">
            <span className="w-1 h-1 rounded-full bg-[#E0B9A0]" />
            Modernist Estate
          </span>
          <span>&bull;</span>
          <span>{yearDisplay}</span>
        </div>
      </div>

      {/* ── 2. Cinematic Showreel Film Layer (Clipped by the 7 Bars with Zero Distortion) ── */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-15"
        style={{
          clipPath: "url(#rebirthPegelClip)",
          WebkitClipPath: "url(#rebirthPegelClip)",
        }}
      >
        {/* Modernist Vision Video (After) */}
        <video
          ref={videoVisionRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/portfolio-after.mp4"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            activeMedia === "after" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Legacy Archive Video (Before) */}
        <video
          ref={videoLegacyRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/portfolio-before.mp4"
          className={`absolute inset-0 w-full h-full object-cover grayscale brightness-75 contrast-110 transition-opacity duration-700 ${
            activeMedia === "before" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Deep Cinematic Contrast Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(8,8,9,0.65) 100%)",
          }}
        />
      </div>

      {/* ── 3. Architectural Pill Tints Layer (Yanhal Branding Colors) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-18">
        {YANHAL_TINTS.map((gradient, i) => (
          <div
            key={i}
            ref={(el) => {
              tintsRef.current[i] = el;
            }}
            className="absolute top-0 left-0 will-change-transform shadow-[0_0_24px_rgba(224,185,160,0.25)]"
            style={{
              background: gradient,
              display: "none",
            }}
          />
        ))}
      </div>

      {/* ── 4. Minimalist Yanhal Cinematic HUD (Revealed at Full View) ── */}
      <div
        ref={hudRef}
        className="absolute inset-0 z-30 pointer-events-none p-4 sm:p-8 md:p-12 flex flex-col justify-between"
        style={{ opacity: 0 }}
      >
        {/* Top Bar HUD */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-full border border-white/10 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#E0B9A0] animate-pulse" />
            <span className="font-display text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-white font-bold">
              YANHAL CINEMA &bull; {activeMedia === "after" ? "MODERNIST VISION" : "LEGACY ARCHIVE"}
            </span>
          </div>

          {/* ── Tactile Yanhal Sound Sticker Station (Scoped Strictly to The Art of Rebirth) ── */}
          <SoundSticker
            isPlayingAudio={isPlayingAudio}
            onToggle={toggleAudio}
            size="default"
            showLabel={true}
            className="hidden sm:flex"
          />
        </div>

        {/* Bottom Bar HUD */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
          {/* Context Badge */}
          <div className="bg-black/75 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-white/10 max-w-sm hidden sm:block shadow-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[#E0B9A0] font-display text-[8.5px] uppercase tracking-[0.3em] font-bold">
                The Art of Rebirth &bull; Nairobi
              </p>
              <span className="font-mono text-[8px] uppercase tracking-widest text-[#FAF8F5]/60 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlayingAudio ? "bg-[#E0B9A0] animate-pulse" : "bg-stone-500"}`} />
                {isPlayingAudio ? "Stereo 44.1kHz" : "Audio Inactive"}
              </span>
            </div>
            <p className="text-stone-300 text-[10px] sm:text-[11px] leading-relaxed font-light mb-2">
              {activeMedia === "after"
                ? "Completed restoration featuring refined architectural geometry, modern finishes, and renewed functionality."
                : "Original legacy structure prior to targeted reinforcement and high-performance renovation."}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>Track: {activeMedia === "after" ? "01 · Modernist Horizon" : "02 · Raw Structure Echo"}</span>
              <span className={isPlayingAudio ? "text-[#E0B9A0] font-bold" : "text-stone-500"}>
                {isPlayingAudio ? "LIVE AUDIO" : "MUTED"}
              </span>
            </div>
          </div>

          {/* Interactive Media Switcher & Mobile Audio Deck */}
          <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-end sm:self-auto">
            {/* Before / After Media Switcher */}
            <div className="flex items-center bg-black/85 backdrop-blur-md p-1 rounded-full border border-white/15 shadow-2xl">
              <button
                onClick={() => handleMediaSwitch("after")}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-display text-[9px] sm:text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeMedia === "after"
                    ? "bg-[#E0B9A0] text-[#2D2926] font-bold shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {activeMedia === "after" && isPlayingAudio && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D2926] animate-ping" />
                )}
                Modernist Vision
              </button>
              <button
                onClick={() => handleMediaSwitch("before")}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-display text-[9px] sm:text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  activeMedia === "before"
                    ? "bg-[#E0B9A0] text-[#2D2926] font-bold shadow-md"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {activeMedia === "before" && isPlayingAudio && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D2926] animate-ping" />
                )}
                Legacy State
              </button>
            </div>

            {/* Quick Audio Sticker in Bottom Deck for direct mobile accessibility */}
            <SoundSticker
              isPlayingAudio={isPlayingAudio}
              onToggle={toggleAudio}
              size="compact"
              showLabel={false}
              className="sm:hidden"
            />
          </div>
        </div>
      </div>

      {/* ── 5. Scrub Progress Track ────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-white/10 overflow-hidden pointer-events-none z-30">
        <div
          ref={progressLineRef}
          className="h-full w-full bg-gradient-to-r from-[#E0B9A0]/50 via-[#E0B9A0] to-[#E0B9A0] origin-left shadow-[0_0_10px_#E0B9A0]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </section>
  );
}
