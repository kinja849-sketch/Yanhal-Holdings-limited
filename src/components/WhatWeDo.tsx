import { useState, useRef, useEffect, useCallback } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import {
  BuildingOffice2Icon,
  SparklesIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Capability {
  id: string;
  number: string;
  category: string;
  title: string;
  shortTitle: string;
  tagline: string;
  copy: string;
  deliverables: string[];
  metrics: { label: string; value: string }[];
  image: string;
  icon: typeof BuildingOffice2Icon;
  colorName: string;
  colorClass: {
    badge: string;
    border: string;
    text: string;
    bg: string;
    activeBorder: string;
  };
  ctaText: string;
  badge: string;
}

const capabilities: Capability[] = [
  {
    id: "construction",
    number: "01",
    category: "Turnkey Development",
    title: "Construction Services",
    shortTitle: "Construction",
    tagline: "From Groundbreaking to Key Handover",
    copy: "Full-scope residential & commercial construction. Site management, labour & material coordination, transparent progress tracking. Ready-to-use structures delivered on agreed timelines.",
    deliverables: [
      "Full project management from foundation to handover for residential & commercial structures",
      "Site management, skilled labour & vetted material coordination",
      "Structural engineering, foundation works & multi-story builds",
      "Transparent progress tracking & milestone-based reporting",
      "Cabro paving, boundary walls, drainage & civil works",
    ],
    metrics: [
      { label: "Delivery", value: "Turnkey" },
      { label: "Milestones", value: "Transparent" },
      { label: "Coverage", value: "Nairobi & Metro" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA4WjWo8QINsAcQrYNWldg-_yGtyRXcaY9GxuqfxqqJUNjJKGVKJK9k6BzdvAdOzlrFc0qGytCm7nFfkPVpw2UlXE0TD5jpBgQTsdfZnze6HPKR-F_LIJU5GB6vFn6scCUpiJeERFbPfixe-j6ROpmSAdI1CdlLIAY80wEX0mhEBON0ym3N7POBq2yiTBXEz4MzKsTFVLNow8pdkmwATpc0EgppXhpFChCjd0QtqA3nJNn-BlEaoP5KLBdor2BL9MWporxSU7Evb2s",
    icon: BuildingOffice2Icon,
    colorName: "sandstone-gold",
    colorClass: {
      badge: "bg-[#E0B9A0]/10 text-[#E0B9A0] border-[#E0B9A0]/30",
      border: "border-[#E0B9A0]/30",
      text: "text-[#E0B9A0]",
      bg: "bg-[#E0B9A0]/15",
      activeBorder: "border-[#E0B9A0]",
    },
    ctaText: "Get an Estimate for Construction",
    badge: "Foundation to Handover",
  },
  {
    id: "interiors",
    number: "02",
    category: "Bespoke Finishing",
    title: "Interior Design & Finishing",
    shortTitle: "Interior & Finishing",
    tagline: "Spaces That Look Polished & Work for Life",
    copy: "Kitchens, cabinetry, gypsum, flooring, WPC and lighting. Spaces that look polished and work for daily life or business.",
    deliverables: [
      "Custom kitchens, cabinetry, gypsum ceilings, flooring, WPC paneling & lighting",
      "Bespoke joinery, wardrobes, vanity units & tailored storage",
      "Multi-level gypsum ceiling designs with integrated LED coves",
      "WPC acoustic fluted wall cladding & accent paneling",
      "Porcelain, wood-plank tiles & premium architectural hardware",
    ],
    metrics: [
      { label: "Finishing", value: "Bespoke" },
      { label: "Lighting", value: "Integrated MEP" },
      { label: "Materials", value: "Premium Grade" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJgMhD7gZWYj9nwCwAFa-s_MoIKJaAnmbe-zn3uBPh48eBIKvCEch2bMTbhJUPuyiGd3xOAaHMgOxV4wAuxxpzfEQgYQp2nVdmKxWuFOxOHzxiTBU_8aHJbCdrz2gLUnOtlqhEf_fW64XTmQM517tep7HZP8zDhABYK0kkq81z7izN8oogn9qs2dgWo0GQGK2n3fEpTpc3UT72jM5V1f_qlOZDg4xVYqazE9EzCsqqR_8NJDkTNURHO3-hXixe5EteZZE-VjGkCkk",
    icon: SparklesIcon,
    colorName: "warm-ivory",
    colorClass: {
      badge: "bg-[#FAF8F5]/10 text-[#FAF8F5] border-[#AE917E]/30",
      border: "border-[#AE917E]/30",
      text: "text-[#FAF8F5]",
      bg: "bg-[#FAF8F5]/10",
      activeBorder: "border-[#AE917E]",
    },
    ctaText: "Get an Interior Finishing Estimate",
    badge: "Custom Millwork & Lighting",
  },
  {
    id: "renovation",
    number: "03",
    category: "Modernization",
    title: "Renovation & Remodeling",
    shortTitle: "Renovation",
    tagline: "Upgrade Existing Spaces with Minimal Disruption",
    copy: "Upgrade existing homes and commercial spaces. Practical improvements that maximise value while minimising disruption.",
    deliverables: [
      "Upgrade and remodel existing homes, shops and offices with minimal disruption",
      "Complete bathroom and kitchen structural renovations",
      "Space reconfiguration, wall removals & open-plan conversions",
      "Plumbing, electrical rewiring & waterproofing overhauls",
      "Phased on-site execution to keep facilities functional during work",
    ],
    metrics: [
      { label: "Property Value", value: "Maximised" },
      { label: "Disruption", value: "Minimised" },
      { label: "Execution", value: "Phased" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBU5rrJrv0XSO0txUIddgRLI4hOVJqCIxPZDcr32giPrLr3EoRik0_-YfPdnc_KtgpzJJm-_45B588EmCsQfjwNwaKxT4PysG9Of6wAyO-byQ3Xn48JvYeevNUaKaK3FY8K-kEftEFLykf5-RLZ0uvao4s9GOUtehJnukMTc-hy-VsI2ob7M114D4l_LsJ5zllEmHvTse1DkBNqRiWe7j7eK-Wj_K6o0gADqR25ghBDDp_8_HZNwJmgTJt0f7a3Rl_AgfdIFSfp3OE",
    icon: ArrowPathIcon,
    colorName: "sandstone-gold",
    colorClass: {
      badge: "bg-[#E0B9A0]/10 text-[#E0B9A0] border-[#E0B9A0]/30",
      border: "border-[#E0B9A0]/25",
      text: "text-[#E0B9A0]",
      bg: "bg-[#E0B9A0]/15",
      activeBorder: "border-[#E0B9A0]",
    },
    ctaText: "Request Renovation Consultation",
    badge: "Disruption-Minimized",
  },
  {
    id: "commercial",
    number: "04",
    category: "Retail & Commercial Units",
    title: "Custom Commercial Projects",
    shortTitle: "Custom Commercial",
    tagline: "Built for Visibility, Workflow & Immediate Use",
    copy: "Kiosks, booths and retail fit-outs designed for visibility, workflow and immediate use.",
    deliverables: [
      "Kiosks, retail fit-outs and small commercial units ready for business",
      "Turnkey mall kiosks, pop-up booths & modular retail pods",
      "Brand-aligned display counters, point-of-sale setups & lighting",
      "High-durability commercial surfaces engineered for heavy foot traffic",
      "Rapid turnaround designed for immediate revenue generation",
    ],
    metrics: [
      { label: "Readiness", value: "Immediate Use" },
      { label: "Workflow", value: "Optimised" },
      { label: "Turnaround", value: "Rapid" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaeFV-7KNBpps2-ELWn3KUvW7uFq7zlkDp2UR0JZ1fotpCQU5pnDn51g6xWJCASKsABXVdbItcamjtlpJaMebg9sd8IEPSsrfP92GrTOBvZOR553mIksZmLejdjmfFWkpqU6xwePrx5INhavcV6sWU1daQ_R4vURLD7D4hEfT2TNCbkKL5yXQ8JxRWqKw8jlo7IUVVUllNt8CC-aZDdbIVpKxAyF3AunTl4FrSrzw8Mu0X7KxdjKAejvlprI84Sh69_HrPajLNS8",
    icon: BuildingStorefrontIcon,
    colorName: "ochre-bronze",
    colorClass: {
      badge: "bg-[#AE917E]/15 text-[#E0B9A0] border-[#AE917E]/40",
      border: "border-[#AE917E]/30",
      text: "text-[#E0B9A0]",
      bg: "bg-[#AE917E]/20",
      activeBorder: "border-[#AE917E]",
    },
    ctaText: "Start Commercial Project",
    badge: "Ready for Business",
  },
];

// ─── Responsive Fan Geometry Calculation ─────────────────────────────────────
// Fluid layout with controlled offsets tailored to mobile, tablet, and desktop viewports
const getFanConfig = (index: number) => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0, rotation: 0, z: 0, zIndex: index + 1 };
  }
  const w = window.innerWidth;

  if (w >= 1280) {
    // Desktop wide (XL+)
    const spreadX = 215;
    const spreadY = 22;
    return [
      { x: -spreadX,        y: spreadY,         rotation: -16,  z: -20, zIndex: 1 },
      { x: -spreadX * 0.34, y: -spreadY * 0.25, rotation: -5,   z: -8,  zIndex: 2 },
      { x: spreadX * 0.34,  y: -spreadY * 0.25, rotation: 5,    z: -8,  zIndex: 3 },
      { x: spreadX,         y: spreadY,         rotation: 16,   z: -20, zIndex: 4 },
    ][index];
  } else if (w >= 1024) {
    // Desktop standard
    const spreadX = 175;
    const spreadY = 18;
    return [
      { x: -spreadX,        y: spreadY,         rotation: -14,  z: -18, zIndex: 1 },
      { x: -spreadX * 0.34, y: -spreadY * 0.25, rotation: -4.5, z: -7,  zIndex: 2 },
      { x: spreadX * 0.34,  y: -spreadY * 0.25, rotation: 4.5,  z: -7,  zIndex: 3 },
      { x: spreadX,         y: spreadY,         rotation: 14,   z: -18, zIndex: 4 },
    ][index];
  } else if (w >= 640) {
    // Tablet (SM to MD)
    const spreadX = 110;
    const spreadY = 14;
    return [
      { x: -spreadX,        y: spreadY,         rotation: -11,  z: -16, zIndex: 1 },
      { x: -spreadX * 0.34, y: -spreadY * 0.25, rotation: -3.5, z: -6,  zIndex: 2 },
      { x: spreadX * 0.34,  y: -spreadY * 0.25, rotation: 3.5,  z: -6,  zIndex: 3 },
      { x: spreadX,         y: spreadY,         rotation: 11,   z: -16, zIndex: 4 },
    ][index];
  } else {
    // Mobile (< 640px)
    // Carefully calibrated spread so all 4 cards overlap gently while keeping
    // their header, number, category badge, and titles partially exposed
    const spreadX = 52;
    const spreadY = 10;
    return [
      { x: -spreadX,        y: spreadY,         rotation: -8.5, z: -15, zIndex: 1 },
      { x: -spreadX * 0.32, y: -spreadY * 0.3,  rotation: -2.8, z: -6,  zIndex: 2 },
      { x: spreadX * 0.32,  y: -spreadY * 0.3,  rotation: 2.8,  z: -6,  zIndex: 3 },
      { x: spreadX,         y: spreadY,         rotation: 8.5,  z: -15, zIndex: 4 },
    ][index];
  }
};

export default function WhatWeDo() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  // Outer scene refs (controls x, y, z, rotation, scale, filter, opacity)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Inner flipper refs (strictly controls 3D rotationY for the card turn)
  const flipperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);
  const fanReady = useRef(false);

  // ─── Reverse Sequence: Flip back -> Settle -> Travel home to deck ─────────
  const handleClose = useCallback(() => {
    if (selectedCard === null || isAnimating.current) return;

    const closingIndex = selectedCard;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        setSelectedCard(null);
        isAnimating.current = false;
        // Restore z-indexes to natural fan defaults
        sceneRefs.current.forEach((scene, i) => {
          if (scene) gsap.set(scene, { zIndex: getFanConfig(i).zIndex });
        });
      },
    });

    const closingScene = sceneRefs.current[closingIndex];
    const closingFlipper = flipperRefs.current[closingIndex];
    const f = getFanConfig(closingIndex);

    // Phase 1: Flip back to front face while staying centered
    if (closingFlipper) {
      tl.to(
        closingFlipper,
        {
          rotationY: 0,
          duration: 0.62,
          ease: "power2.inOut",
        },
        0
      );
    }

    // Phase 2: Card remains momentarily in view; surrounding cards regain clarity
    sceneRefs.current.forEach((scene, i) => {
      if (!scene || i === closingIndex) return;
      const conf = getFanConfig(i);
      tl.to(
        scene,
        {
          opacity: 1,
          scale: 1,
          z: conf.z,
          x: conf.x,
          y: conf.y,
          rotation: conf.rotation,
          filter: "blur(0px)",
          duration: 0.52,
          ease: "power2.out",
        },
        0.5
      );
    });

    // Phase 3: Card scales down and travels back to its original slot and angle in the fan
    if (closingScene) {
      tl.to(
        closingScene,
        {
          x: f.x,
          y: f.y,
          rotation: f.rotation,
          z: f.z,
          scale: 1,
          duration: 0.58,
          ease: "power3.inOut",
        },
        0.64
      );
    }
  }, [selectedCard]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCard !== null && !isAnimating.current) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard, handleClose]);

  // Window resize listener: smoothly adjusts card fan positions on orientation or viewport change
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (selectedCard !== null || isAnimating.current || !fanReady.current) return;
        sceneRefs.current.forEach((scene, i) => {
          if (!scene) return;
          const conf = getFanConfig(i);
          gsap.to(scene, {
            x: conf.x,
            y: conf.y,
            rotation: conf.rotation,
            z: conf.z,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [selectedCard]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      sceneRefs.current.forEach((s) => {
        if (s) gsap.killTweensOf(s);
      });
      flipperRefs.current.forEach((f) => {
        if (f) gsap.killTweensOf(f);
      });
    };
  }, []);

  // ─── Entry Fan-In Animation via ScrollTrigger ─────────────────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Motion enabled: Staggered entry from center across all screen sizes
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        sceneRefs.current.forEach((scene) => {
          if (!scene) return;
          gsap.set(scene, {
            x: 0,
            y: 0,
            rotation: 0,
            z: 0,
            opacity: 0,
            scale: 0.88,
            filter: "blur(0px)",
          });
        });

        flipperRefs.current.forEach((flipper) => {
          if (!flipper) return;
          gsap.set(flipper, { rotationY: 0 });
        });

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({
              onComplete: () => {
                fanReady.current = true;
              },
            });
            sceneRefs.current.forEach((scene, i) => {
              if (!scene) return;
              const f = getFanConfig(i);
              tl.to(
                scene,
                {
                  x: f.x,
                  y: f.y,
                  rotation: f.rotation,
                  z: f.z,
                  opacity: 1,
                  scale: 1,
                  duration: 0.85,
                  ease: "power3.out",
                },
                i * 0.08
              );
            });
          },
        });
      });

      // Reduced motion: Direct placement without stagger
      mm.add("(prefers-reduced-motion: reduce)", () => {
        sceneRefs.current.forEach((scene, i) => {
          if (!scene) return;
          const f = getFanConfig(i);
          gsap.set(scene, {
            x: f.x,
            y: f.y,
            rotation: f.rotation,
            z: f.z,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          });
        });
        flipperRefs.current.forEach((flipper) => {
          if (!flipper) return;
          gsap.set(flipper, { rotationY: 0 });
        });
        fanReady.current = true;
      });
    },
    { scope: containerRef }
  );

  // ─── Desktop Hover Lift & Micro-Nudge (fine pointer only) ────────────────
  const handleMouseEnter = (index: number) => {
    // Only fire on pointer devices with hover support
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    if (selectedCard !== null || isAnimating.current || !fanReady.current) return;
    const f = getFanConfig(index);

    sceneRefs.current.forEach((scene, i) => {
      if (!scene) return;
      if (i === index) {
        // Target card subtly separates and lifts forward
        gsap.to(scene, {
          y: f.y - 24,
          scale: 1.06,
          z: f.z + 45,
          duration: 0.32,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        // Surrounding cards make a small positional adjustment
        const nudge = i < index ? -10 : 10;
        gsap.to(scene, {
          x: getFanConfig(i).x + nudge,
          opacity: 0.78,
          duration: 0.32,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  };

  const handleMouseLeave = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    if (selectedCard !== null || !fanReady.current) return;
    sceneRefs.current.forEach((scene, i) => {
      if (!scene) return;
      const f = getFanConfig(i);
      gsap.to(scene, {
        x: f.x,
        y: f.y,
        rotation: f.rotation,
        z: f.z,
        scale: 1,
        opacity: 1,
        duration: 0.38,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  // ─── Click / Tap: Physical Extraction (Front Face) -> 3D Flip (Back Face) ──
  const handleCardClick = (index: number) => {
    if (selectedCard !== null || isAnimating.current || !fanReady.current) return;

    isAnimating.current = true;
    setSelectedCard(index);

    // Bring selected card above all other cards in z-space
    sceneRefs.current.forEach((scene, i) => {
      if (scene) gsap.set(scene, { zIndex: i === index ? 60 : getFanConfig(i).zIndex });
    });

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    // Controlled scale on mobile ensures card remains completely within viewport with ample margins
    const targetScale = isMobile ? 1.08 : 1.12;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    // ── Phase 1: Surrounding cards recede, blur, and dim into background ──
    sceneRefs.current.forEach((scene, i) => {
      if (!scene || i === index) return;
      tl.to(
        scene,
        {
          opacity: 0.14,
          scale: 0.78,
          z: getFanConfig(i).z - 80,
          filter: "blur(6px)",
          duration: 0.54,
          ease: "power3.inOut",
        },
        0
      );
    });

    // ── Phase 2: Selected card extracts from fan into central viewing position ─
    // STRICTLY remains on its FRONT face during this physical travel
    const selectedScene = sceneRefs.current[index];
    const selectedFlipper = flipperRefs.current[index];

    if (selectedScene) {
      tl.to(
        selectedScene,
        {
          x: 0,
          y: 0,
          rotation: 0,
          z: 130,
          scale: targetScale,
          filter: "blur(0px)",
          duration: 0.56,
          ease: "power3.inOut",
        },
        0
      );
    }

    // ── Phase 3: Only after completely reaching position does the 3D flip start ─
    if (selectedFlipper) {
      tl.to(
        selectedFlipper,
        {
          rotationY: 180,
          duration: 0.72,
          ease: "power2.inOut",
        },
        0.56 // Exact completion of travel
      );
    }
  };

  return (
    <section
      ref={containerRef}
      id="capabilities"
      className="section-brand-white relative z-10 pt-16 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 lg:pb-28 overflow-hidden bg-[#FAF8F5] text-[#2D2926]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-[2px] bg-[#AE917E]" />
              <span className="text-[#AE917E] font-mono text-[10px] tracking-[0.3em] uppercase font-bold">
                02 / Core Capabilities
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-[#2D2926] tracking-[0.1em] uppercase">
              What We <span className="text-[#AE917E] font-medium">Do</span>
            </h2>
          </div>
          <p className="text-stone-700 text-xs sm:text-sm md:text-base max-w-md font-sans font-normal leading-relaxed">
            From single-room interior transformations to multi-structure builds
            across Nairobi, our work is defined by transparent coordination and
            reliable delivery.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            UNIFIED ARCHITECTURAL FANNED DECK (Mobile, Tablet, Desktop)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 sm:mt-10 lg:mt-14 relative w-full">
          {/* Interaction Guidance Notice */}
          <div
            className="text-center text-[9px] sm:text-[10px] font-mono tracking-[0.24em] sm:tracking-[0.28em] uppercase text-stone-400 mb-5 sm:mb-6 select-none transition-opacity duration-500"
            style={{ opacity: selectedCard !== null ? 0 : 1 }}
          >
            <span className="sm:hidden">Tap any card to explore scope</span>
            <span className="hidden sm:inline">Select a project capability to review scope</span>
          </div>

          {/* Transparent Backdrop Click-to-Close Layer */}
          {selectedCard !== null && (
            <div
              className="absolute inset-0 z-30 cursor-pointer"
              onClick={handleClose}
              title="Click or tap outside to close"
            />
          )}

          {/* ── 3D Stage Container ────────────────────────────────────────── */}
          <div
            className="relative mx-auto flex items-center justify-center w-full"
            style={{
              maxWidth: "960px",
              height: "460px", // Responsive height will expand via media styles
              perspective: "1600px",
              perspectiveOrigin: "50% 40%",
            }}
          >
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedCard === index;
              const isBackground = selectedCard !== null && !isSelected;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    sceneRefs.current[index] = el;
                  }}
                  /*
                    Responsive card geometry:
                    - Mobile: w-[245px] h-[395px] (contained within 360px+ screen with generous margins)
                    - Tablet: w-[285px] h-[435px]
                    - Desktop: w-[325px] h-[470px]
                    - Wide Desktop: w-[370px] h-[520px]
                  */
                  className="card-scene absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[245px] sm:w-[285px] lg:w-[325px] xl:w-[370px] h-[395px] sm:h-[435px] lg:h-[470px] xl:h-[520px] select-none touch-manipulation"
                  style={{
                    zIndex: getFanConfig(index).zIndex,
                    transformStyle: "preserve-3d",
                    cursor: isBackground ? "default" : isSelected ? "default" : "pointer",
                    pointerEvents: isBackground ? "none" : "auto",
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleCardClick(index)}
                >
                  {/* ── Inner 3D Flipper Element ───────────────────────────── */}
                  <div
                    ref={(el) => {
                      flipperRefs.current[index] = el;
                    }}
                    className="card-flipper relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                    }}
                  >
                    {/* ═════════════════════════════════════════════════════════
                        FRONT FACE — Normal Service Presentation
                        Strict backface-visibility: hidden ensures 0% bleed-through
                    ═════════════════════════════════════════════════════════ */}
                    <div
                      className="card-face card-front absolute inset-0 rounded-2xl overflow-hidden bg-[#2D2926] text-[#FAF8F5] border border-[#E0B9A0]/20 shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(0deg)",
                      }}
                    >
                      {/* Upper Card Media Section */}
                      <div className="relative h-[55%] overflow-hidden bg-[#181514]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover grayscale-[0.08] hover:grayscale-0 transition-all duration-700"
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926] via-black/20 to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex items-center gap-1.5 bg-[#2D2926]/85 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0]" />
                          <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#FAF8F5]/90 font-medium">
                            {item.category}
                          </span>
                        </div>

                        {/* Watermark Number */}
                        <div className="absolute top-2 right-2.5 sm:right-3 font-display font-light text-xl sm:text-2xl text-white/20 tracking-wider">
                          {item.number}
                        </div>
                      </div>

                      {/* Lower Content Info Area */}
                      <div className="h-[45%] p-3.5 sm:p-4 xl:p-5 flex flex-col justify-between bg-gradient-to-b from-[#2D2926] to-[#1E1B19]">
                        <div>
                          <div className="flex items-center gap-2 sm:gap-2.5 mb-1 sm:mb-1.5">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E0B9A0]/15 border border-[#E0B9A0]/30 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E0B9A0] stroke-[1.5]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[8px] sm:text-[9px] font-mono text-[#E0B9A0] tracking-wider uppercase font-semibold">
                                {item.number} • Service
                              </div>
                              <h3 className="font-display text-[11px] sm:text-xs xl:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] leading-tight truncate">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-[9px] sm:text-[10px] xl:text-[11px] font-mono text-[#AE917E] uppercase tracking-wider line-clamp-1 font-medium pl-0.5">
                            {item.tagline}
                          </p>
                        </div>

                        {/* Bottom Status / Selection Prompt */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/50">
                          <span className="flex items-center gap-1 sm:gap-1.5 text-[#E0B9A0] truncate max-w-[65%]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] animate-pulse shrink-0" />
                            <span className="truncate">{item.badge}</span>
                          </span>
                          <span className="tracking-widest uppercase text-white/40 shrink-0">
                            Explore →
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ═════════════════════════════════════════════════════════
                        BACK FACE — Expanded Context & Scope
                        Initial CSS rotateY(180deg). Revealed only on 3D flip.
                    ═════════════════════════════════════════════════════════ */}
                    <div
                      className="card-face card-back absolute inset-0 rounded-2xl overflow-hidden bg-[#181514] text-[#FAF8F5] border border-[#E0B9A0]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-3.5 sm:p-5 xl:p-6 flex flex-col justify-between"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        pointerEvents: isSelected ? "auto" : "none",
                      }}
                    >
                      {/* Top Bar with Badge & Tactile Close Button */}
                      <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col justify-between pr-0.5">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 sm:mb-2.5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E0B9A0]/15 text-[#E0B9A0] border border-[#E0B9A0]/30 truncate max-w-[150px] sm:max-w-none">
                                {item.badge}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-mono text-white/40">
                                {item.number} / 04
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-[#E0B9A0] hover:text-[#2D2926] text-white/70 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Return to deck"
                              aria-label="Close card"
                            >
                              <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                            </button>
                          </div>

                          {/* Title and Scope Summary */}
                          <h3 className="text-xs sm:text-sm xl:text-base font-display font-bold uppercase tracking-wide text-[#FAF8F5] leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-[8.5px] sm:text-[10px] font-mono text-[#AE917E] uppercase tracking-wider mb-1.5 sm:mb-2 font-medium">
                            {item.tagline}
                          </p>
                          <p className="text-[10px] sm:text-xs text-white/75 font-sans leading-relaxed mb-2.5 sm:mb-3 line-clamp-2 sm:line-clamp-3">
                            {item.copy}
                          </p>

                          {/* Deliverables Checklist (up to 5 items) */}
                          <div className="space-y-1 sm:space-y-1.5 mb-2.5 sm:mb-3">
                            <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#E0B9A0] uppercase font-bold">
                              Scope & Deliverables
                            </div>
                            {item.deliverables.slice(0, 5).map((deliv, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-1.5 sm:gap-2 text-[9px] sm:text-[10.5px] xl:text-[11px] text-white/85 font-sans leading-tight"
                              >
                                <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5 text-[#E0B9A0] stroke-[2]" />
                                <span className="line-clamp-1">{deliv}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Section: Metrics & Direct CTA */}
                        <div className="pt-2">
                          {/* 3 Metric Pills */}
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-white/10 mb-2.5 sm:mb-3">
                            {item.metrics.map((metric, i) => (
                              <div
                                key={i}
                                className="bg-white/5 border border-white/10 rounded-lg p-1 sm:p-1.5 text-center"
                              >
                                <div className="text-[7px] sm:text-[8px] font-mono text-white/50 uppercase tracking-wider mb-0.5 font-bold truncate">
                                  {metric.label}
                                </div>
                                <div className="text-[8.5px] sm:text-[10px] xl:text-[11px] font-bold text-[#E0B9A0] truncate">
                                  {metric.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action CTA */}
                          <div className="flex items-center gap-2">
                            <a
                              href="#estimator"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#E0B9A0] hover:bg-[#FAF8F5] text-[#2D2926] font-mono font-bold py-2 sm:py-2.5 px-3 text-[9px] sm:text-[10px] uppercase tracking-wider rounded-lg transition-colors shadow-md active:scale-95 cursor-pointer text-center"
                            >
                              <span className="truncate">{item.ctaText}</span>
                              <ArrowUpRightIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2] shrink-0" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Micro Reassurance Footer */}
          <div className="pt-6 sm:pt-8 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] text-stone-500 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AE917E]" />
            <span>Active in Nairobi, Kiambu, Machakos & Metro</span>
          </div>
        </div>
      </div>
    </section>
  );
}
