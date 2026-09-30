import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
  (window as any).Flip = Flip;
}

export { gsap, useGSAP, ScrollTrigger, Flip };
export default gsap;

