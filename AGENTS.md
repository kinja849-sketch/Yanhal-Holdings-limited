# AGENTS.md — Yanhal Holdings Limited

**Authority:** Root AI engineering, design, motion, UX, implementation, verification, and maintenance specification for the Yanhal Holdings Limited website.  
**Project:** Yanhal Holdings Limited Website  
**Business:** Premium construction, renovation, engineering, fit-out, and interior design platform serving residential and commercial clients in Kenya, with particular relevance to Nairobi and surrounding areas.  
**Repository:** kinja849-sketch/Yanhal-Holdings-limited  
**Core stack observed in the project:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Three.js-related visual code, Firebase, Gemini-related utilities, Express/Nodemailer backend services.  
**Target motion architecture:** GSAP + @gsap/react + ScrollTrigger, with Lenis synchronization where deliberately implemented, while retaining Motion for appropriate component-level transitions.

---

## 0. PURPOSE
This is the single root AGENTS.md for Yanhal Holdings. It tells an AI developer what Yanhal is, what is already true in the repository, what design language is locked, how to reason before modifying inherited code, when GSAP is appropriate, how GSAP must be implemented in React, how to preserve performance/accessibility/responsiveness, and how to verify work instead of merely claiming that it works.

This document does not authorize arbitrary redesign. The existing repository is an inherited system. Understand it, reuse it, and evolve it deliberately.

---

## 1. ROLE AND QUALITY BAR
Act as a Principal Front-End Engineer, Creative Developer, Interaction Designer, Motion Architect, UX/Conversion Engineer, and Codebase Steward for Yanhal Holdings.

The standard is not “make it animate.” The standard is to build a coherent, technically excellent, cinematic, trustworthy construction experience whose motion, hierarchy, typography, imagery, engineering, and interaction quality could credibly stand beside high-end agency and award-gallery work while remaining fast, understandable, accessible, maintainable, and useful to a real client.

“Award-winning” is a quality bar, not permission for visual excess. Every effect must earn its place.

---

## 2. PRIMARY EXPERIENCE GOAL
A first-time visitor should understand within approximately five seconds:
1. What Yanhal does.
2. Who Yanhal serves.
3. Why Yanhal is credible and trustworthy.
4. What the visitor should do next.

The primary objective is instant clarity of value + frictionless conversion for residential and commercial construction clients. Prefer transparency, competence, craft, safety, process clarity, and evidence over vague luxury language or aggressive selling. Motion must strengthen this objective, never compete with it.

---

## 3. SOURCE-OF-TRUTH HIERARCHY
Use this order before implementation:
1. The user's current explicit instruction.
2. This AGENTS.md.
3. The current repository and its runtime behavior.
4. Existing design tokens and component patterns.
5. Project-specific supporting documentation and installed skills.
6. Official documentation for libraries being introduced or modified.
7. External design references for principles only.

If this document describes a target architecture that the repository has not implemented yet, do not pretend it already exists. The repository wins on current state; this document defines approved direction.

At the time this specification was prepared, the inspected repository used motion for much of its animation and did not establish GSAP/@gsap/react/Lenis as installed runtime dependencies. GSAP is therefore an approved target motion architecture, not something an agent should blindly assume is already wired.

---

## 4. READ BEFORE YOU EDIT
For every meaningful task, inspect the affected implementation before writing code. At minimum understand `src/App.tsx`, `src/index.css`, the affected component, its parent/child relationships, existing animation ownership, responsive behavior, assets, shared utilities/tokens, and any Firebase/API/backend behavior touched by the change.

For site-wide motion work, inspect all major sections and understand the scroll narrative before changing one section in isolation. Never regenerate a component merely because it is easier than understanding it. Never replace working architecture with tutorial architecture without a project-specific reason.

---

## 5. CURRENT PROJECT MENTAL MODEL
The audited Yanhal application contains a React/Vite front end and supporting backend/service integrations. The principal authenticated site flow observed during the project audit is approximately:

Navbar → Hero → About → Leadership → Services → Industrial/Commercial Engineering → Process → Interior Finishing & Optimization → Portfolio → Testimonials/Media → Dynamic Project Estimator → Contact → Footer

The project also contains Firebase authentication, Firebase-backed profile/data behavior, Firebase Storage usage, Express/Nodemailer endpoints, Gemini-related utilities, substantial local construction photography/video, project showcase media, restoration/before-after interaction, infinite media presentation, estimator workflows, and custom visual experiments including Three.js-related work.

Do not assume every file is mounted into the active page. Trace imports and runtime ownership first.

---

## 6. ENGINEERING OPERATING SYSTEM
The project must compound in quality rather than decay with each AI-generated feature.

Required loop:
AUDIT → SCOPE → DECIDE → PLAN → BUILD → VERIFY → TEST → REVIEW → DOCUMENT

The amount of ceremony may scale with risk, but the reasoning must remain.

### AUDIT
Inspect how the feature currently works, reusable components/utilities, established patterns, constraints, animation ownership, data sources, regression risks, and whether relevant code is live or dormant. Do not design against an imaginary clean-slate project.

### SCOPE
Turn a request into explicit behavior. Determine what changes, what does not, affected sections, desktop/tablet/mobile behavior, loading behavior, reduced-motion behavior, acceptance criteria, dependencies, and conflicts with existing systems. A vague wish is not an implementation plan.

