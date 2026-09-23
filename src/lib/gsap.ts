import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

export { gsap, useGSAP, ScrollTrigger };
export default gsap;
