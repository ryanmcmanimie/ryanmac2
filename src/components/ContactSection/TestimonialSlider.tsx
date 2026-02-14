"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import { testimonials, Testimonial } from "./testimonialData";

const BASE_COUNT = testimonials.length;

function TestimonialCard({
  testimonial,
  clipPath,
  spacerHeight,
}: {
  testimonial: Testimonial;
  clipPath: string;
  spacerHeight: string;
}) {
  return (
    <>
      <Image
        src={testimonial.portrait}
        alt={testimonial.name}
        fill
        className="object-cover"
        unoptimized
      />
      <div
        className="absolute inset-0 flex flex-col bg-linear-to-t from-black to-transparent"
        style={{ clipPath }}
      >
        <div className="shrink-0" style={{ minHeight: spacerHeight }} />
        <div className="flex flex-col flex-1 px-3 pb-3 sm:px-6 sm:pb-6">
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
          <div className="flex-1" />
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
    </>
  );
}

export function TestimonialSlider() {
  const [activeIndex, setActiveIndex] = useState(BASE_COUNT + 1);
  const [isHovered, setIsHovered] = useState(false);
  const skipAnimationRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLSpanElement>(null);
  const rightArrowRef = useRef<HTMLSpanElement>(null);

  // Triple the testimonials for infinite scroll buffer (desktop only)
  const cards = [...testimonials, ...testimonials, ...testimonials];

  const goNext = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => prev - 1);
  }, []);

  // Animate strip position and card states on index change (desktop only)
  useEffect(() => {
    // Skip on mobile — the native scroll handles everything
    if (window.innerWidth < 1024) return;

    const strip = stripRef.current;
    if (!strip) return;

    const firstCard = cardRefs.current[0];
    if (!firstCard) return;

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const cardWidth = firstCard.offsetWidth;
    const computedGap = parseFloat(getComputedStyle(strip).gap) || 40;

    const testimonialWidth = containerEl.offsetWidth * (2 / 3);
    const step = testimonialWidth / 3;
    const centerX = step;

    const targetX = centerX - activeIndex * (cardWidth + computedGap) - cardWidth / 2;

    if (skipAnimationRef.current) {
      skipAnimationRef.current = false;
      gsap.set(strip, { x: targetX });
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isActive = i === activeIndex;
        const baseHeight = card.offsetWidth * 2;
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
        if (activeIndex < BASE_COUNT) {
          skipAnimationRef.current = true;
          setActiveIndex(activeIndex + BASE_COUNT);
        } else if (activeIndex >= BASE_COUNT * 2) {
          skipAnimationRef.current = true;
          setActiveIndex(activeIndex - BASE_COUNT);
        }
      },
    });

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.killTweensOf(card);
      const isActive = i === activeIndex;
      const baseHeight = card.offsetWidth * 2;
      gsap.to(card, {
        height: isActive ? baseHeight * 1.1 : baseHeight,
        opacity: isActive ? 1 : 0.3,
        filter: isActive ? "grayscale(0) blur(0px)" : "grayscale(1) blur(0.5px)",
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }, [activeIndex]);

  // Auto-play (desktop only)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

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

  // Periodic swipe hint animation
  const swipeIndicatorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const indicator = swipeIndicatorRef.current;
    const leftArrow = leftArrowRef.current;
    const rightArrow = rightArrowRef.current;
    if (!indicator || !leftArrow || !rightArrow) return;

    const interval = setInterval(() => {
      const tl = gsap.timeline();
      // Darken the whole indicator
      tl.to(indicator, { color: "rgba(0,0,0,0.9)", duration: 0.3, ease: "power2.out" });
      // Left arrow shifts left
      tl.to(leftArrow, { x: -6, duration: 0.25, ease: "power2.out" }, "<0.1");
      tl.to(leftArrow, { x: 0, duration: 0.25, ease: "power2.in" });
      // Right arrow shifts right
      tl.to(rightArrow, { x: 6, duration: 0.25, ease: "power2.out" }, "<");
      tl.to(rightArrow, { x: 0, duration: 0.25, ease: "power2.in" });
      // Fade back to original
      tl.to(indicator, { color: "rgba(0,0,0,0.3)", duration: 0.4, ease: "power2.inOut" });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const desktopCardWidth = "calc(22.222vw - 2.5rem)";
  const desktopStripHeight = "calc((22.222vw - 2.5rem) * 2.2)";
  const desktopContainerMinHeight = "calc((22.222vw - 2.5rem) * 2.2 + 2rem)";

  return (
    <div ref={containerRef} className="relative">
      {/* Mobile: native draggable scroll */}
      <div className="lg:hidden relative">
        <div
          ref={mobileScrollRef}
          className="overflow-x-auto py-4 px-[15vw]"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex gap-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="shrink-0 relative overflow-hidden rounded-lg"
                style={{
                  width: "70vw",
                  aspectRatio: "1 / 1.68",
                  scrollSnapAlign: "center",
                }}
              >
                <TestimonialCard
                  testimonial={testimonial}
                  clipPath="polygon(0 33%, 100% 41%, 100% 100%, 0 100%)"
                  spacerHeight="40%"
                />
              </div>
            ))}
            {/* Spacer so last card can scroll fully into view */}
            <div className="shrink-0 w-[15vw]" aria-hidden="true" />
          </div>
        </div>
        {/* Edge fade gradients */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-neutral-100/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-neutral-100/20 to-transparent pointer-events-none" />

        {/* Swipe indicator */}
        <div ref={swipeIndicatorRef} className="flex items-center justify-center gap-3 pt-4 pb-2 text-black/30 text-xs tracking-[0.2em] uppercase">
          <span ref={leftArrowRef} className="inline-block will-change-transform">&larr;</span>
          <span>Swipe to view</span>
          <span ref={rightArrowRef} className="inline-block will-change-transform">&rarr;</span>
        </div>
      </div>

      {/* Desktop: GSAP animated slider */}
      <div
        className="hidden lg:block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="overflow-hidden py-4"
          style={{ minHeight: desktopContainerMinHeight }}
        >
          <div
            ref={stripRef}
            className="flex items-center will-change-transform gap-4"
            style={{ height: desktopStripHeight }}
          >
            {cards.map((testimonial, i) => (
              <div
                key={`${testimonial.id}-${Math.floor(i / BASE_COUNT)}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => setActiveIndex(i)}
                className="shrink-0 relative overflow-hidden rounded-lg cursor-pointer"
                style={{
                  width: desktopCardWidth,
                  aspectRatio: "1 / 2",
                  opacity: i === BASE_COUNT + 1 ? 1 : 0.3,
                  filter: i === BASE_COUNT + 1 ? "grayscale(0) blur(0px)" : "grayscale(1) blur(0.5px)",
                }}
              >
                <TestimonialCard
                  testimonial={testimonial}
                  clipPath="polygon(0 48%, 100% 56%, 100% 100%, 0 100%)"
                  spacerHeight="55%"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-end gap-4 mb-8 mr-[calc(33.333%+2rem)]">
          <button
            onClick={goPrev}
            className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black transition-colors"
            aria-label="Previous testimonial"
          >
            <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8L10 13" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black transition-colors"
            aria-label="Next testimonial"
          >
            <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3L11 8L6 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