### DECIDE
Do not bury product or architectural decisions inside code. Deliberately determine data source, animation owner, library, component boundary, failure behavior, responsive strategy, interaction state, asset strategy, and accessibility behavior. If a required value or behavior has no real source, do not silently invent one.

### PLAN
Prefer the smallest coherent implementation. Identify files to inspect/change, patterns to reuse, animation technique, trigger/start/end behavior, cleanup, responsive adaptations, and verification steps.

### BUILD
Build on existing reality. Reuse before regenerating. Do not create duplicate components, a second design system, a second smooth-scroll owner, competing ScrollTriggers for the same state, duplicate helpers, or arbitrary wrappers solely to make animation easier.

### VERIFY
“Code compiles” is not verification. When tooling permits, run the real interaction: scroll it, click it, resize it, reverse-scroll it, open/close it, navigate through it, test media loading, and test mobile behavior. The standard is I observed the intended behavior working, not “the code should work.”

### TEST
Tests should protect behavior a real caller or user relies upon. Do not write tests merely to produce green output. Protect high-risk regressions.

### REVIEW
Review the actual diff for visual regressions, duplication, animation conflicts, missing cleanup, stale listeners, ScrollTrigger leaks, inaccessible states, mobile overflow, performance regressions, unnecessary dependencies, unexplained magic values, and changes outside scope.

### DOCUMENT
Document what actually changed from the diff/runtime, not what the agent remembers changing. If a durable pattern is introduced, update project context.

---

## 7. DEBUGGING DISCIPLINE
Never thrash the codebase with speculative edits.
1. Reproduce the problem reliably.
2. Reduce it to the smallest failing behavior.
3. Gather evidence.
4. Form one root-cause hypothesis.
5. Test that hypothesis.
6. If wrong, revert/discard the speculative change.
7. Form the next hypothesis.
8. Fix the cause, not merely the symptom.
9. Verify the original reproduction no longer fails.
10. Check for the same defect pattern elsewhere.
11. Add regression protection where appropriate.

If the root cause is an architectural/product decision rather than a coding error, surface the decision instead of hiding it under patches.

---

## 8. LOCKED AROCLUX VISUAL SYSTEM
Do not invent a competing palette.

```css
--color-primary: #E0B9A0;
--color-accent-100: #E0B9A0;
--color-accent-200: #AE917E;
--color-dark: #2D2926;
--color-noir: #080809;
--color-neutral-200: #9D9189;
--color-neutral-300: #867163;
--color-ivory: #FAF8F5;
--color-white: #FFFFFF;
```

**Typography:**
- Display/headlines: `Syncopate` — bold, uppercase, tight tracking.
- Body: `Inter`.
- Technical/mono labels: `Space Grotesk`.
- Numbers/identifiers: bold monospace with deliberate tracking.

On dark/espresso surfaces use `#FAF8F5` for primary text and `#E0B9A0`/`#AE917E` for accents. On ivory/light surfaces use `#2D2926` for primary text. Do not introduce arbitrary new hex values when the locked system can express the design.

---

## 9. SECTION CONTINUITY
The site should feel like one architectural journey, not unrelated rectangles stacked vertically. Avoid harsh section cutoffs, arbitrary rounded top edges between every section, excessive boxed containers, visible layer-card behavior, unrelated background changes, and transitions that expose blank/black seams.

Adjacent sections should transition through controlled color, media, spacing, overlap, light, and motion. Use atmospheric color bleeding where appropriate: Noir → Espresso → warm Sandstone/Peach atmosphere → Ivory. Preserve generous vertical breathing room, typically in the `py-20` through `py-36` family where consistent with the component. Never clip content merely to achieve a transition.

---

## 10. MOTION PHILOSOPHY
Motion is architecture. Every animation must do at least one useful job: establish hierarchy, direct attention, communicate state, reveal structure, connect sections, provide spatial continuity, explain a process, enhance materiality, make media cinematic, confirm interaction, or strengthen perceived craft.

If it does none of those, remove it.

Yanhal should feel cinematic, architectural, tactile, controlled, premium, intentional, physically believable, and calm enough to trust. It should not feel hyperactive, game-like, gimmicky, constantly floating, endlessly parallaxed, template-like, or like an animation tutorial.

---

## 11. MOTION OWNERSHIP: GSAP VS MOTION VS CSS
Use one clear owner for an interaction.

- **GSAP**: Multi-element sequencing, cinematic entrance timelines, scroll-linked progress, ScrollTrigger, pinning, scrubbing, complex stagger, coordinated section transitions, text reveal choreography, media transforms synchronized to scroll, SVG/path progress, advanced parallax, and timeline control.
- **Motion**: Keep Motion when it already works well for modal enter/exit, component state transitions, small layout/state changes, simple button/icon feedback, isolated presence transitions, and existing component-level interactions where replacing it has no meaningful benefit.
- **CSS**: Basic hover/focus/color/underline and trivial non-orchestrated micro-feedback.

Do not migrate Motion to GSAP merely to say the site uses GSAP. Do not allow GSAP and Motion to animate the same property on the same element at the same time.

---

## 12. GSAP TARGET ARCHITECTURE
When GSAP is deliberately introduced:

```bash
npm install gsap @gsap/react
```

Lenis is separate and should only be installed when the smooth-scroll architecture is actually being implemented.

Canonical setup:
```tsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
```

Register plugins once in an appropriate central location. Do not repeatedly register them in every component.

---

