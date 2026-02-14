"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Force GPU compositing and auto-kill conflicting tweens on touch devices
  if ("ontouchstart" in window) {
    gsap.config({ force3D: true });
    gsap.defaults({ overwrite: "auto" });
  }

  // Respect reduced-motion preference: skip GSAP animations entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.globalTimeline.timeScale(100);
    gsap.defaults({ duration: 0 });
  }
}

interface LenisContextType {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType>({ lenis: null });

export function useLenis() {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a LenisProvider");
  }
  return context.lenis;
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    const lenis = new Lenis({
      // On touch devices, let Lenis ignore touch-initiated scroll events entirely
      // so native iOS/Android momentum scrolling takes over
      ...(isTouchDevice && {
        virtualScroll: (data: { event: Event }) =>
          !(data.event instanceof TouchEvent),
      }),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}
