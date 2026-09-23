import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

interface ProcessStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  gains: string[];
  icon: string;
  image: string;
}

interface Waypoint {
  x: number;
  y: number;
  stepIdx: number;
}

export default function Process() {
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
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
      title: "Consultation & Project Understanding",
      subtitle: "Initial Briefing / Site Visit",
      description: "We engage in a detailed discussion to gather key information such as the purpose of the project, budget expectations, and preferred design direction.",
      details: "When a client initiates a project, the first step is understanding exactly what they need—not just at surface level, but in terms of how the space will actually be used.\n\nDuring this stage, we engage in a detailed discussion to gather key information such as the purpose of the project, budget expectations, preferred design direction, and any constraints related to the site or timeline. If necessary, we conduct a site visit to assess physical conditions, measurements, accessibility, and any existing structures.\n\nThis stage is critical because it sets the foundation for everything that follows. Instead of rushing into design or construction, we ensure that all requirements are clearly defined and aligned from the beginning. This reduces misunderstandings, prevents costly changes later, and ensures that the final result matches what the client actually needs.",
      gains: [
        "Clear understanding of what is possible",
        "Early guidance on budget and feasibility",
        "Confidence that their project is being properly understood"
      ],
      icon: "architecture",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwuefG8ovmHcp1ksm51UibxCLOFP-7cUa2NMuubmMGdd7tenYlY9AM7t-tgiQgRRv_regxsdy_dtnU2utCc5plt6OXQJHMBvUgOx3Q5PV9TefXWw7RrAZHwqvbLT1yVpzHFt_jnp67hboBqW0nq5XKWMtnN7K8_VBPGcsDNpzPonIHUJ6LEIDiw-jbLGJxV2UumtURYXCCpgk6njU5Yt8X8omFr-0Z9vy1YG9-no-hbh6tsDaAYlBskB6Xh1ss7Zce0Xvx1Tub7oU"
    },
    {
      id: "02",
      title: "Planning & Design Development",
      subtitle: "Structured Planning / Space Optimization",
      description: "We translate ideas into practical plans, focusing on creating a vision that is not only visually appealing but also functional and realistic to execute.",
      details: "Once the project requirements are clear, we move into structured planning and design.\n\nAt this stage, we translate ideas into practical plans. This may include layout structuring, space optimization, and design direction depending on whether the project is construction, interior design, or renovation.\n\nThe focus here is on creating a plan that is not only visually appealing but also functional and realistic to execute. Every design decision is made with practicality in mind—ensuring that the final outcome works efficiently in real-world use.\n\nWe also define the scope of work in detail, outlining what will be done, what materials may be used, and how the project will progress.",
      gains: [
        "A clear vision of the final outcome",
        "Structured plan before any work begins",
        "Reduced risk of unexpected changes"
      ],
      icon: "polyline",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzLfBQZzuRiGwuyupMX2bekVgnzAhh0MlGIWNwJ4VrzaQHgQtHrToU0z92nWKb4nQJLvYJXTB7bJysmxY0XoAsetmaDWi7cScEUOV_97-yh6txWTThsw-bMKoYwtzO6rxo4jEnyRdvXBRxZS3Uw_SCouxq3Mfdc5O5VM6IF3hb_CMp3Z11QOP0JXEW_Mf7NskQTvh-oSf-3dNxc_WsRZWo3Uk9_05uuefLHe5GH6GnIaLua8xfHYZDWTqM7ZZX8RbzqegoDBmWTck"
    },
    {
      id: "03",
      title: "Material Selection & Preparation",
      subtitle: "Quality Sourcing / Site Readiness",
      description: "We focus on selecting the right materials guided by durability and cost-effectiveness, while ensuring the site is fully prepared for work.",
      details: "Before construction or installation begins, we focus on selecting the right materials and preparing the site.\n\nMaterial selection is guided by durability, cost-effectiveness, and suitability for the specific project. Rather than choosing materials purely for appearance, we ensure they are appropriate for long-term use and aligned with the project’s purpose.\n\nAt the same time, site preparation is carried out to ensure that the environment is ready for work. This may involve clearing the space, organizing tools and resources, and ensuring that all necessary elements are in place before execution begins.\n\nThis stage ensures that the project starts on a solid foundation, both in terms of materials and readiness.",
      gains: [
        "Assurance of quality materials",
        "Better cost control",
        "Smooth transition into execution"
      ],
      icon: "texture",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCSvc_JWwFQKxZb0krnnZjt8Rl9FxkH69izRW6Cnxh3ahmIgreuWraWQehKNCM2mYlVZorIr6E9YeoU3u8__ex_-ZyIlsdmuvG4z6VuKDGsKqCC47d_5phtGxnfXIFSiIdVZZDFn6t4BfH2GBzz0SV2s0quIp-pDWjMl3jcQPE0VXWUF-6EcWBgvEj1td3GPDiBMZKNtbHlAd1_CRL-L_WtmCuS_0oJI1bsS9a-sAdiEpGzzhVUTkUM9-GAaDsRVbn-QvduFrICoc"
    },
    {
      id: "04",
      title: "Construction / Execution Phase",
      subtitle: "On-site Building / Managed Workflow",
      description: "The actual building or transformation takes place. We coordinate labor and manage workflow to ensure progress remains consistent with the timeline.",
      details: "This is where the actual building or transformation takes place.\n\nDuring this phase, all plans are put into action. The team handles on-site work including structural building, installations, finishing, and adjustments as required. Each stage of execution is carried out with attention to detail to ensure that the work meets the agreed standards.\n\nWe coordinate labor, manage workflow, and ensure that progress remains consistent with the timeline. Any necessary adjustments are communicated clearly to the client to maintain transparency.\n\nThe focus is not just on completing the work, but on doing it correctly and efficiently.",
      gains: [
        "Visible progress on their project",
        "Managed workflow without needing to supervise everything",
        "Confidence that work is being handled professionally"
      ],
      icon: "foundation",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTSpFOhNJgjfRj1_kbIdc2Rgmd9-LXp-RbdlrY2uEiExMn4ZgXPxWiDBnUj4aOkClXvjghxDWDOosR0pZYftJEAjdbpwVKKHmRwJAVZZVxXnHoPlXh5dj31zp6CWA9msP5JrhG24fEKjkQ5mLaNCj0WwR1qUxq91kjQTy08hYnnSG5p8_4Ft0vK9rZua-t1EdAn54jKxL6iBn39PJ6wdRE_hJb-1OP61LC0iGviD5fS-x7dhQzIFLbIvKo6GSL3bLAuTbLethcKAE"
    },
    {
      id: "05",
      title: "Quality Check & Final Touches",
      subtitle: "Standard Review / Detailed Adjustments",
      description: "We carry out a thorough review to ensure everything meets the expected standard, correcting minor issues and making final adjustments.",
      details: "Before handing over the project, we carry out a thorough review to ensure everything meets the expected standard.\n\nThis includes checking structural elements, finishes, fittings, and overall presentation. Any minor issues are corrected, and final adjustments are made to ensure the space is fully complete and ready for use.\n\nAttention is given to details that may not be obvious during construction but are important in the final result—such as alignment, finishing consistency, and usability.",
      gains: [
        "Assurance that the work is complete and properly finished",
        "A polished final result",
        "Reduced need for post-completion fixes"
      ],
      icon: "verified",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: "06",
      title: "Project Handover & Client Support",
      subtitle: "Final Delivery / Continued Guidance",
      description: "We formally hand over the space and remain available for follow-up support to ensure confidence in using and maintaining the space.",
      details: "Once the project is complete, we formally hand over the space to the client.\n\nAt this stage, the client is guided through the completed work to ensure everything aligns with expectations. Any final clarifications are addressed, and the client is given full access to the finished space.\n\nWe also remain available for follow-up support if needed, especially for minor adjustments or guidance related to the completed work.\n\nThe goal is to ensure that the client is not just satisfied at handover, but confident in using and maintaining the space moving forward.",
      gains: [
        "A fully completed, ready-to-use project",
        "Clarity on what has been delivered",
        "Continued support if needed"
      ],
      icon: "key",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK1GIwimSG3fdYlbBSojjOJqJUa71iOeRcRLzPHmyt_zCRn70D1hQpgqe0szONBPtxSPVAhGzhA9c2f96wUp0yvB81CUC8r_4CCgrORaWnorx0XowRgqmmzfCMIPRDqnpIpKqmaVv-83AKwXAmaGy43rvoQLjzQ7nQ4s6-xfrDp_cqrdRPhcw8hUDTwCoEAMruuZ534bmFpwz_oMMDDEhHRvFIK6GLhw7-X2BWDROibw_93iPH6pW2Y3bCgJFiGtDwqQsubaQCGpg"
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
        // S-curve weaving left and right between the alternating cards
        const curveOffset = Math.min(110, W * 0.12);
        // Even indices (0, 2, 4): card is on left, swing toward left
        // Odd indices (1, 3, 5): card is on right, swing toward right
        x = idx % 2 === 0 ? cx - curveOffset : cx + curveOffset;
      } else {
        // Mobile single lane in the left margin with subtle mechanical weave
        const baseMobileX = 28;
        x = baseMobileX + (idx % 2 === 0 ? -4 : 4);
      }

      pts.push({ x, y, stepIdx: idx });
    });

    if (pts.length < 2) return;

    setWaypoints(pts);

    // Build smooth cubic Bezier curve spline
    const startX = desktop ? W / 2 : 28;
    const startY = 0;
    const endX = desktop ? W / 2 : 28;
    const endY = H;

    let d = `M ${startX} ${startY}`;

    // First transition from top center to first milestone
    const firstPt = pts[0];
    const dy0 = firstPt.y - startY;
    d += ` C ${startX} ${startY + dy0 * 0.5}, ${firstPt.x} ${firstPt.y - dy0 * 0.5}, ${firstPt.x} ${firstPt.y}`;

    // Intermediate S-curve segments
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

    // Final segment from last milestone to bottom
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

    // Safety timeout for images settling
    const t = setTimeout(calculatePath, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      clearTimeout(t);
    };
  }, [calculatePath]);

  // ScrollTrigger drive animation along the SVG S-curve (maintaining path progression)
  useEffect(() => {
    if (!mainRef.current || !pathRef.current || !pathData) return;

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    if (totalLength === 0) return;

    // Set initial dasharray for active glowing paved path
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

        // Update glowing paved road dashoffset
        if (activePathRef.current) {
          activePathRef.current.style.strokeDashoffset = `${totalLength - currentDist}`;
        }

        // Determine active step index based on path progress
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

  // Click handler to drive along path / scroll smoothly to a milestone
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
              Masterpiece Progression &bull; Stage {steps[activeStepIdx].id} / 06
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0]" />
            <span className="text-[#E0B9A0] font-bold text-[10px] sm:text-xs">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      </header>

      <main ref={mainRef} className="relative py-14 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Dynamic S-Curve SVG Construction Road */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
          <svg className="w-full h-full" style={{ overflow: "visible" }}>
            <defs>
              {/* Electric Road Neon Glow Filter */}
              <filter id="road-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Construction Track Gradient */}
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
                  strokeWidth={isDesktop ? 32 : 20}
                  strokeOpacity="0.08"
                  strokeLinecap="round"
                />

                {/* Dark Construction Asphalt Base Track */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(8, 8, 9, 0.65)"
                  strokeWidth={isDesktop ? 16 : 10}
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

                {/* Active Paved Glowing Neon Line (Fills behind Bulldozer) */}
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
                  {/* Outer Radar Pulse for Active Milestone */}
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
                  {/* Milestone Center Node */}
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
                  {/* Milestone Index Text on Road */}
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
        <div className="space-y-16 sm:space-y-24 lg:space-y-36 relative z-20">
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
                className={`relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 group ${
                  idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                } pl-10 sm:pl-12 lg:pl-0`}
              >
                {/* Left/Right Media Card */}
                <div className="w-full lg:w-5/12 order-2 lg:order-1">
                  <div 
                    onClick={() => setSelectedStep(step)}
                    className={`relative group overflow-hidden bg-[#181514]/80 cursor-pointer rounded-2xl border transition-all duration-500 shadow-2xl ${
                      isCurrent 
                        ? 'border-[#E0B9A0] ring-2 ring-[#E0B9A0]/40 shadow-[0_0_35px_rgba(224,185,160,0.25)] scale-[1.01]' 
                        : isPassed 
                        ? 'border-white/30 hover:border-[#E0B9A0]' 
                        : 'border-white/20 hover:border-[#E0B9A0]'
                    }`}
                  >
                    <img 
                      alt={step.title} 
                      className={`w-full aspect-video object-cover transition-all duration-1000 ${
                        isCurrent ? 'opacity-95 scale-[1.03]' : 'opacity-75 group-hover:opacity-100'
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
                        <span className="material-symbols-outlined text-xl sm:text-3xl text-[#E0B9A0] drop-shadow-md">
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

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="font-mono text-white text-[9px] tracking-[0.25em] border border-[#E0B9A0] text-[#E0B9A0] px-5 py-2.5 uppercase rounded-full bg-[#181514]/80 backdrop-blur-xs font-bold">
                        Explore Stage
                      </span>
                    </div>
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

                {/* Content Details */}
                <div className={`w-full lg:w-5/12 order-1 lg:order-2 ${idx % 2 !== 0 ? 'lg:text-right' : ''}`}>
                  <div className={`flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                    <span className={`font-display text-4xl sm:text-6xl md:text-7xl leading-none font-bold transition-colors duration-500 ${
                      isCurrent ? 'text-[#E0B9A0] drop-shadow-[0_0_15px_rgba(224,185,160,0.4)]' : 'text-[#E0B9A0]/80'
                    }`}>
                      {step.id}
                    </span>
                    <div className={`h-[2px] flex-grow transition-colors duration-500 ${
                      isCurrent ? 'bg-[#E0B9A0]' : 'bg-white/20'
                    }`}></div>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl md:text-2xl mb-2 sm:mb-4 tracking-wider uppercase text-white leading-tight font-bold">
                    {step.title}
                  </h3>
                  
                  <p className="text-[#E0B9A0] font-mono text-[8.5px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-6 font-bold">
                    {step.subtitle}
                  </p>

                  <p className={`text-stone-200 font-normal text-xs sm:text-sm md:text-base leading-relaxed max-w-md ${idx % 2 !== 0 ? 'lg:ml-auto' : ''}`}>
                    {step.description}
                  </p>

                  <button 
                    onClick={() => setSelectedStep(step)}
                    className={`mt-4 sm:mt-8 flex items-center gap-3 sm:gap-4 group-hover:gap-5 transition-all duration-500 text-[#E0B9A0] font-mono text-[9px] tracking-[0.25em] uppercase cursor-pointer font-bold ${
                      idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                    } active:scale-95`}
                  >
                    <div className="h-[2px] w-6 sm:w-8 bg-[#E0B9A0]"></div>
                    <span>Explore Stage</span>
                  </button>
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>

      {/* Process Detail Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 md:p-10 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.2, 0, 0.2, 1] }}
              className="bg-surface-dark w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-0 sm:border sm:border-white/10 relative no-scrollbar rounded-xs"
            >
              <button 
                onClick={() => setSelectedStep(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-white/60 hover:text-primary transition-colors bg-black/40 p-2 rounded-full border border-white/10 cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-48 sm:h-64 md:h-80 lg:h-full relative">
                  <img 
                    src={selectedStep.image} 
                    alt={selectedStep.title} 
                    className="w-full h-full object-cover grayscale-[0.5]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface-dark to-transparent lg:hidden"></div>
                </div>
                
                <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                      <span className="text-primary font-display text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase leading-none">
                        {selectedStep.id} / PROCESS STAGE
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter mb-4 sm:mb-6 leading-tight">
                      {selectedStep.title}
                    </h2>
                    <div className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light whitespace-pre-line">
                      {selectedStep.details}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 sm:p-6 border-l-2 border-primary rounded-xs">
                    <h4 className="text-primary font-display text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 leading-none">
                      What You Gain
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {selectedStep.gains.map((gain, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
                          <span className="text-primary mt-1 text-[8px]">●</span>
                          {gain}
                        </li>
                      ))}
                    </ul>
                  </div>

                    <button 
                      onClick={() => setSelectedStep(null)}
                      className="w-auto inline-flex items-center justify-center px-8 py-3 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase border border-[#E0B9A0] bg-[#E0B9A0] text-[#2D2926] hover:bg-[#FAF8F5] transition-colors active:scale-95 shadow-[0_0_15px_rgba(224,185,160,0.2)] cursor-pointer"
                    >
                      Close Stage
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </section>
  );
}