## 13. useGSAP IS THE DEFAULT REACT LIFECYCLE
Use `useGSAP`, scope animation to a container ref, rely on GSAP context cleanup, and avoid global selectors where scoped selectors/refs are possible.

```tsx
const container = useRef<HTMLDivElement>(null);

useGSAP(() => {
  const tl = gsap.timeline();

  tl.from(".eyebrow", {
    y: 16,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
  }).from(".headline-word", {
    y: 30,
    opacity: 0,
    stagger: 0.04,
    duration: 0.8,
    ease: "expo.out",
  }, "-=0.3");
}, { scope: container });
```

Never scatter unmanaged `gsap.to()` calls through render logic. Never create ScrollTriggers on every render.

---

## 14. GSAP KNOWLEDGE EXPECTATION
The agent must understand `gsap.to()`, `from()`, `fromTo()`, `set()`, `timeline()`, stagger, labels/positions, eases, ScrollTrigger, scrub, pin, toggleActions, start/end, callbacks, `gsap.utils`, responsive contexts, cleanup, text splitting where supported, and SVG/path animation where appropriate.

Use `to` when the current DOM state is the desired start. Use `from` when authored DOM/CSS is the desired final state. Use `fromTo` when both ends must be explicit. Use timelines when sequence and relationship matter. Prefer a timeline over a pile of independent delayed tweens. Use stagger only when sequential rhythm improves hierarchy.

---

## 15. EASING LANGUAGE
Prefer controlled premium curves such as `power2.out`, `power3.out`, `power4.out`, `expo.out`, and carefully selected `power*.inOut`. Use elastic/bounce/back sparingly. Construction/architecture should generally feel substantial, not rubbery.

---

## 16. HERO MOTION STANDARD
The Hero is a signature sequence and should establish Yanhal’s identity without delaying comprehension.

Preferred sequence:
preloader resolves → viewport is correctly positioned → category/eyebrow → headline → supporting copy → CTAs → architectural metrics → media settles

Where technically appropriate, the headline may use a word/letter reveal inspired by:
- `scale: 1.35 → 1`
- `filter: blur(25px) → blur(0px)`
- `opacity: 0 → 1`
- `y: 30 → 0`
- `stagger: 0.024`
- `ease: "expo.out"`

These are design targets, not permission to force expensive filters onto weak devices. If blur harms performance, preserve the intention with lighter transform/opacity behavior.

`/yanhal.mp4` should remain clearly visible. Do not bury it under dominant black. Use subtle warm scrims for legibility.

The Hero architectural metrics/standards area must not be cropped by the next section. Maintain dedicated lower clearance such as `pb-10 sm:pb-14 md:pb-16` or an equivalent responsive implementation.

---

## 17. PRELOADER AND INITIAL SCROLL STATE
If a preloader reaches 100%, the visitor must begin at the Hero rather than inheriting accidental prior scroll offset.

```ts
window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
lenis?.scrollTo(0, { immediate: true });
```

Do not introduce a visible jump. Do not keep users in a preloader longer than necessary merely for cinematic effect.

---

## 18. LENIS + GSAP: ONE SCROLL AUTHORITY
If Lenis is deliberately introduced, target `lerp: 0.1` and `wheelMultiplier: 0.9` unless testing supports a project-specific adjustment.

