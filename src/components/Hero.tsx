import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { 
  ArrowUpRightIcon, 
  ArrowRightIcon, 
  BuildingOffice2Icon, 
  SparklesIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";

interface HeroProps {
  startEntrance?: boolean;
}

export default function Hero({ startEntrance = true }: HeroProps) {
  const videoSrc = "/yanhal.mp4";
  const heroRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
    if (!startEntrance) {
      gsap.set(
        [
          ".hero-eyebrow",
          ".hero-char-c",
          ".hero-ampersand",
          ".hero-char-i",
          ".hero-description",
          ".hero-cta-btn",
          ".hero-metric-item",
        ],
        { opacity: 0 }
      );
      return;
    }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Step 1: Subtle Eyebrow reveal
        tl.fromTo(
          ".hero-eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, clearProps: "all" }
        );

        // Step 2: Aroclux Signature Letter Blur & Scale Reveal for "CONSTRUCTION & INTERIORS"
        tl.fromTo(
          ".hero-char-c",
          {
            scale: 1.35,
            filter: "blur(25px)",
            opacity: 0,
            y: 30,
          },
          {
            scale: 1,
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
            stagger: 0.024,
            duration: 1.1,
            ease: "expo.out",
          },
          "-=0.3"
        )
          .fromTo(
            ".hero-ampersand",
            {
              scale: 0.5,
              filter: "blur(20px)",
              opacity: 0,
              y: 20,
            },
            {
              scale: 1,
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "expo.out",
            },
            "-=0.7"
          )
          .fromTo(
            ".hero-char-i",
            {
              scale: 1.35,
              filter: "blur(25px)",
              opacity: 0,
              y: 30,
            },
            {
              scale: 1,
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
              stagger: 0.022,
              duration: 1.1,
              ease: "expo.out",
            },
            "-=0.7"
          )
          // Step 3: Supporting copy
          .fromTo(
            ".hero-description",
            { opacity: 0, y: 16, filter: "blur(8px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "expo.out", clearProps: "all" },
            "-=0.5"
          )
          // Step 4: Compact CTA buttons entrance
          .fromTo(
            ".hero-cta-btn",
            { opacity: 0, y: 18, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: "power3.out", clearProps: "all" },
            "-=0.45"
          )
          // Step 5: Metric indicators bar
          .fromTo(
            ".hero-metric-item",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.55, ease: "power2.out", clearProps: "all" },
            "-=0.35"
          );

        // ScrollTrigger: Natural depth response as user scrolls down
        gsap.to(titleContainerRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
          yPercent: 18,
          opacity: 0.4,
          scale: 0.98,
          ease: "none",
        });

        // Controlled subtle contraction as user reaches transition threshold
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "bottom 85%",
            end: "bottom top",
            scrub: 0.6,
          },
          scale: 0.975,
          opacity: 0.92,
          ease: "power2.inOut",
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".hero-eyebrow",
            ".hero-char-c",
            ".hero-ampersand",
            ".hero-char-i",
            ".hero-description",
            ".hero-cta-btn",
            ".hero-metric-item",
          ],
          { opacity: 1, y: 0, yPercent: 0, rotateX: 0, scale: 1 }
        );
      });
    },
    { dependencies: [startEntrance], scope: heroRef }
  );

  const constructionChars = "CONSTRUCTION".split("");
  const interiorsChars = "INTERIORS".split("");

  return (
    <section
      ref={heroRef}
      id="home"
      className="section-brand-black relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden text-[#FAF8F5] pt-18 sm:pt-20 md:pt-24 origin-bottom will-change-transform bg-[#080809]"
    >
      {/* Visual Foundation: Cinematic Video Background - Clearly & Vibrantly Visible */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center opacity-95 transition-opacity duration-700"
          onCanPlay={(e) => {
            (e.target as HTMLVideoElement).play().catch(() => {});
          }}
        />

        {/* Architectural Atmospheric Scrims - Warm, translucent, non-dominant black */}
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#080809]/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 sm:h-52 bg-gradient-to-t from-[#080809]/85 via-[#080809]/30 to-transparent pointer-events-none" />
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(45, 41, 38, 0.25) 0%, transparent 80%)"
          }}
        />
      </div>

      {/* Top Editorial Subheadings Framing Row (Below Navbar) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-3 sm:pt-4 flex items-center justify-between text-xs text-stone-300 font-sans font-light">
        <div className="hero-eyebrow max-w-xs text-left leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] hidden sm:block text-[11px] md:text-xs">
          We design &amp; build structures that combine architectural aesthetics with engineering integrity.
        </div>
        <div className="hero-eyebrow mx-auto sm:mx-0 flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/15 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#AE917E] shadow-[0_0_8px_#AE917E]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
        <div className="hero-eyebrow max-w-xs text-right leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] hidden sm:block text-[11px] md:text-xs">
          Delivering commercial &amp; residential developments across Nairobi and East Africa.
        </div>
      </div>

      {/* Main Centered Hero Composition */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 my-auto py-2 sm:py-4 md:py-6 flex flex-col items-center justify-center text-center">
        
        {/* Centered Brand Capsule with Aroclux Peach Accent */}
        <div className="hero-eyebrow inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-[#2D2926]/70 backdrop-blur-md border border-[#E0B9A0]/40 mb-2 sm:mb-3 md:mb-4 shadow-[0_0_15px_rgba(224,185,160,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] animate-pulse shadow-[0_0_6px_#E0B9A0]" />
          <span className="font-mono text-[8.5px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.26em] uppercase font-semibold text-[#FAF8F5]">
            Yanhal Holdings &bull; Nairobi, Kenya
          </span>
        </div>

        {/* Monumental Choreographed Headline with Aroclux Split Character Animation */}
        <div 
          ref={titleContainerRef}
          className="hero-title-container relative flex flex-col items-center justify-center w-full max-w-5xl px-2 will-change-transform"
        >
          {/* First Line: CONSTRUCTION */}
          <div className="overflow-hidden w-full py-0.5 sm:py-1">
            <h1 
              className="text-[clamp(1.5rem,6.4vw,5.5rem)] font-display font-black text-[#FAF8F5]/90 tracking-[0.08em] sm:tracking-[0.16em] uppercase leading-[0.98] select-none text-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)] m-0 flex justify-center flex-wrap"
              style={{
                WebkitTextStroke: "1px rgba(224, 185, 160, 0.35)"
              }}
            >
              {constructionChars.map((char, index) => (
                <span key={index} className="title-char-mask">
                  <span className="title-char-inner hero-char-c">
                    {char}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          {/* Second Line: & INTERIORS */}
          <div className="overflow-hidden w-full mt-1 sm:mt-2 py-0.5 sm:py-1">
            <h2 
              className="text-[clamp(1.25rem,5.1vw,4.3rem)] font-display font-extrabold text-[#FAF8F5]/90 tracking-[0.1em] sm:tracking-[0.18em] uppercase leading-[1.02] select-none text-center flex items-center justify-center gap-1.5 sm:gap-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] m-0"
              style={{
                WebkitTextStroke: "1px rgba(224, 185, 160, 0.3)"
              }}
            >
              <span className="hero-ampersand text-[#E0B9A0] font-sans font-normal text-[clamp(1.1rem,3.8vw,3rem)] drop-shadow-[0_0_12px_rgba(224,185,160,0.5)] mr-1 sm:mr-2">
                &amp;
              </span>
              <span className="flex justify-center">
                {interiorsChars.map((char, index) => (
                  <span key={index} className="title-char-mask">
                    <span className="title-char-inner hero-char-i">
                      {char}
                    </span>
                  </span>
                ))}
              </span>
            </h2>
          </div>
        </div>

        {/* Centered Concise Supporting Copy */}
        <p className="hero-description text-stone-200 text-[clamp(0.78rem,1.15vw,1.05rem)] font-sans font-light leading-relaxed max-w-xl mx-auto mt-2 sm:mt-4 md:mt-5 mb-4 sm:mb-6 md:mb-7 px-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
          Turnkey architectural construction, commercial developments, and bespoke interior fitouts crafted across Nairobi and East Africa with uncompromising precision.
        </p>

        {/* Refined Responsive Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 w-auto max-w-full px-4 sm:px-0">
          {/* Primary CTA: Aroclux Warm Sandstone Peach Fill */}
          <a
            href="#estimator"
            className="hero-cta-btn btn-fill-hover group w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 min-h-[44px] sm:min-h-[48px] rounded-full border border-[#E0B9A0] bg-[#E0B9A0] text-[#2D2926] hover:bg-[#FAF8F5] hover:border-[#FAF8F5] text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.16em] sm:tracking-[0.22em] uppercase shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_20px_rgba(224,185,160,0.3)] active:scale-[0.97] transition-all duration-300 shrink-0"
          >
            <span>Get a Free Estimate</span>
            <div className="w-5 h-5 rounded-full bg-[#2D2926]/15 group-hover:bg-[#2D2926]/25 flex items-center justify-center transition-colors shrink-0">
              <ArrowUpRightIcon className="w-3 h-3 text-[#2D2926] stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>
          </a>

          {/* Secondary CTA: Architectural Frosted Glass with Warm Slate Accent */}
          <a
            href="#portfolio"
            className="hero-cta-btn btn-fill-hover group w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 min-h-[44px] sm:min-h-[48px] rounded-full border border-white/25 bg-[#181514]/60 backdrop-blur-md text-[#FAF8F5] before:bg-[#AE917E] hover:border-[#AE917E] hover:text-white text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.16em] sm:tracking-[0.22em] uppercase shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.97] transition-all duration-300 shrink-0"
          >
            <span>View Our Work</span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-[#E0B9A0] group-hover:text-white stroke-[2] group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>

      </div>

      {/* Bottom Architectural Standards Bar (Guaranteed Full Visibility, Never Cropped) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-2">
        <div className="pt-4 sm:pt-5 border-t border-white/20 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-center">
          {/* Turnkey Builds */}
          <div className="hero-metric-item flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 md:gap-3 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E0B9A0]/50 bg-[#E0B9A0]/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(224,185,160,0.2)]">
              <BuildingOffice2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E0B9A0] stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider text-[#FAF8F5] whitespace-nowrap">
                Turnkey Builds
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] text-stone-300 font-sans whitespace-nowrap">
                Civil Engineering
              </span>
            </div>
          </div>

          {/* Bespoke Fitouts */}
          <div className="hero-metric-item flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#AE917E]/50 bg-[#AE917E]/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(174,145,126,0.2)]">
              <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#AE917E] stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider text-[#FAF8F5] whitespace-nowrap">
                Bespoke Fitouts
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] text-stone-300 font-sans whitespace-nowrap">
                Interior Artistry
              </span>
            </div>
          </div>

          {/* Grade Standards */}
          <div className="hero-metric-item flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1.5 sm:gap-2.5 md:gap-3 text-center sm:text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF8F5] stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider text-[#FAF8F5] whitespace-nowrap">
                Grade Standards
              </span>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] text-stone-300 font-sans whitespace-nowrap">
                Turnkey Quality
              </span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

