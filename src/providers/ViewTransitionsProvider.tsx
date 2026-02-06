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
      duration: 1500,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

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
      duration: 1500,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
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
