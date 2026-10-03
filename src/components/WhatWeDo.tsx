import { useState, useRef, useEffect, useCallback } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import { transitionManager } from "../lib/transitionManager";
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
      "https://res.cloudinary.com/koc0fyuc/image/upload/v1790775929/780c1a5e-d3dc-486b-8f58-e2efcc314b95_hddabv.png",
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
      "https://res.cloudinary.com/koc0fyuc/image/upload/v1790775956/ChatGPT_Image_Sep_30_2026_08_39_38_PM_sdzsil.png",
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
      "https://res.cloudinary.com/koc0fyuc/image/upload/v1790775956/ChatGPT_Image_Sep_30_2026_08_39_59_PM_qiqyqg.png",
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
      "https://res.cloudinary.com/koc0fyuc/image/upload/v1790775929/7a137120-6cc6-4752-899f-90ed7a66efb8_alws1r.png",
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

export default function WhatWeDo() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flipperRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flip back to front face
  const handleClose = useCallback(() => {
    if (selectedCard === null) return;
    const closingIndex = selectedCard;
    const flipper = flipperRefs.current[closingIndex];
    const card = cardRefs.current[closingIndex];

    if (flipper) {
      gsap.to(flipper, {
        rotationY: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setSelectedCard(null);
          if (card) {
            gsap.set(card, { zIndex: closingIndex + 1 });
          }
        },
      });
    } else {
      setSelectedCard(null);
      if (card) {
        gsap.set(card, { zIndex: closingIndex + 1 });
      }
    }
  }, [selectedCard]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCard !== null) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard, handleClose]);

  // Handle Card Click (Flip to Back Face)
  const handleCardClick = (index: number) => {
    if (selectedCard === index) return;
    if (selectedCard !== null) {
      handleClose();
      return;
    }

    setSelectedCard(index);
    const card = cardRefs.current[index];
    const flipper = flipperRefs.current[index];

    if (card) {
      gsap.set(card, { zIndex: 60 });
    }

    if (flipper) {
      gsap.to(flipper, {
        rotationY: 180,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  };

  // ─── Stacked Reveal Scroll Animation via ScrollTrigger & Lenis ─────────────
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (cards.length === 0) return;

      const mm = gsap.matchMedia();

      // Motion enabled: Sequenced scroll-driven stacking reveal from translateX(100vw)
      // Motion enabled: Sequenced scroll-driven stacking reveal
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Card 0 starts in position so the stage is immediately populated with Card 01
        gsap.set(cards[0], { x: 0, zIndex: 1 });
        // Cards 1..N start off-screen to the right and slide in sequentially
        for (let i = 1; i < cards.length; i++) {
          gsap.set(cards[i], {
            x: () => window.innerWidth,
            zIndex: i + 1,
          });
        }

        // Stacking timeline driven purely by vertical scroll distance
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            pin: stickyRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        // Each subsequent card enters and settles in sequence, stacking on top
        for (let i = 1; i < cards.length; i++) {
          tl.to(
            cards[i],
            {
              x: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            (i - 1) * 0.9
          );
        }
      });

      // Reduced motion: Cards start in their settled stacked positions
      mm.add("(prefers-reduced-motion: reduce)", () => {
        cards.forEach((card, index) => {
          gsap.set(card, {
            x: 0,
            zIndex: index + 1,
          });
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="capabilities"
      className="relative w-full bg-[#FAF8F5] text-[#2D2926]"
      style={{ height: "320vh" }}
    >
      <style>{`
        #capabilities {
          --card-width: 245px;
          --card-height: 385px;
          --stack-sliver: 24px;
          --stack-total-width: calc(var(--card-width) + 3 * var(--stack-sliver));
        }
        @media (min-width: 640px) {
          #capabilities {
            --card-width: 285px;
            --card-height: 425px;
            --stack-sliver: 40px;
          }
        }
        @media (min-width: 1024px) {
          #capabilities {
            --card-width: 325px;
            --card-height: 460px;
            --stack-sliver: 56px;
          }
        }
        @media (min-width: 1280px) {
          #capabilities {
            --card-width: 360px;
            --card-height: 500px;
            --stack-sliver: 68px;
          }
        }
      `}</style>

      {/* Sticky full-viewport container matching Framer reference */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between py-6 sm:py-8 lg:py-10 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full h-full flex flex-col justify-between relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-black/10 shrink-0">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-[2px] bg-[#AE917E]" />
                <span className="text-[#AE917E] font-mono text-[10px] tracking-[0.3em] uppercase font-bold">
                  02 / Core Capabilities
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-[#2D2926] tracking-[0.05em] uppercase mb-3">
                What We <span className="text-[#AE917E] font-medium">Do</span>
              </h2>
              <p className="text-stone-700 text-xs sm:text-sm md:text-base font-sans font-normal leading-relaxed">
                From single-room interior transformations to multi-structure builds
                across Nairobi, our work is defined by transparent coordination and
                reliable delivery.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-stone-500 font-mono text-[10px] uppercase tracking-widest pb-1 self-end">
              <span className="w-2 h-2 rounded-full bg-[#AE917E] animate-pulse" />
              <span>Full-Scope Capabilities</span>
            </div>
          </div>

          {/* Cards Stage Container */}
          <div className="relative w-full flex-1 flex flex-col items-center justify-center my-auto min-h-0">
            {/* Interaction Guidance Notice */}
            <div
              className="text-center text-[9px] sm:text-[10px] font-mono tracking-[0.24em] sm:tracking-[0.28em] uppercase text-stone-400 mb-3 sm:mb-4 select-none transition-opacity duration-300 shrink-0"
              style={{ opacity: selectedCard !== null ? 0 : 1 }}
            >
              <span className="sm:hidden">Tap card to explore scope</span>
              <span className="hidden sm:inline">Select a project capability to review scope</span>
            </div>

            {/* Transparent Backdrop Click-to-Close Layer */}
            {selectedCard !== null && (
              <div
                className="absolute inset-0 z-40 cursor-pointer"
                onClick={handleClose}
                title="Click or tap outside to close"
              />
            )}

            {/* Layered Card Deck Staging Area */}
            <div
              className="relative mx-auto"
              style={{
                width: "var(--stack-total-width)",
                height: "var(--card-height)",
              }}
            >
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                const isSelected = selectedCard === index;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className="card-scene absolute top-0 select-none touch-manipulation cursor-pointer"
                    style={{
                      left: `calc(${index} * var(--stack-sliver))`,
                      width: "var(--card-width)",
                      height: "var(--card-height)",
                      zIndex: isSelected ? 60 : index + 1,
                      transform: index === 0 ? "none" : "translateX(100vw)",
                      willChange: "transform",
                    }}
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
                                href="#contact"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  transitionManager.transitionTo({
                                    destination: "#contact",
                                    label: "START YOUR PROJECT",
                                  });
                                }}
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
          </div>

          {/* Micro Reassurance Footer */}
          <div className="pt-4 sm:pt-6 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] text-stone-500 font-mono font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AE917E]" />
            <span>Active in Nairobi, Kiambu, Machakos & Metro</span>
          </div>
        </div>
      </div>
    </section>
  );
}
