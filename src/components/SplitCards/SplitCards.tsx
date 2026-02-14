"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface CardData {
  image: string;
  imageAlt?: string;
  label: string;
  description: string;
  backgroundColor: string;
  textColor?: string;
}

interface SplitCardsProps {
  header: string;
  cards: CardData[];
}

export function SplitCards({ header, cards }: SplitCardsProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const isGapAnimationCompleted = useRef(false);
  const isFlipAnimationCompleted = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stickySection = stickyRef.current;
    const cardContainer = cardContainerRef.current;
    const stickyHeader = headerRef.current;

    if (!stickySection || !cardContainer || !stickyHeader) return;

    const cardElements = cardContainer.querySelectorAll<HTMLElement>(".split-card");
    const firstCard = cardElements[0];
    const lastCard = cardElements[cardElements.length - 1];

    const initAnimations = () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      isGapAnimationCompleted.current = false;
      isFlipAnimationCompleted.current = false;

      const mm = gsap.matchMedia();

      mm.add("(max-width: 999px)", () => {
        // Reset styles for mobile
        cardElements.forEach((el) => (el.style.cssText = ""));
        cardContainer.style.cssText = "";
        stickyHeader.style.cssText = "";
        return () => {};
      });

      mm.add("(min-width: 1000px)", () => {
        // Set initial state
        gsap.set(stickyHeader, { y: 40, opacity: 0 });
        gsap.set(cardContainer, { width: "75%" });

        ScrollTrigger.create({
          trigger: stickySection,
          start: "top top",
          end: `+=${window.innerHeight * 4}px`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Header animation (fade in between 10-25%)
            if (progress >= 0.1 && progress <= 0.25) {
              const headerProgress = gsap.utils.mapRange(0.1, 0.25, 0, 1, progress);
              const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
              const opacityValue = gsap.utils.mapRange(0, 1, 0, 1, headerProgress);

              gsap.set(stickyHeader, { y: yValue, opacity: opacityValue });
            } else if (progress < 0.1) {
              gsap.set(stickyHeader, { y: 40, opacity: 0 });
            } else if (progress > 0.25) {
              gsap.set(stickyHeader, { y: 0, opacity: 1 });
            }

            // Container width animation (0-25%)
            if (progress <= 0.25) {
              const widthPercentage = gsap.utils.mapRange(0, 0.25, 75, 60, progress);
              gsap.set(cardContainer, { width: `${widthPercentage}%` });
            } else {
              gsap.set(cardContainer, { width: "60%" });
            }

            // Gap animation (triggers at 35%)
            if (progress >= 0.35 && !isGapAnimationCompleted.current) {
              gsap.to(cardContainer, {
                gap: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(cardElements, {
                borderRadius: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              isGapAnimationCompleted.current = true;
            } else if (progress < 0.35 && isGapAnimationCompleted.current) {
              gsap.to(cardContainer, {
                gap: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              if (firstCard) {
                gsap.to(firstCard, {
                  borderRadius: "20px 0 0 20px",
                  duration: 0.5,
                  ease: "power3.out",
                });
              }

              cardElements.forEach((card, i) => {
                if (i > 0 && i < cardElements.length - 1) {
                  gsap.to(card, {
                    borderRadius: "0px",
                    duration: 0.5,
                    ease: "power3.out",
                  });
                }
              });

              if (lastCard) {
                gsap.to(lastCard, {
                  borderRadius: "0 20px 20px 0",
                  duration: 0.5,
                  ease: "power3.out",
                });
              }

              isGapAnimationCompleted.current = false;
            }

            // Flip animation (triggers at 70%)
            if (progress >= 0.7 && !isFlipAnimationCompleted.current) {
              gsap.to(cardElements, {
                rotationY: 180,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: 0.1,
              });

              // Tilt first and last cards
              if (firstCard) {
                gsap.to(firstCard, {
                  y: 30,
                  rotationZ: -15,
                  duration: 0.75,
                  ease: "power3.inOut",
                });
              }
              if (lastCard) {
                gsap.to(lastCard, {
                  y: 30,
                  rotationZ: 15,
                  duration: 0.75,
                  ease: "power3.inOut",
                });
              }

              isFlipAnimationCompleted.current = true;
            } else if (progress < 0.7 && isFlipAnimationCompleted.current) {
              gsap.to(cardElements, {
                rotationY: 0,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: -0.1,
              });

              if (firstCard) {
                gsap.to(firstCard, {
                  y: 0,
                  rotationZ: 0,
                  duration: 0.75,
                  ease: "power3.inOut",
                });
              }
              if (lastCard) {
                gsap.to(lastCard, {
                  y: 0,
                  rotationZ: 0,
                  duration: 0.75,
                  ease: "power3.inOut",
                });
              }

              isFlipAnimationCompleted.current = false;
            }
          },
        });

        return () => {};
      });
    };

    initAnimations();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initAnimations();
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [cards.length]);

  // Determine border radius based on card position
  const getInitialBorderRadius = (index: number, total: number) => {
    if (total === 1) return "20px";
    if (index === 0) return "20px 0 0 20px";
    if (index === total - 1) return "0 20px 20px 0";
    return "0";
  };

  return (
    <div
      ref={stickyRef}
      className="relative w-full min-h-screen flex justify-center items-center bg-neutral-100"
    >
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h2
          ref={headerRef}
          className="relative text-center text-white text-4xl lg:text-6xl font-medium leading-none will-change-transform"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {header}
        </h2>
      </div>

      <div
        ref={cardContainerRef}
        className="relative w-[75%] flex translate-y-10 will-change-[width] max-lg:w-full max-lg:flex-col max-lg:gap-8 max-lg:translate-y-0 max-lg:py-16 max-lg:px-8"
        style={{ perspective: "1000px" }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="split-card relative flex-1 aspect-[5/7] max-lg:w-full max-lg:max-w-[400px] max-lg:mx-auto max-lg:!rounded-[20px]"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "top",
              borderRadius: getInitialBorderRadius(index, cards.length),
            }}
          >
            {/* Card Front */}
            <div
              className="absolute w-full h-full overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                borderRadius: "inherit",
              }}
            >
              <Image
                src={card.image}
                alt={card.imageAlt || card.description}
                fill
                className="object-cover"
              />
            </div>

            {/* Card Back */}
            <div
              className="absolute w-full h-full flex justify-center items-center text-center p-8 max-lg:hidden"
              style={{
                backfaceVisibility: "hidden",
                borderRadius: "inherit",
                transform: "rotateY(180deg)",
                backgroundColor: card.backgroundColor,
                color: card.textColor || "#ffffff",
              }}
            >
              <span className="absolute top-8 left-8 opacity-40">
                {card.label}
              </span>
              <p
                className="text-2xl lg:text-[2rem] font-medium leading-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