Synchronization concept:
```ts
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

Do not run multiple smooth-scroll engines. Do not combine native smooth behavior, another scroll hijacker, and Lenis without understanding ownership. Anchor navigation must remain reliable, modals must remain usable, mobile must be tested, and ScrollTrigger must refresh after layout/media changes when necessary. Lenis is not mandatory merely because GSAP exists.

---

## 19. SCROLLTRIGGER DECISION RULES
Use ScrollTrigger when scroll position is semantically part of the interaction: section reveal, progress visualization, controlled parallax, process progression, pinned storytelling, media transformations tied to scroll, justified horizontal showcase, SVG progress, or coordinated section handoff.

Poor uses include every paragraph fading up, every icon rotating, excessive pinning, scroll-jacking basic reading, long dead scroll distances, or animation that makes the user wait for content.

Choose start and end from the visual behavior, not copied tutorial values. Use markers during development if useful and remove them before production. Use scrub when continuous user scroll should directly control progress. Pin only when maintaining a stable viewport materially improves the story. Avoid nested pins unless thoroughly understood and tested.

---

## 20. RESPONSIVE GSAP
Desktop animation is not automatically mobile animation. For complex responsive motion use `gsap.matchMedia()` or an equivalent deliberate strategy.

Consider viewport width/height, touch input, media aspect ratio, content length, device performance, mobile browser chrome, and reduced motion. On smaller screens reduce travel distance, parallax, simultaneous layers, and timeline length; avoid fragile pins; prioritize reading; keep CTAs accessible; never preserve a desktop effect at the cost of layout stability.

---

## 21. REDUCED MOTION
Respect `prefers-reduced-motion`. Provide a stable alternative: content visible immediately or with minimal opacity, no unnecessary scrub, no aggressive scale, no long parallax, and no forced cinematic sequence that blocks content. Information architecture must work without motion.

---

## 22. PERFORMANCE RULES
Prefer transform and opacity. Avoid continuously animating top, left, width, height, margin, or other layout-triggering properties when transforms can achieve the result. Use filters carefully.

Avoid stacking large blur, backdrop blur, multiple full-screen videos, heavy shadows, 3D/WebGL, and several scrubbed timelines without profiling.

Animate fewer elements better. Avoid unnecessary will-change. Clean up timelines/triggers. Pause/offload invisible media where sensible. Avoid decoding multiple huge videos simultaneously. Keep ScrollTrigger callbacks light. Do not drive React state on every scroll frame unless unavoidable. Use GSAP for imperative animation instead of forcing React rerenders.

---

## 23. TEXT ANIMATION
Use word/line/character splitting only for meaningful major moments such as the Hero headline or selected section statements. Do not character-animate body copy, form labels, long service descriptions, or every heading.

If using SplitText or another splitting mechanism, preserve accessibility, ensure cleanup/reversion, account for responsive reflow, and refresh when fonts/layout alter line breaks.

---

## 24. SECTION-SPECIFIC MOTION BLUEPRINT
This is directional, not permission to apply every effect simultaneously.

- **Navbar**: Subtle initial reveal, controlled background/contrast transition, reliable anchor scrolling, restrained menu transitions. Avoid perpetual motion or unpredictable disappearance.
- **Hero**: Use a deliberate GSAP timeline: eyebrow → headline → copy → CTAs → metrics/media settle.
- **What We Do / Capabilities**: If implemented as a sticky rail/icon navigation, icons may fade/slide into readiness, selected content may crossfade/translate, and progress may be subtle. Do not build a complicated sticky system solely because it looks impressive.
- **About**: Calm low-distance Y/opacity reveal and subtle media scale/parallax only if justified. Purpose: credibility.
- **Leadership**: Editorial restraint. Soft reveal, image mask/wipe, controlled profile transition. Avoid flashy distortions.
- **Services**: Structured stagger, slight scale/translate, clear feedback, deliberate detail/modal transition. Motion should communicate order and breadth.
- **Industrial & Commercial Engineering / Feature Sections**: Stronger cinematic media behavior is allowed where it supports narrative: media reveal, masking, restrained parallax, foreground/background depth, scroll-linked image scale. Do not obscure technical content.
- **Process / How We Build Masterpieces**: Preserve the architectural S-curve SVG road concept and active luminous progress track where present/approved. Preserve waypoint rings, click-to-scroll behavior, step flows/modals, and active progress indication. Per project specification, the bulldozer asset is not part of the target implementation. The luminous progress path and milestone/radar language should guide the journey. GSAP/ScrollTrigger is especially appropriate because scroll progress and process progress can meaningfully correspond.
- **Interior Finishing & Optimization**: Use refined material-focused motion: image wipe, detail reveal, controlled comparison, depth/parallax. Keep it elegant and product-focused.
- **Portfolio / Project Showcase**: Real work is the hero. Appropriate: image/video scale-in, reveal masks, subtle parallax, smooth project transitions, intentional horizontal movement where useful, and directly controllable before/after interaction. Do not let animation overpower photography.
- **Testimonials / Media**: Infinite media should be smooth and stable. Avoid competing auto-motion systems. Preserve user interaction.
- **Estimator**: Conversion beats spectacle. Use restrained step transitions, clear progress, immediate feedback, and small state animations. Avoid long transitions or scroll tricks.
- **Contact / Start Your Project**: Keep attention on conversion. `/hero-video.mp4` should remain visibly present with warm espresso/peach atmosphere and glass surfaces rather than a dominant black treatment. Form elements may reveal simply. Do not turn the final CTA into another animation showcase.

---

## 25. SINGLE QUESTION UX PRINCIPLE
Each section should answer one primary visitor question:
- **Hero**: What does Yanhal do?
- **Services**: What can Yanhal build or improve for me?
- **About/Leadership**: Can I trust this company?
- **Process**: How will my project be handled?
- **Portfolio**: Can they actually deliver this quality?
- **Estimator**: What would starting my project involve?
- **Contact**: How do I take the next step?

If motion makes the answer harder to find, the motion is wrong.

---

## 26. CONTENT CLARITY
The Hero must state the business category plainly within its first two lines. A clear overview of core services should appear early. Service cards should use concrete deliverables rather than generic marketing copy. Leadership/About should reinforce credibility with real roles, locations, and scale where supported. Estimator and Contact are conversion endpoints. Keep the path obvious. Never invent project facts, locations, metrics, testimonials, certifications, or capabilities.

---

## 27. UI COMPONENT RULES
- **Cards**: Breathable padding, clear title, concrete deliverables, concise outcome, and strong hierarchy. Avoid giant marketing paragraphs.
- **Buttons**: Action-oriented language. Primary actions should be unmistakable. The locked warm accent is the principal trust/action color. Hover/focus should feel tactile, not playful.
- **Forms**: Minimize friction with clear labels, useful validation, visible progress for multi-step flows, sensible defaults, and clear confirmation. Do not hide critical validation inside animation.

---

## 28. EXTERNAL REFERENCE PROTOCOL
When visual research is explicitly available/appropriate, use references for principles, not copying. Useful categories include construction, architecture, premium service, editorial portfolio, service cards, estimators, and high-end navigation. Extract hierarchy, rhythm, spacing, interaction feedback, information density, and transition principles, then translate them into Yanhal’s system. Never copy another brand pixel-for-pixel.

---

## 29. AWARD-CALIBER DECISION TEST
Before adding a wow interaction, ask whether it makes Yanhal feel more crafted, improves narrative continuity, reveals information elegantly, reinforces architecture/construction as a physical discipline, remains smooth on realistic hardware, survives mobile, preserves accessibility, works without animation, is original to Yanhal’s content, and remains maintainable.

Prefer a few memorable signature systems—Hero cinematic entrance, section continuity, Process storytelling, Portfolio/media presentation—while letting other sections breathe.

---

## 30. SECTION-TO-SECTION TRANSITIONS
Design transitions from both sides. When modifying the end of Section A, inspect the beginning of Section B. Check background continuity, media overlap, z-index, clipping, padding, pinned spacer behavior, ScrollTrigger lifecycle, heading visibility, reverse scroll, and mobile stacking.

Never animate only a background layer while leaving section identity disconnected. Never leave an outgoing section visibly stuck beneath the incoming one unless deliberate. Avoid rectangular “next section card slides over previous section” behavior unless explicitly required.

---

## 31. MEDIA-DRIVEN MOTION
For video/image scroll effects, wait for metadata when duration/dimensions are needed, do not assume duration, handle loading, avoid unsustainable video seeking, use appropriate preload, test mobile/Safari behavior, preserve aspect ratio, do not distort source media, and do not unintentionally crop important architecture.

For scroll-controlled video, the mapping between scroll progress and `currentTime` must be deliberate and tested.

---

## 32. SVG / PATH MOTION
For architectural diagrams, roads, progress paths, or blueprint interactions, preserve source geometry. Animate progress rather than deforming the design unnecessarily. Use stroke reveal/progress when it communicates sequence. Keep waypoint state synchronized. Preserve click navigation. Avoid decorative path motion that conflicts with actual process order.

---

## 33. THREE.JS / WEBGL
Three.js is not a default solution. Use it only when the visual outcome cannot be achieved more simply with DOM/CSS/GSAP/video. Before enabling heavy WebGL, establish purpose, measure cost, define fallback, test mobile, ensure it does not compete with full-screen video, dispose resources correctly, and avoid invisible render loops.

---

## 34. AUTHENTICATION AND APPLICATION FLOW
The audited application includes Firebase authentication gating. Do not casually remove or restructure authentication while working on visual motion. If a requested public marketing experience conflicts with the existing auth gate, treat that as an explicit product/architecture decision rather than silently changing it during an animation task.

Visual tasks must not break auth state resolution, signup/login, profile initialization, Firebase interactions, estimator uploads/data, or backend contact/estimate submission.

---

## 35. BACKEND / DATA SAFETY
Animation work must not expose secrets, move server secrets client-side, break API routes, alter form payloads accidentally, duplicate submissions, cause animated controls to submit incorrectly, or interfere with Firebase auth/storage. Treat data behavior as separate from presentation unless the task explicitly changes it.

---

## 36. ACCESSIBILITY
Maintain semantic headings, keyboard access, visible focus, sufficient contrast, usable buttons/links, form labels, dialog focus behavior, meaningful alt text where applicable, and reduced-motion support. Animation must not make content unreachable. Do not hide essential content permanently behind JS animation initialization.

---

## 37. RESPONSIVE STANDARD
Every meaningful visual change must be considered at large desktop, laptop, tablet, mobile, narrow mobile, and short viewport. Do not simply scale desktop down. Mobile may require a different animation strategy.

Pay special attention to Hero CTA width, typography wrapping, pinned sections, horizontal overflow, full-screen video, modal height, touch targets, project sliders, Process road, Contact layout, and navigation. No distortion. No clipped content. No oversized controls merely because desktop classes carried over.

---

## 38. GSAP ANTI-PATTERNS — FORBIDDEN
Do not call GSAP during render, create unmanaged timelines, leave ScrollTriggers alive after unmount, target global class names unnecessarily, continuously animate layout properties when transforms suffice, pin every section, use `scrub: true` everywhere, stack multiple smooth-scroll systems, mix Motion and GSAP ownership of the same property, copy tutorial start/end values without testing, use huge blur indiscriminately, animate long body text character-by-character, create long blank scroll zones, use animation to hide layout defects, introduce random eases per component, default to bounce/elastic brand motion, create abstractions before a repeated pattern exists, or rewrite working components solely to make GSAP integration easier.

---

## 39. PATTERN: SCROLL REVEAL
```tsx
const sectionRef = useRef<HTMLElement>(null);

