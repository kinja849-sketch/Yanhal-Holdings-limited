import { useRef, useCallback } from "react";
import Navbar from "./Navbar";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import { transitionManager } from "../lib/transitionManager";
import { ArrowUpRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  startEntrance?: boolean;
}

export default function Hero({ startEntrance = true }: HeroProps) {
  const videoSrc = "/yanhal.mp4";
  const heroRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track the last played animation style so consecutive animations are always unpredictable & different
  const lastStyleRef = useRef<string | null>(null);
  const isAnimatingRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeScramblesRef = useRef<(() => void)[]>([]);

  // Headline Words Breakdown
  const line1Words = ["YOUR", "VISION."];
  const line2Words = ["BUILT", "DIFFERENT."];

  // ── 7 Unpredictable GSAP Animation Styles (from https://gsap-text-animations-cloneable.webflow.io/) ──
  const playUnpredictableAnimation = useCallback(() => {
    if (!titleContainerRef.current) return;
    const chars = titleContainerRef.current.querySelectorAll<HTMLElement>(".hero-char");
    if (!chars.length) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(chars, { clearProps: "all", opacity: 1 });
      return;
    }

    // Cancel any active scramble timeouts or running tweens
    activeScramblesRef.current.forEach((cancel) => cancel());
    activeScramblesRef.current = [];
    gsap.killTweensOf(chars);

    // Reset character textContent back to original attribute data-char
    chars.forEach((c) => {
      const orig = c.getAttribute("data-char");
      if (orig) c.textContent = orig;
    });

    const styles = [
      "rise",             // Cloneable #1: Vertical Rise Stagger
      "flip-center",      // Cloneable #2: 3D Center Flip
      "alternating-skew", // Cloneable #4: 3D Alternating Split & Skew
      "scramble",         // Cloneable #6: Cyber / Matrix Scramble Decoder
      "blur-reveal",      // Cloneable #8: Cinematic Gaussian Blur Reveal
      "deep-space",       // Cloneable #9: 3D Deep Space Assembly
      "elastic-stretch",  // Cloneable #10: Elastic Kinetic Snap
    ];

    // Pick a style different from the last one played
    const available = styles.filter((s) => s !== lastStyleRef.current);
    const chosen = available[Math.floor(Math.random() * available.length)];
    lastStyleRef.current = chosen;
    isAnimatingRef.current = true;

    // Execute selected animation style
    switch (chosen) {
      case "rise": {
        // Cloneable #1: Vertical Rise Stagger
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          { opacity: 0, yPercent: 110 },
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.035,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      case "flip-center": {
        // Cloneable #2: 3D Flip from Center
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          { opacity: 0, rotateX: -85, transformOrigin: "50% 50% -30px" },
          {
            opacity: 1,
            rotateX: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: {
              each: 0.04,
              from: "center",
              grid: "auto",
            },
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      case "alternating-skew": {
        // Cloneable #4: 3D Alternating Split & Skew
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          {
            opacity: 0,
            rotateY: -50,
            yPercent: (i: number) => (i % 2 === 0 ? -110 : 110),
          },
          {
            opacity: 1,
            rotateY: 0,
            yPercent: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.035,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      case "scramble": {
        // Cloneable #6: Cyber / Matrix Scramble Decoder
        gsap.set(chars, { clearProps: "all" });
        const glyphs = "█▓▒░<>!@#$%^&*+/";
        const scrambleDuration = 1.3;
        const scrambleInterval = 45;
        const iterations = Math.ceil((scrambleDuration * 1000) / scrambleInterval);

        chars.forEach((charEl, idx) => {
          const original = charEl.getAttribute("data-char") || charEl.textContent || "";
          if (original === " " || original === "") return;

          let iteration = 0;
          let timerId: NodeJS.Timeout;
          let cancelled = false;

          const cancel = () => {
            cancelled = true;
            clearTimeout(timerId);
            charEl.textContent = original;
          };
          activeScramblesRef.current.push(cancel);

          const step = () => {
            if (cancelled) return;
            if (iteration >= iterations) {
              charEl.textContent = original;
              if (idx === chars.length - 1) isAnimatingRef.current = false;
              return;
            }
            charEl.textContent =
              Math.random() > iteration / iterations
                ? glyphs[Math.floor(Math.random() * glyphs.length)]
                : original;
            iteration++;
            timerId = setTimeout(step, scrambleInterval);
          };

          gsap.fromTo(
            charEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.35,
              delay: idx * 0.025,
              onStart: step,
            }
          );
        });
        break;
      }

      case "blur-reveal": {
        // Cloneable #8: Cinematic Gaussian Blur Reveal
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          { opacity: 0, filter: "blur(14px)", y: 24 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.035,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      case "deep-space": {
        // Cloneable #9: 3D Deep Space Assembly
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          {
            opacity: 0,
            y: 50,
            z: () => gsap.utils.random(-180, 180),
            rotationX: () => gsap.utils.random(-80, 80),
            rotationY: () => gsap.utils.random(-80, 80),
          },
          {
            opacity: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.035,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      case "elastic-stretch": {
        // Cloneable #10: Elastic Kinetic Snap
        gsap.set(chars, { clearProps: "all" });
        gsap.fromTo(
          chars,
          { scaleX: 3.5, scaleY: 0.15, opacity: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: 1.2,
            ease: "elastic.out(1, 0.75)",
            stagger: 0.03,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
        break;
      }

      default:
        gsap.set(chars, { opacity: 1 });
        isAnimatingRef.current = false;
    }
  }, []);

  // ── GSAP Entrance, Unpredictable Scrollback Trigger & Parallax ─────────────────
  useGSAP(
    () => {
      if (!startEntrance) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Initial entrance animation
        playUnpredictableAnimation();

        // 2. Reveal bottom CTAs
        gsap.fromTo(
          ".hero-cta-btn",
          { opacity: 0, y: 16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, delay: 0.3, ease: "power3.out" }
        );

        // 3. ScrollTrigger: Trigger a NEW unpredictable animation upon EACH scrollback
        let hasScrolledAway = false;
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: "bottom 60%",
          onLeave: () => {
            // User scrolled down past hero threshold
            hasScrolledAway = true;
          },
          onEnterBack: () => {
            // User scrolled back up into hero: trigger fresh unpredictable animation!
            if (hasScrolledAway) {
              playUnpredictableAnimation();
              hasScrolledAway = false;
            }
          },
        });

        // 4. Subtle depth recession as user scrolls away
        gsap.to(titleContainerRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
          yPercent: 12,
          opacity: 0.3,
          scale: 0.96,
          ease: "none",
        });

        if (videoRef.current) {
          gsap.to(videoRef.current, {
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
            scale: 0.96,
            opacity: 0.65,
            ease: "none",
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (titleContainerRef.current) {
          const chars = titleContainerRef.current.querySelectorAll(".hero-char");
          gsap.set(chars, { opacity: 1, clearProps: "all" });
        }
      });
    },
    { dependencies: [startEntrance, playUnpredictableAnimation], scope: heroRef }
  );

  // Subtle periodic cycle if user remains idle on hero for >8 seconds
  const handleIdleCycle = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.scrollY < 200 && !isAnimatingRef.current) {
      playUnpredictableAnimation();
    }
  }, [playUnpredictableAnimation]);

  useGSAP(() => {
    if (!startEntrance) return;
    const interval = setInterval(handleIdleCycle, 8500);
    return () => clearInterval(interval);
  }, { dependencies: [startEntrance, handleIdleCycle] });

  return (
    <section
      ref={heroRef}
      id="home"
      className="section-brand-black relative w-full h-[100svh] min-h-[600px] flex flex-col justify-between overflow-hidden text-[#FAF8F5] pt-18 sm:pt-20 md:pt-24 origin-bottom will-change-transform bg-[#080809]"
    >
      {/* Top Scoped Navigation Header */}
      <Navbar />

      {/* Visual Foundation: Cinematic Video Background - 100% Unobstructed */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
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

        {/* Ambient Architectural Scrims for Flawless Readability Over Video */}
        <div className="absolute inset-0 bg-[#080809]/40 sm:bg-[#080809]/30 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#080809]/85 via-[#080809]/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-[#080809]/90 via-[#080809]/40 to-transparent pointer-events-none" />
      </div>

      {/* Central Zone: "Your Vision. Built Different." Unpredictable GSAP Animated Text */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 flex-1 flex flex-col justify-center items-center">
        <h1
          ref={titleContainerRef}
          className="hero-title-container flex flex-col items-center sm:items-start text-center sm:text-left will-change-transform select-none sm:-translate-x-6 md:-translate-x-10"
        >
          {/* Line 1: YOUR VISION. */}
          <span className="hero-line block text-[clamp(1.75rem,5.2vw,4.25rem)] font-display font-semibold text-[#FAF8F5] tracking-[0.08em] sm:tracking-[0.12em] uppercase leading-[1.08] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)] min-h-[1.12em] whitespace-nowrap [perspective:1000px] [transform-style:preserve-3d]">
            {line1Words.map((word, wIdx) => (
              <span key={`w1-${wIdx}`} className="inline-block">
                <span className="hero-word inline-block whitespace-nowrap [perspective:1000px] [transform-style:preserve-3d]">
                  {word.split("").map((char, cIdx) => (
                    <span
                      key={`c1-${wIdx}-${cIdx}`}
                      className="hero-char inline-block will-change-transform"
                      data-char={char}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                {wIdx < line1Words.length - 1 && <span className="inline-block w-[0.26em] select-none">&nbsp;</span>}
              </span>
            ))}
          </span>

          {/* Line 2: BUILT DIFFERENT. */}
          <span className="hero-line block text-[clamp(1.5rem,4.5vw,3.65rem)] font-display font-semibold text-[#FAF8F5]/95 tracking-[0.08em] sm:tracking-[0.12em] uppercase leading-[1.08] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)] mt-1.5 sm:mt-2.5 min-h-[1.12em] whitespace-nowrap [perspective:1000px] [transform-style:preserve-3d]">
            {line2Words.map((word, wIdx) => (
              <span key={`w2-${wIdx}`} className="inline-block">
                <span className="hero-word inline-block whitespace-nowrap [perspective:1000px] [transform-style:preserve-3d]">
                  {word.split("").map((char, cIdx) => (
                    <span
                      key={`c2-${wIdx}-${cIdx}`}
                      className="hero-char inline-block will-change-transform"
                      data-char={char}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                {wIdx < line2Words.length - 1 && <span className="inline-block w-[0.26em] select-none">&nbsp;</span>}
              </span>
            ))}
          </span>
        </h1>
      </div>

      {/* Bottom Zone: Visible Action Buttons Floating Close to Bottom - Beside Each Other & Exact Same Size */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-12 pb-18 sm:pb-12 md:pb-14 flex items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 md:gap-5 w-auto">
          {/* Primary CTA: Start Project */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              transitionManager.transitionTo({
                destination: "#contact",
                label: "START PROJECT",
              });
            }}
            className="hero-cta-btn btn-fill-hover group w-[138px] sm:w-[195px] md:w-[210px] h-[44px] sm:h-[48px] md:h-[50px] inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 rounded-full border border-[#E0B9A0] bg-[#E0B9A0] text-[#2D2926] hover:bg-[#FAF8F5] hover:border-[#FAF8F5] text-[9.5px] sm:text-[11px] font-mono font-bold tracking-[0.08em] sm:tracking-[0.16em] uppercase shadow-[0_4px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(224,185,160,0.3)] active:scale-[0.97] transition-all duration-300 shrink-0"
          >
            <span className="whitespace-nowrap">Start Project</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2D2926]/15 group-hover:bg-[#2D2926]/25 flex items-center justify-center shrink-0 transition-colors">
              <ArrowUpRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#2D2926] stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Secondary CTA: Check Us Out */}
          <a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault();
              transitionManager.transitionTo({
                destination: "#portfolio",
                label: "03 · SELECTED WORKS",
              });
            }}
            className="hero-cta-btn btn-fill-hover group w-[138px] sm:w-[195px] md:w-[210px] h-[44px] sm:h-[48px] md:h-[50px] inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 rounded-full border border-white/25 bg-[#181514]/70 backdrop-blur-md text-[#FAF8F5] hover:border-[#AE917E] hover:text-white text-[9.5px] sm:text-[11px] font-mono font-bold tracking-[0.08em] sm:tracking-[0.16em] uppercase shadow-[0_4px_25px_rgba(0,0,0,0.5)] active:scale-[0.97] transition-all duration-300 shrink-0"
          >
            <span className="whitespace-nowrap">Check Us Out</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E0B9A0] group-hover:text-white stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
