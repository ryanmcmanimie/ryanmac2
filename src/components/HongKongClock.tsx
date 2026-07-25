"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

function useHongKongTime() {
  const [time, setTime] = useState("");
  const [isDaytime, setIsDaytime] = useState(true);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Hong_Kong",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      const hour = parseInt(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Hong_Kong",
          hour: "numeric",
          hour12: false,
        })
      );
      setIsDaytime(hour >= 6 && hour < 18);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return { time, isDaytime };
}

export function HongKongClock({ className }: { className?: string }) {
  const { time, isDaytime } = useHongKongTime();
  if (!time) return null;
  return (
    <p className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {isDaytime ? <Sun size={18} /> : <Moon size={18} />}
      It&apos;s {time} in Hong Kong
    </p>
  );
}
