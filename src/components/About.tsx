import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import AnimatedBlock from "./AnimatedBlock";
import { ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Counter = ({ target, duration, suffix }: { target: number; duration: number, suffix: string }) => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <motion.span
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true, amount: 0.2 }}
    >
      {count}{suffix}
    </motion.span>
  );
};

export default function About() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { label: "Projects Delivered", value: 25, suffix: "+", duration: 2.2, color: "text-[#E0B9A0]" },
    { label: "Years of Experience", value: 3, suffix: "+", duration: 1.5, color: "text-[#FAF8F5]" },
    { label: "Clients Served", value: 15, suffix: "+", duration: 1.8, color: "text-[#AE917E]" },
    { label: "KES Project Value Managed", value: 10, suffix: "M+", duration: 2.0, color: "text-[#E0B9A0]" },
  ];

  const fullContent = [
    {
      title: "Our Purpose",
      text: "Yanhal Holdings Ltd exists to bridge the gap between design ideas and real-world execution by providing clients with structured, reliable, and results-driven construction services. At its core, the company is built around the idea that every space has a purpose, and that purpose should be reflected in how it is designed, built, and used."
    },
    {
      title: "Practical Execution",
      text: "Whether working on a new construction project, transforming an existing interior, or upgrading a commercial space, the focus remains on creating environments that are not only visually presentable but also efficient, durable, and aligned with the client’s actual needs. We prioritize practical implementation that can be delivered within real-world constraints such as budget, materials, and location."
    },
    {
      title: "Hands-On Management",
      text: "The company operates with a hands-on approach, meaning every project is actively managed from the initial consultation stage through to final completion. This includes understanding the client’s vision, assessing the site conditions, planning the structure or design, and ensuring that execution follows a clear and structured process."
    },
    {
      title: "Transparency & Communication",
      text: "Yanhal Holdings places strong emphasis on communication and transparency throughout the project lifecycle. Clients are kept informed at key stages of development so that expectations remain aligned and decisions are made with clarity. This reduces uncertainty and ensures that each project progresses in a controlled and predictable manner."
    },
    {
      title: "Service Excellence",
      text: "Our work covers a range of services including construction of small to medium-scale structures, interior design and finishing, renovation of existing spaces, and custom commercial setups such as kiosks and retail environments. Each service is approached with the same level of care, focusing on functionality, structural integrity, and long-term usability."
    }
  ];

  return (
    <section 
      id="about" 
      className="flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-18 sm:py-24 lg:py-28 relative overflow-hidden bg-[#2D2926] text-[#FAF8F5]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-8 sm:space-y-12"
        >
          <div>
            <span className="text-[#E0B9A0] font-display text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase block mb-3 sm:mb-6 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]" />
              Established Expertise &bull; 03
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.08] text-[#FAF8F5] uppercase tracking-tight">
              ABOUT <br/>
              <span className="text-[#E0B9A0] font-medium">YANHAL</span> <br/>
              HOLDINGS
            </h2>
          </div>
          <div className="max-w-xl space-y-5 sm:space-y-8">
            <AnimatedBlock delay={0.1} index={0}>
              <p className="text-base sm:text-lg lg:text-xl text-[#FAF8F5] font-normal leading-relaxed">
                Yanhal Holdings Ltd is a construction and interior architecture firm based in Nairobi, Kenya, focused on delivering practical, functional, and well-executed building solutions.
              </p>
            </AnimatedBlock>
            <AnimatedBlock delay={0.1} index={1}>
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                We bridge the gap between design ideas and real-world execution, providing structured, reliable, and results-driven services for residential, commercial, and custom development projects.
              </p>
            </AnimatedBlock>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-3 sm:gap-4 text-[#E0B9A0] font-display text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <span>Explore Our Story</span>
              <span className="w-8 sm:w-12 h-px bg-[#E0B9A0]/60 group-hover:w-16 group-hover:bg-[#E0B9A0] transition-all"></span>
            </button>
          </div>
          <div className="space-y-8 sm:space-y-10 pt-8 sm:pt-10 border-t border-white/15">
            <div className="grid grid-cols-2 gap-y-8 sm:gap-y-12 gap-x-4 sm:gap-x-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="group bg-[#1E1B18] border border-[#AE917E]/30 p-4 sm:p-5 rounded-xl shadow-lg hover:border-[#E0B9A0]/70 transition-all">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[#E0B9A0] mb-1 sm:mb-2 tracking-tighter">
                    <Counter target={stat.value} duration={stat.duration} suffix={stat.suffix} />
                  </div>
                  <div className="text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-stone-300 font-semibold leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-[#1E1B18] border-l-4 border-[#E0B9A0] rounded-xl shadow-lg">
              <ShieldCheckIcon className="w-5 h-5 text-[#E0B9A0] stroke-[1.5] shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-stone-200 font-normal leading-relaxed italic">
                Actively engaged in large-scale residential developments, including overseeing high-value apartment projects with construction costs exceeding <span className="text-[#E0B9A0] font-bold">100M KES.</span>
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mt-8 lg:mt-0"
        >
          <div className="absolute -inset-4 border border-[#AE917E]/40 translate-x-4 sm:translate-x-6 translate-y-4 sm:translate-y-6 -z-10 hidden sm:block rounded-2xl"></div>
          <div className="overflow-hidden bg-[#1E1B18] aspect-[4/5] relative group shadow-2xl rounded-2xl border border-white/20">
            <img 
              alt="Professional Architectural Project" 
              className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTqcc2ApLv-RX_qf9lurkf5yjntaZ9f_sP_ZtsvpH_TM-SPqwqFAa3sus9i-Ppj7AQODDKc1hg_KsIAfwH0Ztra0-X-GntWQHHnyw4WGPwgNcurptufRqWun_FzrgLMA2NZOhCxirdhBGx2w0zmEaNB0lOJ_y7-5ybIGKusyv6cIhdYuf8OLRyr92vZayE-CkevcBn66MP73wBx__-vY5UCwautMiOzls53qHN29lF-2s_CGdF0x4CdvioGAtw8786G_nt_dXbzeQ" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-70"></div>
            <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10">
              <div className="flex items-center gap-3 sm:gap-5 bg-[#1E1B18]/90 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-[#AE917E]/30 shadow-xl">
                <img 
                  src="/logo.png" 
                  alt="Yanhal Logo" 
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                />
                <div>
                  <p className="text-[#FAF8F5] font-display text-[8.5px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.4em] mb-1 font-bold">DESIGN STUDIO</p>
                  <p className="text-[#E0B9A0] text-[7.5px] sm:text-[10px] uppercase font-bold tracking-widest">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="bg-surface-dark border border-white/10 w-full max-w-4xl max-h-[88vh] overflow-y-auto relative z-10 custom-scrollbar rounded-xs"
            >
              <div className="sticky top-0 z-20 flex justify-end p-4 sm:p-6 bg-surface-dark/90 backdrop-blur-md border-b border-white/5">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/10 text-white hover:bg-bronze hover:text-black transition-all group rounded-xs cursor-pointer"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 stroke-[1.5] group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-5 sm:p-10 md:p-16 pt-4 sm:pt-6">
                <div className="mb-10 sm:mb-16">
                  <span className="text-[#E0B9A0] font-display text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.6em] uppercase block mb-3 sm:mb-6">In-Depth Philosophy</span>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white uppercase tracking-tighter leading-tight">
                    The Yanhal <br/> <span className="text-[#E0B9A0] italic">Identity</span>
                  </h2>
                </div>

                <div className="space-y-10 sm:space-y-16">
                  {fullContent.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 sm:gap-8 border-t border-white/5 pt-8 sm:pt-12">
                      <h4 className="text-[#E0B9A0] font-display text-[9.5px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase pt-1">
                        {item.title}
                      </h4>
                      <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-white/10 text-center">
                  <p className="text-stone-400 text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.5em] mb-6 sm:mb-8">Ready to build your masterpiece?</p>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#E0B9A0] text-[#2D2926] px-8 sm:px-12 py-4 sm:py-5 font-display text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase hover:bg-white transition-all cursor-pointer w-full sm:w-auto rounded-full"
                  >
                    Start Your Estimate
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
