"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { ViewTransitions, useTransitionRouter } from "next-view-transitions";

interface ViewTransitionsContextType {
  navigateWithTransition: (href: string) => void;
}

const ViewTransitionsContext = createContext<ViewTransitionsContextType | null>(null);

export function usePageTransition() {
  const context = useContext(ViewTransitionsContext);
  if (!context) {
    throw new Error("usePageTransition must be used within a ViewTransitionsProvider");
  }
  return context;
}

function slideInOut() {
  const isMobile = "ontouchstart" in window || window.innerWidth < 768;
  const duration = isMobile ? 800 : 1500;

  document.documentElement.animate(
    [
      {
        opacity: 1,
        transform: "translateY(0)",
      },
      {
        opacity: 0.2,
        transform: "translateY(-35%)",
      },
    ],
    {
      duration,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  if (isMobile) {
    // Simpler opacity + transform on mobile (avoids expensive clipPath)
    document.documentElement.animate(
      [
        { opacity: 0, transform: "translateY(8%)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  } else {
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          opacity: 1,
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          opacity: 1,
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }
}

function ViewTransitionsContextProvider({ children }: { children: ReactNode }) {
  const router = useTransitionRouter();

  const navigateWithTransition = useCallback(
    (href: string) => {
      router.push(href, {
        onTransitionReady: slideInOut,
      });
    },
    [router]
  );

  return (
    <ViewTransitionsContext.Provider value={{ navigateWithTransition }}>
      {children}
    </ViewTransitionsContext.Provider>
  );
}

interface ViewTransitionsProviderProps {
  children: ReactNode;
}

export function ViewTransitionsProvider({ children }: ViewTransitionsProviderProps) {
  return (
    <ViewTransitions>
      <ViewTransitionsContextProvider>{children}</ViewTransitionsContextProvider>
    </ViewTransitions>
  );
}
