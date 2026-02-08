"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Content } from "@prismicio/client";

type LogosContextType = Content.LogosDocument | null;

const LogosContext = createContext<LogosContextType>(null);

export function useLogos() {
  return useContext(LogosContext);
}

interface LogosProviderProps {
  children: ReactNode;
  logos: Content.LogosDocument | null;
}

export function LogosProvider({ children, logos }: LogosProviderProps) {
  return (
    <LogosContext.Provider value={logos}>{children}</LogosContext.Provider>
  );
}
