"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import { testimonials } from "./testimonialData";

const BASE_COUNT = testimonials.length;

export function TestimonialSlider() {
  // Start in the middle copy, offset by 1 (matching original "2nd card active" layout)
  const [activeIndex, setActiveIndex] = useState(BASE_COUNT + 1);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const skipAnimationRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Triple the testimonials for infinite scroll buffer: [copy] [main] [copy]
  const cards = [...testimonials, ...testimonials, ...testimonials];

  // Track mobile/desktop breakpoint (matches lg: in ContactSection)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => prev - 1);
  }, []);

  // Animate strip position and card states on index change
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const firstCard = cardRefs.current[0];
    if (!firstCard) return;

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const cardWidth = firstCard.offsetWidth;
    const computedGap = parseFloat(getComputedStyle(strip).gap) || 40;

    // Mobile: center active card in full container
    // Desktop: offset center since right 1/3 is covered by contact form
    let centerX: number;
    if (isMobile) {
      centerX = containerEl.offsetWidth / 2;
    } else {
      const testimonialWidth = containerEl.offsetWidth * (2 / 3);
      const step = testimonialWidth / 3;
      centerX = step;
    }

    const targetX = centerX - activeIndex * (cardWidth + computedGap) - cardWidth / 2;

    // Instant reposition after a wrap (no visible animation)
    if (skipAnimationRef.current) {
      skipAnimationRef.current = false;
      gsap.set(strip, { x: targetX });
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isActive = i === activeIndex;
        const baseHeight = card.offsetWidth * (isMobile ? 1.68 : 2);
        gsap.set(card, {
          height: isActive ? baseHeight * 1.1 : baseHeight,
          opacity: isActive ? 1 : 0.3,
          filter: isActive ? "grayscale(0) blur(0px)" : "grayscale(1) blur(0.5px)",
        });
      });
      return;
    }

    gsap.killTweensOf(strip);
    gsap.to(strip, {
      x: targetX,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        // If we've moved into a buffer zone, silently wrap to the equivalent
        // position in the middle zone. The cards are identical so it's invisible.
        if (activeIndex < BASE_COUNT) {
          skipAnimationRef.current = true;
          setActiveIndex(activeIndex + BASE_COUNT);
        } else if (activeIndex >= BASE_COUNT * 2) {
          skipAnimationRef.current = true;
          setActiveIndex(activeIndex - BASE_COUNT);
        }
      },
    });

    // Animate individual cards
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.killTweensOf(card);
      const isActive = i === activeIndex;
      const baseHeight = card.offsetWidth * (isMobile ? 1.68 : 2);
      gsap.to(card, {
        height: isActive ? baseHeight * 1.1 : baseHeight,
        opacity: isActive ? 1 : 0.3,
        filter: isActive ? "grayscale(0) blur(0px)" : "grayscale(1) blur(0.5px)",
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }, [activeIndex, isMobile]);

  // Auto-play - always forward, wraps infinitely
  useEffect(() => {
    if (isHovered) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered]);

  // Cleanup GSAP on unmount
  useEffect(() => {
    return () => {
      if (stripRef.current) gsap.killTweensOf(stripRef.current);
      cardRefs.current.forEach((card) => {
        if (card) gsap.killTweensOf(card);
      });
    };
  }, []);

  // Responsive sizing: mobile cards 70vw with 15% peek on each side, half gap
  const cardWidthCSS = isMobile ? "70vw" : "calc(22.222vw - 2.5rem)";
  const stripHeight = isMobile
    ? "calc(117.6vw * 1.1)"
    : "calc((22.222vw - 2.5rem) * 2.2)";
  const containerMinHeight = isMobile
    ? "calc(117.6vw * 1.1 + 2rem)"
    : "calc((22.222vw - 2.5rem) * 2.2 + 2rem)";

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card strip */}
      <div
        className="overflow-hidden py-4"
        style={{
          minHeight: containerMinHeight,
        }}
      >
        <div
          ref={stripRef}
          className={`flex items-center will-change-transform ${isMobile ? "gap-1" : "gap-4"}`}
          style={{
            height: stripHeight,
          }}
        >
          {cards.map((testimonial, i) => (
            <div
              key={`${testimonial.id}-${Math.floor(i / BASE_COUNT)}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => setActiveIndex(i)}
              className="flex-shrink-0 relative overflow-hidden rounded-lg cursor-pointer"
              style={{
                width: cardWidthCSS,
                aspectRatio: isMobile ? "1 / 1.68" : "1 / 2",
                opacity: i === BASE_COUNT + 1 ? 1 : 0.3,
                filter: i === BASE_COUNT + 1 ? "grayscale(0) blur(0px)" : "grayscale(1) blur(0.5px)",
              }}
            >
              {/* Full-bleed portrait */}
              <Image
                src={testimonial.portrait}
                alt={testimonial.name}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Black angled content overlay */}
              <div
                className="absolute inset-0 flex flex-col bg-linear-to-t from-black to-transparent"
                style={{
                  clipPath: isMobile
                    ? "polygon(0 33%, 100% 41%, 100% 100%, 0 100%)"
                    : "polygon(0 48%, 100% 56%, 100% 100%, 0 100%)",
                }}
              >
                {/* Spacer matching the clipped region */}
                <div className="shrink-0" style={{ minHeight: isMobile ? "40%" : "55%" }} />

                {/* Visible content area */}
                <div className="flex flex-col flex-1 px-3 pb-3 sm:px-6 sm:pb-6">
                  {/* Quote icon + text at top of visible area */}
                  <div>
                    <svg
                      width="28"
                      height="20"
                      viewBox="0 0 32 24"
                      fill="none"
                      className="text-white mb-2"
                    >
                      <path
                        d="M0 24V14.4C0 11.7333 0.488889 9.28889 1.46667 7.06667C2.48889 4.8 3.82222 2.93333 5.46667 1.46667L9.06667 4.26667C7.82222 5.46667 6.8 6.84444 6 8.4C5.24444 9.91111 4.86667 11.5111 4.86667 13.2H9.33333V24H0ZM17.3333 24V14.4C17.3333 11.7333 17.8222 9.28889 18.8 7.06667C19.8222 4.8 21.1556 2.93333 22.8 1.46667L26.4 4.26667C25.1556 5.46667 24.1333 6.84444 23.3333 8.4C22.5778 9.91111 22.2 11.5111 22.2 13.2H26.6667V24H17.3333Z"
                        fill="currentColor"
                      />
                    </svg>

                    <p className="text-white leading-relaxed pt-1">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Spacer pushes attribution to bottom */}
                  <div className="flex-1" />

                  {/* Attribution pinned to bottom */}
                  <div className="mb-1">
                    <p className="text-white text-sm font-medium pb-1">
                      -{testimonial.name}
                    </p>
                    <p className="text-white/60 text-xs ml-1">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center lg:justify-end gap-4 mb-8 lg:mr-[calc(33.333%+2rem)]">
        <button
          onClick={goPrev}
          className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black transition-colors"
          aria-label="Previous testimonial"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 3L5 8L10 13" />
          </svg>
        </button>
        <button
          onClick={goNext}
          className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black transition-colors"
          aria-label="Next testimonial"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 3L11 8L6 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
