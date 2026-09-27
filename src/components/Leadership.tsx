import React, { useState, useRef, useEffect, useCallback } from "react";
import AnimatedHeading from "./AnimatedHeading";
import AnimatedBlock from "./AnimatedBlock";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";

interface LeaderData {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  hook: string;
  microBio: string;
  tags: string[];
}

const LEADERS: LeaderData[] = [
  {
    id: "ismail-abdirahman",
    name: "Ismail Abdirahman",
    role: "Chief Executive Officer (CEO)",
    coverUrl: "/leaders/leader_cutout_2.png",
    hook: "Signs the checks, steers the ship, and makes sure gravity doesn't win.",
    microBio: "Look, somebody has to be the adult in the room and remind everyone that buildings don't just stay up on good vibes. Ismail runs the entire Yanhal operation, juggling massive project pipelines, high-stakes investor handshakes, and keeping the team from debating cement formulas all day. When he's not turning raw soil into landmark skylines, he's probably on his fourth espresso making sure zero corners get cut.",
    tags: ["#ChiefExecutive", "#ZeroShortcuts", "#RunsOnEspresso"]
  },
  {
    id: "dahir-yusuf",
    name: "Dahir Yusuf",
    role: "Project Manager • Buildings & Road Construction",
    coverUrl: "/leaders/leader_cutout_1.png",
    hook: "Turns pretty blueprint dreams into heavy, reinforced steel and concrete.",
    microBio: "Having a slick 3D render is cute, but somebody actually has to stand in the mud at 6:00 AM and make sure the concrete pour is rock-solid. That's Dahir. He's Yanhal's ground-zero field general, corralling bulldozers, paving highways that won't buckle after the first rainy season, and checking millimeter tolerances. If a Yanhal structure survives the next hundred years, you can thank this guy.",
    tags: ["#FieldGeneral", "#ConcreteWhisperer", "#MudAt6AM"]
  }
];

// =========================================================================
// =========================================================================
// ISMAIL ABDIRAHMAN: CC PAGE TURN STICKER PEEL (AFTER EFFECTS MATHEMATICAL MODEL)
// Exact physical paper peel with fold line sweeping diagonally top-to-bottom,
// reflected sticker flap with cream adhesive backing, 3D cylindrical roll
// highlight, and moving contact drop shadow.
// ZERO background, ZERO card, ZERO rectangular frame.
// =========================================================================

function clipPolygonToHalfPlane(
  poly: [number, number][],
  nx: number,
  ny: number,
  d: number,
  keepGreater: boolean
): [number, number][] {
  const out: [number, number][] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const A = poly[i];
    const B = poly[(i + 1) % n];
    const dA = (A[0] * nx + A[1] * ny - d) * (keepGreater ? 1 : -1);
    const dB = (B[0] * nx + B[1] * ny - d) * (keepGreater ? 1 : -1);
    if (dA >= 0) {
      if (dB >= 0) {
        out.push(B);
      } else {
        const t = dA / (dA - dB);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      }
    } else {
      if (dB >= 0) {
        const t = dA / (dA - dB);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
        out.push(B);
      }
    }
  }
  return out;
}

function findFoldIntersections(
  W: number,
  H: number,
  nx: number,
  ny: number,
  d: number
): [number, number][] {
  const pts: [number, number][] = [];
  if (Math.abs(nx) > 1e-6) {
    const x = d / nx;
    if (x >= -1 && x <= W + 1) pts.push([Math.max(0, Math.min(W, x)), 0]);
  }
  if (Math.abs(ny) > 1e-6) {
    const y = (d - W * nx) / ny;
    if (y >= -1 && y <= H + 1) pts.push([W, Math.max(0, Math.min(H, y))]);
  }
  if (Math.abs(nx) > 1e-6) {
    const x = (d - H * ny) / nx;
    if (x >= -1 && x <= W + 1) pts.push([Math.max(0, Math.min(W, x)), H]);
  }
  if (Math.abs(ny) > 1e-6) {
    const y = d / ny;
    if (y >= -1 && y <= H + 1) pts.push([0, Math.max(0, Math.min(H, y))]);
  }
  const unique: [number, number][] = [];
  for (const p of pts) {
    if (!unique.some(u => Math.hypot(u[0] - p[0], u[1] - p[1]) < 1.0)) {
      unique.push(p);
    }
  }
  return unique;
}

const ISMAIL_VB_W = 420;
const ISMAIL_VB_H = 600;
const ISMAIL_RECT: [number, number][] = [
  [0, 0],
  [ISMAIL_VB_W, 0],
  [ISMAIL_VB_W, ISMAIL_VB_H],
  [0, ISMAIL_VB_H]
];
const PEEL_ANGLE_RAD = (22 * Math.PI) / 180;
const PEEL_NX = -Math.sin(PEEL_ANGLE_RAD);
const PEEL_NY = Math.cos(PEEL_ANGLE_RAD);
const PEEL_TX = Math.cos(PEEL_ANGLE_RAD);
const PEEL_TY = Math.sin(PEEL_ANGLE_RAD);

