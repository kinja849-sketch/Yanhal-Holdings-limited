import { motion } from "motion/react";
import AnimatedHeading from "./AnimatedHeading";
import InfiniteMediaLoop from "./InfiniteMediaLoop";

export default function Testimonials() {
  const testimonials = [
    {
      id: "01",
      quote: "The project was handled with a high level of coordination and attention to detail. From planning to execution, the team ensured that everything was done according to expectations. The progress has been consistent, and communication throughout the process has been clear and professional.",
      author: "Ismail Abdullahi Siyad",
      role: "Supervisor – Muhoho Road",
      status: "Ongoing",
      rating: 5,
      rotate: "-rotate-1"
    },
    {
      id: "02",
      quote: "Working with Yanhal has been a structured and efficient experience. The site has been managed well, and the team maintains good control over both timelines and quality. Their approach makes it easier to keep the project on track.",
      author: "Hani Sheikh",
      role: "Site Manager – Off Muhoho",
      status: "Ongoing",
      rating: 5,
      rotate: "rotate-1",
      translateY: "lg:translate-y-6"
    },
    {
      id: "03",
      quote: "The project was completed as expected, with good finishing and proper execution. The team was reliable and delivered a result that met the requirements without unnecessary delays.",
      author: "Garder & Roble",
      role: "Contractor – Kapiti South B",
      status: "Completed",
      rating: 5,
      rotate: "-rotate-1",
      translateY: "lg:-translate-y-4"
    },
    {
      id: "04",
      quote: "The interior work delivered was clean, modern, and aligned with the intended commercial use. The improvements made a noticeable difference in both appearance and functionality of the space.",
      author: "BBS Mall",
      role: "Interior Design – Eastleigh",
      status: "Completed",
      rating: 5,
      rotate: "rotate-1",
      translateY: "lg:translate-y-4"
    }
  ];

  return (
    <section 
      id="testimonials" 
      className="relative py-18 sm:py-24 lg:py-28 overflow-hidden bg-[#FAF8F5] text-[#2D2926]"
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

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 lg:perspective-[2000px]">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: idx * 0.12 
              }}
              className={`lg:col-span-5 ${t.translateY || ''} ${t.rotate || ''} ${idx % 2 === 0 ? '' : 'sm:translate-z-[20px] lg:translate-z-[40px]'} ${idx === 1 ? 'lg:col-start-7' : ''} ${idx === 2 ? 'lg:col-span-4' : ''} ${idx === 3 ? 'lg:col-span-5 lg:col-start-8' : ''} border border-stone-200 p-6 sm:p-10 lg:p-12 bg-white transition-all duration-700 hover:border-[#AE917E] hover:shadow-2xl rounded-2xl group shadow-md`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1 text-[#E0B9A0]">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`material-symbols-outlined text-[10px] sm:text-sm transition-all duration-500 group-hover:scale-110 ${i < (t.rating || 5) ? 'fill-1' : 'opacity-30'}`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[#2D2926] font-display text-[10px] font-bold">5.0</span>
                </div>
                <div className={`text-[8px] tracking-[0.2em] font-display uppercase px-2.5 py-1 rounded-full border ${t.status === 'Ongoing' ? 'text-[#2D2926] border-stone-300 bg-[#E0B9A0]/30 font-bold' : 'text-white border-[#2D2926] bg-[#2D2926] font-bold'}`}>
                  {t.status}
                </div>
              </div>
              <blockquote className="text-base sm:text-lg lg:text-xl font-normal italic leading-relaxed mb-6 sm:mb-10 text-[#2D2926]">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-stone-100">
                <div>
                  <p className="font-display text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-1 text-[#2D2926] leading-none font-bold">{t.author}</p>
                  <p className="text-stone-500 text-[8px] sm:text-[9px] uppercase tracking-widest leading-none font-medium">{t.role}</p>
                </div>
                <span className="text-[#AE917E] font-display text-[10px] sm:text-xs font-bold">{t.id}</span>
              </div>
            </motion.div>
          ))}
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
