import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedHeading from "./AnimatedHeading";
import AnimatedBlock from "./AnimatedBlock";
import { gsap, useGSAP } from "../lib/gsap";

interface LeaderData {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  characterUrl: string;
  modalImageUrl: string;
  quote: string;
  pillars: string[];
  bio: string[];
}

const LEADERS: LeaderData[] = [
  {
    id: "ismail-abdirahman",
    name: "Ismail Abdirahman",
    role: "Chief Executive Officer (CEO)",
    coverUrl: "/leaders/isma.jpg",
    characterUrl: "/leaders/isma2.jpg",
    modalImageUrl: "/leaders/isma2.jpg",
    quote: "Guiding Yanhal Holdings toward structural excellence, strategic discipline, and long-term enterprise value.",
    pillars: [
      "Corporate Strategy & Governance",
      "Commercial & Residential Vision",
      "Executive Oversight & Delivery"
    ],
    bio: [
      "Ismail Abdirahman is the Chief Executive Officer of Yanhal Holdings Ltd, providing strategic leadership and overall direction for the company’s operations in construction and project development. As the driving force behind the organization, he is responsible for shaping the company’s vision, establishing operational standards, and ensuring that every project reflects a balance of quality, efficiency, and long-term value.",
      "With a strong foundation in project coordination and construction oversight, Ismail plays an active role in guiding projects from initial concept through to completion. His leadership approach is centered on precision, accountability, and structured execution, ensuring that all aspects of a project—from planning and budgeting to resource allocation and delivery—are managed effectively.",
      "He works closely with engineers, site managers, and stakeholders to align technical execution with client expectations, maintaining clear communication and transparency throughout the project lifecycle. His ability to oversee multiple moving parts while maintaining a focus on detail enables Yanhal Holdings to deliver consistent and reliable results across its portfolio.",
      "Ismail’s leadership is defined by a commitment to building not just structures, but lasting relationships with clients through trust, professionalism, and performance. Under his direction, the company continues to grow its presence in both residential and commercial construction, with a focus on delivering projects that meet modern standards and practical functionality."
    ]
  },
  {
    id: "dahir-yusuf",
    name: "Dahir Yusuf",
    role: "Project Manager – Buildings & Road Construction",
    coverUrl: "/leaders/dahir1.jpg",
    characterUrl: "/leaders/dahir2.jpg",
    modalImageUrl: "/leaders/dahir2.jpg",
    quote: "Translating engineering blueprints into resilient physical structures with relentless on-site precision.",
    pillars: [
      "Structural Engineering & Concrete",
      "Infrastructure & Road Development",
      "On-Site Quality & Safety Protocols"
    ],
    bio: [
      "Dahir Yusuf serves as Project Manager at Yanhal Holdings Ltd, where he oversees the day-to-day execution of construction projects, ensuring that all site activities are carried out efficiently, safely, and in accordance with engineering standards. With strong on-site experience, he plays a central role in turning project plans into tangible, well-constructed outcomes.",
      "In his role, Dahir is responsible for supervising site operations, coordinating with contractors and labor teams, and monitoring progress to ensure that timelines and project milestones are met. He maintains strict oversight of construction quality, ensuring that materials, structural elements, and workmanship adhere to required specifications and industry standards.",
      "His expertise spans across structural construction and infrastructure development, including foundations, reinforced concrete works, and road-related projects. Dahir is also actively involved in problem-solving on-site, addressing challenges in real time to keep projects moving forward without compromising quality or safety.",
      "With a disciplined and detail-oriented approach, he ensures that every stage of construction is executed with accuracy and consistency. His ability to manage teams, track progress, and maintain clear communication between all parties involved makes him a key contributor to the successful delivery of projects at Yanhal Holdings."
    ]
  }
];