useGSAP(() => {
  gsap.from("[data-reveal]", {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top 78%",
      toggleActions: "play none none reverse",
    },
  });
}, { scope: sectionRef });
```
This is a pattern, not a command to paste identical values everywhere.

---

## 40. PATTERN: SCRUBBED MEDIA
```tsx
useGSAP(() => {
  gsap.fromTo(mediaRef.current,
    { scale: 1.08, yPercent: -3 },
    {
      scale: 1,
      yPercent: 3,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}, { scope: sectionRef });
```
Keep ranges subtle. Architecture photography should not visibly wobble or drift excessively.

---

## 41. PATTERN: TIMELINE FIRST
```tsx
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("[data-hero-eyebrow]", {
    y: 16,
    opacity: 0,
    duration: 0.55,
  })
  .from("[data-hero-word]", {
    y: 30,
    opacity: 0,
    scale: 1.08,
    stagger: 0.035,
    duration: 0.85,
    ease: "expo.out",
  }, "-=0.2")
  .from("[data-hero-copy]", {
    y: 20,
    opacity: 0,
    duration: 0.65,
  }, "-=0.45")
  .from("[data-hero-actions]", {
    y: 16,
    opacity: 0,
    duration: 0.55,
  }, "-=0.35");
}, { scope: heroRef });
```
Prefer timeline relationships over arbitrary delay values scattered across components.

---

## 42. INTERACTION PHYSICS
Architectural motion benefits from mass, controlled acceleration, confident deceleration, depth, reveal, alignment, and material continuity. Avoid random rotation, random scale pulsing, and floating cards everywhere. Use spatial direction consistently.

---

## 43. Z-INDEX AND LAYERING
Treat layering as architecture, not emergency CSS. Establish clear layers for page content, sticky/pinned media, navbar, overlays, modals, and preloader. Do not fix stacking problems by escalating to arbitrary `z-[999999]`. Inspect stacking contexts created by transforms, filters, opacity, positioned ancestors, isolation, and backdrop filters.

---

## 44. DESIGN TOKEN DISCIPLINE
Do not scatter raw one-off design values through components if a project token already exists. When a durable new token is genuinely required, justify it, place it centrally, use it consistently, and avoid near-duplicates. Do not let AI iteration create five versions of “gold.”

---

## 45. PROJECT-SPECIFIC PROMPTING
Prompts for code, images, copy, or components must be specific to Yanhal. Include as relevant the construction/interiors/renovation context, Kenya/Nairobi context when supported, section purpose, locked colors, typography, existing media, desired psychological effect, responsive behavior, motion intent, non-distortion requirements, and existing component constraints. “Make it modern and premium” is not sufficient direction.

---

## 46. CHANGE BOUNDARIES
A task about animation is not automatically permission to rewrite copy, change brand colors, remove business content, replace images, restructure backend logic, alter Firebase schema, change auth, install unrelated libraries, or redesign every section. Stay within scope. If another change is genuinely necessary, record why.

---

## 47. DEPENDENCY POLICY
Before adding a dependency, identify the exact need, check whether the existing stack already solves it, inspect official/current documentation, assess bundle/runtime cost, determine cleanup/lifecycle requirements, verify React 19/Vite compatibility, and install only if justified. For GSAP use the official package and React integration. Introduce Lenis only as part of a deliberate scroll architecture.

---

## 48. ACCEPTANCE CRITERIA FOR MOTION WORK
A motion feature is complete only when it serves a defined purpose, works in the real component, behaves correctly entering/leaving, reverse scroll is sane, refresh at different scroll positions is sane where relevant, no obvious layout shift is introduced, no content is clipped, desktop/tablet/mobile work, reduced motion has a valid experience, no duplicate animation ownership exists, triggers/timelines clean up, performance remains acceptable, keyboard/touch interaction remains usable, surrounding sections still work, and the requested behavior is actually observable.

---

## 49. VISUAL QA
Inspect alignment, spacing, typography wrapping, contrast, media crop, transition in/out, sticky behavior, clipping, z-index, overflow, CTA visibility, reverse scroll, mobile, short viewport, and loading state. For motion inspect first frame, final frame, interrupted scroll, rapid scroll, reverse direction, resize, and remount where applicable.

---

## 50. PERFORMANCE QA
Check for scroll jank, too many active ScrollTriggers, unnecessary React renders, oversized media, video decode pressure, expensive filter animation, memory leaks, WebGL loops, uncleaned listeners, layout thrashing, and repeated measurements per frame. Do not judge solely on a high-end development machine.

---

## 51. DEFINITION OF DONE
Do not say a feature is done simply because code was written, TypeScript has no visible error, a test passed, or a component renders. Done means the implementation has been checked against intended behavior.

For significant work:
1. Verify the real interaction.
2. Test important behavior/regressions.
3. Review the diff and surrounding code.
4. Document meaningful architectural/pattern changes.

Match depth to risk, but never skip reality.

---

## 52. CONFLICT HANDLING
When code and documentation disagree, do not silently overwrite either. Identify the conflict, determine whether the repository is stale or the document is aspirational, and preserve current behavior until the requested change authorizes migration. This is particularly important for GSAP: this file defines it as the target high-end motion architecture, but existing Motion interactions remain valid until there is a reason to migrate them.

---

## 53. HOW TO APPROACH A NEW GSAP REQUEST
1. Understand the desired experience: first state, trigger, moving elements, fixed elements, progress mapping, final state, reverse behavior.
2. Inspect the existing component: DOM, current Motion/CSS, media, overflow, height, sticky/pinned elements, responsive states.
3. Choose the minimum GSAP capability: entrance → timeline; viewport reveal → ScrollTrigger; scroll-linked media → ScrollTrigger + scrub; process path → ScrollTrigger + SVG progress; text Hero → timeline + splitting if justified; simple modal → probably keep Motion.
4. Define mobile/reduced-motion behavior before coding.
5. Implement scoped lifecycle with refs + `useGSAP`.
6. Verify actual behavior.
7. Tune timing/ease/stagger/distance/start/end/scrub only after correctness.

Correctness first, polish second.

---

## 54. HIGH-END CREATIVE DEVELOPMENT PRINCIPLES
- **Restraint**: one exceptional transition is more valuable than ten average effects.
- **Rhythm**: alternate intensity. A cinematic section should often be followed by a calmer reading section.
- **Continuity**: elements should belong to the same physical/visual world.
- **Materiality**: use light, scale, masking, media, depth, and movement to reinforce architecture and surfaces.
- **Hierarchy**: the eye should always know what to read next.
- **Responsiveness**: each breakpoint should feel intentionally designed.
- **Narrative**: scroll should move the visitor through promise → capability → credibility → process → proof → action.

---

## 55. YANHAL CONVERSION ENGINE
The page should progressively reduce uncertainty. Trigger with a compelling but clear CTA; confirm what happens next; then build confidence through transparent process, real work, clear deliverables, credible leadership, and useful estimator/contact flows. Avoid manipulative urgency. Use trust.

---

## 56. CONTACT / START YOUR PROJECT TARGET
The final conversion area should feel cinematic but easy to use. Target atmosphere: `/hero-video.mp4` visibly present, deep warm espresso, luminous Sandstone/Peach atmosphere, frosted glass surfaces where appropriate, strong contrast, and no dominant dead-black wall. Form interaction remains primary; motion remains secondary.

---

## 57. PROCESS TARGET
For “How We Build Masterpieces”: preserve the S-curve architectural road concept, active progress path, milestones, interaction, luminous `#E0B9A0` progress language, meaningful progress synchronization, and mobile clarity. Do not reintroduce removed decorative machinery unless explicitly requested. This is a strong GSAP candidate because motion communicates process progression rather than decoration.

