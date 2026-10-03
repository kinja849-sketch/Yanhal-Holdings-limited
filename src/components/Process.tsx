import { motion } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollTrigger } from "../lib/gsap";

interface ProcessStep {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  deliverables: string[];
  icon: string;
  image: string;
}

interface Waypoint {
  x: number;
  y: number;
  stepIdx: number;
}

export default function Process() {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [pathData, setPathData] = useState<string>("");
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const containerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps: ProcessStep[] = [
    {
      id: "01",
      title: "Vibe Check & Ground Recon",
      subtitle: "Briefing & Ground Recon",
      tagline: "Zero Cap, Total Transparency",
      description: "We lock in your vision, budget, and site reality upfront. Zero guesswork, zero mid-project surprises. Just crystal-clear blueprints and straight facts before a single hammer swings.",
      deliverables: [
        "Zero-fluff budget & timeline breakdown",
        "Site LiDAR scan & structural reality check",
        "Locked-in architectural brief from day one"
      ],
      icon: "architecture",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790716176/Screenshot_2026-09-30_034301_xfvb6v.png"
    },
    {
      id: "02",
      title: "Spatial Architecture & 3D Modeling",
      subtitle: "3D CAD & Optimization",
      tagline: "Form Meets Pure Function",
      description: "Translating concepts into high-precision 3D architecture. Designs that don't just look fire on Pinterest, but actually function effortlessly in daily life. Zero wasted square meters.",
      deliverables: [
        "Hyper-realistic 3D walkthrough renders",
        "Fluid spatial ergonomics & circulation",
        "Precision MEP & structural schematics"
      ],
      icon: "polyline",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790716175/Screenshot_2026-09-30_034308_ucty01.png"
    },
    {
      id: "03",
      title: "Material Curation & Spec Sourcing",
      subtitle: "Spec Sourcing & Prep",
      tagline: "Top-Tier Grade Only",
      description: "We curate certified, high-grade materials built to outlast trends. No cheap knockoffs, no fake aesthetics—only tested porcelain, structural hardwoods, and reinforced steel prepped on-site.",
      deliverables: [
        "Factory-vetted durability & test certs",
        "Transparent cost control with zero markup games",
        "Site cleared, organized & 100% staging-ready"
      ],
      icon: "texture",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790715900/Screenshot_2026-09-30_034316_tduwu7.png"
    },
    {
      id: "04",
      title: "The Build: Heavy Lifting & Craft",
      subtitle: "Structural Build & Execution",
      tagline: "Engineered With Precision",
      description: "Full-throttle structural execution and bespoke finishing. Managed with relentless on-site supervision, live milestone updates, and craft that permanently raises your property standard.",
      deliverables: [
        "Live progress tracking with supervisor on-site",
        "Structural integrity verified at every level",
        "Clean, synchronized multi-trade workflow"
      ],
      icon: "foundation",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790716173/Screenshot_2026-09-30_034331_hs8akg.png"
    },
    {
      id: "05",
      title: "The Snag-List: 100% Locked",
      subtitle: "Forensic Quality Inspection",
      tagline: "Obsessive Quality Control",
      description: "Every joint, gypsum line, LED channel, and seam inspected with forensic detail. If it’s even 1mm off, we fix it on the spot. We don't do 'good enough'—only flawless completion.",
      deliverables: [
        "Zero-tolerance alignment & finish inspection",
        "Rigorous MEP, plumbing & electrical stress tests",
        "White-glove polishing & architectural handover prep"
      ],
      icon: "verified",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790715899/Screenshot_2026-09-30_034343_ll0q7j.png"
    },
    {
      id: "06",
      title: "Handover & Keys In Hand",
      subtitle: "Turnkey Delivery & Care",
      tagline: "Ready To Live, Built To Last",
      description: "We walk you through every finished detail, hand over the keys, and stay on speed-dial. 100% turnkey ready from second one, backed by genuine post-handover warranty and ongoing care.",
      deliverables: [
        "Complete walkthrough & documentation handover",
        "100% turnkey operational from day one",
        "Direct post-handover warranty & support line"
      ],
      icon: "key",
      image: "https://res.cloudinary.com/koc0fyuc/image/upload/w_1200,c_scale,q_auto:best,e_sharpen:100/v1790716172/Screenshot_2026-09-30_034353_gv6vkg.png"
    }
  ];

  // Recalculate S-curve path geometry based on actual DOM card coordinates
  const calculatePath = useCallback(() => {
    if (!mainRef.current) return;
    const parentRect = mainRef.current.getBoundingClientRect();
    const W = parentRect.width;
    const H = parentRect.height;
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);

    const pts: Waypoint[] = [];

    stepRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top - parentRect.top + rect.height / 2;

      let x: number;
      if (desktop) {
        const cx = W / 2;
        const curveOffset = Math.min(110, W * 0.12);
        x = idx % 2 === 0 ? cx - curveOffset : cx + curveOffset;
      } else {
        const baseMobileX = 24;
        x = baseMobileX + (idx % 2 === 0 ? -3 : 3);
      }

      pts.push({ x, y, stepIdx: idx });
    });

    if (pts.length < 2) return;

    setWaypoints(pts);

    // Build smooth cubic Bezier curve spline
    const startX = desktop ? W / 2 : 24;
    const startY = 0;
    const endX = desktop ? W / 2 : 24;
    const endY = H;

    let d = `M ${startX} ${startY}`;

    const firstPt = pts[0];
    const dy0 = firstPt.y - startY;
    d += ` C ${startX} ${startY + dy0 * 0.5}, ${firstPt.x} ${firstPt.y - dy0 * 0.5}, ${firstPt.x} ${firstPt.y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const pCurrent = pts[i];
      const pNext = pts[i + 1];
      const dy = pNext.y - pCurrent.y;
      const cp1x = pCurrent.x;
      const cp1y = pCurrent.y + dy * 0.5;
      const cp2x = pNext.x;
      const cp2y = pNext.y - dy * 0.5;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pNext.x} ${pNext.y}`;
    }

    const lastPt = pts[pts.length - 1];
    const dyEnd = endY - lastPt.y;
    d += ` C ${lastPt.x} ${lastPt.y + dyEnd * 0.5}, ${endX} ${endY - dyEnd * 0.5}, ${endX} ${endY}`;

    setPathData(d);
  }, []);

  // Update path on mount and resize
  useEffect(() => {
    calculatePath();

    const handleResize = () => {
      calculatePath();
    };

    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(() => {
      calculatePath();
    });

    if (mainRef.current) {
      observer.observe(mainRef.current);
    }

    const t = setTimeout(calculatePath, 400);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      clearTimeout(t);
    };
  }, [calculatePath]);

  // ScrollTrigger drive animation along the SVG S-curve
  useEffect(() => {
    if (!mainRef.current || !pathRef.current || !pathData) return;

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    if (totalLength === 0) return;

    if (activePathRef.current) {
      activePathRef.current.style.strokeDasharray = `${totalLength}`;
      activePathRef.current.style.strokeDashoffset = `${totalLength}`;
    }

    const st = ScrollTrigger.create({
      trigger: mainRef.current,
      start: "top 65%",
      end: "bottom 75%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        const currentDist = p * totalLength;
        const pt = path.getPointAtLength(currentDist);

        if (activePathRef.current) {
          activePathRef.current.style.strokeDashoffset = `${totalLength - currentDist}`;
        }

        if (waypoints.length > 0) {
          let closestIdx = 0;
          let minDiff = Infinity;
          waypoints.forEach((wp) => {
            const diff = Math.abs(pt.y - wp.y);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = wp.stepIdx;
            }
          });
          setActiveStepIdx(closestIdx);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, [pathData, waypoints]);

  const scrollToMilestone = (idx: number) => {
    const el = stepRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section 
      ref={containerRef}
      id="process" 
      className="section-brand-violet relative py-16 sm:py-24 lg:py-28 bg-[#2D2926] text-[#FAF8F5] overflow-hidden"
    >
      <header className="relative py-12 sm:py-16 flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden border-b border-white/15">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80')] bg-cover"></div>
        <div className="relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#181514]/70 border border-[#E0B9A0]/35 backdrop-blur-md mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0] animate-pulse" />
            <span className="text-[#E0B9A0] font-mono text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase font-bold">
              The Yanhal Method &bull; 07
            </span>
          </div>
          <h1 className="font-display text-white text-2xl sm:text-5xl lg:text-7xl mb-4 sm:mb-8 leading-tight tracking-tighter uppercase font-bold">
            How We <span className="text-[#E0B9A0] font-medium">Build</span> Masterpieces
          </h1>
          <p className="max-w-xl mx-auto text-stone-200 font-normal text-xs sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8">
            A structured, transparent journey from technical precision to breathtaking architectural reality.
          </p>

          {/* Interactive Milestone Progression Status Pill */}
          <div className="inline-flex items-center gap-3 bg-[#181514]/80 backdrop-blur-md border border-white/20 px-4 sm:px-6 py-2 rounded-full text-xs font-mono">
            <span className="text-[#E0B9A0] animate-bounce material-symbols-outlined text-sm sm:text-base">
              arrow_downward
            </span>
            <span className="text-white/90 text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
              Milestone Progression &bull; Stage {steps[activeStepIdx]?.id || "01"} / 06
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0]" />
            <span className="text-[#E0B9A0] font-bold text-[10px] sm:text-xs">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      </header>

      <main ref={mainRef} className="relative py-14 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto box-border overflow-hidden">
        {/* Dynamic S-Curve SVG Construction Road */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
          <svg className="w-full h-full" style={{ overflow: "visible" }}>
            <defs>
              <filter id="road-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="paved-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#AE917E" />
                <stop offset="50%" stopColor="#E0B9A0" />
                <stop offset="100%" stopColor="#FAF8F5" />
              </linearGradient>
            </defs>

            {pathData && (
              <>
                {/* Wide Outer Road Bed Glow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#E0B9A0"
                  strokeWidth={isDesktop ? 32 : 18}
                  strokeOpacity="0.08"
                  strokeLinecap="round"
                />

                {/* Dark Construction Asphalt Base Track */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(8, 8, 9, 0.65)"
                  strokeWidth={isDesktop ? 16 : 8}
                  strokeLinecap="round"
                />

                {/* Blueprint Hazard / Center Lane Markings */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 10"
                  strokeLinecap="round"
                />

                {/* Reference Path for coordinates sampling */}
                <path
                  ref={pathRef}
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="1"
                />

                {/* Active Paved Glowing Neon Line */}
                <path
                  ref={activePathRef}
                  d={pathData}
                  fill="none"
                  stroke="url(#paved-gradient)"
                  strokeWidth={isDesktop ? 4 : 3}
                  strokeLinecap="round"
                  filter="url(#road-glow)"
                  className="transition-all duration-75"
                />
              </>
            )}

            {/* Waypoint Milestone Rings along the S-Curve Road */}
            {waypoints.map((wp, idx) => {
              const isPassed = activeStepIdx >= idx;
              const isCurrent = activeStepIdx === idx;
              return (
                <g key={idx} className="cursor-pointer pointer-events-auto" onClick={() => scrollToMilestone(idx)}>
                  {isCurrent && (
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r="18"
                      fill="none"
                      stroke="#E0B9A0"
                      strokeWidth="2"
                      opacity="0.7"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={isCurrent ? "8" : "5"}
                    fill={isPassed ? "#E0B9A0" : "#AE917E"}
                    stroke="#FFFFFF"
                    strokeWidth={isCurrent ? "3" : "2"}
                    filter={isPassed ? "url(#road-glow)" : undefined}
                    className="transition-all duration-500"
                  />
                  {isDesktop && (
                    <text
                      x={wp.x + (idx % 2 === 0 ? 16 : -16)}
                      y={wp.y + 4}
                      textAnchor={idx % 2 === 0 ? "start" : "end"}
                      fill={isCurrent ? "#E0B9A0" : "rgba(255,255,255,0.6)"}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="select-none tracking-widest"
                    >
                      {steps[idx].id}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Milestone Steps List */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-36 relative z-20 box-border">
          {steps.map((step, idx) => {
            const isCurrent = activeStepIdx === idx;
            const isPassed = activeStepIdx >= idx;

            return (
              <motion.section 
                key={idx}
                ref={(el) => { stepRefs.current[idx] = el; }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1] }}
                className={`relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 group ${
                  idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                } pl-8 sm:pl-10 lg:pl-0 w-full max-w-full box-border`}
              >
                {/* Media Card */}
                <div className="w-full lg:w-5/12 order-2 lg:order-1 max-w-full">
                  <div 
                    onClick={() => scrollToMilestone(idx)}
                    className={`relative group overflow-hidden bg-[#181514]/90 rounded-2xl border transition-all duration-500 shadow-2xl ${
                      isCurrent 
                        ? 'border-[#E0B9A0] ring-2 ring-[#E0B9A0]/40 shadow-[0_0_35px_rgba(224,185,160,0.25)] scale-[1.01]' 
                        : isPassed 
                        ? 'border-white/30 hover:border-[#E0B9A0]' 
                        : 'border-white/20 hover:border-[#E0B9A0]'
                    }`}
                  >
                    <img 
                      alt={step.title} 
                      className={`w-full aspect-[16/10] sm:aspect-video object-cover transition-all duration-700 ${
                        isCurrent ? 'opacity-95 scale-[1.02]' : 'opacity-80 group-hover:opacity-100 group-hover:scale-[1.02]'
                      }`} 
                      src={step.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 border border-white/10 pointer-events-none group-hover:border-[#E0B9A0] transition-colors rounded-2xl"></div>
                    
                    {/* Stage icon badge */}
                    <div className={`absolute top-3.5 sm:top-4 ${idx % 2 !== 0 ? 'right-3.5 sm:right-4' : 'left-3.5 sm:left-4'}`}>
                      <div className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                        isCurrent ? 'bg-[#E0B9A0]/20 border border-[#E0B9A0]' : 'bg-[#181514]/60 border border-white/15'
                      }`}>
                        <span className="material-symbols-outlined text-xl sm:text-2xl text-[#E0B9A0] drop-shadow-md">
                          {step.icon}
                        </span>
                      </div>
                    </div>

                    {/* Active Site Operation Tag */}
                    {isCurrent && (
                      <div className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0B9A0] text-[#2D2926] font-mono text-[9px] font-extrabold tracking-widest uppercase shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D2926] animate-ping" />
                          Site In Progress
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestone Node on Desktop center */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-20 pointer-events-none">
                  <div className={`rounded-full transition-all duration-500 ${
                    isCurrent 
                      ? 'w-5 h-5 bg-[#E0B9A0] shadow-[0_0_20px_#E0B9A0] ring-4 ring-[#E0B9A0]/40' 
                      : isPassed 
                      ? 'w-4 h-4 bg-[#E0B9A0] shadow-[0_0_12px_#E0B9A0]' 
                      : 'w-3 h-3 bg-white/40'
                  }`}></div>
                </div>

                {/* Content Details: Direct, Punchy, Self-Contained */}
                <div className={`w-full lg:w-5/12 order-1 lg:order-2 max-w-full ${idx % 2 !== 0 ? 'lg:text-right' : ''}`}>
                  <div className={`flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                    <span className={`font-display text-4xl sm:text-5xl md:text-6xl leading-none font-bold transition-colors duration-500 ${
                      isCurrent ? 'text-[#E0B9A0] drop-shadow-[0_0_15px_rgba(224,185,160,0.4)]' : 'text-[#E0B9A0]/80'
                    }`}>
                      {step.id}
                    </span>
                    <div className={`h-[2px] flex-grow transition-colors duration-500 ${
                      isCurrent ? 'bg-[#E0B9A0]' : 'bg-white/20'
                    }`}></div>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl md:text-2xl mb-1.5 sm:mb-2 tracking-wider uppercase text-white leading-tight font-bold">
                    {step.title}
                  </h3>
                  
                  <div className={`flex items-center gap-2 mb-3 sm:mb-4 ${idx % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                    <span className="text-[#E0B9A0] font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold">
                      {step.subtitle}
                    </span>
                    <span className="text-white/30 text-xs">&bull;</span>
                    <span className="text-stone-400 font-mono text-[9px] tracking-wider uppercase">
                      {step.tagline}
                    </span>
                  </div>

                  <p className={`text-stone-200 font-normal text-xs sm:text-sm md:text-base leading-relaxed max-w-lg ${idx % 2 !== 0 ? 'lg:ml-auto' : ''}`}>
                    {step.description}
                  </p>

                  {/* Complete Deliverables Visible Upfront — No Modal Needed */}
                  <div className={`flex flex-wrap gap-2 mt-4 sm:mt-5 ${idx % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                    {step.deliverables.map((item, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-stone-300 font-mono text-[9px] sm:text-[10px] tracking-wider"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>
    </section>
  );
}
