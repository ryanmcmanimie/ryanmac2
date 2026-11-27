"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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

interface LenisStore {
  getSnapshot: () => Lenis | null;
  subscribe: (listener: () => void) => () => void;
  set: (lenis: Lenis | null) => void;
}

function createLenisStore(): LenisStore {
  let current: Lenis | null = null;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (next) => {
      current = next;
      listeners.forEach((listener) => listener());
    },
  };
}

const getServerLenisSnapshot = () => null;

export function LenisProvider({ children }: LenisProviderProps) {
  const [store] = useState(createLenisStore);
  const lenis = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerLenisSnapshot
  );

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    const instance = new Lenis({
      // On touch devices, let Lenis ignore touch-initiated scroll events entirely
      // so native iOS/Android momentum scrolling takes over
      ...(isTouchDevice && {
        virtualScroll: (data: { event: Event }) =>
          !(data.event instanceof TouchEvent),
      }),
    });
    store.set(instance);

    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      store.set(null);
    };
  }, [store]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <LenisContext.Provider value={value}>
      {children}
    </LenisContext.Provider>
  );
}