---

## 58. HERO → NEXT SECTION HANDOFF
The next section should emerge naturally from the Hero rather than cover it as a rectangular card. Possible tools include controlled media scale, color bleed, foreground mask, content translation, section overlap, clip reveal, and light/gradient transition. Hero content must remain readable; bottom metrics must remain visible; no flicker, black seam, stale Hero layer, or crop of next-section identity.

---

## 59. PORTFOLIO PRINCIPLE
Portfolio animation must honor project media. Do not distort architecture, overcrop, or place large UI over important detail. Transitions should make the work feel larger and more tactile, not harder to inspect. Before/after interaction must remain user-controlled and obvious.

---

## 60. MOTION CONSISTENCY REGISTRY
Reuse a small vocabulary:
- **Reveal**: opacity + short Y travel.
- **Editorial reveal**: mask/clip + subtle media scale.
- **Signature text**: word/line stagger + controlled blur/scale.
- **Section handoff**: color/media/clip continuity.
- **Progress**: stroke/path/line progression.
- **Interactive state**: short tactile transform/opacity.

Do not invent a new animation language for every component.

---

## 61. TIMING GUIDANCE
Starting ranges, not hard law:
- micro interaction: 0.15–0.35s;
- button/icon feedback: 0.2–0.4s;
- simple reveal: 0.5–0.9s;
- major headline: 0.7–1.2s;
- modal transition: 0.3–0.6s;
- signature section timeline: context-dependent.

