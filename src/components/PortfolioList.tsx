"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { RedactText } from "./RedactText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

interface Project {
  name: string;
  nickname: string | null;
  subtitle: string | null;
  muxPlaybackId: string | null;
}

interface PortfolioListProps {
  projects: Project[];
}

// Safely play video, catching AbortError when pause() interrupts play()
function safePlay(player: MuxPlayerElement | null) {
  if (!player) return;
  player.play()?.catch(() => {});
}

function MobilePortfolioList({ projects }: PortfolioListProps) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playerRefs = useRef<(MuxPlayerElement | null)[]>([]);
  const lastActiveRef = useRef(0);
  const lastScrollY = useRef(0);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(true);

  useEffect(() => {
    let rafId: number | null = null;

    const updateActiveItem = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const items = mobileItemRefs.current.filter(Boolean) as HTMLDivElement[];
        if (items.length === 0) return;

        // Detect scroll direction
        const scrollingUp = window.scrollY < lastScrollY.current;
        lastScrollY.current = window.scrollY;

        // Target point: 40% from top so later items activate before reaching dead center
        const targetY = window.innerHeight * (scrollingUp ? 0.45 : 0.4);
        let closestIndex = 0;
        let closestDistance = Infinity;

        // Break early once distance starts increasing (items are in DOM order)
        for (let i = 0; i < items.length; i++) {
          const rect = items[i].getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(itemCenter - targetY);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          } else if (distance > closestDistance) {
            break; // Past the closest — no need to measure remaining items
          }
        }

        // Only update if changed
        if (closestIndex !== lastActiveRef.current) {
          lastActiveRef.current = closestIndex;
          setCurrentIndex(closestIndex + 1);
          setShowTopGradient(closestIndex > 0);
          setShowBottomGradient(closestIndex < items.length - 1);

          // Pause all videos except the active one
          playerRefs.current.forEach((player, index) => {
            if (index === closestIndex) {
              safePlay(player);
            } else {
              player?.pause();
            }
          });
        }

        // Move counter horizontally based on which item is centered
        // Batch layout reads together, then write once at the end
        const counter = counterRef.current;
        if (items.length >= 2 && counter) {
          const firstRect = items[0].getBoundingClientRect();
          const lastRect = items[items.length - 1].getBoundingClientRect();
          const firstCenter = firstRect.top + firstRect.height / 2;
          const lastCenter = lastRect.top + lastRect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const startOffset = window.innerHeight * 0.3;
          const totalSpan = lastCenter - firstCenter;
          const progress = totalSpan !== 0
            ? Math.min(1, Math.max(0, (viewCenter - firstCenter + startOffset) / (totalSpan + startOffset)))
            : 0;
          const parent = counter.parentElement;
          if (parent) {
            const style = getComputedStyle(parent);
            const contentWidth = parent.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            const maxX = contentWidth - counter.offsetWidth;
            counter.style.transform = `translateX(${progress * maxX}px)`;
          }
        }
      });
    };

    window.addEventListener("scroll", updateActiveItem, { passive: true });
    updateActiveItem(); // Initial check

    return () => {
      window.removeEventListener("scroll", updateActiveItem);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#141414] text-white font-sans min-h-screen relative">

      {/* Top fade gradient - appears once first item scrolls off */}
      <div className={`sticky top-0 left-0 right-0 h-48 bg-linear-to-b from-[#141414] via-[#141414]/60 to-transparent z-20 pointer-events-none transition-opacity duration-500 ${showTopGradient ? "opacity-100" : "opacity-0"}`} />

      <h2 className="text-white uppercase tracking-tighter absolute font-medium top-0 right-6 text-[4rem] z-30 my-6 sm:mt-2 font-serif">Projects</h2>

      {/* Portfolio Section - contains sticky header and items */}
      <div className="relative">
        {/* Portfolio Items */}
        <div className="px-6 py-0 sm:py-24 flex flex-col gap-18">
          {projects.map((project, index) => {
            const isActive = currentIndex === index + 1;
            return (
              <div
                key={index}
                ref={(el) => { mobileItemRefs.current[index] = el; }}
                className="flex flex-col gap-4"
              >
                <div
                  className="w-full aspect-video overflow-hidden rounded-sm transition-all duration-300"
                  style={{
                    filter: isActive ? "brightness(1)" : "brightness(0.2)",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {project.muxPlaybackId ? (
                    <MuxPlayer
                      ref={(el) => { playerRefs.current[index] = el; }}
                      playbackId={project.muxPlaybackId}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ "--controls": "none" }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <div className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
                  <h2 className="text-2xl font-bold font-serif tracking-wide">
                    {project.name}
                  </h2>
                  {project.subtitle && (
                    <p className="text-sm text-[#5f5f5f] italic mt-0.5">
                      {project.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom fade gradient - hidden once last item is active */}
        <div className={`sticky bottom-12 left-0 right-0 h-48 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent z-20 pointer-events-none transition-opacity duration-500 ${showBottomGradient ? "opacity-100" : "opacity-0"}`} />

        {/* Sticky Counter Footer - sticks to bottom when scrolling through section */}
        <div className="sticky bottom-0 z-40 text-[#141414] bg-white/90 px-4 py-3">
          <h2 ref={counterRef} className="text-4xl font-serif font-bold leading-none inline-block will-change-transform">
            {String(currentIndex).padStart(2, "0")}
            <span className="text-2xl ml-1 font-normal">/{String(projects.length).padStart(2, "0")}</span>
          </h2>
        </div>
      </div>

    </section>
  );
}

function DesktopPortfolioList({ projects }: PortfolioListProps) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const projectIndexRef = useRef<HTMLHeadingElement>(null);
  const projectImagesRef = useRef<HTMLDivElement>(null);
  const projectNamesRef = useRef<HTMLDivElement>(null);
  const projectImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectNameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectSubtitleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const playerRefs = useRef<(MuxPlayerElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const hoveredVideoRef = useRef<number | null>(null);

  const handleVideoMouseMove = (e: React.MouseEvent, index: number) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    // Show/hide based on whether hovered video is active
    const isActive = index === activeIndexRef.current;
    gsap.to(cursor, { scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0, duration: 0.2, overwrite: "auto" });
  };

  const handleVideoMouseEnter = (index: number) => {
    hoveredVideoRef.current = index;
    const cursor = cursorRef.current;
    if (cursor && index === activeIndexRef.current) {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
    }
  };

  const handleVideoMouseLeave = () => {
    hoveredVideoRef.current = null;
    const cursor = cursorRef.current;
    if (cursor) gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3 });
  };

  const handleVideoMouseDown = (index: number) => {
    if (index !== activeIndexRef.current) return;
    const inner = cursorRef.current?.querySelector("[data-cursor-inner]") as HTMLElement | null;
    if (inner) gsap.to(inner, { x: 2, y: 2, boxShadow: "0px 0px 0px rgba(0,0,0,0.5)", duration: 0.1 });
  };

  const handleVideoMouseUp = (index: number) => {
    if (index !== activeIndexRef.current) return;
    const inner = cursorRef.current?.querySelector("[data-cursor-inner]") as HTMLElement | null;
    if (inner) gsap.to(inner, { x: 0, y: 0, boxShadow: "2px 2px 0px rgba(0,0,0,0.5)", duration: 0.1 });
  };

  const scrollToProject = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetProgress = (index + 0.5) / projects.length;
    const targetScroll = st.start + targetProgress * (st.end - st.start);
    gsap.to(window, { scrollTo: targetScroll, duration: 0.8, ease: "power2.inOut" });
  };

  useEffect(() => {
    const spotlightSection = spotlightRef.current;
    const projectIndex = projectIndexRef.current;
    const projectImagesContainer = projectImagesRef.current;
    const projectNamesContainer = projectNamesRef.current;
    const projectImgs = projectImgRefs.current.filter(Boolean) as HTMLDivElement[];
    const projectNames = projectNameRefs.current.filter(Boolean) as HTMLDivElement[];
    const projectSubtitles = projectSubtitleRefs.current.filter(Boolean) as HTMLParagraphElement[];

    if (!spotlightSection || !projectIndex || !projectImagesContainer || !projectNamesContainer) {
      return;
    }

    const totalProjectCount = projects.length;

    const spotlightSectionHeight = spotlightSection.offsetHeight;
    const spotlightSectionPadding = parseFloat(getComputedStyle(spotlightSection).padding);
    const projectIndexHeight = projectIndex.offsetHeight;
    const containerHeight = projectNamesContainer.offsetHeight;
    const imagesHeight = projectImagesContainer.offsetHeight;

    const moveDistanceIndex =
      spotlightSectionHeight - spotlightSectionPadding * 2 - projectIndexHeight;
    const moveDistanceNames =
      spotlightSectionHeight - spotlightSectionPadding * 2 - containerHeight;
    const moveDistanceImages = window.innerHeight - imagesHeight;

    const imgActivationThreshold = window.innerHeight / 1.95;
    const navHeight = 112; // 7rem = 112px

    const scrollTriggerInstance = scrollTriggerRef.current = ScrollTrigger.create({
      trigger: spotlightSection,
      start: `top top+=${navHeight}`,
      end: `+=${window.innerHeight * 5}px`,
      pin: true,
      pinType: "transform",
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const currentIdx = Math.min(
          Math.floor(progress * totalProjectCount) + 1,
          totalProjectCount
        );

        projectIndex.innerHTML = `${String(currentIdx).padStart(2, "0")}<span>/&nbsp;${String(
          totalProjectCount
        ).padStart(2, "0")}</span>`;

        if (currentIdx - 1 !== activeIndexRef.current) {
          activeIndexRef.current = currentIdx - 1;
          setActiveProjectIndex(currentIdx - 1);
          // Hide cursor if hovered video is no longer active
          const hovered = hoveredVideoRef.current;
          if (hovered !== null && hovered !== currentIdx - 1) {
            const cursor = cursorRef.current;
            if (cursor) gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.2 });
          }
        }

        gsap.set(projectIndex, {
          y: progress * moveDistanceIndex,
        });

        gsap.set(projectImagesContainer, {
          y: progress * moveDistanceImages,
        });

        projectImgs.forEach((img, index) => {
          const imgRect = img.getBoundingClientRect();
          const imgTop = imgRect.top;
          const imgBottom = imgRect.bottom;
          const player = playerRefs.current[index];

          if (imgTop <= imgActivationThreshold && imgBottom >= imgActivationThreshold) {
            gsap.set(img, { filter: "brightness(1)", scale: 1.05 });
            safePlay(player);
          } else {
            gsap.set(img, { filter: "brightness(0.1)", scale: 1 });
            player?.pause();
          }
        });

        projectNames.forEach((p, index) => {
          const startProgress = index / totalProjectCount;
          const endProgress = (index + 1) / totalProjectCount;
          const projectProgress = Math.max(
            0,
            Math.min(1, (progress - startProgress) / (endProgress - startProgress))
          );

          gsap.set(p, {
            y: -projectProgress * moveDistanceNames,
          });

          if (projectProgress > 0 && projectProgress < 1) {
            gsap.set(p, { color: "#fff" });
            p.dataset.active = "true";
          } else {
            gsap.set(p, { color: "#4a4a4a" });
            p.dataset.active = "false";
          }

          // Subtitle slide - delayed in, early out
          const subtitle = projectSubtitles[index];
          if (subtitle) {
            if (projectProgress > 0.025 && projectProgress < 0.975) {
              gsap.set(subtitle, { x: -2 });
            } else {
              gsap.set(subtitle, { x: "200%" });
            }
          }
        });
      },
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, [projects.length]);

  return (
    <section className="bg-[#141414] text-white font-sans relative">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/lines2.jpg')", opacity: 0.02 }}
      />

     
      <div className="absolute top-0 right-8 z-10 mt-8   text-right">
        <h2 className="text-white uppercase tracking-tighter font-medium text-[6rem] font-serif leading-none">Projects</h2>
        <div className="text-white text-sm">More En Route</div>
      </div>
     

      {/* Spotlight Section - height accounts for nav */}
      <div
        ref={spotlightRef}
        className="relative w-full h-[calc(100svh-112px)] p-8 pointer-events-none"
      >
        {/* Project Index */}
        <div className="project-index">
          <h1
            ref={projectIndexRef}
            className="uppercase font-serif text-[6rem] font-extralight leading-none tracking-tight will-change-transform"
          >
            01<span>/{String(projects.length).padStart(2, "0")}</span>
          </h1>
        </div>

        {/* Project Images */}
        <div
          ref={projectImagesRef}
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[45%] py-[50svh] flex flex-col gap-6 -z-10 will-change-transform rounded-md pointer-events-auto"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { projectImgRefs.current[index] = el; }}
              className="group/vid relative w-full aspect-video brightness-[0.1] transition-all duration-300 overflow-hidden rounded-md cursor-none"
              onMouseMove={(e) => handleVideoMouseMove(e, index)}
              onMouseEnter={() => handleVideoMouseEnter(index)}
              onMouseLeave={handleVideoMouseLeave}
              onMouseDown={() => handleVideoMouseDown(index)}
              onMouseUp={() => handleVideoMouseUp(index)}
            >
              {project.muxPlaybackId ? (
                <MuxPlayer
                  ref={(el) => { playerRefs.current[index] = el; }}
                  playbackId={project.muxPlaybackId}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ "--controls": "none" }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
              <div className="absolute inset-0 bg-black/0 opacity-0 group-hover/vid:opacity-100 transition-opacity duration-300 rounded-md" />
            </div>
          ))}
        </div>

        {/* Project Names */}
        <div
          ref={projectNamesRef}
          className="absolute right-8 bottom-8 flex flex-col items-end pointer-events-auto"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { projectNameRefs.current[index] = el; }}
              className="relative text-right text-[#4a4a4a] transition-[color,filter] duration-300 will-change-transform cursor-pointer data-[active=false]:hover:brightness-[1.25]"
              onClick={() => scrollToProject(index)}
            >
              <h3 className="text-4xl font-serif font-bold leading-tight">
                {project.name}
              </h3>
              {project.subtitle && (
                <div className="absolute top-full right-0 overflow-hidden">
                  <p
                    ref={(el) => { projectSubtitleRefs.current[index] = el; }}
                    className="italic font-normal font-condensed leading-tight translate-x-[200%] transition-transform duration-500 ease-out"
                  >
                    {project.subtitle}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-50 pointer-events-none scale-0 opacity-0 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div className="w-[84px] h-[84px] rounded-full bg-green-200/95 backdrop-blur-sm flex flex-col items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all duration-100" data-cursor-inner>
          <span className="text-[10px] font-bold uppercase tracking-wider text-black leading-none -mr-[0.1em]">Open</span>
          <span className="text-[10px] font-normal uppercase tracking-wider text-black leading-none mt-0.5 ">{projects[activeProjectIndex]?.nickname || projects[activeProjectIndex]?.name}</span>
        </div>
      </div>

    </section>
  );
}

export function PortfolioList({ projects }: PortfolioListProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render until we know the viewport size (prevents hydration mismatch)
  if (isMobile === null) {
    return <div className="bg-[#141414] min-h-screen" />;
  }

  // Use key to force complete unmount/remount when switching layouts
  // This prevents GSAP's DOM modifications from conflicting with React
  return isMobile ? (
    <MobilePortfolioList key="mobile" projects={projects} />
  ) : (
    <DesktopPortfolioList key="desktop" projects={projects} />
  );
}
