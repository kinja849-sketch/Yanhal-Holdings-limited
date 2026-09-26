import { gsap } from "./gsap";

export type TransitionTheme = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  name: string;
};

// Destination-specific color palettes using Yanhal's authorized design tokens
export const YANHAL_TRANSITION_THEMES: Record<string, TransitionTheme> = {
  home: {
    primary: "#080809",
    secondary: "#181514",
    accent: "#E0B9A0",
    text: "#FAF8F5",
    name: "Obsidian Noir",
  },
  services: {
    primary: "#E0B9A0",
    secondary: "#AE917E",
    accent: "#2D2926",
    text: "#2D2926",
    name: "Sandstone Peach",
  },
  portfolio: {
    primary: "#AE917E",
    secondary: "#867163",
    accent: "#FAF8F5",
    text: "#FAF8F5",
    name: "Terracotta Slate",
  },
  about: {
    primary: "#2D2926",
    secondary: "#181514",
    accent: "#E0B9A0",
    text: "#FAF8F5",
    name: "Espresso Graphite",
  },
  leadership: {
    primary: "#2D2926",
    secondary: "#221D1A",
    accent: "#AE917E",
    text: "#FAF8F5",
    name: "Executive Bronze",
  },
  process: {
    primary: "#221D1A",
    secondary: "#080809",
    accent: "#E0B9A0",
    text: "#FAF8F5",
    name: "Blueprint Charcoal",
  },
  estimator: {
    primary: "#E0B9A0",
    secondary: "#FAF8F5",
    accent: "#080809",
    text: "#080809",
    name: "Warm Sandstone",
  },
  contact: {
    primary: "#2D2926",
    secondary: "#AE917E",
    accent: "#E0B9A0",
    text: "#FAF8F5",
    name: "Architectural Noir",
  },
  social: {
    primary: "#867163",
    secondary: "#AE917E",
    accent: "#FAF8F5",
    text: "#FAF8F5",
    name: "Terracotta Bronze",
  },
  default: {
    primary: "#080809",
    secondary: "#2D2926",
    accent: "#E0B9A0",
    text: "#FAF8F5",
    name: "Yanhal Brand",
  },
};

export interface TransitionPayload {
  destination: string;
  label?: string;
  theme?: TransitionTheme;
  isExternal?: boolean;
  target?: string;
}

type TransitionSubscriber = (payload: TransitionPayload, onCovered: () => void, onComplete: () => void) => void;