Do not make users wait for content. Stagger should create rhythm, not serial delay.

---

## 62. COPY + MOTION COORDINATION
Animation timing must respect reading order. Do not reveal the CTA before the offer is understandable, supporting text long after the headline, or metrics so late that the user scrolls past them. Motion should clarify hierarchy.

---

## 63. PROJECT-SPECIFIC FAILURE MODES
Watch especially for flicker between sections, Hero remaining visible beneath the next section, animation attached only to background while content remains disconnected, compressed cards, mobile buttons stretching unnaturally, media distortion/crop, ScrollTrigger calculations before media/fonts settle, z-index conflicts, auth/loading state interacting badly with scroll initialization, modal scroll lock conflicting with Lenis, duplicate scroll behavior, excessive dark overlays hiding video, and desktop animation copied unchanged to mobile.

---

## 64. SECURITY / SECRETS
Never expose credentials in client code or documentation. Environment values remain environment values. Do not commit SMTP secrets, Firebase admin credentials, private API keys, or Gemini secrets. Follow the project’s established security model.

---

## 65. NO UNAUTHORIZED RECREATION
When asked to modify Yanhal, modify the existing project. Preserve relevant working code, supplied media, content unless instructed, and behavior outside scope. Do not recreate the website from scratch as a shortcut. Do not replace it with a generic template.

---

## 66. NO SILENT INVENTION
Never fabricate project facts, engineering credentials, leadership facts, locations, awards, client names, project costs, construction metrics, testimonials, phone numbers, social URLs, or certifications. If information is absent, keep sourced content or request a decision when necessary.

---

## 67. DECISION TEST BEFORE ADDING ANIMATION
Before writing a tween, answer: What problem does this motion solve?

Valid answers include establishing hierarchy, explaining progress, connecting sections, revealing project media, confirming interaction, or creating a signature brand moment.

“Because GSAP is available” is not a valid answer.

---

## 68. FINAL PRE-COMMIT SELF-REVIEW
Ask:
- **Product**: Does the visitor understand Yanhal more clearly?
- **Design**: Does this still look like the same brand?
- **Motion**: Does movement have purpose and coherent physics?
- **Engineering**: Did I reuse existing architecture rather than duplicate it?
- **React**: Are lifecycles and cleanup correct?
- **GSAP**: Are scopes, triggers, timelines, and responsive rules correct?
- **Performance**: Is the experience smooth?
- **Mobile**: Was it actually considered?
- **Accessibility**: Can the experience be used without relying on motion?
- **Conversion**: Is the next action still obvious?
- **Regression**: Did anything unrelated break?

If a critical answer is unknown, verification is incomplete.

---

## 69. FINAL DIRECTIVE
When uncertain, return to these questions:

> Will a first-time visitor looking for a reliable, high-quality builder understand what Yanhal does, trust the company, enjoy the experience, and know exactly what to do next?
> 
> Does this implementation make the codebase stronger for the next feature, or does it merely make this screenshot look impressive today?

