import { useEffect, useState, useRef } from "react";

interface SectionMeta {
  id: string;
  name: string;
}

const SECTIONS: SectionMeta[] = [
  { id: "panel-hero", name: "Overview" },
  { id: "panel-capabilities", name: "Capabilities" },
  { id: "panel-about", name: "About" },
  { id: "panel-leadership", name: "Leadership" },
  { id: "panel-services", name: "Services" },
  { id: "panel-feature-industrial", name: "Engineering" },
  { id: "panel-process", name: "Process" },
  { id: "panel-portfolio", name: "Portfolio" },
  { id: "panel-testimonials", name: "Reviews" },
  { id: "panel-estimator", name: "Estimator" },
  { id: "panel-contact", name: "Contact" },
];

export default function ScrollTimeline() {
  const [scrollPct, setScrollPct] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [segmentFills, setSegmentFills] = useState<number[]>(() =>
    new Array(SECTIONS.length).fill(0)
  );

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateScrollMetrics = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Calculate overall page scroll percentage (0 - 100)
      const pct = docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));

      // Visible after scrolling past initial hero header area
      if (scrollY > 150 && pct < 99) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Compute section positions & segment fills
      const viewportMid = scrollY + window.innerHeight * 0.45;
      let currentActive = 0;
      const fills = new Array(SECTIONS.length).fill(0);

      SECTIONS.forEach((sec, idx) => {
        const el = document.getElementById(sec.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + el.offsetHeight;

        if (scrollY >= bottom) {
          // Fully passed
          fills[idx] = 100;
        } else if (scrollY < top) {
          // Not reached
          fills[idx] = 0;
        } else {
          // Currently in section
          const progress = (scrollY - top) / el.offsetHeight;
          fills[idx] = Math.min(100, Math.max(0, progress * 100));
        }

        if (viewportMid >= top && viewportMid <= bottom) {
          currentActive = idx;
        }
      });

      setActiveSectionIdx(currentActive);
      setSegmentFills(fills);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollMetrics);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollMetrics, { passive: true });

    updateScrollMetrics();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, []);

  const handleSegmentClick = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeSection = SECTIONS[activeSectionIdx] || SECTIONS[0];
  const labelTopPercent =
    ((activeSectionIdx + 0.5) / SECTIONS.length) * 100;

  return (
    <>
      {/* Luke Baffait Minimal Left Scroll Percentage Indicator */}
      <div
        className={`scroll-pct hidden md:block ${isVisible ? "visible" : ""}`}
        aria-hidden="true"
      >
        <span>({scrollPct}%)</span>
      </div>

      {/* Luke Baffait Segmented Right Scroll Navigation Bar */}
      <nav
        ref={timelineRef}
        className={`scroll-timeline hidden lg:flex ${isVisible ? "visible" : ""}`}
        aria-label="Page scroll position"
      >
        {/* Dynamic Section Label Tag */}
        <div
          className="st-label"
          style={{ top: `${labelTopPercent}%` }}
        >
          <span>0{activeSectionIdx + 1}</span> {activeSection.name}
        </div>

        {/* Vertical Segmented Bars */}
        <div className="st-bar">
          {SECTIONS.map((sec, idx) => (
            <div
              key={sec.id}
              className="st-seg group"
              onClick={() => handleSegmentClick(sec.id)}
              title={`Go to ${sec.name}`}
            >
              <div
                className="st-seg-fill"
                style={{ height: `${segmentFills[idx]}%` }}
              />
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
