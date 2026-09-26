import { motion } from "motion/react";
import { transitionManager } from "../lib/transitionManager";

export default function Footer() {
  return (
    <footer className="section-brand-black text-[#FAF8F5] pt-24 relative overflow-hidden border-t border-white/10 bg-[#080809]">
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-25 pointer-events-none z-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
          <path 
            d="M0,100 L0,80 L20,80 L20,70 L40,70 L40,90 L60,90 L60,60 L80,60 L80,85 L100,85 L100,50 L130,50 L130,90 L160,90 L160,40 L200,40 L200,90 L230,90 L230,70 L250,70 L250,95 L300,95 L300,60 L350,60 L350,85 L400,85 L400,30 L450,30 L450,90 L500,90 L500,75 L550,75 L550,95 L600,95 L600,40 L650,40 L650,80 L700,80 L700,55 L750,55 L750,90 L800,90 L800,20 L850,20 L850,85 L900,85 L900,60 L950,60 L950,95 L1000,95 L1000,45 L1050,45 L1050,85 L1100,85 L1100,70 L1150,70 L1150,95 L1200,95 L1200,100 Z" 
            fill="#181514"
          ></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-16 sm:pb-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8">
          <div className="space-y-6 sm:space-y-8 lg:col-span-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Yanhal Logo" 
                className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-[0_0_15px_rgba(224,185,160,0.3)]"
              />
              <div>
                <h3 className="text-2xl font-display font-bold tracking-tight text-white">YANHAL</h3>
                <p className="text-[10px] tracking-[0.4em] text-[#E0B9A0] uppercase mt-1">Holdings Ltd</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-300 max-w-xs">
              Professional construction and engineering firm delivering high-performance structural solutions and professional interior finishing since 2020.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 sm:mb-8 uppercase tracking-widest text-[10px] sm:text-xs border-b border-white/10 pb-2 inline-block">Our Services</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              {["Construction Services", "Interior Design", "Renovation & Remodeling", "Commercial Projects", "Structural Engineering"].map((service, idx) => (
                <li key={idx}>
                  <a 
                    className="text-stone-300 hover:text-[#E0B9A0] transition-colors flex items-center gap-2 group py-1 cursor-pointer" 
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      transitionManager.transitionTo({
                        destination: "#services",
                        label: `02 · ${service.toUpperCase()}`,
                      });
                    }}
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-[#E0B9A0] transition-all"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 sm:mb-8 uppercase tracking-widest text-[10px] sm:text-xs border-b border-white/10 pb-2 inline-block">Navigation</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              {[
                { name: "About Us", href: "#about", label: "04 · ABOUT US" },
                { name: "Our Projects", href: "#portfolio", label: "03 · SELECTED WORKS" },
                { name: "Process", href: "#process", label: "BLUEPRINT PROCESS" },
                { name: "Estimator", href: "#estimator", label: "PROJECT ESTIMATOR" },
                { name: "Contact", href: "#contact", label: "05 · CONSULTATIONS" }
              ].map((nav, idx) => (
                <li key={idx}>
                  <a 
                    className="text-stone-300 hover:text-[#E0B9A0] transition-colors block py-1 cursor-pointer" 
                    href={nav.href}
                    onClick={(e) => {
                      e.preventDefault();
                      transitionManager.transitionTo({
                        destination: nav.href,
                        label: nav.label,
                      });
                    }}
                  >
                    {nav.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-white font-bold mb-6 sm:mb-8 uppercase tracking-widest text-[10px] sm:text-xs border-b border-white/10 pb-2 inline-block">Contact</h4>
            <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              {/* Headquarters / Location */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=South+C,+Behind+Masjid+As+Salaam,+Nairobi,+Kenya" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "https://www.google.com/maps/search/?api=1&query=South+C,+Behind+Masjid+As+Salaam,+Nairobi,+Kenya",
                    label: "HEADQUARTERS · NAIROBI",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="Headquarters"
                title="South C, Behind Masjid As Salaam, Nairobi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </a>

              {/* Phone Number */}
              <a 
                href="tel:0724093256" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "tel:0724093256",
                    label: "DIRECT LINE · CALL",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="Phone Number"
                title="0724093256"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>

              {/* WhatsApp & Secondary Line */}
              <a 
                href="https://wa.me/254740895374" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "https://wa.me/254740895374",
                    label: "CONNECTING · WHATSAPP",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="WhatsApp & Secondary Line"
                title="+254 740 895374"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.675-2.086-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.151-.678-1.633-.929-2.235-.245-.586-.494-.507-.678-.516l-.578-.01c-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.913 1.23 3.114.15.2 2.123 3.242 5.144 4.545.718.31 1.28.495 1.718.634.722.23 1.378.197 1.897.12.579-.086 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.006L2 22l5.177-1.308A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.628 0-3.14-.498-4.402-1.354l-.316-.214-3.267.826.871-3.136-.231-.336A8.17 8.17 0 0 1 3.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z"/>
                </svg>
              </a>

              {/* Email Inquiries */}
              <a 
                href="mailto:Yanhalholdingslimited@gmail.com" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "mailto:Yanhalholdingslimited@gmail.com",
                    label: "INQUIRY · EMAIL",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="Email Inquiries"
                title="Yanhalholdingslimited@gmail.com"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@yanhal.holdings.lt" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "https://www.tiktok.com/@yanhal.holdings.lt",
                    label: "SOCIAL · TIKTOK",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="TikTok"
                title="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/yanhalholdings/" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => {
                  e.preventDefault();
                  transitionManager.transitionTo({
                    destination: "https://www.instagram.com/yanhalholdings/",
                    label: "SOCIAL · INSTAGRAM",
                    isExternal: true,
                  });
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-white/20 hover:border-[#E0B9A0] bg-white/[0.05] hover:bg-[#E0B9A0]/10 rounded-lg flex items-center justify-center text-white hover:text-[#E0B9A0] transition-all duration-300 shadow-md group cursor-pointer shrink-0" 
                aria-label="Instagram"
                title="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-widest text-center md:text-left">
          <p>© 2026 Yanhal Holdings Ltd. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <a className="hover:text-[#E0B9A0] transition-colors py-1" href="#">Privacy Policy</a>
            <a className="hover:text-[#AE917E] transition-colors py-1" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
