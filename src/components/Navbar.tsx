import { useState, useEffect } from "react";
import { 
  HomeIcon, 
  Squares2X2Icon, 
  BuildingOffice2Icon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  ArrowUpRightIcon, 
  XMarkIcon,
  PhoneIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navItems = [
    { 
      number: "01", 
      label: "Home", 
      href: "#home", 
      icon: <HomeIcon className="w-4 h-4 stroke-[1.5]" />,
      tagline: "Main Overview & Vision",
      accent: "text-white",
      borderAccent: "border-white/20 group-hover:border-white/50 group-hover:bg-white/10",
      numberColor: "text-white/60"
    },
    { 
      number: "02", 
      label: "Services", 
      href: "#services", 
      icon: <Squares2X2Icon className="w-4 h-4 stroke-[1.5]" />,
      tagline: "Engineering & Finishing Scope",
      accent: "text-[#E0B9A0]",
      borderAccent: "border-[#E0B9A0]/30 group-hover:border-[#E0B9A0] group-hover:bg-[#E0B9A0]/15 group-hover:text-[#FAF8F5]",
      numberColor: "text-[#E0B9A0]"
    },
    { 
      number: "03", 
      label: "Projects", 
      href: "#portfolio", 
      icon: <BuildingOffice2Icon className="w-4 h-4 stroke-[1.5]" />,
      tagline: "Commercial & Residential Portfolio",
      accent: "text-[#AE917E]",
      borderAccent: "border-[#AE917E]/30 group-hover:border-[#AE917E] group-hover:bg-[#AE917E]/15 group-hover:text-[#E0B9A0]",
      numberColor: "text-[#AE917E]"
    },
    { 
      number: "04", 
      label: "About", 
      href: "#about", 
      icon: <UserGroupIcon className="w-4 h-4 stroke-[1.5]" />,
      tagline: "Leadership & Standards",
      accent: "text-white",
      borderAccent: "border-white/20 group-hover:border-white/50 group-hover:bg-white/10",
      numberColor: "text-white/70"
    },
    { 
      number: "05", 
      label: "Contact", 
      href: "#contact", 
      icon: <EnvelopeIcon className="w-4 h-4 stroke-[1.5]" />,
      tagline: "Estimates & Consultations",
      accent: "text-[#E0B9A0]",
      borderAccent: "border-[#E0B9A0]/30 group-hover:border-[#E0B9A0] group-hover:bg-[#E0B9A0]/15 group-hover:text-[#FAF8F5]",
      numberColor: "text-[#E0B9A0]"
    },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] bg-[#0A0C0E]/85 backdrop-blur-xl border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 md:h-22 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <a 
          href="#home" 
          className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 group focus:outline-none shrink-0 select-none"
          aria-label="Yanhal Holdings Home"
        >
          <img 
            src="/yanhal-emblem.svg" 
            alt="Yanhal Holdings Emblem" 
            style={{ aspectRatio: "300 / 386" }}
            className="h-10 sm:h-12 md:h-13 lg:h-[58px] xl:h-[62px] w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_14px_rgba(224,185,160,0.3)]"
          />
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-display font-medium tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-[#FAF8F5] whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[1.125rem] xl:text-[1.22rem] leading-tight">
              YANHAL <span className="text-[#E0B9A0] font-semibold">HOLDINGS</span>
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_rgba(224,185,160,0.85)] animate-pulse shrink-0" />
              <span className="font-mono text-[8px] sm:text-[9.5px] md:text-[10px] lg:text-[11px] xl:text-[11.5px] tracking-[0.22em] sm:tracking-[0.26em] lg:tracking-[0.3em] text-[#FAF8F5]/75 uppercase whitespace-nowrap">
                Engineering &bull; Interiors
              </span>
            </div>
          </div>
        </a>
        
        {/* Unified Architectural Hamburger Trigger & Estimate CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <a
            href="#estimator"
            className="hidden sm:inline-flex items-center gap-2 text-[10px] font-mono font-medium tracking-[0.2em] uppercase text-[#E0B9A0] border border-[#E0B9A0]/40 px-3.5 py-1.5 hover:bg-[#E0B9A0] hover:text-[#2D2926] transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(224,185,160,0.15)] active:scale-95 font-bold"
          >
            <span>Estimate</span>
            <ArrowUpRightIcon className="w-3 h-3 stroke-[2]" />
          </a>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/15 hover:border-[#E0B9A0]/60 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 group cursor-pointer focus:outline-none active:scale-95"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase text-white/80 group-hover:text-[#E0B9A0] transition-colors">
              {isMenuOpen ? "CLOSE" : "MENU"}
            </span>

            {/* Refined 3-bar architectural hamburger animation */}
            <div className="w-4 h-3 flex flex-col justify-between items-end relative overflow-hidden">
              <span 
                className={`h-[1.5px] bg-[#E0B9A0] transition-all duration-300 origin-right ${
                  isMenuOpen ? "w-4 -rotate-45 -translate-y-[1px]" : "w-4"
                }`} 
              />
              <span 
                className={`h-[1.5px] bg-[#AE917E] transition-all duration-200 ${
                  isMenuOpen ? "opacity-0 translate-x-3" : "w-2.5 group-hover:w-4"
                }`} 
              />
              <span 
                className={`h-[1.5px] bg-[#E0B9A0] transition-all duration-300 origin-right ${
                  isMenuOpen ? "w-4 rotate-45 translate-y-[1px]" : "w-3.5 group-hover:w-4"
                }`} 
              />
            </div>
          </button>
        </div>
      </div>

      {/* Full Architectural Slide-In Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110]"
            />

            {/* Premium Slide-in Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="fixed top-0 right-0 h-[100dvh] max-h-screen w-full sm:w-[85%] md:w-[460px] lg:w-[490px] bg-[#181514]/98 backdrop-blur-2xl border-l border-white/10 z-[120] shadow-[-25px_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto overscroll-contain"
            >
              {/* Subtle background ambient glow in Aroclux peach & ochre */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#E0B9A0]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 left-0 w-64 h-64 bg-[#AE917E]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Drawer Header */}
              <div className="p-6 sm:p-7 flex items-center justify-between border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <img 
                    src="/yanhal-emblem.svg" 
                    alt="Yanhal Logo" 
                    style={{ aspectRatio: "300 / 386" }}
                    className="h-10 w-auto object-contain shrink-0 drop-shadow-[0_0_10px_rgba(224,185,160,0.3)]"
                  />
                  <span className="font-mono text-xs text-white/70 tracking-[0.25em] uppercase">
                    Navigation Index
                  </span>
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-1.5 text-white/60 hover:text-[#E0B9A0] transition-colors text-xs font-mono uppercase tracking-widest cursor-pointer group p-2"
                  aria-label="Close navigation"
                >
                  <span className="group-hover:translate-x-[-2px] transition-transform text-[11px]">ESC</span>
                  <XMarkIcon className="w-4 h-4 text-[#E0B9A0] stroke-[2]" />
                </button>
              </div>

              {/* Navigation Links with Multi-color rhythm */}
              <div className="px-6 sm:px-9 py-6 flex flex-col gap-1 relative z-10">
                {navItems.map((item, idx) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + idx * 0.05, duration: 0.35 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center justify-between py-3 px-3.5 -mx-3.5 rounded-sm border-b border-white/5 hover:border-[#E0B9A0]/30 hover:bg-white/[0.03] transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-[10px] font-semibold tracking-wider ${item.numberColor}`}>
                        {item.number}
                      </span>
                      
                      {/* Architectural icon container */}
                      <div className={`w-8 h-8 rounded-full border ${item.borderAccent} text-white/75 flex items-center justify-center transition-all duration-300`}>
                        {item.icon}
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-lg sm:text-xl font-display font-medium tracking-[0.14em] uppercase text-white group-hover:${item.accent} transition-colors`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-white/40 font-sans tracking-wide">
                          {item.tagline}
                        </span>
                      </div>
                    </div>

                    <ArrowUpRightIcon className="w-4 h-4 text-white/20 group-hover:text-[#E0B9A0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 stroke-[1.5]" />
                  </motion.a>
                ))}
              </div>

              {/* Drawer Footer & Quick Contact */}
              <div className="p-6 sm:p-8 border-t border-white/10 bg-black/40 relative z-10 flex flex-col gap-4">
                <a
                  href="#estimator"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-fill-hover w-full flex items-center justify-center gap-2.5 border border-[#E0B9A0]/50 bg-[#E0B9A0]/10 text-[#E0B9A0] before:bg-[#E0B9A0] hover:border-[#E0B9A0] hover:text-[#2D2926] font-mono font-bold text-xs uppercase tracking-[0.22em] py-3.5 px-5 rounded-full transition-colors duration-400 shadow-[0_0_15px_rgba(224,185,160,0.15)] active:scale-95"
                >
                  <span>Request an Estimate</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2]" />
                </a>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2 text-white/60 text-[11px] font-sans">
                    <MapPinIcon className="w-3.5 h-3.5 text-[#E0B9A0] shrink-0 stroke-[1.5]" />
                    <span className="truncate">South C, Nairobi</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-[11px] font-sans">
                    <PhoneIcon className="w-3.5 h-3.5 text-[#E0B9A0] shrink-0 stroke-[1.5]" />
                    <span className="truncate">+254 724 093 256</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-white/35 uppercase tracking-widest pt-2 border-t border-white/5">
                  <span>Yanhal Holdings Ltd</span>
                  <span className="text-[#E0B9A0]/70">&bull; 2026</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
