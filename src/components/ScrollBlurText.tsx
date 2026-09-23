import React, { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

interface ScrollBlurTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  wordClassName?: string;
  accentWords?: string[];
  scrub?: boolean | number;
  start?: string;
}

export default function ScrollBlurText({
  text,
  as: Component = "p",
  className = "",
  wordClassName = "",
  accentWords = [],
  scrub = false,
  start = "top 82%",
}: ScrollBlurTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const words = text.split(/\s+/);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const wordEls = container.querySelectorAll<HTMLElement>(".scroll-blur-word");
      if (wordEls.length === 0) return;

      if (scrub) {
        gsap.to(wordEls, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: start,
            end: "top 45%",
            scrub: typeof scrub === "number" ? scrub : true,
          },
        });
      } else {
        gsap.to(wordEls, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.025,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: start,
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: containerRef, dependencies: [text] }
  );

  return (
    <Component
      ref={containerRef as any}
      className={`scroll-blur-text ${className}`}
    >
      {words.map((word, i) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const isAccent = accentWords.some(
          (acc) => acc.toLowerCase() === cleanWord || acc.toLowerCase() === word.toLowerCase()
        );

        return (
          <span
            key={i}
            className={`scroll-blur-word ${isAccent ? "other-accent" : ""} ${wordClassName}`}
          >
            {word}&nbsp;
          </span>
        );
      })}
    </Component>
  );
}
