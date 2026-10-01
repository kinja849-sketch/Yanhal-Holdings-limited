import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import AnimatedHeading from "./AnimatedHeading";
import InfiniteMediaLoop from "./InfiniteMediaLoop";

export default function Testimonials() {
  const containerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      id: "01",
      quote: "The project was handled with a high level of coordination and attention to detail. From planning to execution, the team ensured that everything was done according to expectations. The progress has been consistent, and communication throughout the process has been clear and professional.",
      author: "Ismail Abdullahi Siyad",
      role: "Supervisor – Muhoho Road",
      status: "Ongoing",
      rating: 5,
    },
    {
      id: "02",
      quote: "Working with Yanhal has been a structured and efficient experience. The site has been managed well, and the team maintains good control over both timelines and quality. Their approach makes it easier to keep the project on track.",
      author: "Hani Sheikh",
      role: "Site Manager – Off Muhoho",
      status: "Ongoing",
      rating: 5,
    },
    {
      id: "03",
      quote: "The project was completed as expected, with good finishing and proper execution. The team was reliable and delivered a result that met the requirements without unnecessary delays.",
      author: "Garder & Roble",
      role: "Contractor – Kapiti South B",
      status: "Completed",
      rating: 5,
    },
    {
      id: "04",
      quote: "The interior work delivered was clean, modern, and aligned with the intended commercial use. The improvements made a noticeable difference in both appearance and functionality of the space.",
      author: "BBS Mall",
      role: "Interior Design – Eastleigh",
      status: "Completed",
      rating: 5,
    }
  ];

  // Distinct, solid, high-contrast colours drawn from Yanhal Transition and brand architectural palette
  const cardThemes = [
    {
      // Card 01: Dark Charcoal
      name: "Dark Charcoal",
      bg: "#1F1D1B",
      text: "text-[#FAF8F5]",
      quote: "text-[#FAF8F5]",
      role: "text-[#A8A29E]",
      author: "text-[#FAF8F5]",
      id: "text-[#E0B9A0]",
      stars: "text-[#E0B9A0]",
      border: "border-white/10",
      divider: "border-white/10",
      badge: "text-[#E0B9A0] border-[#E0B9A0]/30 bg-[#E0B9A0]/15 font-bold",
      ratingNum: "text-[#FAF8F5]",
    },
    {
      // Card 02: Warm Sandstone
      name: "Warm Sandstone",
      bg: "#BFA78F",
      text: "text-[#221D1A]",
      quote: "text-[#221D1A]",
      role: "text-[#54483E]",
      author: "text-[#221D1A]",
      id: "text-[#783E1D]",
      stars: "text-[#783E1D]",
      border: "border-[#967F6A]/50",
      divider: "border-[#967F6A]/30",
      badge: "text-[#221D1A] border-[#221D1A]/30 bg-[#221D1A]/10 font-bold",
      ratingNum: "text-[#221D1A]",
    },
    {
      // Card 03: Deep Espresso
      name: "Deep Espresso",
      bg: "#2A201A",
      text: "text-[#FAF8F5]",
      quote: "text-[#FAF8F5]",
      role: "text-[#A8A29E]",
      author: "text-[#FAF8F5]",
      id: "text-[#E0B9A0]",
      stars: "text-[#E0B9A0]",
      border: "border-white/10",
      divider: "border-white/10",
      badge: "text-white border-white/20 bg-white/10 font-bold",
      ratingNum: "text-[#FAF8F5]",
    },
    {
      // Card 04: Muted Terracotta
      name: "Muted Terracotta",
      bg: "#8F4432",
      text: "text-[#FAF8F5]",
      quote: "text-[#FAF8F5]",
      role: "text-[#F3D8D0]",
      author: "text-[#FAF8F5]",
      id: "text-[#FFD2C0]",
      stars: "text-[#FFD2C0]",
      border: "border-white/15",
      divider: "border-white/15",
      badge: "text-white border-white/25 bg-black/20 font-bold",
      ratingNum: "text-[#FAF8F5]",
    },
  ];

  // Exact reference stacked card timing and scale progression driven by ScrollTrigger
  useGSAP(
    () => {
      const cardsWrappers = gsap.utils.toArray<HTMLElement>(".card-wrapper");
      const cards = gsap.utils.toArray<HTMLElement>(".card");

      cardsWrappers.forEach((wrapper, i) => {
        const card = cards[i];
        if (!card) return;

        let scale = 1;
        let rotation = 0;
        if (i !== cards.length - 1) {
          scale = 0.9 + 0.025 * i;
          rotation = -10;
        }

        gsap.to(card, {
          scale: scale,
          rotationX: rotation,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top " + (60 + 10 * i),
            end: "bottom 550",
            endTrigger: wrapperRef.current || ".wrapper",
            scrub: true,
            pin: wrapper,
            pinSpacing: false,
            pinType: "transform",
            id: `testimonial-card-${i + 1}`,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section 
      ref={containerRef}
      id="testimonials" 
      className="relative py-18 sm:py-24 lg:py-28 bg-[#FAF8F5] text-[#2D2926]"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-4 leading-none">
              <div className="h-[2px] w-8 sm:w-12 bg-[#AE917E]"></div>
              <span className="text-[#AE917E] font-mono text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-bold">
                Testimonials &bull; 10
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#2D2926] text-white px-3.5 py-1.5 rounded-full self-start sm:self-auto shadow-sm">
              <div className="flex text-[#E0B9A0]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[11px] fill-1">star</span>
                ))}
              </div>
              <span className="text-[#FAF8F5] font-display text-[9px] font-bold">5.0 AVERAGE RATING</span>
            </div>
          </div>
          <div className="flex flex-col gap-0 mb-6 sm:mb-8">
            <AnimatedHeading delay={0.1}>
              <h1 className="font-display text-2xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.2] sm:leading-[1.1] max-w-5xl text-[#2D2926] uppercase m-0">
                Redefining <span className="text-[#AE917E] italic">Modern</span> Spaces Through
              </h1>
            </AnimatedHeading>
            <AnimatedHeading delay={0.2}>
              <h1 className="font-display text-2xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.2] sm:leading-[1.1] max-w-5xl text-[#2D2926] uppercase m-0">
                Real Client Experiences
              </h1>
            </AnimatedHeading>
          </div>
          <p className="text-stone-700 max-w-2xl text-sm sm:text-lg font-normal leading-relaxed">
            We work closely with clients across construction, interior design, and project supervision to deliver spaces that are practical, well-executed, and aligned with their intended purpose. The feedback we receive reflects our commitment to quality, reliability, and attention to detail in every project we handle.
          </p>
        </div>

        {/* Stacked Cards Wrapper with pin containers */}
        <div 
          ref={wrapperRef} 
          className="wrapper relative w-full pt-4 sm:pt-8 pb-32 sm:pb-44"
        >
          <div className="cards w-full max-w-[750px] md:w-[80%] lg:w-[70%] mx-auto px-4 sm:px-6 lg:px-8">
            {testimonials.map((t, idx) => {
              const theme = cardThemes[idx];
              return (
                <div 
                  key={t.id}
                  className="card-wrapper w-full mb-[50px] last:mb-0"
                  style={{ perspective: "500px", zIndex: idx + 1 }}
                >
                  <div 
                    className={`card card-${idx + 1} w-full min-h-[360px] sm:min-h-[390px] lg:min-h-[410px] flex flex-col justify-between p-6 sm:p-10 lg:p-12 rounded-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] border ${theme.border}`}
                    style={{
                      backgroundColor: theme.bg,
                      transformOrigin: "top center",
                      willChange: "transform",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                      <div className="flex items-center gap-2">
                        <div className={`flex space-x-1 ${theme.stars}`}>
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`material-symbols-outlined text-[10px] sm:text-sm ${i < (t.rating || 5) ? 'fill-1' : 'opacity-30'}`}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className={`font-display text-[10px] font-bold ${theme.ratingNum}`}>5.0</span>
                      </div>
                      <div className={`text-[8px] tracking-[0.2em] font-display uppercase px-2.5 py-1 rounded-full border ${theme.badge}`}>
                        {t.status}
                      </div>
                    </div>
                    <blockquote className={`text-base sm:text-lg lg:text-xl font-normal italic leading-relaxed mb-6 sm:mb-10 ${theme.quote}`}>
                      "{t.quote}"
                    </blockquote>
                    <div className={`flex items-center justify-between pt-5 sm:pt-6 border-t ${theme.divider}`}>
                      <div>
                        <p className={`font-display text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-1 leading-none font-bold ${theme.author}`}>
                          {t.author}
                        </p>
                        <p className={`text-[8px] sm:text-[9px] uppercase tracking-widest leading-none font-medium ${theme.role}`}>
                          {t.role}
                        </p>
                      </div>
                      <span className={`font-display text-[10px] sm:text-xs font-bold ${theme.id}`}>
                        {t.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-stone-200 overflow-hidden">
          <p className="text-center font-display text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.5em] uppercase text-stone-500 mb-8 sm:mb-12 font-bold">Partners in Excellence</p>
          
          <div 
            className="w-full overflow-hidden select-none flex bg-transparent"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            <style>{`
              @keyframes scroll-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-content {
                display: flex;
                flex-direction: row;
                white-space: nowrap;
                animation: scroll-left 25s linear infinite;
              }
              .marquee-wrapper:hover .marquee-content {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .marquee-content {
                  animation: none !important;
                }
              }
            `}</style>
            
            <div className="marquee-wrapper w-full">
              <div className="marquee-content w-max">
                {/* First Set */}
                {[...Array(4)].map((_, idx) => (
                  <div key={`set1-${idx}`} className="text-[clamp(2.5rem,8vw,5.5rem)] font-display font-black text-[#2D2926]/15 hover:text-[#AE917E] uppercase px-[3vw] flex items-center tracking-tighter transition-colors duration-500 cursor-default leading-none">
                    Yanhal Holding Limited
                  </div>
                ))}
                {/* Cloned Set for Seamless Loop */}
                {[...Array(4)].map((_, idx) => (
                  <div key={`set2-${idx}`} className="text-[clamp(2.5rem,8vw,5.5rem)] font-display font-black text-[#2D2926]/15 hover:text-[#AE917E] uppercase px-[3vw] flex items-center tracking-tighter transition-colors duration-500 cursor-default leading-none">
                    Yanhal Holding Limited
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* The infinite left-to-right media loop goes right below the marquee */}
        <InfiniteMediaLoop />
      </div>
    </section>
  );
}
