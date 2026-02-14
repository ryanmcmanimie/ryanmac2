"use client";

import { FC, useRef, useLayoutEffect, useState, useCallback } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { PiArrowBendRightUpFill, PiArrowBendRightDownFill } from "react-icons/pi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type AnimationStyle = "ClipOut" | "FadeIn";
const ANIMATION = "FadeIn" as AnimationStyle;

export type AboutDuoProps = SliceComponentProps<Content.AboutDuoSlice>;

const AboutDuo: FC<AboutDuoProps> = ({ slice }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const aboutRef = useRef<HTMLSpanElement>(null);
  const meRowRef = useRef<HTMLDivElement>(null);
  const aiRowRef = useRef<HTMLDivElement>(null);
  const meContentRef = useRef<HTMLDivElement>(null);
  const aiContentRef = useRef<HTMLDivElement>(null);
  const mobileAboutMeRef = useRef<HTMLSpanElement>(null);
  const mobileAboutAiRef = useRef<HTMLSpanElement>(null);

  const [activeTab, setActiveTab] = useState<"me" | "ai">("me");
  const isAnimating = useRef(false);

  const switchTab = useCallback(
    (tab: "me" | "ai") => {
      if (tab === activeTab || isAnimating.current) return;
      if (!meContentRef.current || !aiContentRef.current) return;

      isAnimating.current = true;

      // Desktop: slide the "About" element between rows
      if (aboutRef.current && meRowRef.current && aiRowRef.current) {
        const targetY =
          tab === "me" ? 0 : aiRowRef.current.offsetTop - meRowRef.current.offsetTop;

        gsap.to(aboutRef.current, {
          y: targetY,
          duration: 0.5,
          ease: "power3.inOut",
        });
      }

      // Mobile: "About" collapses from one word and expands before the other
      // Uses scaleX instead of width to stay on the GPU compositor
      if (mobileAboutMeRef.current && mobileAboutAiRef.current) {
        const hiding = tab === "ai" ? mobileAboutMeRef.current : mobileAboutAiRef.current;
        const showing = tab === "ai" ? mobileAboutAiRef.current : mobileAboutMeRef.current;

        gsap.to(hiding, {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.5,
          ease: "power3.inOut",
        });
        gsap.to(showing, {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.5,
          ease: "power3.inOut",
        });
      }

      // Carousel slide — text fully exits/enters the clipped container
      const outContent =
        tab === "me" ? aiContentRef.current : meContentRef.current;
      const inContent =
        tab === "me" ? meContentRef.current : aiContentRef.current;
      const direction = tab === "ai" ? 1 : -1; // 1 = upward travel, -1 = downward
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const axis = isMobile ? "xPercent" : "yPercent";

      // Clear the opposite axis so stale transforms don't interfere
      const clearAxis = isMobile ? "yPercent" : "xPercent";
      gsap.set([outContent, inContent], { [clearAxis]: 0 });

      gsap.to(outContent, {
        [axis]: -100 * direction,
        duration: 0.5,
        ease: "power3.inOut",
      });
      gsap.fromTo(
        inContent,
        { [axis]: 100 * direction },
        {
          [axis]: 0,
          duration: 0.5,
          ease: "power3.inOut",
        },
      );

      setActiveTab(tab);
      setTimeout(() => {
        isAnimating.current = false;
      }, 550);
    },
    [activeTab],
  );

  useLayoutEffect(() => {
    if (
      !sectionRef.current ||
      !lineRef.current ||
      !titleRef.current ||
      !contentRef.current
    )
      return;

    // Initial hidden states (synchronous before paint)
    gsap.set(lineRef.current, {
      scaleY: 0,
      transformOrigin: "bottom center",
    });

    if (ANIMATION === "ClipOut") {
      gsap.set(titleRef.current, { clipPath: "inset(0 0 0 100%)" });
      gsap.set(contentRef.current, { clipPath: "inset(0 100% 0 0)" });
    } else {
      gsap.set(titleRef.current, { opacity: 0 });
      gsap.set(contentRef.current, { opacity: 0 });
    }

    // Position Ai content off-screen (below on desktop, right on mobile)
    if (aiContentRef.current) {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      gsap.set(aiContentRef.current, isMobile ? { xPercent: 100 } : { yPercent: 100 });
    }

    // Mobile: collapse the Ai "About" so only "About Me / Ai" is visible
    if (mobileAboutAiRef.current) {
      gsap.set(mobileAboutAiRef.current, { scaleX: 0, transformOrigin: "left center" });
    }

    // Build paused timeline
    const tl = gsap.timeline({ paused: true });

    // Phase 1: Line grows upward
    tl.to(lineRef.current, {
      scaleY: 1,
      duration: 1.35,
      ease: "power3.out",
    });

    // Phase 2: Text reveals (simultaneous, slight overlap with phase 1)
    if (ANIMATION === "ClipOut") {
      tl.to(
        titleRef.current,
        { clipPath: "inset(0 0 0 0%)", duration: 1.05, ease: "power3.out" },
        ">-0.15",
      );
      tl.to(
        contentRef.current,
        { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "power3.out" },
        "<",
      );
    } else {
      tl.to(
        [titleRef.current, contentRef.current],
        { opacity: 1, duration: 1.05, ease: "power3.out" },
        ">-0.15",
      );
    }

    // Play once when section enters viewport
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-nav-theme="light"
      className="bg-neutral-100 text-[#141414] md:max-h-175 py-8 sm:pt-0"
    >
      <div className="flex min-h-[630px] items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full relative">
          <div
            ref={lineRef}
            className="hidden md:block absolute left-1/3 sm:-top-8 -bottom-[50vh] w-px bg-[#141414]"
          />

          {/* Mobile title — single row: About Me / Ai */}
          <div ref={titleRef} className="col-span-1 p-6 md:p-12 md:pt-6">
            {/* Mobile: inline row — "About" travels between Me and Ai */}
            <div className="flex items-baseline text-5xl font-semibold font-serif tracking-tight md:hidden">
              <span
                ref={mobileAboutMeRef}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                About&nbsp;
              </span>
              <button
                onClick={() => switchTab("me")}
                className={`transition-colors duration-300 ${
                  activeTab === "me"
                    ? "text-[#141414]"
                    : "text-[rgba(20,20,20,0.25)] hover:text-[rgba(20,20,20,0.35)]"
                }`}
              >
                Me
              </button>
              <span className="mx-1 text-[rgba(20,20,20,0.25)]">/</span>
              <span
                ref={mobileAboutAiRef}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                About&nbsp;
              </span>
              <button
                onClick={() => switchTab("ai")}
                className={`transition-colors duration-300 ${
                  activeTab === "ai"
                    ? "text-[#141414]"
                    : "text-[rgba(20,20,20,0.25)] hover:text-[rgba(20,20,20,0.35)]"
                }`}
              >
                Ai
              </button>
            </div>

            {/* Desktop: two-row sliding layout */}
            <div className="hidden md:flex justify-end gap-3">
              {/* About column — single element slides between rows */}
              <div className="flex flex-col gap-2 text-5xl font-serif font-semibold tracking-tight text-right relative">
                {/* Invisible spacers to hold column width */}
                <div ref={meRowRef} className="invisible">About</div>
                <div ref={aiRowRef} className="invisible">About</div>
                {/* Sliding "About" */}
                <span
                  ref={aboutRef}
                  className="absolute top-0 right-0 will-change-transform"
                >
                  About
                </span>
              </div>

              {/* Me/Ai column */}
              <div className="flex flex-col gap-2 text-5xl font-serif font-semibold tracking-tight text-left">
                <button
                  onClick={() => switchTab("me")}
                  className={`block text-left transition-colors duration-300 ${
                    activeTab === "me"
                      ? "text-[#141414]"
                      : "text-[rgba(20,20,20,0.25)] hover:text-[rgba(20,20,20,0.35)]"
                  }`}
                >
                  Me
                </button>
                <button
                  onClick={() => switchTab("ai")}
                  className={`block text-left transition-colors duration-300 ${
                    activeTab === "ai"
                      ? "text-[#141414]"
                      : "text-[rgba(20,20,20,0.25)] hover:text-[rgba(20,20,20,0.35)]"
                  }`}
                >
                  Ai
                </button>
              </div>
            </div>
          </div>

          {/* Right column — content carousel */}
          <div ref={contentRef} className="col-span-1 md:col-span-2 p-6 md:p-12 md:pt-6">
            <div className="grid *:col-start-1 *:row-start-1 overflow-hidden">
              <div
                ref={meContentRef}
                className="max-w-2xl text-lg sm:text-xl leading-relaxed [&_strong]:font-bold will-change-transform"
              >
                <PrismicRichText field={slice.primary.about_me} />
                <div className="flex justify-end mt-9">
                  <button
                    onClick={() => switchTab("ai")}
                    className="group text-lg sm:text-xl font-bold text-black transition-opacity duration-300 hover:opacity-80"
                  >
                    What about Ai? <PiArrowBendRightUpFill className="inline-block -mt-4 text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
              <div
                ref={aiContentRef}
                className="max-w-2xl text-lg sm:text-xl leading-relaxed [&_strong]:font-bold will-change-transform"
              >
                <PrismicRichText field={slice.primary.about_ai} />
                <div className="flex justify-end mt-9">
                  <button
                    onClick={() => switchTab("me")}
                    className="group text-lg sm:text-xl font-bold text-black transition-opacity duration-300 hover:opacity-80"
                  >
                    More About Me <PiArrowBendRightDownFill className="inline-block mt-4 text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDuo;
