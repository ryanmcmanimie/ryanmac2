"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import { PrismicRichText } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import type { Testimonial } from "./testimonialData";

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

function TestimonialCard({
  testimonial,
  short = false,
}: {
  testimonial: Testimonial;
  short?: boolean;
}) {
  const useShort = short && testimonial.quoteShortRichText && isFilled.richText(testimonial.quoteShortRichText);

  return (
    <>
      <Image
        src={testimonial.portrait}
        alt={testimonial.name}
        fill
        className="object-cover object-top grayscale"
        unoptimized
      />
      {/* Full-height overlay — content locked to bottom half */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 sm:from-black via-black/60 sm:via-transparent to-transparent flex flex-col px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="sm:min-h-[57%] min-h-[40%] shrink-0" />
        <svg
          width="32"
          height="23"
          viewBox="0 0 32 24"
          fill="none"
          className="text-green-100 mb-3"
        >
          <path
            d="M0 24V14.4C0 11.7333 0.488889 9.28889 1.46667 7.06667C2.48889 4.8 3.82222 2.93333 5.46667 1.46667L9.06667 4.26667C7.82222 5.46667 6.8 6.84444 6 8.4C5.24444 9.91111 4.86667 11.5111 4.86667 13.2H9.33333V24H0ZM17.3333 24V14.4C17.3333 11.7333 17.8222 9.28889 18.8 7.06667C19.8222 4.8 21.1556 2.93333 22.8 1.46667L26.4 4.26667C25.1556 5.46667 24.1333 6.84444 23.3333 8.4C22.5778 9.91111 22.2 11.5111 22.2 13.2H26.6667V24H17.3333Z"
            fill="currentColor"
          />
        </svg>
        {useShort ? (
          <div className="text-white/90 font-medium leading-relaxed [&_strong]:font-black [&_strong]:text-green-100">
            <PrismicRichText field={testimonial.quoteShortRichText!} />
          </div>
        ) : testimonial.quoteRichText && isFilled.richText(testimonial.quoteRichText) ? (
          <div className="text-white/90 font-medium leading-relaxed [&_strong]:font-black [&_strong]:text-green-100">
            <PrismicRichText field={testimonial.quoteRichText} />
          </div>
        ) : (
          <p className="text-white font-normal leading-relaxed">
            {testimonial.quote}
          </p>
        )}
        <div className="flex-1" />
        <div>
          <p className="text-white text-sm font-medium pb-1">
            -{testimonial.name}
          </p>
          <p className="text-green-100 text-sm ml-1 font-bold">
            {testimonial.position}{testimonial.position && testimonial.company ? " @ " : ""}{testimonial.company}
          </p>
        </div>
      </div>
    </>
  );
}

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const BASE_COUNT = testimonials.length;
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

    const testimonialWidth = containerEl.offsetWidth * (3 / 5);
    const centerX = testimonialWidth / 2;

    const targetX = centerX - activeIndex * (cardWidth + computedGap) - cardWidth / 2;

    if (skipAnimationRef.current) {
      skipAnimationRef.current = false;
      gsap.set(strip, { x: targetX });
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isActive = i === activeIndex;
        const baseHeight = Math.min(card.offsetWidth * 1.7, 560);
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
      const baseHeight = Math.min(card.offsetWidth * 1.7, 560);
      gsap.to(card, {
        height: isActive ? baseHeight * 1.1 : baseHeight,
        opacity: isActive ? 1 : 0.2,
        filter: isActive ? "grayscale(0) blur(0px)" : "grayscale(1) blur(1px)",
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

  const desktopCardWidth = "calc(32.329vw - 3.637rem)";
  const desktopStripHeight = "min(calc((32.329vw - 3.637rem) * 1.7 * 1.1), 616px)";
  const desktopContainerMinHeight = "min(calc((32.329vw - 3.637rem) * 1.7 * 1.1 + 2rem), 640px)";

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
                <TestimonialCard testimonial={testimonial} short />
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
          className="overflow-hidden py-6"
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
                  aspectRatio: "1 / 1.7",
                  opacity: i === BASE_COUNT + 1 ? 1 : 0.2,
                  filter: i === BASE_COUNT + 1 ? "grayscale(0) blur(0px)" : "grayscale(1) blur(1px)",
                }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-end gap-4 mb-8 mr-[calc(40%+2rem)]">
          <button
            onClick={goPrev}
            className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black hover:scale-105 transition-all"
            aria-label="Previous testimonial"
          >
            <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8L10 13" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center text-black hover:border-black hover:scale-105 transition-all"
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
