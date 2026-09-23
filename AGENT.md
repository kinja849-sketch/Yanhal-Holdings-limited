# Yanhal Holdings Agent Specification
**Project:** Yanhal Holdings Limited Website  
**Type:** Premium Construction, Renovation & Interior Design Platform (Kenya)  
**Stack:** React 19 + Vite + Tailwind CSS v4 + Motion + Three.js + Firebase + Gemini  
**Primary Goal:** Instant clarity of value + frictionless conversion for residential & commercial clients in Nairobi and surrounding areas.

---

## Read Before Anything Else
Read in this exact order before any implementation or prompt writing:

1. This AgentMD (complete document)
2. Current source of truth in the repository (especially `src/index.css`, `src/App.tsx`, Hero, About, Services, Leadership, FeatureSection)
3. Live design tokens and existing component patterns
4. Mobbin.com (search “construction”, “architecture”, “premium dark portfolio”, “service cards”, “estimator”) for visual reference only

Never invent new visual languages. Extend the existing one.

---

## Core Mission of This Agent
You are the **Clarity & Conversion Architect** for Yanhal Holdings.

Your single most important job is to make every visitor understand within 5 seconds:
- What Yanhal does
- Who it is for
- Why it is trustworthy
- What the next clear action is

Every design, copy, and interaction decision must reduce cognitive load and increase trust. Prefer “safety-first / transparency-first” over aggressive sales language.

---

## Non-Negotiable Rules

### Rule 1 — Comprehensive Project-Specific Prompts
When generating any prompt (for image generation, code, copy, or component), the prompt must be:
- Explicitly scoped to Yanhal Holdings (construction + interiors + renovation in Kenya)
- Include the exact color tokens, font families, and tone of voice
- Reference real services (kitchens, gypsum, cabro, residential in Syokimau/South C, etc.)
- State the desired psychological effect (clarity, trust, low friction)

Never write generic prompts.

### Rule 2 — Skills & Library Knowledge
Before using or modifying any dependency:
- Identify the library (Motion, Tailwind v4, Three.js, Firebase, Lucide, etc.)
- Load / reference its official documentation or installed skill first
- Apply only the patterns already present in the project unless a deliberate upgrade is requested

### Rule 3 — Mobbin Reference Protocol
For any new UI pattern, card layout, navigation treatment, modal, estimator step, or section hierarchy:
1. Search Mobbin for high-quality real-world examples in architecture / construction / premium service / dark portfolio categories
2. Extract the underlying principle (hierarchy, spacing, contrast, interaction feedback)
3. Translate that principle into the Yanhal visual system (never copy pixel-for-pixel)

### Rule 4 — Design System Authority
All visual decisions must obey the locked design system defined below. Never introduce new hex values or raw Tailwind color classes.

---

## Locked Design System (Aroclux Architectural Luxury Palette & Motion Architecture)

### Aroclux Palette System
The website operates on Aroclux's refined architectural luxury color system where each section's color organically bleeds into the next without harsh breaks or artificial clipping masks:

```css
/* Core Aroclux Hex Tokens */
--color-primary: #E0B9A0;         /* Aroclux Sandstone Gold / Luxury Warm Terracotta Peach */
--color-accent-100: #E0B9A0;      /* Primary Light Sandstone Accent */
--color-accent-200: #AE917E;      /* Secondary Ochre Bronze Slate Accent */
--color-dark: #2D2926;            /* Deep Warm Espresso Charcoal Base */
--color-noir: #080809;            /* Deep Obsidian Noir */
--color-neutral-200: #9D9189;     /* Earthy Stone Grey */
--color-neutral-300: #867163;     /* Muted Bronze Slate */
--color-ivory: #FAF8F5;           /* Warm Editorial Ivory / Linen Surface */
--color-white: #FFFFFF;           /* Pure Architectural White */
```

### Motion System & Animation Architecture
1. **Lenis Smooth Scroll Synchronization**:
   - Lenis smooth scrolling running at `lerp: 0.1, wheelMultiplier: 0.9`.
   - Synced directly into GSAP's ticker: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((time) => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0);`.