const ISMAIL_PROJS = ISMAIL_RECT.map(p => p[0] * PEEL_NX + p[1] * PEEL_NY);
const ISMAIL_S_MIN = Math.min(...ISMAIL_PROJS);
const ISMAIL_S_MAX = Math.max(...ISMAIL_PROJS);
const ISMAIL_S_RANGE = ISMAIL_S_MAX - ISMAIL_S_MIN;

function polyToSvgPath(pts: [number, number][]): string {
  if (pts.length < 3) return "";
  return "M" + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
}

function calculateCCPageTurn(t: number) {
  if (t <= 0) {
    return {
      unpeeledPath: `M0,0 L${ISMAIL_VB_W},0 L${ISMAIL_VB_W},${ISMAIL_VB_H} L0,${ISMAIL_VB_H} Z`,
      peeledPath: "",
      cylinderPath: "",
      shadowPath: "",
      matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      cylinderGrad: { x1: 0, y1: 0, x2: 0, y2: 0 },
      hasFlap: false,
      hasCylinder: false
    };
  }

  if (t >= 1) {
    return {
      unpeeledPath: "",
      peeledPath: `M0,0 L${ISMAIL_VB_W},0 L${ISMAIL_VB_W},${ISMAIL_VB_H} L0,${ISMAIL_VB_H} Z`,
      cylinderPath: "",
      shadowPath: "",
      matrix: {
        a: 1 - 2 * PEEL_NX * PEEL_NX,
        b: -2 * PEEL_NX * PEEL_NY,
        c: -2 * PEEL_NX * PEEL_NY,
        d: 1 - 2 * PEEL_NY * PEEL_NY,
        e: 2 * ISMAIL_S_MAX * PEEL_NX,
        f: 2 * ISMAIL_S_MAX * PEEL_NY
      },
      cylinderGrad: { x1: 0, y1: 0, x2: 0, y2: 0 },
      hasFlap: true,
      hasCylinder: false
    };
  }

  const s0 = ISMAIL_S_MIN + t * ISMAIL_S_RANGE;
  const unpeeledPoly = clipPolygonToHalfPlane(ISMAIL_RECT, PEEL_NX, PEEL_NY, s0, true);
  const peeledPoly = clipPolygonToHalfPlane(ISMAIL_RECT, PEEL_NX, PEEL_NY, s0, false);
  const inter = findFoldIntersections(ISMAIL_VB_W, ISMAIL_VB_H, PEEL_NX, PEEL_NY, s0);

  const a = 1 - 2 * PEEL_NX * PEEL_NX;
  const b = -2 * PEEL_NX * PEEL_NY;
  const c = -2 * PEEL_NX * PEEL_NY;
  const d = 1 - 2 * PEEL_NY * PEEL_NY;
  const e = 2 * s0 * PEEL_NX;
  const f = 2 * s0 * PEEL_NY;

  let cylinderPath = "";
  let shadowPath = "";
  let gradX1 = 0, gradY1 = 0, gradX2 = 0, gradY2 = 0;
  let hasCylinder = false;

  if (inter.length >= 2) {
    const I1 = inter[0];
    const I2 = inter[1];
    const R = 20;

    const ext = 35;
    const E1: [number, number] = [I1[0] - ext * PEEL_TX, I1[1] - ext * PEEL_TY];
    const E2: [number, number] = [I2[0] + ext * PEEL_TX, I2[1] + ext * PEEL_TY];

    const C1: [number, number] = [E1[0] - R * PEEL_NX, E1[1] - R * PEEL_NY];
    const C2: [number, number] = [E2[0] - R * PEEL_NX, E2[1] - R * PEEL_NY];
    const C3: [number, number] = [E2[0] + 0.4 * R * PEEL_NX, E2[1] + 0.4 * R * PEEL_NY];
    const C4: [number, number] = [E1[0] + 0.4 * R * PEEL_NX, E1[1] + 0.4 * R * PEEL_NY];
    cylinderPath = polyToSvgPath([C1, C2, C3, C4]);

    const S1: [number, number] = [E1[0] + 0.1 * R * PEEL_NX, E1[1] + 0.1 * R * PEEL_NY];
    const S2: [number, number] = [E2[0] + 0.1 * R * PEEL_NX, E2[1] + 0.1 * R * PEEL_NY];
    const S3: [number, number] = [E2[0] + 2.5 * R * PEEL_NX, E2[1] + 2.5 * R * PEEL_NY];
    const S4: [number, number] = [E1[0] + 2.5 * R * PEEL_NX, E1[1] + 2.5 * R * PEEL_NY];
    shadowPath = polyToSvgPath([S1, S2, S3, S4]);

    const midX = (I1[0] + I2[0]) / 2;
    const midY = (I1[1] + I2[1]) / 2;
    gradX1 = midX - R * PEEL_NX;
    gradY1 = midY - R * PEEL_NY;
    gradX2 = midX + 0.4 * R * PEEL_NX;
    gradY2 = midY + 0.4 * R * PEEL_NY;
    hasCylinder = true;
  }

  return {
    unpeeledPath: polyToSvgPath(unpeeledPoly),
    peeledPath: polyToSvgPath(peeledPoly),
    cylinderPath,
    shadowPath,
    matrix: { a, b, c, d, e, f },
    cylinderGrad: { x1: gradX1, y1: gradY1, x2: gradX2, y2: gradY2 },
    hasFlap: peeledPoly.length >= 3,
    hasCylinder
  };
}