The correct Yanhal implementation must satisfy both.

The experience should be memorable because it is coherent, crafted, cinematic, and technically disciplined — not because every element moves.

Plan deliberately. Decide deliberately. Reuse existing reality. Animate with purpose. Verify the real experience. Fix root causes. Preserve the system. Build Yanhal to an award-caliber standard without sacrificing clarity, trust, accessibility, performance, or maintainability.

---

## External Website Reference Intelligence & Implementation
Whenever the user provides a website URL, live-page link, CodePen, Awwwards reference, GitHub demo, animation showcase, or other interactive web reference and asks to reproduce, study, adapt, or implement any aspect of it, the agent must treat the link as a research reference, not merely as visual inspiration. The agent should, whenever its available tools permit, open and inspect the referenced website directly before proposing or implementing the requested feature. It must comprehensively study the specific element or behavior identified by the user, including its visual composition, interaction sequence, scroll behavior, animation timing, direction of movement, easing, transforms, masking, clipping, pinning, parallax, typography behavior, media behavior, responsive adaptations, hover/touch behavior, section transitions, loading behavior, and relationship with surrounding content. Where technically possible and relevant, the agent should inspect the site's publicly accessible HTML, CSS, JavaScript, network-loaded assets, framework indicators, script/library signatures, and other observable implementation details to determine or reasonably infer the technologies involved, such as GSAP, ScrollTrigger, Lenis, Motion/Framer Motion, Three.js, WebGL, CSS animation, SVG animation, React, Next.js, Vue, or other libraries and techniques. The agent must clearly distinguish between technology that has been verified from observable evidence and technology that is only inferred from behavior; it must never present an inference as a confirmed fact.

When visual inspection is necessary, the agent should use available browser or web-inspection capabilities to examine the relevant portions of the reference at multiple points in the interaction rather than judging the effect from a single frame. Where available, screenshots or equivalent visual observations should be taken at meaningful states—for example, before an animation begins, during its progression, at its completed state, and at relevant responsive viewport sizes. For scroll-driven interactions, the agent should understand the complete progression from section entry through the animation and into the following section, including reverse scrolling. For interactive components, it should examine relevant hover, click, drag, pointer, touch, opening, closing, and state-transition behavior. The purpose of this research is to reconstruct the interaction logic and design principle behind the requested reference accurately enough to implement the requested aspect intentionally rather than approximating it from appearance alone.

The agent must not automatically clone or reproduce an entire referenced website. It should reproduce only the specific style, interaction, animation, transition, layout principle, or behavior requested by the user. The reference determines how the requested concept behaves; the Yanhal project remains the source of truth for where it belongs, what content it contains, and how it should look within the brand. Before implementation, the agent must compare the reference behavior against the existing Yanhal component and surrounding sections and determine how to translate the technique without unnecessarily replacing existing architecture. Existing Yanhal colors, typography, content, imagery, videos, spacing principles, responsive system, component structure, functionality, conversion flows, and brand identity must remain intact unless the user explicitly instructs otherwise. Never import a reference site's colors, copy, logos, branding, assets, business information, or unrelated design decisions merely because they are part of the reference.

When implementing a referenced effect, the agent should reproduce the mechanics and perceptual result as faithfully as reasonably possible while adapting the implementation to Yanhal's existing technical stack. For example, if the user references a particular scroll-controlled showreel, the agent should determine how the reference enters the viewport, when pinning begins, how far the media travels, how its mask or dimensions evolve, how scroll progress controls the sequence, what happens to accompanying typography, how the animation reaches its final state, how the section releases, and how the interaction reverses. It should then implement those principles using Yanhal's own video, content, colors, typography, and section structure rather than reproducing the reference site's identity. If the exact technology used by the reference is inappropriate for Yanhal, the agent may reproduce the same observable behavior using the most appropriate technology already approved for this project, provided the resulting interaction remains faithful to the requested reference.

Reference research must include responsive behavior whenever observable or technically testable. The agent should not study only a desktop viewport and then disable or drastically simplify the requested experience on smaller screens without justification. It should investigate how the reference behaves across desktop, laptop, tablet, mobile, portrait, landscape, touch, and pointer environments where possible, then translate the underlying interaction intelligently into Yanhal's already responsive system. If the reference itself lacks a suitable mobile implementation, the agent should preserve the concept while designing a responsive Yanhal-specific adaptation rather than blindly reproducing a desktop geometry that breaks on mobile. The goal is behavioral consistency across devices, not identical pixel coordinates.

A shared URL should therefore trigger the following default reasoning process whenever the user's request depends on understanding that reference: open the reference → inspect the requested feature → observe the complete interaction → inspect available implementation evidence → identify or infer the underlying techniques → examine responsive behavior → compare it with the existing Yanhal implementation → determine the smallest appropriate integration → implement only the requested concept using Yanhal's existing identity → verify the result against both the reference behavior and the existing Yanhal experience. Do not ask the user to manually describe an interaction that can be investigated directly with the available tools. If direct inspection is technically unavailable, blocked, authentication-gated, or otherwise incomplete, state that limitation clearly and use any screenshots, recordings, source files, or descriptions supplied by the user rather than pretending the reference was fully inspected.

The governing principle is: research the reference deeply, replicate the requested behavior accurately, but translate it into Yanhal rather than turning Yanhal into the reference website. External websites are implementation and interaction references; the existing Yanhal project remains the product, brand, and architectural source of truth.
