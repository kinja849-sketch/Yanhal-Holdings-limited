import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import AnimatedBlock from "./AnimatedBlock";
import { 
  BuildingOffice2Icon, 
  SparklesIcon, 
  ArrowPathIcon, 
  BuildingStorefrontIcon,
  XMarkIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

interface ServiceDetail {
  id: string;
  title: string;
  cardSummary: string;
  overview: string;
  scope: string[];
  clients: string[];
  process: string[];
  outcome: string;
  icon: typeof BuildingOffice2Icon;
  colorClass: {
    accentText: string;
    border: string;
  };
  image: string;
}

const services: ServiceDetail[] = [
  {
    id: "01",
    title: "Construction Services",
    cardSummary: "Full-scope residential & commercial construction. Site management, labour & material coordination, transparent progress tracking. Ready-to-use structures delivered on agreed timelines.",
    overview: "When you choose Yanhal Holdings for construction, you are working with a team that manages the building process from initial planning to final completion. This service is designed for clients who want to develop residential or commercial structures without dealing with the complexity of coordinating multiple parties.\n\nWe handle the full scope of construction, starting with understanding your project requirements, reviewing your site, and aligning on the type of structure you want to build. This includes small to medium-scale projects such as residential units, rental spaces, retail shops, and standalone commercial buildings.\n\nFrom the beginning, we focus on proper planning and execution, ensuring that the structure is not only visually acceptable but also structurally sound and practical for long-term use. We coordinate the workflow on-site, manage labor, and ensure that materials are used efficiently to avoid unnecessary costs.\n\nThroughout the project, you are kept informed of progress, key milestones, and any necessary adjustments. Our goal is to make the construction process predictable, transparent, and manageable for you.",
    scope: [
      "Full scope construction management",
      "Residential or commercial structures",
      "Small to medium-scale projects",
      "Rental spaces and retail shops",
      "Standalone commercial buildings"
    ],
    clients: [
      "Residential developers",
      "Commercial property owners",
      "Rental space investors",
      "Business owners"
    ],
    process: [
      "Project Requirement Alignment",
      "Site Review & Planning",
      "Workflow Coordination",
      "Labor & Material Management",
      "Progress & Milestone Tracking"
    ],
    outcome: "By the end of the project, you receive a completed structure that is ready for use, built according to agreed specifications, and aligned with your intended purpose—whether that is living, renting, or running a business.",
    icon: BuildingOffice2Icon,
    colorClass: {
      accentText: "text-[#E0B9A0]",
      border: "hover:border-[#E0B9A0]/40"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4WjWo8QINsAcQrYNWldg-_yGtyRXcaY9GxuqfxqqJUNjJKGVKJK9k6BzdvAdOzlrFc0qGytCm7nFfkPVpw2UlXE0TD5jpBgQTsdfZnze6HPKR-F_LIJU5GB6vFn6scCUpiJeERFbPfixe-j6ROpmSAdI1CdlLIAY80wEX0mhEBON0ym3N7POBq2yiTBXEz4MzKsTFVLNow8pdkmwATpc0EgppXhpFChCjd0QtqA3nJNn-BlEaoP5KLBdor2BL9MWporxSU7Evb2s"
  },
  {
    id: "02",
    title: "Interior Design & Finishing",
    cardSummary: "Kitchens, cabinetry, gypsum, flooring, WPC and lighting. Spaces that look polished and work for daily life or business.",
    overview: "This service focuses on transforming internal spaces into environments that are both functional and visually appealing. It is ideal for clients who already have a structure but need to improve how the space looks and works.\n\nWe begin by understanding how you intend to use the space. Whether it is a shop, office, or residential interior, the design is tailored to support your daily activities while also improving the overall appearance.\n\nOur work includes layout adjustments, finishing selections, lighting improvements, and surface treatments such as flooring, ceilings, and wall finishes. The goal is not just decoration, but creating a space that works better for you.\n\nWe pay close attention to how different elements come together—ensuring that movement within the space is smooth, lighting is effective, and the final result feels complete rather than pieced together.",
    scope: [
      "Internal space transformation",
      "Layout adjustments",
      "Finishing selections",
      "Lighting improvements",
      "Surface treatments (flooring, ceilings, walls)"
    ],
    clients: [
      "Shop and retail owners",
      "Office facility managers",
      "Residential clients",
      "Business owners"
    ],
    process: [
      "Usage Intent Analysis",
      "Tailored Design Development",
      "Layout & Finishing Selection",
      "Lighting & Movement Optimization",
      "Final Result Integration"
    ],
    outcome: "For business owners, this often means creating a space that attracts customers and supports operations. For residential clients, it means making the home more comfortable and organized. The final outcome is a space that is cleaner, more modern, and better suited to its purpose.",
    icon: SparklesIcon,
    colorClass: {
      accentText: "text-[#FAF8F5]",
      border: "hover:border-[#AE917E]/40"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJgMhD7gZWYj9nwCwAFa-s_MoIKJaAnmbe-zn3uBPh48eBIKvCEch2bMTbhJUPuyiGd3xOAaHMgOxV4wAuxxpzfEQgYQp2nVdmKxWuFOxOHzxiTBU_8aHJbCdrz2gLUnOtlqhEf_fW64XTmQM517tep7HZP8zDhABYK0kkq81z7izN8oogn9qs2dgWo0GQGK2n3fEpTpc3UT72jM5V1f_qlOZDg4xVYqazE9EzCsqqR_8NJDkTNURHO3-hXixe5EteZZE-VjGkCkk"
  },
  {
    id: "03",
    title: "Renovation & Remodeling",
    cardSummary: "Upgrade existing homes and commercial spaces. Practical improvements that maximise value while minimising disruption.",
    overview: "Renovation services are designed for clients who already have an existing structure but need to improve, upgrade, or repurpose it.\n\nWe start by assessing the current condition of the space and identifying what is not working—this could be outdated finishes, poor layout, structural wear, or underutilized areas.\n\nBased on this, we propose practical improvements that enhance both functionality and appearance. This may involve redesigning certain sections, replacing materials, upgrading finishes, or reconfiguring the layout entirely.\n\nThe focus is on maximizing the value of what you already have, rather than starting from scratch. This makes renovation a cost-effective option for improving property value and usability.\n\nWe carefully manage the process to minimize disruption, especially for spaces that are still in use, such as shops or offices.",
    scope: [
      "Existing structure improvement",
      "Structural wear repair",
      "Layout reconfiguration",
      "Material replacement",
      "Property repurposing"
    ],
    clients: [
      "Owners of existing structures",
      "Property value seekers",
      "Shop and office owners",
      "Repurposing clients"
    ],
    process: [
      "Current Condition Assessment",
      "Practical Improvement Proposal",
      "Redesign & Material Selection",
      "Disruption-Minimized Management",
      "Efficiency & Look Modernization"
    ],
    outcome: "At completion, the space feels renewed, more efficient, and aligned with current needs—whether that means modernizing the look or improving how the space functions.",
    icon: ArrowPathIcon,
    colorClass: {
      accentText: "text-[#E0B9A0]",
      border: "hover:border-[#E0B9A0]/40"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU5rrJrv0XSO0txUIddgRLI4hOVJqCIxPZDcr32giPrLr3EoRik0_-YfPdnc_KtgpzJJm-_45B588EmCsQfjwNwaKxT4PysG9Of6wAyO-byQ3Xn48JvYeevNUaKaK3FY8K-kEftEFLykf5-RLZ0uvao4s9GOUtehJnukMTc-hy-VsI2ob7M114D4l_LsJ5zllEmHvTse1DkBNqRiWe7j7eK-Wj_K6o0gADqR25ghBDDp_8_HZNwJmgTJt0f7a3Rl_AgfdIFSfp3OE"
  },
  {
    id: "04",
    title: "Custom Commercial Projects",
    cardSummary: "Kiosks, booths and retail fit-outs designed for visibility, workflow and immediate use.",
    overview: "This service is specifically designed for entrepreneurs and businesses that need functional, ready-to-use commercial spaces such as kiosks, booths, or small retail setups.\n\nWe understand that for business owners, the space is not just a structure—it directly affects visibility, customer experience, and daily operations.\n\nThe process begins by understanding your business type, location, and operational needs. From there, we design a setup that fits your brand, supports your workflow, and makes efficient use of available space.\n\nWe handle both the design and construction, ensuring that the final setup is durable, practical, and visually appealing to customers. This includes structural work, finishing, and layout optimization.\n\nFor example, kiosk projects are designed to be compact but efficient, allowing for smooth service delivery while maintaining a professional appearance.",
    scope: [
      "Kiosks and booths",
      "Small retail setups",
      "Ready-to-use commercial spaces",
      "Brand-aligned setup design",
      "Layout optimization"
    ],
    clients: [
      "Entrepreneurs",
      "Retail businesses",
      "Small setup operators",
      "Brand managers"
    ],
    process: [
      "Business Type & Needs Analysis",
      "Brand-Aligned Setup Design",
      "Efficient Space Planning",
      "Design & Construction Execution",
      "Operational Readiness Handover"
    ],
    outcome: "The final result is a business space that is ready for immediate use, designed to support your operations and attract customers.",
    icon: BuildingStorefrontIcon,
    colorClass: {
      accentText: "text-[#AE917E]",
      border: "hover:border-[#AE917E]/40"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaeFV-7KNBpps2-ELWn3KUvW7uFq7zlkDp2UR0JZ1fotpCQU5pnDn51g6xWJCASKsABXVdbItcamjtlpJaMebg9sd8IEPSsrfP92GrTOBvZOR553mIksZmLejdjmfFWkpqU6xwePrx5INhavcV6sWU1daQ_R4vURLD7D4hEfT2TNCbkKL5yXQ8JxRWqKw8jlo7IUVVUllNt8CC-aZDdbIVpKxAyF3AunTl4FrSrzw8Mu0X7KxdjKAejvlprI84Sh69_HrPajLNS8"
  }
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  return (
    <section 
      id="services" 
      className="pt-16 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 lg:pb-28 relative bg-[#FAF8F5] text-[#2D2926] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <header className="pb-10 sm:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-3 sm:mb-6">
                <div className="h-[2px] w-8 sm:w-12 bg-[#AE917E]"></div>
                <h2 className="text-[#AE917E] font-display text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.5em] uppercase flex items-center gap-2 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AE917E] animate-pulse" />
                  Engineering & Finishing Scope &bull; 05
                </h2>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.08] uppercase tracking-tighter text-[#2D2926]">
                Our <br/> <span className="text-[#AE917E] font-bold">Services</span>
              </h1>
            </div>
            <AnimatedBlock delay={0.1}>
              <p className="text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-md">
                We deliver a comprehensive range of construction and engineering services, focusing on technical precision and reliable project execution for every client.
              </p>
            </AnimatedBlock>
          </div>
        </header>

        {/* Refined Responsive Grid: 4 cols on desktop, 2 on tablet, 1 on mobile with generous heights */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6"
        >
          {services.map((service) => (
            <motion.div 
              key={service.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
              }}
              onClick={() => setSelectedService(service)}
              className="service-card group relative overflow-hidden bg-[#2D2926] border border-[#AE917E]/30 hover:border-[#E0B9A0] rounded-2xl min-h-[440px] sm:min-h-[480px] cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <img 
                alt={service.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                src={service.image}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926] via-[#2D2926]/70 to-transparent transition-opacity duration-500"></div>
              
              <div className="relative h-full p-6 sm:p-7 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="font-display text-3xl sm:text-4xl text-[#E0B9A0]/60 group-hover:text-[#E0B9A0] transition-colors duration-500 font-bold tracking-tight">{service.id}</span>
                  <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center bg-white/10 group-hover:border-[#E0B9A0] group-hover:bg-[#E0B9A0]/20 transition-all duration-500 shadow-md">
                    <service.icon className="w-5 h-5 text-[#E0B9A0] transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-lg sm:text-xl text-white uppercase tracking-wider leading-snug font-bold">{service.title}</h3>
                  <p className="text-stone-300 text-xs sm:text-[13px] leading-relaxed font-normal opacity-95">
                    {service.cardSummary}
                  </p>
                  <div className="pt-3 flex items-center gap-2.5 group-hover:gap-3.5 transition-all duration-300">
                    <div className="h-[2px] w-6 bg-[#E0B9A0] group-hover:w-9 transition-all duration-300"></div>
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#E0B9A0] font-bold">Explore Scope</span>
                    <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#E0B9A0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
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
              className="bg-[#1E1B18] w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-0 sm:border sm:border-white/10 relative no-scrollbar rounded-2xl"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 sm:p-2.5 rounded-full border border-white/10 cursor-pointer"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full sm:min-h-0">
                <div className="h-52 sm:h-72 lg:h-full relative">
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.title} 
                    className="w-full h-full object-cover grayscale-[0.2]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1E1B18] to-transparent lg:hidden"></div>
                </div>
                
                <div className="p-5 sm:p-8 md:p-12 lg:p-16 space-y-8 sm:space-y-12">
                  <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                      <span className="text-[#E0B9A0] font-display text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase font-bold">{selectedService.id} / SERVICE DETAIL</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter mb-4 sm:mb-8 leading-tight">
                      {selectedService.title}
                    </h2>
                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                      {selectedService.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-3 sm:space-y-5">
                      <h4 className="text-[#E0B9A0] font-display text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase border-b border-[#E0B9A0]/20 pb-2 font-bold">What We Do</h4>
                      <ul className="space-y-2.5 sm:space-y-3">
                        {selectedService.scope.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-300">
                            <span className="text-[#E0B9A0] mt-1 text-[8px]">●</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3 sm:space-y-5">
                      <h4 className="text-[#E0B9A0] font-display text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase border-b border-[#E0B9A0]/20 pb-2 font-bold">Ideal Clients</h4>
                      <ul className="space-y-2.5 sm:space-y-3">
                        {selectedService.clients.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-300">
                            <span className="text-[#E0B9A0] mt-1 text-[8px]">●</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-7">
                    <h4 className="text-[#E0B9A0] font-display text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase border-b border-[#E0B9A0]/20 pb-2 font-bold">Our Execution Process</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
                      {selectedService.process.map((step, i) => (
                        <div key={i} className="space-y-1.5 p-2.5 bg-white/[0.04] rounded-lg border border-white/10">
                          <span className="text-[#E0B9A0] font-display text-base sm:text-lg font-bold">0{i+1}</span>
                          <p className="text-[7.5px] sm:text-[8.5px] text-stone-300 uppercase tracking-wider leading-snug font-medium">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 sm:p-7 border-l-2 border-[#E0B9A0] rounded-lg">
                    <h4 className="text-white font-bold text-xs sm:text-sm mb-1">Expected Outcome</h4>
                    <p className="text-stone-300 text-xs sm:text-sm italic">"{selectedService.outcome}"</p>
                  </div>

                  <div className="pt-2 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 pb-6 sm:pb-0">
                    <button 
                      onClick={() => {
                        setSelectedService(null);
                        document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase border border-[#E0B9A0] bg-[#E0B9A0] text-[#2D2926] hover:bg-white hover:border-white rounded-full transition-all cursor-pointer text-center active:scale-95 shadow-lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Start Your Project
                        <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2]" />
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedService(null);
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase border border-white/20 text-[#FAF8F5] hover:bg-white/10 rounded-full transition-all cursor-pointer text-center active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Request Consultation
                        <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#E0B9A0] stroke-[2]" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
