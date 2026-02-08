"use client";

import Image from "next/image";
import { useLogos } from "@/providers";
import { isFilled } from "@prismicio/client";
import { useRef, useState, useEffect } from "react";

interface LogoMarqueeProps {
  height?: number;
}

export function LogoMarquee({ height = 200 }: LogoMarqueeProps) {
  const logosDoc = useLogos();
  const logos = logosDoc?.data.logos ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  // Filter to only filled logos
  const filledLogos = logos.filter((item) => isFilled.image(item.logo));

  // Calculate scroll distance based on content overflow
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const updateScrollDistance = () => {
      const containerWidth = container.offsetWidth;
      const contentWidth = content.scrollWidth;
      const overflow = contentWidth - containerWidth;
      console.log("Marquee:", { containerWidth, contentWidth, overflow });
      if (overflow > 0) {
        setScrollDistance(overflow);
      }
    };

    // Initial calculation after mount
    updateScrollDistance();

    // Also run after a short delay to catch image loads
    const timeoutId = setTimeout(updateScrollDistance, 500);

    // Use ResizeObserver to detect when content size changes
    const resizeObserver = new ResizeObserver(updateScrollDistance);
    resizeObserver.observe(content);
    resizeObserver.observe(container);

    window.addEventListener("resize", updateScrollDistance);
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollDistance);
    };
  }, [filledLogos]);

  // If no logos, don't render
  if (filledLogos.length === 0) {
    return null;
  }

  // Duplicate logos so end logos get prominent display
  const duplicatedLogos = [...filledLogos, ...filledLogos];

  // Mobile: 75% of desktop height
  const mobileHeight = Math.round(height * 0.75);

  return (
    <div
      ref={containerRef}
      className="logo-marquee relative overflow-hidden bg-black/20 backdrop-blur-sm border-b-8 border-neutral-100"
      style={{
        ["--desktop-height" as string]: `${height}px`,
        ["--mobile-height" as string]: `${mobileHeight}px`,
        clipPath: "polygon(0 0, 90% 0, 100% 100%, 0 100%)",
      }}
    >
      {/* Left fade gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-black/0 to-transparent z-10 pointer-events-none" />

      {/* Right fade gradient */}
      <div
        className="absolute top-0 bottom-0 bg-linear-to-l from-black/70 from-30% to-transparent z-10 pointer-events-none"
        style={{ right: "0", width: "25%" }}
      />

      {/* Scrolling container */}
      <div
        ref={contentRef}
        className={`flex items-center h-full w-max ${scrollDistance > 0 ? "animate-marquee" : ""}`}
        style={
          {
            "--marquee-distance": `-${scrollDistance}px`,
          } as React.CSSProperties
        }
      >
        {duplicatedLogos.map((item, index) => (
          <div key={index} className="shrink-0 h-full flex items-center">
            {/* Gradient border */}
            <div className="w-px h-full bg-linear-to-b from-transparent via-white/20 to-transparent" />
            <div className="px-6 h-full flex items-center">
              <Image
                src={item.logo.url!}
                alt={item.logo.alt || "Logo"}
                width={item.logo.dimensions?.width ?? 120}
                height={item.logo.dimensions?.height ?? 40}
                className="h-9 md:h-12 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
