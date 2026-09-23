import React, { useRef, useState, useEffect, useCallback } from "react";

export default function RestorationSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeVideoRef = useRef<HTMLVideoElement>(null);
  const afterVideoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);

  // Measure container width for accurate video sizing
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Sync before video currentTime to after video
  useEffect(() => {
    const after = afterVideoRef.current;
    const before = beforeVideoRef.current;
    if (!after || !before) return;
    const sync = () => {
      if (Math.abs(before.currentTime - after.currentTime) > 0.25) {
        before.currentTime = after.currentTime;
      }
    };
    after.addEventListener("timeupdate", sync);
    return () => after.removeEventListener("timeupdate", sync);
  }, []);

  // Zero-bleed dominant-side audio: strict threshold at 50%
  useEffect(() => {
    const before = beforeVideoRef.current;
    const after = afterVideoRef.current;
    if (!before || !after) return;

    const beforeDominant = sliderPos > 50;
    const afterDominant = sliderPos <= 50;

    // Mute both first for zero bleed
    before.muted = true;
    after.muted = true;

    if (beforeDominant) {
      // Before is dominant: fade in based on how far past 50
      const vol = Math.min(1, (sliderPos - 50) / 30);
      before.muted = vol <= 0;
      if (!before.muted) before.volume = vol;
    }
    if (afterDominant && sliderPos < 50) {
      const vol = Math.min(1, (50 - sliderPos) / 30);
      after.muted = vol <= 0;
      if (!after.muted) after.volume = vol;
    }
  }, [sliderPos]);

  const getPercent = useCallback((clientX: number) => {
    if (!containerRef.current) return sliderPos;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, [sliderPos]);

  // Mouse drag — attached to window so handle never "escapes"
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setSliderPos(getPercent(e.clientX));
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, getPercent]);

  // Touch — prevent page scroll on the slider itself
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // block vertical scroll
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setSliderPos(getPercent(e.touches[0].clientX));
      });
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [getPercent]);

  const [yearDisplay] = useState(() => {
    const days = Math.floor((Date.now() - new Date("2024-01-01").getTime()) / 86400000);
    return `Est. 2024 · ${days} days active`;
  });

  return (
    <section className="section-obsidian border-t border-white/10 overflow-hidden">
      {/* ── Text Strip ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-16 sm:pt-24 lg:pt-32 pb-10 sm:pb-16
                      grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-end">
        <div className="space-y-4 sm:space-y-6">
          <span className="text-primary font-display text-[8.5px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase leading-none block">
            RESTORATION SERIES
          </span>
          <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white tracking-tighter leading-[0.98] uppercase">
            THE ART OF <br />
            <span className="text-primary italic">REBIRTH</span>
          </h3>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed font-light">
            At Yanhal Holdings Ltd, transformation is not just about changing how a space
            looks — it is about restoring its purpose, improving functionality, and
            extending its long-term value.
          </p>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8">
            <div className="flex flex-col gap-2 sm:gap-3">
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">history</span>
              <div>
                <p className="text-[8px] sm:text-[9px] font-display text-white/30 tracking-widest mb-1 leading-none uppercase">
                  The Heritage
                </p>
                <p className="text-xs sm:text-sm font-medium text-white">Legacy State</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">auto_awesome</span>
              <div>
                <p className="text-[8px] sm:text-[9px] font-display text-white/30 tracking-widest mb-1 leading-none uppercase">
                  The Vision
                </p>
                <p className="text-xs sm:text-sm font-medium text-white">Modernist Estate</p>
              </div>
            </div>
          </div>

          <p className="text-[8.5px] sm:text-[9px] font-display text-primary/50 tracking-[0.3em] sm:tracking-[0.4em] uppercase">
            {yearDisplay}
          </p>
        </div>
      </div>

      {/* ── Full-Width Cinematic Slider ─────────────────── */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        className="relative w-full overflow-hidden select-none"
        style={{
          height: "clamp(320px, 58vh, 700px)",
          cursor: isDragging ? "col-resize" : "col-resize",
          touchAction: "none",          // block browser scroll on touch
          willChange: "transform",      // GPU layer hint
        }}
      >
        {/* AFTER (New Vision) — full-bleed background */}
        <video
          ref={afterVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          src="/portfolio-after.mp4"
        />

        {/* BEFORE (Legacy) — clipped reveal panel */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{
            width: `${sliderPos}%`,
            willChange: "width",
          }}
        >
          <video
            ref={beforeVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src="/portfolio-before.mp4"
            className="absolute top-0 left-0 h-full object-cover grayscale brightness-50 contrast-125"
            style={{
              width: containerW > 0 ? `${containerW}px` : "100vw",
              maxWidth: "none",
              willChange: "transform",
            }}
          />
        </div>

        {/* Peach gold divider line */}
        <div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            left: `calc(${sliderPos}% - 1px)`,
            width: "2px",
            background: "linear-gradient(to bottom, transparent, #E0B9A0 15%, #E0B9A0 85%, transparent)",
            boxShadow: "0 0 24px rgba(224,185,160,0.7)",
            willChange: "left",
          }}
        />

        {/* Drag handle — always follows divider */}
        <div
          onMouseDown={onMouseDown}
          className="absolute top-1/2 z-20 flex items-center justify-center
                     w-14 h-14 rounded-full bg-[#E0B9A0] text-[#2D2926] shadow-2xl
                     hover:scale-110 active:scale-95 transition-transform duration-100 cursor-pointer"
          style={{
            left: `${sliderPos}%`,
            transform: "translate(-50%, -50%)",
            cursor: "col-resize",
            willChange: "left",
          }}
        >
          <span className="material-symbols-outlined font-bold text-xl">swap_horiz</span>
        </div>

        {/* Labels */}
        <div className="absolute bottom-6 left-6 text-[9px] px-3 py-1.5 bg-black/80
                        text-white tracking-[0.3em] font-display uppercase pointer-events-none
                        backdrop-blur-sm border border-white/10 rounded-sm">
          Legacy State
        </div>
        <div className="absolute bottom-6 right-6 text-[9px] px-3 py-1.5 bg-[#E0B9A0]
                        text-[#2D2926] tracking-[0.3em] font-display uppercase font-bold
                        pointer-events-none rounded-sm">
          New Vision
        </div>

        {/* Hint badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[8px] px-4 py-1.5
                        bg-black/60 text-white/70 tracking-[0.3em] font-display uppercase
                        pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 rounded-full">
          ← Drag to Compare →
        </div>

        {/* Subtle vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)"
          }}
        />
      </div>

      {/* Seamless Color Bleed: Portfolio Espresso into Testimonials Ivory */}
      <div className="w-full h-16 sm:h-24 bg-gradient-to-b from-[#2D2926] via-[#9D9189]/40 via-[#FAF8F5]/80 to-[#FAF8F5] relative z-10 pointer-events-none" />
    </section>
  );
}