// =========================================================================
// DAHIR YUSUF: AUTHENTIC DECKLE PAPER COLLAR TEAR IN HALF (VIDEO REFERENCE)
// Natural paper tear line across the collar/upper chest (y ~ 335)
// separating the entire head & neck piece from the torso suit piece.
// =========================================================================
function createDahirTearPaths(w = 408, h = 612) {
  const steps = 40;
  const xStart = 68;
  const xEnd = 344;
  const ripLine: [number, number][] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = xStart + t * (xEnd - xStart);
    // Collar line: y=338 on left shoulder, dip to y=322 at center white t-shirt collar, rise to y=354 on right shoulder
    const baseY = 338 - 16 * Math.sin(t * Math.PI) + (t * 16);
    const noise = Math.sin(i * 1.3) * 3.2 
                + Math.cos(i * 2.7) * 2.0 
                + Math.sin(i * 5.9) * 1.2 
                + Math.cos(i * 11.3) * 0.6;
    const y = +(baseY + noise).toFixed(1);
    ripLine.push([+x.toFixed(1), y]);
  }

  // Top piece clip path (includes full head down to collar rip line with 2px resting overlap)
  let topPath = `M0,0 L${w},0 L${w},${ripLine[ripLine.length - 1][1]} `;
  for (let i = ripLine.length - 1; i >= 0; i--) {
    topPath += `L${ripLine[i][0]},${(ripLine[i][1] + 2.0).toFixed(1)} `;
  }
  topPath += `L0,${ripLine[0][1]} Z`;

  // Bottom piece clip path (includes suit torso from collar rip line down to bottom)
  let botPath = `M0,${ripLine[0][1]} `;
  for (let i = 0; i < ripLine.length; i++) {
    botPath += `L${ripLine[i][0]},${ripLine[i][1]} `;
  }
  botPath += `L${w},${ripLine[ripLine.length - 1][1]} L${w},${h} L0,${h} Z`;

  // Exposed paper deckle seam path (strictly across Dahir's body from x=68 to x=344)
  let seamPath = `M${ripLine[0][0]},${ripLine[0][1]} `;
  for (let i = 1; i < ripLine.length; i++) {
    seamPath += `L${ripLine[i][0]},${ripLine[i][1]} `;
  }

  // Left corner paper curl flap (attached to left torn shoulder seam at x=68..110)
  const p0 = ripLine[0];
  const p1 = ripLine[6];
  const flapPath = `M${p0[0]},${p0[1]} L${p1[0]},${p1[1]} L${p1[0] - 6},${p1[1] - 18} L${p0[0] + 4},${p0[1] - 22} Z`;

  return { topPath, botPath, seamPath, flapPath };
}

const DAHIR_PATHS = createDahirTearPaths(408, 612);