const TypewriterLoop = ({ mainText, subText }: { mainText: string; subText: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fullText = mainText + "|" + subText;

  useEffect(() => {
    const typingSpeed = 60;
    const deletingSpeed = 30;
    const pauseBeforeDelete = 4000;
    const pauseBeforeType = 1000;

    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
    } else if (isDeleting && displayText === "") {
      timer = setTimeout(() => setIsDeleting(false), pauseBeforeType);
    } else {
      const nextChar = isDeleting
        ? fullText.slice(0, displayText.length - 1)
        : fullText.slice(0, displayText.length + 1);

      timer = setTimeout(() => {
        setDisplayText(nextChar);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, fullText]);

  const parts = displayText.split("|");
  const renderedMain = parts[0];
  const renderedSub = parts[1];

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="italic min-h-[40px] sm:min-h-[24px]">
        {renderedMain}
        {renderedSub === undefined && (
          <span className="animate-pulse border-r-[1.5px] border-[#E0B9A0] ml-0.5 inline-block h-[0.9em] translate-y-[0.1em]"></span>
        )}
      </p>
      <p className="text-[10px] text-[#E0B9A0] uppercase tracking-widest min-h-[15px]">
        {renderedSub !== undefined ? renderedSub : ""}
        {renderedSub !== undefined && (
          <span className="animate-pulse border-r-[1.5px] border-[#E0B9A0] ml-0.5 inline-block h-[0.9em] translate-y-[0.1em]"></span>
        )}
      </p>
    </div>
  );
};

export default function Leadership() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [photoView, setPhotoView] = useState<"cover" | "character">("cover");

  const sectionRef = useRef<HTMLElement>(null);
  const sliderStageRef = useRef<HTMLDivElement>(null);
  const slideLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const portraitImagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const contentOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const wipeBeamRef = useRef<HTMLDivElement>(null);

  // Transition Lock: strictly blocks navigation while animation is active
  const isAnimatingRef = useRef(false);

  // Touch Swipe tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Coordinated GSAP Directional Transition
  const transitionToLeader = useCallback((targetIndex: number, dir: 1 | -1) => {
    if (isAnimatingRef.current || targetIndex === currentIndex) return;
    isAnimatingRef.current = true;

    const outgoingIdx = currentIndex;
    const incomingIdx = targetIndex;

    const outgoingSlide = slideLayersRef.current[outgoingIdx];
    const incomingSlide = slideLayersRef.current[incomingIdx];
    const outgoingImg = portraitImagesRef.current[outgoingIdx];
    const incomingImg = portraitImagesRef.current[incomingIdx];
    const outgoingContent = contentOverlaysRef.current[outgoingIdx];
    const incomingContent = contentOverlaysRef.current[incomingIdx];
    const wipeBeam = wipeBeamRef.current;

    if (!outgoingSlide || !incomingSlide || !outgoingImg || !incomingImg || !outgoingContent || !incomingContent) {
      setCurrentIndex(targetIndex);
      isAnimatingRef.current = false;
      return;
    }

    const outgoingChars = outgoingContent.querySelectorAll<HTMLElement>(".title-char-inner");
    const incomingChars = incomingContent.querySelectorAll<HTMLElement>(".title-char-inner");
    const outgoingMeta = outgoingContent.querySelectorAll<HTMLElement>(".editorial-meta-anim");
    const incomingMeta = incomingContent.querySelectorAll<HTMLElement>(".editorial-meta-anim");

    // Prepare incoming slide on top
    gsap.set(incomingSlide, {
      zIndex: 25,
      visibility: "visible",
      opacity: 1,
      pointerEvents: "auto"
    });
    gsap.set(outgoingSlide, {
      zIndex: 10,
      pointerEvents: "none"
    });

    // Create synchronized GSAP Master Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(incomingIdx);
        // Reset outgoing slide resting states
        gsap.set(outgoingSlide, {
          zIndex: 1,
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none"
        });
        gsap.set(incomingSlide, {
          zIndex: 10,
          visibility: "visible",
          opacity: 1,
          pointerEvents: "auto"
        });
        gsap.set(outgoingImg, {
          scale: 1,
          opacity: 1
        });
        if (wipeBeam) {
          gsap.set(wipeBeam, { opacity: 0 });
        }
        isAnimatingRef.current = false;
      }
    });

    if (dir === 1) {
      // ==========================================
      // DIRECTION: NEXT (Forward)
      // Wipe sweeps from RIGHT toward LEFT
      // Outgoing text lifts up, incoming text enters from below with delay
      // ==========================================

      // 1. Stable CSS inset template setup via numerical custom property --clip-l
      // inset(0% 0% 0% 100%) -> reveal starts at right and sweeps toward left
      gsap.set(incomingSlide, {
        "--clip-t": 0,
        "--clip-r": 0,
        "--clip-b": 0,
        "--clip-l": 100
      });

      // 2. Incoming image photographic settling initial scale
      gsap.set(incomingImg, { scale: 1.1 });

      // 3. Incoming typography initial state (from below)
      gsap.set(incomingChars, { yPercent: 120, opacity: 0 });
      gsap.set(incomingMeta, { y: 24, opacity: 0 });

      // 4. Wipe beam initial state
      if (wipeBeam) {
        gsap.set(wipeBeam, {
          left: "100%",
          opacity: 1
        });
      }

      // --- TIMELINE SEQUENCING ---
      // A. Outgoing Typography Exits First (lifts up)
      tl.to(outgoingChars, {
        yPercent: -120,
        opacity: 0,
        stagger: 0.012,
        duration: 0.32,
        ease: "power2.in"
      }, 0);

      tl.to(outgoingMeta, {
        y: -18,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in"
      }, 0.04);

      // B. Incoming Typography Enters with intentional delay (from below)
      // Delay ensures outgoing and incoming typography never collide
      tl.to(incomingChars, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.018,
        duration: 0.48,
        ease: "power3.out"
      }, 0.36);

      tl.to(incomingMeta, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.42,
        ease: "power3.out"
      }, 0.44);

      // C. Directional Full-Slide Wipe: Right to Left via numerical --clip-l
      tl.to(incomingSlide, {
        "--clip-l": 0,
        duration: 1.15,
        ease: "power3.inOut"
      }, 0.05);

      // D. Photographic Settling Motion: scale 1.1 -> 1.0 smoothly
      tl.to(incomingImg, {
        scale: 1.0,
        duration: 1.18,
        ease: "power2.out"
      }, 0.05);

      // E. Outgoing Image Subtle Settle
      tl.to(outgoingImg, {
        scale: 0.96,
        opacity: 0.65,
        duration: 0.9,
        ease: "power2.inOut"
      }, 0.05);

      // F. Beam movement following wipe cut
      if (wipeBeam) {
        tl.to(wipeBeam, {
          left: "0%",
          duration: 1.15,
          ease: "power3.inOut"
        }, 0.05);
        tl.to(wipeBeam, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.out"
        }, 1.02);
      }

    } else {
      // ==========================================
      // DIRECTION: PREVIOUS (Backward)
      // Wipe sweeps from LEFT toward RIGHT (Mirrored)
      // Outgoing text drops down, incoming text enters from above with delay
      // ==========================================

      // 1. Stable CSS inset template setup via numerical custom property --clip-r
      // inset(0% 100% 0% 0%) -> reveal starts at left and sweeps toward right
      gsap.set(incomingSlide, {
        "--clip-t": 0,
        "--clip-r": 100,
        "--clip-b": 0,
        "--clip-l": 0
      });

      // 2. Incoming image photographic settling initial scale
      gsap.set(incomingImg, { scale: 1.1 });

      // 3. Incoming typography initial state (from above)
      gsap.set(incomingChars, { yPercent: -120, opacity: 0 });
      gsap.set(incomingMeta, { y: -24, opacity: 0 });

      // 4. Wipe beam initial state
      if (wipeBeam) {
        gsap.set(wipeBeam, {
          left: "0%",
          opacity: 1
        });
      }

      // --- TIMELINE SEQUENCING ---
      // A. Outgoing Typography Exits First (drops down in reverse stagger)
      tl.to(outgoingChars, {
        yPercent: 120,
        opacity: 0,
        stagger: -0.012,
        duration: 0.32,
        ease: "power2.in"
      }, 0);

      tl.to(outgoingMeta, {
        y: 18,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in"
      }, 0.04);

      // B. Incoming Typography Enters with intentional delay (from above)
      tl.to(incomingChars, {
        yPercent: 0,
        opacity: 1,
        stagger: -0.018,
        duration: 0.48,
        ease: "power3.out"
      }, 0.36);

      tl.to(incomingMeta, {
        y: 0,
        opacity: 1,
        stagger: -0.05,
        duration: 0.42,
        ease: "power3.out"
      }, 0.44);

      // C. Directional Full-Slide Wipe: Left to Right via numerical --clip-r
      tl.to(incomingSlide, {
        "--clip-r": 0,
        duration: 1.15,
        ease: "power3.inOut"
      }, 0.05);

      // D. Photographic Settling Motion: scale 1.1 -> 1.0 smoothly
      tl.to(incomingImg, {
        scale: 1.0,
        duration: 1.18,
        ease: "power2.out"
      }, 0.05);

      // E. Outgoing Image Subtle Settle
      tl.to(outgoingImg, {
        scale: 0.96,
        opacity: 0.65,
        duration: 0.9,
        ease: "power2.inOut"
      }, 0.05);

      // F. Beam movement following wipe cut
      if (wipeBeam) {
        tl.to(wipeBeam, {
          left: "100%",
          duration: 1.15,
          ease: "power3.inOut"
        }, 0.05);
        tl.to(wipeBeam, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.out"
        }, 1.02);
      }
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % LEADERS.length;
    transitionToLeader(nextIdx, 1);
  }, [currentIndex, transitionToLeader]);

  const handlePrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + LEADERS.length) % LEADERS.length;
    transitionToLeader(prevIdx, -1);
  }, [currentIndex, transitionToLeader]);

  // Initial layout configuration with useGSAP
  useGSAP(() => {
    LEADERS.forEach((_, idx) => {
      const slide = slideLayersRef.current[idx];
      const img = portraitImagesRef.current[idx];
      const content = contentOverlaysRef.current[idx];

      if (!slide || !img || !content) return;

      if (idx === currentIndex) {
        gsap.set(slide, {
          "--clip-t": 0,
          "--clip-r": 0,
          "--clip-b": 0,
          "--clip-l": 0,
          zIndex: 10,
          visibility: "visible",
          opacity: 1,
          pointerEvents: "auto"
        });
        gsap.set(img, { scale: 1, opacity: 1 });
        const chars = content.querySelectorAll<HTMLElement>(".title-char-inner");
        const meta = content.querySelectorAll<HTMLElement>(".editorial-meta-anim");
        gsap.set(chars, { yPercent: 0, opacity: 1 });
        gsap.set(meta, { y: 0, opacity: 1 });
      } else {
        gsap.set(slide, {
          "--clip-t": 0,
          "--clip-r": 100,
          "--clip-b": 0,
          "--clip-l": 0,
          zIndex: 1,
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none"
        });
        gsap.set(img, { scale: 1.1, opacity: 0.7 });
        const chars = content.querySelectorAll<HTMLElement>(".title-char-inner");
        const meta = content.querySelectorAll<HTMLElement>(".editorial-meta-anim");
        gsap.set(chars, { yPercent: 120, opacity: 0 });
        gsap.set(meta, { y: 24, opacity: 0 });
      }
    });
  }, { scope: sliderStageRef, dependencies: [] });

  // Keyboard Navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBioOpen) return;

      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isInViewport) return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isBioOpen]);

  // Pause Lenis smooth scroll while bio modal is open
  useEffect(() => {
    if (isBioOpen) {
      if ((window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsBioOpen(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
        if ((window as any).__lenis) {
          (window as any).__lenis.start();
        }
      };
    }
  }, [isBioOpen]);

  // Touch Swipe Handlers (Directionally consistent: swipe left -> NEXT, swipe right -> PREV)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Minimum horizontal swipe threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const activeLeader = LEADERS[currentIndex];

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="py-18 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 relative overflow-hidden bg-[#2D2926] text-[#FAF8F5] select-none"
    >
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-[#E0B9A0]/10 rounded-full blur-[160px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#AE917E]/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-14">
          <AnimatedBlock delay={0}>
            <div className="flex items-center justify-center gap-4 mb-3 sm:mb-5">
              <span className="w-8 sm:w-12 h-px bg-[#E0B9A0]/50"></span>
              <span className="text-[#E0B9A0] font-display text-[9.5px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase flex items-center gap-2 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_6px_#E0B9A0]" />
                Executive Leadership &bull; 04
              </span>
              <span className="w-8 sm:w-12 h-px bg-[#E0B9A0]/50"></span>
            </div>
          </AnimatedBlock>

          <AnimatedHeading>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-4 sm:mb-6">
              Leadership <span className="text-[#E0B9A0]">At Yanhal</span>
            </h2>
          </AnimatedHeading>

          <AnimatedBlock delay={0.1}>
            <p className="text-sm sm:text-base lg:text-lg text-stone-300 font-light leading-relaxed max-w-2xl mx-auto px-2">
              Driven by vision and executed with precision. Meet the minds steering Yanhal Holdings toward structural excellence and sustainable growth.
            </p>
          </AnimatedBlock>
        </div>

        {/* Master Full-Image Unified Leadership Slider Canvas */}
        <div
          ref={sliderStageRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative w-full h-[720px] sm:h-[760px] lg:h-[760px] rounded-2xl sm:rounded-3xl border border-[#AE917E]/30 bg-[#14110F] shadow-2xl overflow-hidden"
        >
          {/* Visual Wipe Beam Line Indicator */}
          <div
            ref={wipeBeamRef}
            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#E0B9A0] to-transparent shadow-[0_0_16px_#E0B9A0] z-40 pointer-events-none opacity-0"
          />

          {/* Unified Full-Bleed Slides (One per Leader) */}
          {LEADERS.map((leader, idx) => {
            const displayImg = photoView === "cover" ? leader.coverUrl : leader.characterUrl;

            return (
              <div
                key={leader.id}
                ref={(el) => { slideLayersRef.current[idx] = el; }}
                className="portrait-wipe-frame absolute inset-0 w-full h-full overflow-hidden bg-[#14110F]"
                style={{
                  clipPath:
                    "inset(calc(var(--clip-t, 0) * 1%) calc(var(--clip-r, 0) * 1%) calc(var(--clip-b, 0) * 1%) calc(var(--clip-l, 0) * 1%))",
                  zIndex: idx === currentIndex ? 10 : 1,
                  pointerEvents: idx === currentIndex ? "auto" : "none"
                }}
              >
                {/* 1. DOMINANT PHOTOGRAPHIC CANVAS */}
                {/* On desktop: right-side photographic canvas (60% width) preserving natural portrait proportions */}
                {/* On mobile: full-bleed canvas with upper-face focus (object-position: center top / 5%) */}
                <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] h-full overflow-hidden">
                  <img
                    ref={(el) => { portraitImagesRef.current[idx] = el; }}
                    src={displayImg}
                    alt={leader.name}
                    className="w-full h-full object-cover will-change-transform"
                    style={{
                      // Precise natural proportion framing: face and eyes unobstructed and crisp
                      objectPosition: idx === 0 ? "center 8%" : "center top"
                    }}
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  {/* Desktop: subtle atmospheric feathering on the left edge seamlessly blending into background */}
                  <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-[#14110F] via-[#14110F]/70 to-transparent pointer-events-none hidden lg:block" />
                  {/* Mobile/Tablet: vertical upward gradient protecting lower typography while keeping top 42% clear */}
                  <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#14110F] via-[#14110F]/90 to-transparent pointer-events-none lg:hidden" />
                </div>

                {/* Global subtle vignette for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14110F]/95 via-transparent to-black/30 pointer-events-none" />

                {/* Architectural Corner Crop Accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#E0B9A0]/60 z-20 pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#E0B9A0]/60 z-20 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#E0B9A0]/60 z-20 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#E0B9A0]/60 z-20 pointer-events-none" />

                {/* Watermark Slide Number inside photographic canvas */}
                <div className="absolute top-4 right-8 font-display text-[80px] sm:text-[120px] lg:text-[150px] font-bold text-white/[0.04] leading-none pointer-events-none select-none tracking-tighter z-10">
                  0{idx + 1}
                </div>

                {/* 2. INTEGRATED LEADERSHIP INFORMATION OVERLAY */}
                <div
                  ref={(el) => { contentOverlaysRef.current[idx] = el; }}
                  className="relative z-20 w-full lg:w-[54%] h-full flex flex-col justify-end lg:justify-center p-5 sm:p-10 lg:p-14 pb-20 sm:pb-24 lg:pb-20"
                >
                  {/* Eyebrow badge */}
                  <div className="editorial-meta-anim flex items-center gap-2.5 mb-2 sm:mb-3">
                    <span className="px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] tracking-[0.25em] font-mono uppercase bg-[#E0B9A0]/20 text-[#E0B9A0] border border-[#E0B9A0]/40 rounded backdrop-blur-md">
                      0{idx + 1} / 0{LEADERS.length}
                    </span>
                    <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-stone-300 font-semibold drop-shadow">
                      Executive Direction
                    </span>
                  </div>

                  {/* Prominent Split Leader Name */}
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-white uppercase tracking-tight mb-1.5 sm:mb-2 leading-[1.08] drop-shadow-md">
                    {leader.name.split(" ").map((word, wIdx) => (
                      <span key={wIdx} className="inline-block mr-2 sm:mr-4 whitespace-nowrap">
                        {word.split("").map((char, cIdx) => (
                          <span
                            key={cIdx}
                            className="title-char-mask inline-block overflow-hidden align-bottom"
                          >
                            <span className="title-char-inner inline-block will-change-transform">
                              {char}
                            </span>
                          </span>
                        ))}
                      </span>
                    ))}
                  </h3>

                  {/* Leader Position / Title */}
                  <div className="editorial-meta-anim mb-3 sm:mb-5">
                    <p className="text-[#E0B9A0] text-xs sm:text-sm lg:text-base tracking-[0.2em] uppercase font-bold flex items-center gap-2 drop-shadow">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]" />
                      {leader.role}
                    </p>
                  </div>

                  {/* Executive Quote / Leadership Statement */}
                  <div className="editorial-meta-anim relative pl-3 sm:pl-4 border-l-2 border-[#E0B9A0] mb-3 sm:mb-5">
                    <p className="text-stone-200 text-xs sm:text-sm lg:text-base italic font-light leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                      &ldquo;{leader.quote}&rdquo;
                    </p>
                  </div>

                  {/* Areas of Authority Badges */}
                  <div className="editorial-meta-anim mb-4 sm:mb-6">
                    <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-stone-300 font-bold mb-1.5 sm:mb-2 drop-shadow">
                      Core Areas of Authority
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {leader.pillars.map((pillar, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[10px] sm:text-xs text-stone-100 bg-black/60 backdrop-blur-md border border-[#AE917E]/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md tracking-wide shadow"
                        >
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA: Read Biography inside overlay */}
                  <div className="editorial-meta-anim flex items-center gap-3">
                    <button
                      onClick={() => setIsBioOpen(true)}
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#E0B9A0] text-[#2D2926] hover:bg-white transition-all duration-300 text-[11px] sm:text-xs tracking-[0.18em] uppercase font-bold cursor-pointer shadow-lg shadow-[#E0B9A0]/20 active:scale-95"
                    >
                      <span>Read Full Biography</span>
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/15">
                      <button
                        onClick={() => setPhotoView("cover")}
                        className={`px-2.5 py-1 text-[10px] tracking-wider uppercase font-semibold rounded transition-all cursor-pointer ${
                          photoView === "cover"
                            ? "bg-[#E0B9A0] text-[#2D2926]"
                            : "text-stone-300 hover:text-white"
                        }`}
                        title="Studio Portrait"
                      >
                        Studio
                      </button>
                      <button
                        onClick={() => setPhotoView("character")}
                        className={`px-2.5 py-1 text-[10px] tracking-wider uppercase font-semibold rounded transition-all cursor-pointer ${
                          photoView === "character"
                            ? "bg-[#E0B9A0] text-[#2D2926]"
                            : "text-stone-300 hover:text-white"
                        }`}
                        title="Operations Portrait"
                      >
                        Operations
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* INTEGRATED FLOATING CONTROLS BAR (INSIDE THE SLIDER CANVAS) */}
          {/* ============================================================== */}
          <div className="absolute bottom-3.5 sm:bottom-6 left-3.5 sm:left-10 right-3.5 sm:right-10 z-30 flex items-center justify-between pointer-events-auto">
            {/* Quick Leader Switcher Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {LEADERS.map((leader, idx) => (
                <button
                  key={leader.id}
                  onClick={() => {
                    if (idx !== currentIndex) {
                      transitionToLeader(idx, idx > currentIndex ? 1 : -1);
                    }
                  }}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 sm:gap-2 cursor-pointer border backdrop-blur-md ${
                    idx === currentIndex
                      ? "bg-[#E0B9A0] text-[#2D2926] border-[#E0B9A0] font-bold shadow-md shadow-[#E0B9A0]/20"
                      : "bg-black/60 text-stone-300 border-white/15 hover:border-[#E0B9A0]/60 hover:text-white"
                  }`}
                  aria-label={`View leader ${leader.name}`}
                >
                  <span className="font-mono text-[10px]">0{idx + 1}</span>
                  <span className="tracking-wider hidden sm:inline">{leader.name}</span>
                </button>
              ))}
            </div>

            {/* Previous & Next Tactile Controls with Visual Indicator */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden md:inline text-[10px] tracking-[0.2em] uppercase text-stone-300 font-mono drop-shadow">
                [ &larr; &rarr; Keys or Swipe ]
              </span>

              {/* Previous Button */}
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-[#AE917E]/40 text-stone-200 hover:text-[#2D2926] hover:bg-[#E0B9A0] hover:border-[#E0B9A0] transition-all duration-300 cursor-pointer shadow-md active:scale-95 group"
                aria-label="Previous Leader"
                title="Previous Leader (Sweeps Left to Right)"
              >
                <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span className="text-xs uppercase font-bold tracking-wider hidden sm:inline">Prev</span>
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-[#E0B9A0] border border-[#E0B9A0] text-[#2D2926] hover:bg-white hover:border-white transition-all duration-300 cursor-pointer shadow-lg shadow-[#E0B9A0]/20 font-bold active:scale-95 group"
                aria-label="Next Leader"
                title="Next Leader (Sweeps Right to Left)"
              >
                <span className="text-xs uppercase tracking-wider hidden sm:inline">Next</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Quranic Reflection / Striving Quote */}
        <AnimatedBlock delay={0.3}>
          <div className="mt-12 sm:mt-16 text-center">
            <div className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto font-light px-2">
              <TypewriterLoop
                mainText="“And that there is not for man except that [good] for which he strives.”"
                subText="— Surah An-Najm (53:39)"
              />
            </div>
          </div>
        </AnimatedBlock>
      </div>

      {/* Comprehensive Full Bio Modal */}
      <AnimatePresence>
        {isBioOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            style={{ pointerEvents: "auto" }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
              onClick={() => setIsBioOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-5xl bg-[#1E1B18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] my-auto z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsBioOpen(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#E0B9A0] hover:text-[#2D2926] transition-colors border border-white/10 cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              {/* Modal Left Side: Portrait Image */}
              <div className="w-full md:w-2/5 h-56 sm:h-72 md:h-auto relative bg-[#151210] flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B18] via-transparent to-transparent z-10 pointer-events-none"></div>
                <img
                  src={activeLeader.modalImageUrl || activeLeader.coverUrl}
                  alt={activeLeader.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-95"
                  style={{ objectPosition: "center 15%" }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Modal Right Side: Complete Executive Bio Content */}
              <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-10 overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[9px] tracking-[0.25em] font-mono uppercase bg-[#E0B9A0]/15 text-[#E0B9A0] rounded border border-[#E0B9A0]/30">
                    Leader 0{currentIndex + 1}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider mb-1.5 sm:mb-2">
                  {activeLeader.name}
                </h3>
                <p className="text-[#E0B9A0] text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase font-bold mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
                  {activeLeader.role}
                </p>

                <div className="space-y-3.5 sm:space-y-4">
                  {activeLeader.bio.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-xs sm:text-sm md:text-base text-stone-300 font-light leading-relaxed text-left sm:text-justify"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