class TransitionManager {
  private subscribers: Set<TransitionSubscriber> = new Set();
  private isTransitioning: boolean = false;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.setupBFCacheHandlers();
    }
  }

  // Subscribe the CinematicTransition component
  subscribe(fn: TransitionSubscriber): () => void {
    this.subscribers.add(fn);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  // Determine theme by destination
  resolveTheme(destination: string, isExternal?: boolean): TransitionTheme {
    if (isExternal) {
      return YANHAL_TRANSITION_THEMES.social;
    }
    const cleanDest = destination.replace(/^#/, "").toLowerCase().trim();
    if (cleanDest.includes("service")) return YANHAL_TRANSITION_THEMES.services;
    if (cleanDest.includes("port") || cleanDest.includes("project")) return YANHAL_TRANSITION_THEMES.portfolio;
    if (cleanDest.includes("about")) return YANHAL_TRANSITION_THEMES.about;
    if (cleanDest.includes("lead")) return YANHAL_TRANSITION_THEMES.leadership;
    if (cleanDest.includes("process")) return YANHAL_TRANSITION_THEMES.process;
    if (cleanDest.includes("estimat")) return YANHAL_TRANSITION_THEMES.estimator;
    if (cleanDest.includes("contact")) return YANHAL_TRANSITION_THEMES.contact;
    if (cleanDest === "home" || cleanDest === "") return YANHAL_TRANSITION_THEMES.home;
    return YANHAL_TRANSITION_THEMES.default;
  }

  // Resolve human-readable label
  resolveLabel(destination: string, isExternal?: boolean): string {
    if (isExternal) {
      if (destination.includes("wa.me")) return "CONNECTING · WHATSAPP";
      if (destination.includes("maps")) return "HEADQUARTERS · NAIROBI";
      if (destination.includes("tel:")) return "DIRECT LINE · CALL";
      if (destination.includes("mailto:")) return "INQUIRY · EMAIL";
      return "EXTERNAL DESTINATION";
    }
    const cleanDest = destination.replace(/^#/, "").toUpperCase();
    if (cleanDest === "HOME" || cleanDest === "") return "01 · HOME OVERVIEW";
    if (cleanDest === "SERVICES") return "02 · SERVICES & SCOPE";
    if (cleanDest === "PORTFOLIO" || cleanDest === "PROJECTS") return "03 · SELECTED WORKS";
    if (cleanDest === "ABOUT") return "04 · STANDARDS & LEADERSHIP";
    if (cleanDest === "PROCESS") return "BLUEPRINT PROCESS";
    if (cleanDest === "ESTIMATOR") return "PROJECT ESTIMATOR";
    if (cleanDest === "CONTACT") return "05 · CONSULTATIONS";
    return cleanDest;
  }

  // Trigger the full cinematic transition
  transitionTo(opts: {
    destination: string;
    label?: string;
    theme?: TransitionTheme;
    isExternal?: boolean;
    target?: string;
    onCustomAction?: () => void;
  }): void {
    if (this.isTransitioning) {
      return; // Prevent double-click stacking
    }

    const { destination, target, onCustomAction } = opts;
    const isExternal =
      opts.isExternal ??
      (destination.startsWith("http") ||
        destination.startsWith("tel:") ||
        destination.startsWith("mailto:") ||
        destination.startsWith("wa.me"));

    this.isTransitioning = true;
    const theme = opts.theme || this.resolveTheme(destination, isExternal);
    const label = opts.label || this.resolveLabel(destination, isExternal);

    // Fail-safe watchdog timer: unlock after 2000ms if anything interrupts
    if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
    this.watchdogTimer = setTimeout(() => {
      this.forceUnlock();
    }, 2200);

    const payload: TransitionPayload = {
      destination,
      label,
      theme,
      isExternal,
      target,
    };

    // Callback executed when screen is 100% COVERED
    const onCovered = () => {
      if (onCustomAction) {
        onCustomAction();
      }

      if (isExternal) {
        // Social or External link: redirect once covered
        if (target === "_blank" || destination.startsWith("http")) {
          // Open external destination
          window.open(destination, target || "_blank", "noopener,noreferrer");
        } else {
          window.location.href = destination;
        }
      } else {
        // Internal navigation: smooth jump underneath the transition cover
        const hash = destination.startsWith("#") ? destination : `#${destination}`;
        const targetId = hash.replace("#", "").trim();

        // Release any modal overflow lock and restart smooth scroll
        document.body.style.overflow = "";
        const lenis = (window as any).__lenis;
        if (lenis && typeof lenis.start === "function") {
          lenis.start();
        }

        if (targetId === "home" || targetId === "") {
          if (lenis && typeof lenis.scrollTo === "function") {
            lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
          }
        } else {
          const targetEl =
            document.getElementById(targetId) ||
            document.getElementById(`panel-${targetId}`) ||
            document.querySelector(hash);

          if (targetEl) {
            if (lenis && typeof lenis.scrollTo === "function") {
              lenis.scrollTo(targetEl, { immediate: true });
            } else {
              targetEl.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
            }
          }
        }

        // Update URL hash without causing a browser jump
        if (history.pushState) {
          history.pushState(null, "", hash);
        } else {
          window.location.hash = hash;
        }

        // Trigger ScrollTrigger refresh now that scroll position is in place
        setTimeout(() => {
          if ((window as any).ScrollTrigger) {
            (window as any).ScrollTrigger.refresh();
          }
        }, 50);
      }
    };

    // Callback executed when transition exits and destination is fully revealed
    const onComplete = () => {
      this.isTransitioning = false;
      if (this.watchdogTimer) {
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = null;
      }
    };

    // If no subscribers (e.g. during preloader or test), fallback to immediate action
    if (this.subscribers.size === 0) {
      onCovered();
      onComplete();
      return;
    }

    this.subscribers.forEach((fn) => {
      try {
        fn(payload, onCovered, onComplete);
      } catch (err) {
        console.error("Transition subscriber error:", err);
        onCovered();
        onComplete();
      }
    });
  }

  // Safeguard: BFCache & visibility handlers (identical to the reference site's robust implementation)
  private setupBFCacheHandlers(): void {
    window.addEventListener("pageshow", () => {
      this.forceUnlock();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.forceUnlock();
      }
    });

    window.addEventListener("popstate", () => {
      this.forceUnlock();
    });

    window.addEventListener("focus", () => {
      this.forceUnlock();
    });
  }

  private forceUnlock(): void {
    this.isTransitioning = false;
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    // Dispatch unlock event to UI layer
    window.dispatchEvent(new CustomEvent("yanhal:transition:forceUnlock"));
  }
}

export const transitionManager = new TransitionManager();
