import { useState, useRef, useEffect } from "react";
import Lenis from "lenis";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatWeDo from "./components/WhatWeDo";
import About from "./components/About";
import Leadership from "./components/Leadership";
import Services from "./components/Services";
import Process from "./components/Process";
import Portfolio from "./components/Portfolio";
import Testimonials from "./components/Testimonials";
import Estimator from "./components/Estimator";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FeatureSection from "./components/FeatureSection";
import ScrollTimeline from "./components/ScrollTimeline";
import FluidLineLoop from "./components/FluidLineLoop";
import { gsap, useGSAP, ScrollTrigger } from "./lib/gsap";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Strictly lock document and body scrolling while preloader is active
  useEffect(() => {
    if (!isLoaded) {
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [isLoaded]);

  // Aroclux Lenis Smooth Scroll Engine + GSAP Ticker synchronization (only runs once site is loaded)
  useEffect(() => {
    if (!isLoaded) return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.9,
      infinite: false,
      gestureOrientation: "vertical",
    });

    (window as any).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    // Refresh ScrollTrigger only after website layout, fonts and media are completely visible
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 180);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      clearTimeout(timer);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isLoaded]);

  // Coordinated GSAP Section Transition System — Varied Scroll Choreography
  useGSAP(
    () => {
      if (!isLoaded) return;

      const mm = gsap.matchMedia();

      // Desktop & Large Screens: Layered Pinning & Varied Scroll Choreography
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".section-panel");
        if (panels.length <= 1) return;

        // Iterate through all panels except the final conversion/footer sections
        panels.forEach((panel, i) => {
          const nextPanel = panels[i + 1];
          if (!nextPanel) return;

          // Leave Contact and Footer in natural fluid flow so form submission and footer links are fully accessible
          if (panel.id === "panel-contact" || panel.id === "panel-footer") return;

          // Check if current panel is taller than viewport (with 50px tolerance)
          // Viewport panels pin at 'top top', while tall panels pin once the user has scrolled
          // through their entire content ('bottom bottom'), ensuring zero distortion or cutoff.
          const isTall = () => panel.offsetHeight > window.innerHeight + 50;

          // 1. Layered Pinning ScrollTrigger:
          // Pinned with pinSpacing: false so subsequent panel glides over it
          ScrollTrigger.create({
            trigger: panel,
            start: () => (isTall() ? "bottom bottom" : "top top"),
            endTrigger: nextPanel,
            end: "top top",
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });

          // 2. Varied Scroll Choreography:
          // As the next section slides up over the current pinned panel,
          // the outgoing panel subtly recedes with architectural depth (scale, opacity, y-parallax)
          gsap.to(panel, {
            scale: 0.965,
            opacity: 0.88,
            y: -25,
            ease: "none",
            scrollTrigger: {
              trigger: nextPanel,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      // Mobile & Tablet: Fluid non-pinning layout for seamless touch performance
      mm.add("(max-width: 1023px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".section-panel");
        panels.forEach((panel) => {
          gsap.set(panel, {
            scale: 1,
            opacity: 1,
            y: 0,
            clearProps: "transform,opacity",
          });
        });
      });
    },
    { dependencies: [isLoaded], scope: mainContainerRef }
  );

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen bg-[#080809] text-[#FAF8F5] overflow-x-hidden selection:bg-[#E0B9A0] selection:text-[#2D2926]"
    >
      {/* Isolated Dedicated Preloader Screen */}
      <Preloader
        onComplete={() => {
          setIsLoaded(true);
          // Strictly guarantee browser starts at Hero section
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          if ((window as any).__lenis) {
            (window as any).__lenis.scrollTo(0, { immediate: true });
          }
          // Allow full layout paint + font/image settle before GSAP calculates
          // pin heights and ScrollTrigger scroll positions
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 300);
        }}
      />

      {/* Website Root Container: Pre-rendered underneath preloader for immediate reveal with zero black screen gap */}
      <div
        className="relative w-full"
        style={{
          opacity: 1,
          visibility: "visible",
          pointerEvents: isLoaded ? "auto" : "none",
        }}
      >
        <Navbar />
        <ScrollTimeline />

        {/* Architectural Section Dwell Spacer: Desktop-only scroll buffer ensuring previous section is fully displayed before next section layers over */}
        {/* 01. Hero */}
        <div id="panel-hero" className="section-panel panel relative z-10 bg-[#080809]">
          <Hero startEntrance={isLoaded} />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 02. What We Do / Capabilities */}
        <div id="panel-capabilities" className="section-panel panel section-panel-elevated relative z-20 bg-[#FAF8F5]">
          <WhatWeDo />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 03. About */}
        <div id="panel-about" className="section-panel panel section-panel-elevated relative z-30 bg-[#2D2926]">
          <About />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 04. Leadership */}
        <div id="panel-leadership" className="section-panel panel section-panel-elevated relative z-40 bg-[#2D2926]">
          <Leadership />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 05 & 06 Connected Span with Continuous Fluid Drawing Line Loop */}
        <div className="relative w-full">
          <div className="absolute inset-0 pointer-events-none z-[65] overflow-visible">
            <FluidLineLoop />
          </div>

          {/* 05. Engineering & Finishing Scope */}
          <div id="panel-services" className="section-panel panel section-panel-elevated relative z-50 bg-[#FAF8F5]">
            <Services />
          </div>
          <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

          {/* 06. Industrial & Commercial Engineering */}
          <div id="panel-feature-industrial" className="section-panel panel section-panel-elevated relative z-60 bg-[#FAF8F5]">
            <FeatureSection 
              title="Industrial & Commercial Engineering"
              subtitle="Structural Performance • 06"
              description="We deliver high-performance structural solutions for industrial and commercial facilities, ensuring durability, precision, and operational efficiency."
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuD81-4lALGQwufXU647htptVo5VBqEZ9_8CU1SZfsYB8EvbuKIUNAF6GmRdFY4XHnzkPeRcPTE17NV4ioer5zYdqdlEQUioMu0-Kh8gg8WRIBjg99WghG-WHIN3GCV6xKaCH-6KepCQYzAOPzlpytUze9Q9sGoyARU47VQLjrbmYgU6EcinP-u_-fRnA1yoaTflP8LZ-SoPEOWNmLE7S9uumUU8djTL4Rruh3QcLWAr4BGZMXpmW2eT5V1UCZLxMZxbreaOWpKs-Lw"
              features={[
                { icon: "precision_manufacturing", title: "Technical Precision", desc: "Rigorous engineering standards for every structural component." },
                { icon: "speed", title: "Efficient Delivery", desc: "Optimized project management to meet strict commercial timelines." },
                { icon: "security", title: "Safety Compliance", desc: "Full adherence to local building codes and safety regulations." }
              ]}
              theme="white"
              siteProgressGallery
            />
          </div>
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 07. Blueprint Process */}
        <div id="panel-process" className="section-panel panel section-panel-elevated relative z-70 bg-[#2D2926]">
          <Process />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 08. Interior Finishing & Optimization */}
        <div id="panel-feature-interior" className="section-panel panel section-panel-elevated relative z-80 bg-[#FAF8F5]">
          <FeatureSection 
            title="Interior Finishing & Optimization"
            subtitle="Functional Design • 08"
            description="Our interior solutions focus on space optimization, bespoke millwork, and high-quality material finishing for professional and residential environments."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuC5hNxK_S0BQ30SDJFQBI6K_gXJU7o41wTPIH6apCbFJmECGuEHz0iD3moIczlWTT91EKExZ90Bze4TM-TarKWnFDKyKLJbjjFS7h-LbIOu5bO_vsAjcA1RRWysoN0JNUkusFZB_i6wb2tEYMuo4bGvDaOXORL8jGAZi0I7yYsOzWWoqIvGHsYDmPH2mMLfW9cI0jZAfFIqsgCxTd_J8lH1rjBZpACEM1LHJKqieWsJkrJLJ0yvj2mdS7MkQYSEJ5jMMo84_Ekten0"
            features={[
              { icon: "space_dashboard", title: "Space Planning", desc: "Maximizing utility and flow in commercial and residential layouts." },
              { icon: "texture", title: "Premium Materials", desc: "Sourcing durable, high-grade materials for a professional finish." },
              { icon: "light_mode", title: "Integrated Systems", desc: "Seamless integration of lighting, MEP, and smart systems." }
            ]}
            theme="white"
            reverse
            animatedGallery
          />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 09. Portfolio & Restoration Cinema */}
        <div id="panel-portfolio" className="section-panel panel section-panel-elevated relative z-[85] bg-[#2D2926]">
          <Portfolio />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 10. Testimonials */}
        <div id="panel-testimonials" className="section-panel panel section-panel-elevated relative z-[90] bg-[#FAF8F5]">
          <Testimonials />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 11. Interactive Estimator */}
        <div id="panel-estimator" className="section-panel panel section-panel-elevated relative z-[92] bg-[#2D2926]">
          <Estimator />
        </div>
        <div className="section-dwell-spacer hidden lg:block h-[42vh] pointer-events-none" aria-hidden="true" />

        {/* 12. Contact */}
        <div id="panel-contact" className="section-panel panel section-panel-elevated relative z-[94] bg-[#2D2926]">
          <Contact />
        </div>

        {/* 13. Footer */}
        <div id="panel-footer" className="section-panel panel relative z-[96] bg-[#080809]">
          <Footer />
        </div>
      </div>
    </div>
  );
}