const TypewriterLoop = ({ mainText, subText }: { mainText: string; subText: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fullText = mainText + "|" + subText;

  useEffect(() => {
    const typingSpeed = 60;
    const deletingSpeed = 30;
    const pauseBeforeDelete = 4000;
    const pauseBeforeType = 1000;

    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
    } else if (isDeleting && displayText === "") {
      timer = setTimeout(() => setIsDeleting(false), pauseBeforeType);
    } else {
      const nextChar = isDeleting
        ? fullText.slice(0, displayText.length - 1)
        : fullText.slice(0, displayText.length + 1);

      timer = setTimeout(() => {
        setDisplayText(nextChar);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, fullText]);

  const parts = displayText.split("|");
  const renderedMain = parts[0];
  const renderedSub = parts[1];

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="italic min-h-[40px] sm:min-h-[24px]">
        {renderedMain}
        {renderedSub === undefined && (
          <span className="animate-pulse border-r-[1.5px] border-[#E0B9A0] ml-0.5 inline-block h-[0.9em] translate-y-[0.1em]"></span>
        )}
      </p>
      <p className="text-[10px] text-[#E0B9A0] uppercase tracking-widest min-h-[15px]">
        {renderedSub !== undefined ? renderedSub : ""}
        {renderedSub !== undefined && (
          <span className="animate-pulse border-r-[1.5px] border-[#E0B9A0] ml-0.5 inline-block h-[0.9em] translate-y-[0.1em]"></span>
        )}
      </p>
    </div>
  );
};

export default function Leadership() {
  const sectionRef = useRef<HTMLElement>(null);

  // Ismail Refs
  const ismailWrapperRef = useRef<HTMLDivElement>(null);
  const ismailStickerRef = useRef<SVGSVGElement>(null);
  const ismailImgClipPathRef = useRef<SVGPathElement>(null);
  const ismailFlapClipPathRef = useRef<SVGPathElement>(null);
  const ismailFlapGroupRef = useRef<SVGGElement>(null);
  const ismailCylinderPathRef = useRef<SVGPathElement>(null);
  const ismailCylinderGradRef = useRef<SVGLinearGradientElement>(null);
  const ismailShadowPathRef = useRef<SVGPathElement>(null);

  // Dahir Refs
  const dahirWrapperRef = useRef<HTMLDivElement>(null);
  const dahirTopHeadRef = useRef<HTMLDivElement>(null);
  const dahirRipShadowRef = useRef<HTMLDivElement>(null);
  const dahirBotSeamRef = useRef<SVGPathElement>(null);
  const dahirBotInnerSeamRef = useRef<SVGPathElement>(null);
  const dahirTopSeamRef = useRef<SVGPathElement>(null);
  const dahirTopInnerSeamRef = useRef<SVGPathElement>(null);
  const dahirLeftFlapRef = useRef<SVGPathElement>(null);

  // Helper to re-render Ismail's After Effects CC Page Turn peel paths
  const updateIsmailPeel = useCallback((t: number) => {
    const data = calculateCCPageTurn(t);

    if (ismailImgClipPathRef.current) {
      ismailImgClipPathRef.current.setAttribute("d", data.unpeeledPath);
    }

    if (ismailFlapClipPathRef.current) {
      ismailFlapClipPathRef.current.setAttribute("d", data.peeledPath);
    }

    if (ismailFlapGroupRef.current) {
      if (data.hasFlap) {
        const m = data.matrix;
        ismailFlapGroupRef.current.setAttribute(
          "transform",
          `matrix(${m.a.toFixed(4)}, ${m.b.toFixed(4)}, ${m.c.toFixed(4)}, ${m.d.toFixed(4)}, ${m.e.toFixed(2)}, ${m.f.toFixed(2)})`
        );
        ismailFlapGroupRef.current.style.opacity = "1";
      } else {
        ismailFlapGroupRef.current.style.opacity = "0";
      }
    }

    if (ismailCylinderPathRef.current) {
      if (data.hasCylinder && data.cylinderPath) {
        ismailCylinderPathRef.current.setAttribute("d", data.cylinderPath);
        ismailCylinderPathRef.current.style.opacity = "1";
      } else {
        ismailCylinderPathRef.current.style.opacity = "0";
      }
    }

    if (ismailCylinderGradRef.current && data.hasCylinder) {
      ismailCylinderGradRef.current.setAttribute("x1", data.cylinderGrad.x1.toFixed(1));
      ismailCylinderGradRef.current.setAttribute("y1", data.cylinderGrad.y1.toFixed(1));
      ismailCylinderGradRef.current.setAttribute("x2", data.cylinderGrad.x2.toFixed(1));
      ismailCylinderGradRef.current.setAttribute("y2", data.cylinderGrad.y2.toFixed(1));
    }

    if (ismailShadowPathRef.current) {
      if (data.hasCylinder && data.shadowPath) {
        ismailShadowPathRef.current.setAttribute("d", data.shadowPath);
        ismailShadowPathRef.current.style.opacity = "0.75";
      } else {
        ismailShadowPathRef.current.style.opacity = "0";
      }
    }
  }, []);

  // -----------------------------------------------------------------------
  // DEDICATED SCROLLTRIGGERS FOR NATURAL SCROLL-DRIVEN TACTILE EFFECTS
  // 1. Ismail: CC Page Turn Sticker Peel (Top-to-Bottom Sweep)
  //    lifts in 3D and peels away. ZERO rectangular card background.
  // 2. Dahir: Ripped side to side upon scroll through, top head piece separates.
  // -----------------------------------------------------------------------
  useGSAP(() => {
    // Initial resting state: 0 (100% attached pristine silhouette cutout)
    updateIsmailPeel(0);

    // 1. ISMAIL SCROLLTRIGGER: CC Page Turn Sticker Peel (Top-to-Bottom Sweep)
    if (ismailWrapperRef.current) {
      ScrollTrigger.create({
        trigger: ismailWrapperRef.current,
        start: "top 45%",
        end: "bottom -10%",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress; // 0 -> 1

          if (p <= 0.08) {
            // 100% attached, flat, pristine resting state while reading bio
            updateIsmailPeel(0);
            if (ismailStickerRef.current) {
              ismailStickerRef.current.style.transform = "perspective(1000px) translate3d(0, 0, 0)";
              ismailStickerRef.current.style.opacity = "1";
            }
          } else if (p < 0.74) {
            // Active CC Page Turn Peel sweeping across the sticker
            const peelT = (p - 0.08) / 0.66;
            updateIsmailPeel(peelT);
            if (ismailStickerRef.current) {
              ismailStickerRef.current.style.transform = "perspective(1000px) translate3d(0, 0, 0)";
              ismailStickerRef.current.style.opacity = "1";
            }
          } else {
            // Fully peeled: sticker lifts off physically in 3D and exits
            updateIsmailPeel(1);
            if (ismailStickerRef.current) {
              const liftP = (p - 0.74) / 0.26;
              const transX = liftP * 65;
              const transY = -liftP * 340;
              const transZ = liftP * 50;
              const rotZ = -liftP * 14;
              const rotX = -liftP * 12;
              const rotY = liftP * 8;
              const opacity = Math.max(0, 1 - Math.pow(liftP, 1.4));

              ismailStickerRef.current.style.transform = `perspective(1000px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${transZ.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
              ismailStickerRef.current.style.opacity = `${opacity.toFixed(2)}`;
            }
          }
        }
      });
    }

    // 2. DAHIR SCROLLTRIGGER: Ripped from side to side upon scroll through (Video Reference)
    if (dahirWrapperRef.current && dahirTopHeadRef.current && dahirRipShadowRef.current) {
      const topHead = dahirTopHeadRef.current;
      const shadow = dahirRipShadowRef.current;
      const botSeam = dahirBotSeamRef.current;
      const botInnerSeam = dahirBotInnerSeamRef.current;
      const topSeam = dahirTopSeamRef.current;
      const topInnerSeam = dahirTopInnerSeamRef.current;
      const leftFlap = dahirLeftFlapRef.current;

      const seams = [botSeam, botInnerSeam, topSeam, topInnerSeam].filter(Boolean) as SVGPathElement[];
      seams.forEach((seam) => {
        seam.style.strokeDasharray = "450";
        seam.style.strokeDashoffset = "450";
        seam.style.opacity = "0";
      });

      if (leftFlap) {
        leftFlap.style.opacity = "0";
      }

      ScrollTrigger.create({
        trigger: dahirWrapperRef.current,
        start: "top 45%",
        end: "bottom -15%",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress; // 0 -> 1

          if (p <= 0.18) {
            // 1. Intact Pristine State: While reading micro-bio, 100% attached, solid sticker
            seams.forEach((s) => {
              s.style.opacity = "0";
              s.style.strokeDashoffset = "450";
            });
            if (leftFlap) leftFlap.style.opacity = "0";
            topHead.style.transform = "none";
            topHead.style.opacity = "1";
            shadow.style.opacity = "0";
          } else if (p < 0.52) {
            // 2. Progressive Left-to-Right Collar Tear Propagation
            const ripP = (p - 0.18) / 0.34; // 0 -> 1
            const dashOffset = (1 - ripP) * 450;
            seams.forEach((s) => {
              s.style.opacity = "1";
              s.style.strokeDashoffset = `${dashOffset.toFixed(1)}`;
            });
            if (leftFlap) {
              leftFlap.style.opacity = `${(ripP * 0.95).toFixed(2)}`;
            }
            // Pinned to right shoulder anchor as left corner tears and curls up
            topHead.style.transformOrigin = "92% 58%";
            const rotZ = -ripP * 3.8;
            const rotX = ripP * 6.5;
            const transX = -ripP * 3.0;
            const transY = -ripP * 6.0;
            const transZ = ripP * 14.0;
            topHead.style.transform = `perspective(1000px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${transZ.toFixed(1)}px) rotateZ(${rotZ.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
            topHead.style.opacity = "1";
            shadow.style.opacity = `${(ripP * 0.7).toFixed(2)}`;
          } else {
            // 3. Complete Severance: Upper head & neck piece lifts away in 3D and floats off
            seams.forEach((s) => {
              s.style.opacity = "1";
              s.style.strokeDashoffset = "0";
            });
            if (leftFlap) leftFlap.style.opacity = "1";
            const sepP = (p - 0.52) / 0.48; // 0 -> 1
            const y = -6 - Math.pow(sepP, 1.25) * 280;     // accelerates upward
            const x = -3 - Math.pow(sepP, 1.1) * 75;       // drifts left
            const z = 14 + sepP * 60;                      // floats forward
            const rotZ = -3.8 - sepP * 14.0;               // tilts
            const rotX = 6.5 - sepP * 24.0;                // 3D paper curl
            const rotY = -sepP * 14.0;
            const opacity = Math.max(0, 1 - Math.pow(sepP, 1.4));

            topHead.style.transformOrigin = "center center";
            topHead.style.transform = `perspective(1000px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
            topHead.style.opacity = `${opacity.toFixed(2)}`;
            shadow.style.opacity = `${(0.7 * (1 - sepP)).toFixed(2)}`;
          }
        }
      });
    }
  }, { scope: sectionRef, dependencies: [updateIsmailPeel] });

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="relative w-full bg-[#2D2926] text-[#FAF8F5] select-none py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
    >
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute top-1/4 right-0 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-[#E0B9A0]/10 rounded-full blur-[120px] sm:blur-[180px] pointer-events-none translate-x-1/3"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] sm:w-[650px] h-[300px] sm:h-[650px] bg-[#AE917E]/10 rounded-full blur-[120px] sm:blur-[170px] pointer-events-none -translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24 lg:mb-28">
          <AnimatedBlock delay={0}>
            <div className="flex items-center justify-center gap-4 mb-2 sm:mb-3">
              <span className="w-8 sm:w-12 h-px bg-[#E0B9A0]/50"></span>
              <span className="text-[#E0B9A0] font-display text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase flex items-center gap-2 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_6px_#E0B9A0]" />
                Executive Leadership &bull; 04
              </span>
              <span className="w-8 sm:w-12 h-px bg-[#E0B9A0]/50"></span>
            </div>
          </AnimatedBlock>

          <AnimatedHeading>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-3 sm:mb-4">
              Leadership <span className="text-[#E0B9A0]">At Yanhal</span>
            </h2>
          </AnimatedHeading>

          <AnimatedBlock delay={0.1}>
            <p className="text-xs sm:text-sm md:text-base text-stone-300/90 max-w-2xl mx-auto font-light leading-relaxed">
              Driven by vision and executed with precision. Meet the minds steering Yanhal Holdings toward structural excellence.
            </p>
          </AnimatedBlock>
        </div>

        {/* ================================================================ */}
        {/* LEADER 01: ISMAIL ABDIRAHMAN (CEO) - PURE SILHOUETTE STICKER PEEL */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-center mb-24 sm:mb-32 lg:mb-40">
          
          {/* Ismail Editorial Details & Micro-Bio */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 order-2 lg:order-1">
            <div className="inline-flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-mono tracking-[0.25em] uppercase bg-[#E0B9A0]/15 text-[#E0B9A0] rounded border border-[#E0B9A0]/30 font-semibold">
                ABOUT &bull; THIS GUY
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#E0B9A0]/70 uppercase hidden sm:inline">
                [ SCROLL TO PEEL ]
              </span>
            </div>

            <div>
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tight leading-[1.05]">
                {LEADERS[0].name}
              </h3>
              <p className="text-[#E0B9A0] font-display text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase mt-2">
                {LEADERS[0].role}
              </p>
            </div>

            {/* Punchy tagline */}
            <div className="relative pl-5 sm:pl-6 border-l-2 border-[#E0B9A0]">
              <p className="text-base sm:text-lg lg:text-xl text-[#FAF8F5] font-display font-semibold tracking-wide">
                "{LEADERS[0].hook}"
              </p>
            </div>

            {/* Brief & Funny Casual Bio (speaking to friends) */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-sm space-y-4">
              <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed">
                {LEADERS[0].microBio}
              </p>
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                {LEADERS[0].tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 text-xs text-[#E0B9A0] bg-[#E0B9A0]/10 border border-[#E0B9A0]/20 rounded-full font-mono text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ismail Hero Photographic Silhouette Sticker (NO Background, NO Frame, Pure Sticker Silhouette Peel) */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div
              ref={ismailWrapperRef}
              id="ismail-sticker-wrap"
              role="img"
              aria-label="Ismail Abdirahman Die Cut Sticker"
              className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] aspect-[420/600] flex items-center justify-center select-none"
            >
              <svg
                ref={ismailStickerRef}
                viewBox="0 0 420 600"
                shapeRendering="geometricPrecision"
                className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter overflow-visible will-change-transform"
                style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.8))" }}
              >
                <defs>
                  {/* Silhouette Alpha Mask to guarantee ZERO bleed beyond leader's cutout silhouette */}
                  <filter id="ismail-alpha-to-white">
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                    />
                  </filter>

                  <mask id="ismail-silhouette-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="600">
                    <image
                      href={LEADERS[0].coverUrl}
                      x="0"
                      y="0"
                      width="420"
                      height="600"
                      preserveAspectRatio="xMidYMid meet"
                      filter="url(#ismail-alpha-to-white)"
                    />
                  </mask>

                  {/* Soft blur filter for contact shadow under curled flap */}
                  <filter id="cp-blur-ismail" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>

                  {/* Tactile Paper Sticker Adhesive Backing Gradient */}
                  <linearGradient id="ismail-paper-back" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FAF8F5" />
                    <stop offset="60%" stopColor="#EDE6D6" />
                    <stop offset="100%" stopColor="#DDD3BF" />
                  </linearGradient>

                  {/* 3D Cylindrical Roll Highlight Gradient (oriented along peel normal) */}
                  <linearGradient
                    id="ismail-cylinder-grad"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    ref={ismailCylinderGradRef}
                  >
                    <stop offset="0%" stopColor="#25211E" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#A89E8D" stopOpacity="0.85" />
                    <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="72%" stopColor="#FAF8F5" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
                  </linearGradient>

                  {/* Clip path for unpeeled base */}
                  <clipPath id="cp-img-clip-ismail">
                    <path ref={ismailImgClipPathRef} d="M0,0 L420,0 L420,600 L0,600 Z" />
                  </clipPath>

                  {/* Clip path for peeled region (in local coordinates) */}
                  <clipPath id="cp-peeled-clip-ismail">
                    <path ref={ismailFlapClipPathRef} d="" />
                  </clipPath>
                </defs>

                {/* 1. Pure Leader Cutout Photo Sticker (ZERO Frame, ZERO Box, ZERO Card Behind Him) */}
                <image
                  href={LEADERS[0].coverUrl}
                  x="0"
                  y="0"
                  width="420"
                  height="600"
                  preserveAspectRatio="xMidYMid meet"
                  clipPath="url(#cp-img-clip-ismail)"
                />

                {/* 2. Soft Contact Drop Shadow under the roll (clipped to unpeeled base) */}
                <g clipPath="url(#cp-img-clip-ismail)" mask="url(#ismail-silhouette-mask)">
                  <path
                    ref={ismailShadowPathRef}
                    fill="rgba(0,0,0,0.65)"
                    filter="url(#cp-blur-ismail)"
                    style={{ opacity: 0 }}
                  />
                </g>

                {/* 3. Reflected Flap - Back of the sticker (exact reflected silhouette of Ismail) */}
                <g
                  ref={ismailFlapGroupRef}
                  clipPath="url(#cp-peeled-clip-ismail)"
                  mask="url(#ismail-silhouette-mask)"
                  style={{ opacity: 0, willChange: "transform" }}
                >
                  {/* Tactile paper adhesive backing with clean matte finish */}
                  <rect
                    x="0"
                    y="0"
                    width="420"
                    height="600"
                    fill="url(#ismail-paper-back)"
                    stroke="#DDD4C4"
                    strokeWidth="1"
                  />
                </g>

                {/* 4. Roll Cylinder 3D Specular Highlight & Crease Strip */}
                <g mask="url(#ismail-silhouette-mask)">
                  <path
                    ref={ismailCylinderPathRef}
                    fill="url(#ismail-cylinder-grad)"
                    style={{ opacity: 0 }}
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ARCHITECTURAL SEPARATOR */}
        {/* ================================================================ */}
        <div className="relative py-8 sm:py-12 flex items-center justify-center my-6 sm:my-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E0B9A0]/30 to-transparent"></div>
          <div className="absolute px-4 bg-[#2D2926] text-[#E0B9A0] flex items-center gap-3">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#E0B9A0]/80"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#AE917E]">
              ENTERPRISE &bull; EXECUTION
            </span>
            <span className="w-1.5 h-1.5 rotate-45 bg-[#E0B9A0]/80"></span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* LEADER 02: DAHIR YUSUF (PM) - RIPPED SIDE TO SIDE ON SCROLL */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-center mt-24 sm:mt-32 lg:mt-40 mb-16 sm:mb-24">
          
          {/* Dahir Hero Photographic Silhouette Object (No Box, Head Rips Completely on Scroll) */}
          <div className="lg:col-span-5 flex justify-center order-1">
            <div
              ref={dahirWrapperRef}
              id="dahir-sticker-wrap"
              role="img"
              aria-label="Dahir Yusuf Torn Head Sticker"
              className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] aspect-[408/612] flex items-end justify-center select-none"
            >
              {/* Lower Piece: Shoulders & Suit Torso up to collar tear seam */}
              <div
                className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none select-none"
                style={{
                  filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.85))"
                }}
              >
                <svg
                  viewBox="0 0 408 612"
                  className="w-full h-full max-h-full overflow-visible"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <filter id="dahir-alpha-to-white-bot">
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                      />
                    </filter>
                    <mask id="dahir-mask-bot" maskUnits="userSpaceOnUse" x="0" y="0" width="408" height="612">
                      <image
                        href={LEADERS[1].coverUrl}
                        x="0"
                        y="0"
                        width="408"
                        height="612"
                        preserveAspectRatio="xMidYMid meet"
                        filter="url(#dahir-alpha-to-white-bot)"
                      />
                    </mask>
                    <clipPath id="dahir-clip-bot" clipPathUnits="userSpaceOnUse">
                      <path d={DAHIR_PATHS.botPath} />
                    </clipPath>
                  </defs>

                  <g mask="url(#dahir-mask-bot)">
                    <image
                      href={LEADERS[1].coverUrl}
                      x="0"
                      y="0"
                      width="408"
                      height="612"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#dahir-clip-bot)"
                    />
                    {/* Exposed cotton deckle paper bottom fiber border */}
                    <path
                      ref={dahirBotSeamRef}
                      d={DAHIR_PATHS.seamPath}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      style={{ opacity: 0 }}
                    />
                    <path
                      ref={dahirBotInnerSeamRef}
                      d={DAHIR_PATHS.seamPath}
                      fill="none"
                      stroke="#E6DFD3"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      style={{ opacity: 0 }}
                    />
                  </g>
                </svg>
              </div>

              {/* Dynamic Contact Shadow cast by ripped piece onto suit lapel */}
              <div
                ref={dahirRipShadowRef}
                className="absolute top-[52%] left-[6%] right-[6%] h-12 bg-black/90 rounded-full blur-lg pointer-events-none opacity-0 will-change-transform"
              />

              {/* Upper Torn Piece: Head, Sunglasses, Beard & Neck - rips off cleanly on scroll */}
              <div
                ref={dahirTopHeadRef}
                className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none select-none will-change-transform"
                style={{
                  filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.85))",
                  transformOrigin: "bottom center"
                }}
              >
                <svg
                  viewBox="0 0 408 612"
                  className="w-full h-full max-h-full overflow-visible"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <filter id="dahir-alpha-to-white-top">
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                      />
                    </filter>
                    <mask id="dahir-mask-top" maskUnits="userSpaceOnUse" x="0" y="0" width="408" height="612">
                      <image
                        href={LEADERS[1].coverUrl}
                        x="0"
                        y="0"
                        width="408"
                        height="612"
                        preserveAspectRatio="xMidYMid meet"
                        filter="url(#dahir-alpha-to-white-top)"
                      />
                    </mask>
                    <linearGradient id="dahir-paper-back" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="25%" stopColor="#FAF8F5" />
                      <stop offset="60%" stopColor="#EDE6D6" />
                      <stop offset="100%" stopColor="#DDD3BF" />
                    </linearGradient>
                    <clipPath id="dahir-clip-top" clipPathUnits="userSpaceOnUse">
                      <path d={DAHIR_PATHS.topPath} />
                    </clipPath>
                  </defs>

                  <g mask="url(#dahir-mask-top)">
                    <image
                      href={LEADERS[1].coverUrl}
                      x="0"
                      y="0"
                      width="408"
                      height="612"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#dahir-clip-top)"
                    />
                    {/* Exposed cotton deckle paper top fiber border */}
                    <path
                      ref={dahirTopSeamRef}
                      d={DAHIR_PATHS.seamPath}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      style={{ opacity: 0 }}
                    />
                    <path
                      ref={dahirTopInnerSeamRef}
                      d={DAHIR_PATHS.seamPath}
                      fill="none"
                      stroke="#E6DFD3"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      style={{ opacity: 0 }}
                    />
                    {/* Left curled torn paper flap showing adhesive paper backing */}
                    <path
                      ref={dahirLeftFlapRef}
                      d={DAHIR_PATHS.flapPath}
                      fill="url(#dahir-paper-back)"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      style={{ opacity: 0 }}
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Dahir Editorial Details & Micro-Bio */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 order-2">
            <div className="inline-flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-mono tracking-[0.25em] uppercase bg-[#E0B9A0]/15 text-[#E0B9A0] rounded border border-[#E0B9A0]/30 font-semibold">
                ABOUT &bull; THIS DUDE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#E0B9A0]/70 uppercase hidden sm:inline">
                [ SCROLL TO RIP ]
              </span>
            </div>

            <div>
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tight leading-[1.05]">
                {LEADERS[1].name}
              </h3>
              <p className="text-[#E0B9A0] font-display text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase mt-2">
                {LEADERS[1].role}
              </p>
            </div>

            {/* Punchy tagline */}
            <div className="relative pl-5 sm:pl-6 border-l-2 border-[#E0B9A0]">
              <p className="text-base sm:text-lg lg:text-xl text-[#FAF8F5] font-display font-semibold tracking-wide">
                "{LEADERS[1].hook}"
              </p>
            </div>

            {/* Brief & Funny Casual Bio (speaking to friends) */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-sm space-y-4">
              <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed">
                {LEADERS[1].microBio}
              </p>
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                {LEADERS[1].tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 text-xs text-[#E0B9A0] bg-[#E0B9A0]/10 border border-[#E0B9A0]/20 rounded-full font-mono text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quranic Reflection / Striving Quote */}
        <AnimatedBlock delay={0.2}>
          <div className="mt-16 sm:mt-24 text-center border-t border-white/10 pt-10 sm:pt-14">
            <div className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto font-light px-2">
              <TypewriterLoop
                mainText="“And that there is not for man except that [good] for which he strives.”"
                subText="— Surah An-Najm (53:39)"
              />
            </div>
          </div>
        </AnimatedBlock>
      </div>
    </section>
  );
}
