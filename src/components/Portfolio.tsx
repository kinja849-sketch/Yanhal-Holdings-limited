import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import RestorationSlider from "./RestorationSlider";


interface Project {
  title: string;
  location: string;
  description: string;
  details: string;
  keyPoints: string[];
  result: string;
  image: string;
}

export default function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isRestorationModalOpen, setIsRestorationModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const restorationContent = [
    "THE ART OF REBIRTH THROUGH PURPOSEFUL RENOVATION",
    "At Yanhal Holdings Ltd, transformation is not just about changing how a space looks—it is about restoring its purpose, improving its functionality, and extending its value. Many spaces lose efficiency over time due to outdated layouts, worn materials, or changing needs. Our role is to identify these limitations and turn them into opportunities for improvement.",
    "Every renovation project begins with a careful assessment of the existing structure. We look at what is no longer working—whether it is poor space utilization, outdated finishes, or structural wear—and develop a practical plan to upgrade the space without unnecessary reconstruction. This allows clients to achieve meaningful improvements while maintaining cost efficiency.",
    "Our approach focuses on refining what already exists rather than replacing it entirely. By reworking layouts, upgrading finishes, and improving structural elements where necessary, we are able to create spaces that feel renewed, more efficient, and better aligned with modern use.",
    "The transformation process is guided by three key priorities:",
    "Restoration of Functionality: Ensuring the space works better for its intended purpose through improved layout and usability",
    "Modernization of Finishes: Replacing outdated materials with cleaner, more durable, and visually consistent alternatives",
    "Value Enhancement: Increasing the overall usability and long-term worth of the property without unnecessary rebuilding",
    "Through this process, spaces are not just renovated—they are repositioned to serve their purpose more effectively, offering clients a renewed environment that is practical, efficient, and ready for continued use."
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const projects: Project[] = [
    {
      title: "Modern Retail Kiosk Development",
      location: "Commercial Project",
      description: "Design and construction of a compact retail kiosk optimized for high-traffic commercial use and efficient workflow.",
      details: "This project involved the design and construction of a compact retail kiosk intended for high-traffic commercial use. The initial structure lacked visual appeal and was not optimized for customer interaction or efficient workflow. The objective was to transform it into a functional and attractive business space that could support daily operations while drawing customer attention.\n\nThe approach focused on maximizing limited space while ensuring durability and ease of use. The layout was carefully structured to allow smooth movement within the kiosk, while the exterior was designed to create a strong visual presence. Finishing materials were selected based on both appearance and long-term usability, ensuring that the kiosk could withstand continuous use.",
      keyPoints: [
        "Redesigning the internal layout to improve workflow efficiency",
        "Upgrading exterior finishing to enhance visibility and branding",
        "Using durable materials suitable for daily commercial activity",
        "Ensuring the structure was compact yet fully functional"
      ],
      result: "The final result was a modern, well-structured kiosk that not only improved operational efficiency but also created a more professional and inviting presence for customers.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaeFV-7KNBpps2-ELWn3KUvW7uFq7zlkDp2UR0JZ1fotpCQU5pnDn51g6xWJCASKsABXVdbItcamjtlpJaMebg9sd8IEPSsrfP92GrTOBvZOR553mIksZmLejdjmfFWkpqU6xwePrx5INhavcV6sWU1daQ_R4vURLD7D4hEfT2TNCbkKL5yXQ8JxRWqKw8jlo7IUVVUllNt8CC-aZDdbIVpKxAyF3AunTl4FrSrzw8Mu0X7KxdjKAejvlprI84Sh69_HrPajLNS8"
    },
    {
      title: "Interior Space Transformation",
      location: "Commercial Use",
      description: "Upgrading an outdated commercial interior to improve functionality, organization, and visual appeal for better customer retention.",
      details: "This project focused on upgrading an existing commercial interior that was outdated and underutilized. The space did not effectively support business operations and lacked the visual appeal needed to attract and retain customers.\n\nThe goal was to redesign the space to make it more functional, organized, and visually modern. This involved rethinking the layout, improving lighting, and applying updated finishes that aligned with current design standards.\n\nA major part of the transformation was ensuring that the space was not just visually improved, but also practical for everyday use. Movement within the space was optimized, and key functional areas were clearly defined to support business activities.",
      keyPoints: [
        "Reorganizing the layout to improve usability and flow",
        "Enhancing lighting to create a brighter and more welcoming environment",
        "Applying modern finishes to walls, floors, and ceilings",
        "Creating a cleaner and more professional overall appearance"
      ],
      result: "The completed space became more efficient for operations and significantly more appealing to customers, directly improving its usability and value.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyhLfJI6qcVsd547X9vsbARSrm5GpwUKhF1HoFXKBBL9kGpzmc7HstQP6ak-NEl0EiBxou5nIkozYkc69mjhRrHNQqpt2wXTgn2GEaofQLgJzWUHMWaftvsLI1iM4nsMtqS_SDB_IlDqVuRRvxRw86jBhuoZNwqftw_526fbrIl6pL2TgzpMCeya4hcS6dJVY5sgsBz-YkI6jIxAyweo84J_rdvcfjE2OF69UVBk5pKFk1M9xbZazpWqXms6QDsi1_61fxmjOOMMw"
    },
    {
      title: "Residential Interior Upgrade",
      location: "Residential Project",
      description: "Modernizing a residential interior with a focus on better space utilization, refined finishes, and overall comfort.",
      details: "This project involved improving a residential interior that required modernization and better space utilization. The existing setup was functional but lacked cohesion, comfort, and a refined finish.\n\nThe approach taken was to enhance both the aesthetic and practical aspects of the space. This included updating surfaces, improving layout balance, and ensuring that each area served its intended purpose more effectively.\n\nAttention was given to details such as finishing quality, color consistency, and spatial organization. The goal was to create a space that felt complete, comfortable, and visually aligned.",
      keyPoints: [
        "Updating interior finishes for a cleaner and more modern look",
        "Improving spatial arrangement for better functionality",
        "Enhancing overall comfort and livability",
        "Ensuring consistency in design across the space"
      ],
      result: "The result was a well-balanced residential interior that felt more organized, modern, and suitable for everyday living.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfwlau3HJ5dxfSxI6IMFl_i59YPCeUTuNOmUEb3Y14OeQemBQqkZAKks3SVhgITJxGuAWP_elxuY4lMB0i5-_qcGAuQWEUQNR_lHuuERE6aDo4Al0TfsSp7vOBVOKg2voPtQWM08Ib4zEu6b_ZQtj4mxpy7potvRYXktCnF1U9f5dxJmX23To6GqYjO6TDFVs3glb1Jb991qYt01-aPkCvExQF6mHLJB2qAgbcf8YAQJwcOjLEA4HXOPxwh3XtbinxFi9suCwPc_E"
    },
    {
      title: "Renovation & Structural Improvement",
      location: "Structural Project",
      description: "Strategically restoring and upgrading an existing structure to improve functionality and extend its usability.",
      details: "This project involved the renovation of an existing structure that had begun to show signs of wear and inefficiency. The objective was to restore the space while also improving its functionality and extending its usability.\n\nRather than rebuilding entirely, the focus was on identifying weak points and upgrading them strategically. This included repairing structural elements, replacing outdated materials, and improving the overall layout where necessary.\n\nThe challenge was to work within the existing structure while achieving a noticeable transformation. This required careful planning and execution to ensure that improvements were both effective and cost-efficient.",
      keyPoints: [
        "Assessing and addressing structural weaknesses",
        "Replacing worn-out materials with more durable alternatives",
        "Improving layout functionality without major reconstruction",
        "Enhancing the overall appearance of the space"
      ],
      result: "The final outcome was a renewed structure that was safer, more functional, and visually improved, without the need for complete redevelopment.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU5rrJrv0XSO0txUIddgRLI4hOVJqCIxPZDcr32giPrLr3EoRik0_-YfPdnc_KtgpzJJm-_45B588EmCsQfjwNwaKxT4PysG9Of6wAyO-byQ3Xn48JvYeevNUaKaK3FY8K-kEftEFLykf5-RLZ0uvao4s9GOUtehJnukMTc-hy-VsI2ob7M114D4l_LsJ5zllEmHvTse1DkBNqRiWe7j7eK-Wj_K6o0gADqR25ghBDDp_8_HZNwJmgTJt0f7a3Rl_AgfdIFSfp3OE"
    },
    {
      title: "Custom Business Setup",
      location: "Small Commercial Space",
      description: "Creating a tailored, practical, and visually presentable business environment for small-scale commercial operations.",
      details: "This project focused on creating a tailored business environment for a small-scale commercial operation. The client required a space that was practical, visually presentable, and aligned with their business needs.\n\nThe design process centered around understanding how the business operates on a daily basis. This allowed for the creation of a layout that supported workflow efficiency while also maintaining a professional appearance.\n\nConstruction and finishing were handled with attention to both durability and presentation, ensuring that the space could handle regular use while still appealing to customers.",
      keyPoints: [
        "Custom layout tailored to business operations",
        "Efficient use of limited space",
        "Durable construction suitable for daily use",
        "Clean and professional finishing"
      ],
      result: "The completed setup provided the client with a ready-to-use business space that supported both functionality and customer engagement.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4WjWo8QINsAcQrYNWldg-_yGtyRXcaY9GxuqfxqqJUNjJKGVKJK9k6BzdvAdOzlrFc0qGytCm7nFfkPVpw2UlXE0TD5jpBgQTsdfZnze6HPKR-F_LIJU5GB6vFn6scCUpiJeERFbPfixe-j6ROpmSAdI1CdlLIAY80wEX0mhEBON0ym3N7POBq2yiTBXEz4MzKsTFVLNow8pdkmwATpc0EgppXhpFChCjd0QtqA3nJNn-BlEaoP5KLBdor2BL9MWporxSU7Evb2s"
    }
  ];

  return (
    <>
    <section 
      id="portfolio" 
      className="py-18 sm:py-24 lg:py-28 overflow-hidden bg-[#2D2926] text-[#FAF8F5] relative"
    >
      <div className="px-6 sm:px-10 mb-10 sm:mb-14 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8">
        <div>
          <span className="text-[#E0B9A0] font-display text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 block uppercase leading-none flex items-center gap-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_6px_#E0B9A0]" />
            The Portfolio &bull; 09
          </span>
          <h3 className="font-display text-3xl sm:text-4xl text-white tracking-tighter uppercase leading-none font-bold">
            Project <span className="text-[#E0B9A0] font-medium">Showcase</span>
          </h3>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => scroll('left')}
            className="flex-1 sm:w-12 sm:h-12 py-3 sm:py-0 border border-white/20 rounded-full flex items-center justify-center hover:border-[#E0B9A0] hover:text-[#E0B9A0] hover:bg-white/5 transition-all active:scale-95 cursor-pointer text-white"
            aria-label="Scroll left"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="flex-1 sm:w-12 sm:h-12 py-3 sm:py-0 border border-white/20 rounded-full flex items-center justify-center hover:border-[#E0B9A0] hover:text-[#E0B9A0] hover:bg-white/5 transition-all active:scale-95 cursor-pointer text-white"
            aria-label="Scroll right"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar gap-6 sm:gap-8 px-6 sm:px-10 pb-8 snap-x snap-mandatory"
      >
        {projects.map((project, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedProject(project)}
            className="snap-center min-w-[85vw] sm:min-w-[55vw] lg:min-w-[38vw] xl:min-w-[420px] group relative h-[420px] sm:h-[480px] lg:h-[520px] border border-white/10 transition-all duration-500 hover:border-[#E0B9A0]/70 hover:shadow-[0_0_30px_rgba(224,185,160,0.15)] overflow-hidden cursor-pointer rounded-xl bg-[#1E1B18]"
          >
            <img 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              src={project.image}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-12 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
              <div className="max-w-md">
                <span className="text-[#E0B9A0] font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-2 sm:mb-3 block font-semibold">{project.location}</span>
                <h4 className="text-white font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-tight">{project.title}</h4>
                <p className="text-stone-300 text-[10px] sm:text-[11px] mt-2 sm:mt-4 max-w-xs uppercase tracking-widest leading-relaxed hidden sm:block">{project.description}</p>
              </div>
              <button className="w-10 h-10 sm:w-13 md:w-14 sm:h-13 md:h-14 rounded-full border border-[#E0B9A0]/40 bg-[#E0B9A0]/10 flex items-center justify-center group-hover:bg-[#E0B9A0] group-hover:text-[#2D2926] transition-all duration-500 shrink-0 self-end sm:self-auto shadow-[0_0_15px_rgba(224,185,160,0.15)]">
                <span className="material-symbols-outlined text-[#E0B9A0] group-hover:text-[#2D2926] text-lg sm:text-xl">arrow_outward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-10 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
              className="bg-surface-dark w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-0 sm:border sm:border-white/10 relative no-scrollbar"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 text-white/50 hover:text-primary transition-colors bg-black/40 sm:bg-transparent p-2 rounded-full"
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">close</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-60 sm:h-[380px] lg:h-full min-h-[240px] relative">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover grayscale-[0.5]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface-dark to-transparent lg:hidden"></div>
                </div>
                
                <div className="p-6 sm:p-10 md:p-12 space-y-6 sm:space-y-10">
                  <div>
                    <div className="flex items-center gap-4 mb-4 sm:mb-6">
                      <span className="text-primary font-display text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase leading-none">{selectedProject.location}</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-display font-bold text-white uppercase tracking-tighter mb-6 sm:mb-8 leading-tight">
                      {selectedProject.title}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed font-light whitespace-pre-line">
                      {selectedProject.details}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-primary font-display text-[9px] sm:text-[10px] tracking-[0.3em] uppercase border-b border-primary/20 pb-2">Key Highlights</h4>
                    <ul className="space-y-3">
                      {selectedProject.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-400">
                          <span className="text-primary mt-1 text-[8px]">●</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 p-6 sm:p-8 border-l-2 border-[#E0B9A0] rounded-lg">
                    <h4 className="text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2">Final Result</h4>
                    <p className="text-stone-300 text-xs sm:text-sm italic">"{selectedProject.result}"</p>
                  </div>

                  <div className="pt-4 pb-8 sm:pb-0 flex justify-center sm:justify-start">
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="w-auto inline-flex items-center justify-center px-8 py-3 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase border border-[#E0B9A0] bg-[#E0B9A0] text-[#2D2926] hover:bg-white transition-colors active:scale-95 shadow-lg cursor-pointer"
                    >
                      Close Showcase
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restoration Detail Modal */}
      <AnimatePresence>
        {isRestorationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-10 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
              className="bg-[#1E1B18] w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-0 sm:border sm:border-white/10 relative no-scrollbar p-6 sm:p-12 md:p-16 rounded-2xl"
            >
              <button 
                onClick={() => setIsRestorationModalOpen(false)}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 text-white/50 hover:text-primary transition-colors bg-black/40 sm:bg-transparent p-2 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">close</span>
              </button>

              <div className="space-y-10 sm:space-y-12">
                <div>
                  <span className="text-[#E0B9A0] font-display text-[10px] tracking-[0.5em] mb-4 block uppercase leading-none font-bold">The Manifesto</span>
                  <h2 className="text-3xl sm:text-5xl font-display font-bold text-white uppercase tracking-tighter leading-tight">
                    The Art of <br/><span className="text-[#E0B9A0] italic">Rebirth</span>
                  </h2>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {restorationContent.map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className={`text-stone-300 leading-relaxed font-light ${
                        idx === 0 ? "text-lg sm:text-xl font-medium text-white border-l-2 border-[#E0B9A0] pl-4 sm:pl-6 py-2" : "text-sm sm:text-base"
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/10 pb-8 sm:pb-0">
                  <button 
                    onClick={() => setIsRestorationModalOpen(false)}
                    className="bg-[#E0B9A0] text-[#2D2926] px-12 py-4 font-display text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all w-full rounded-full cursor-pointer"
                  >
                    Close Manifesto
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
    {/* Restoration slider: full-width, outside the portfolio section */}
    <RestorationSlider />
    </>
  );
}
