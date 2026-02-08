"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Project {
  name: string;
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

  useEffect(() => {
    let rafId: number | null = null;

    const updateActiveItem = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const items = mobileItemRefs.current.filter(Boolean) as HTMLDivElement[];
        if (items.length === 0) return;

        // Target point is 60% down the viewport (keeps items active longer when scrolling down)
        const targetY = window.innerHeight * 0.6;
        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(itemCenter - targetY);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        // Only update if changed
        if (closestIndex !== lastActiveRef.current) {
          lastActiveRef.current = closestIndex;
          setCurrentIndex(closestIndex + 1);

          // Pause all videos except the active one
          playerRefs.current.forEach((player, index) => {
            if (index === closestIndex) {
              safePlay(player);
            } else {
              player?.pause();
            }
          });
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
    <section className="bg-[#141414] text-white font-sans min-h-screen relative">

      {/* Portfolio Section - contains sticky header and items */}
      <div className="relative">
        {/* Sticky Counter Header - sticks when reached, releases when section ends */}
        <div className="sticky top-18 z-40 text-[#141414] bg-white px-6 py-4">
          <h2 className="text-4xl font-extralight leading-none">
            {String(currentIndex).padStart(2, "0")}
            <span>/{projects.length}</span>
          </h2>
        </div>

        {/* Portfolio Items */}
        <div className="px-6 pb-12 flex flex-col gap-12">
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
                  <h2 className="text-2xl font-medium font-condensed tracking-wide">
                    {project.name}
                  </h2>
                  {project.subtitle && (
                    <p className="text-sm text-[#5f5f5f] italic">
                      {project.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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

    const scrollTriggerInstance = ScrollTrigger.create({
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
          } else {
            gsap.set(p, { color: "#4a4a4a" });
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

      <h2 className="text-[#141414] uppercase tracking-tighter -mt-22 absolute font-black top-0 right-8 text-[6rem] z-10 font-condensed">Projects</h2>

      {/* Spotlight Section - height accounts for nav */}
      <div
        ref={spotlightRef}
        className="relative w-full h-[calc(100svh-112px)] p-8"
      >
        {/* Project Index */}
        <div className="project-index">
          <h1
            ref={projectIndexRef}
            className="uppercase font-condensed text-[8rem] font-extralight leading-none tracking-tight will-change-transform"
          >
            01<span>/{String(projects.length).padStart(2, "0")}</span>
          </h1>
        </div>

        {/* Project Images */}
        <div
          ref={projectImagesRef}
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[45%] py-[50svh] flex flex-col gap-6 -z-10 will-change-transform rounded-md"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { projectImgRefs.current[index] = el; }}
              className="w-full aspect-video brightness-[0.1] transition-all duration-300 overflow-hidden rounded-md"
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
          ))}
        </div>

        {/* Project Names */}
        <div
          ref={projectNamesRef}
          className="absolute right-8 bottom-8 flex flex-col items-end"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { projectNameRefs.current[index] = el; }}
              className="relative text-right text-[#4a4a4a] transition-colors duration-300 will-change-transform"
            >
              <h3 className="text-3xl font-normal font-condensed leading-tight">
                {project.name}
              </h3>
              {project.subtitle && (
                <div className="absolute top-full right-0 overflow-hidden">
                  <p
                    ref={(el) => { projectSubtitleRefs.current[index] = el; }}
                    className="italic text-base font-normal font-condensed leading-tight translate-x-[200%] transition-transform duration-500 ease-out"
                  >
                    {project.subtitle}
                  </p>
                </div>
              )}
            </div>
          ))}
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