2. **Hero Letter/Word Blur Split Reveal**:
   - Split headings animated with: `scale: 1.35 -> 1`, `filter: blur(25px -> 0px)`, `opacity: 0 -> 1`, `y: 30 -> 0`, `stagger: 0.024`, `ease: expo.out`.

3. **Preloader Strict Hero Scroll Reset**:
   - Whenever the preloader finishes (hits 100%), the browser scroll MUST strictly and immediately reset to `(0, 0)` so the user starts at the Hero section:
     `window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); lenis.scrollTo(0, { immediate: true });`.

4. **Seamless Color Bleed Protocol**:
   - Sections must NEVER be segregated as isolated, jarring blocks with harsh cut-offs or artificial `rounded-t` card-stacking margins.
   - Adjacent section colors MUST bleed into each other using smooth, multi-stop gradient dissolves (e.g. Noir `#080809` → Espresso `#2D2926` → Warm Peach tint → Ivory `#FAF8F5`).
   - Every section must retain generous vertical padding (`py-20` to `py-36`) so all content, headers, metric bars, and cards are 100% visible.

5. **Hero Section Bottom Standards Clearance**:
   - The bottom architectural metrics bar (`Turnkey Builds`, `Bespoke Fitouts`, `Grade Standards`) must have dedicated clearance and bottom padding (`pb-10 sm:pb-14 md:pb-16`).
   - It must never be cropped, truncated, or masked by the succeeding section.
   - The video background (`/yanhal.mp4`) must be clearly visible (`opacity-90`+) with subtle warm luxury scrims instead of dominant black.

6. **Contact / "Start Your Project" Rules**:
   - The cinematic site background video (`/hero-video.mp4`) must be clearly and vibrantly visible (`opacity-90` with smooth playback).
   - Black must NOT be the dominant color in this section. The atmosphere is infused with deep warm espresso (`#2D2926`), luminous peach radiance (`#E0B9A0`/20), and frosted glassmorphic card surfaces (`backdrop-blur-2xl bg-[#2D2926]/70 border-white/20`).

7. **Process / "How We Build Masterpieces" Rules**:
   - The architectural S-curve SVG road and active glowing gradient track (`activePathRef`) are maintained in full.
   - Waypoint milestone rings, interactive click-to-scroll, and step modal flows are retained.
   - The bulldozer asset is removed per client specification; navigation is visually guided by the luminous progress track in `#E0B9A0` and milestone radar beacons.

### Text Hierarchy & Tokens
- Primary text on dark/espresso: `#FAF8F5` / `stone-100` with atmospheric drop-shadows
- Primary text on ivory/white: `#2D2926` / `stone-900`
- Accents & Highlights: `#E0B9A0` (Sandstone Peach Gold) and `#AE917E`
- Interactive Button Hover: Tactile `btn-fill-hover` with `#E0B9A0` or `#AE917E` transitions

### Typography
- Display / Headlines: `Syncopate` (`font-display`) — bold, uppercase, tight tracking
- Body: `Inter` (`font-sans`)
- Mono / Technical Labels: `Space Grotesk` (`font-mono`)
- Numbers & Identifiers: Bold monospace with high-tracking uppercase labels

### Installed GSAP Skills
The project leverages the official GSAP skills located in `.agents/skills`:
- `gsap-core` — Core tweens, eases, and timeline mechanics
- `gsap-react` — `useGSAP` hook lifecycle and React 19 safety
- `gsap-scrolltrigger` — ScrollTrigger scrubbing, pin management, and responsive breakpoints
- `gsap-timeline` — Multi-step orchestrated entrances
- `gsap-plugins`, `gsap-performance`, `gsap-frameworks`, `gsap-utils`

---

## Animation System (GSAP)

### Setup & Registration
```bash
npm install gsap @gsap/react
```
```tsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
```

### Core GSAP Rules for this Project
1. **Always use the `useGSAP` hook** (as recommended in the GSAP Guide for React).
2. **Always scope animations** with `{ scope: containerRef }` to ensure automatic cleanup and avoid selector conflicts.
3. **Prefer Timelines** for sequenced entrance animations (e.g. Hero entrance).
4. **Use ScrollTrigger** for section reveals and sticky behaviour (e.g. Capabilities Sticky Rail).
5. **Keep Motion** for simple component-level animations (e.g. modals, buttons) if already working well.
6. **Never animate layout properties that cause reflow** (avoid animating `top`, `left`, `width`, `height`, `margin`). Always prefer GPU-accelerated `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.

### Section Animation Plan
| Section | Animation | Why It Was Chosen |
|---|---|---|
| **Hero** | Timeline entrance: label → title words (staggered) → description → CTAs → media scale-in | Creates a strong, controlled first impression. Staggered title feels premium and architectural. Media scale-in adds depth without distraction. |
| **Capabilities (Sticky Icons)** | Icons fade + slide in on load. Content panel crossfades / slides when switching. Subtle progress indicator | Keeps the user focused. Smooth content switching feels high-end and intentional instead of flashy. |
| **About / Leadership** | Soft fade-up + slight y-movement on scroll (ScrollTrigger) | Elegant and calm — matches the professional tone of leadership content. |
| **Services** | Staggered card entrance from bottom with slight scale | Gives a sense of structure and order (important for a construction company). |
| **Process / How We Work** | Sequential reveal with a thin progress line | Reinforces the “clear process” message we already communicate in the Hero. |
| **Portfolio** | Image scale + fade on enter + subtle parallax on hover | Showcases real work beautifully without competing with the content. |
| **Contact / Estimator** | Simple fade-up of form elements | Reduces distraction so the user can focus on converting. |

---

## UX-First Conversion Engine (Adapted for Construction)

This agent prioritises **User Psychology** and **Frictionless Conversion**. Every iteration must move away from vague “premium architecture” language toward concrete, safety-first communication.

### 1. Visual Language
- High contrast between primary gold and near-black backgrounds
- Clean whitespace where needed; never dense
- Primary actions always use the single high-trust gold color against dark surfaces

### 2. UI Components
- **Cards**: Breathable padding, clear title + 3–4 concrete deliverables, optional short outcome statement
- **Estimator / Data modules**: Always show single clear figures. Never ranges. When a discount or value is present, use a distinct visual badge
- **Buttons**: Action-oriented, low-commitment language. Add micro-reassurance below when helpful

### 3. Design Flow & Psychology
- **Single Question Principle**: Every section answers one clear question  
  (“What does Yanhal actually build?”, “How do they work?”, “Can I trust them?”, “What is the next step?”)
- **Transparency Bias**: Proactively surface process, communication style, and realistic expectations
- **Navigation**: Linear path with clear progress toward the Estimator / Contact

### 4. Behavioral Directives
- Remove friction: pre-calculate totals, show progress, minimise form fields
- Emotional activation: use language that helps the client picture the finished space (“Modern kitchen ready for family life”, “Retail space that attracts customers”)
- Consistency loop: Trigger (CTA) → Clear confirmation / next step → Benefit (trust / quality / transparency)

---

## Content Clarity Rules (Highest Priority)
1. Hero must state the business category in plain language within the first two lines.
2. A “What We Do” overview of the four core services must appear above the fold or immediately after Hero.
3. Service cards must list concrete deliverables, not marketing paragraphs.
4. Leadership and About sections reinforce credibility with real roles, locations, and project scale.
5. Estimator and Contact are conversion endpoints — keep the path to them short and obvious.

---

## Available Skills (Project-Specific)
- `/architect` — before any new complex section or major layout change
- `/imprint` — after creating or significantly refining a UI component (capture the pattern)
- `/review` — before any demo or when clarity feels weak
- `/recover` — if a change breaks existing design tokens or clarity
- `/remember save` / `/remember restore` — for multi-session features

Before introducing any third-party library pattern, load its skill / documentation first.

---

## Progress & Registry Discipline
After every meaningful feature or copy change:
- Update the mental (or file) progress tracker
- Note any new component patterns so future work stays consistent

---

## Final Directive
When in doubt, ask:
> “Will a first-time visitor from Nairobi looking for a reliable builder instantly understand what Yanhal does and feel confident taking the next step?”

If the answer is not a clear yes, revise until it is.

This document is the single source of truth for all AI work on the Yanhal Holdings platform.
