"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Span } from "next/dist/trace";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const projects = [
  { name: "Human Form Study", image: "/images/img1.jpg" },
  { name: "Interior Light", image: "/images/img2.jpg" },
  { name: "Project 21", image: "/images/img3.jpg" },
  { name: "Shadow Portraits", image: "/images/img4.jpg" },
  { name: "Everyday Objects", image: "/images/img5.jpg" },
  { name: "Unit 07 Care", image: "/images/img6.jpg" },
  { name: "Motion Practice", image: "/images/img7.jpg" },
  { name: "Noonlight Series", image: "/images/img8.jpg" },
  { name: "Material Stillness", image: "/images/img9.jpg" },
  { name: "Quiet Walk", image: "/images/img10.jpg" },
];

function MobilePortfolioList() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    mobileItemRefs.current.forEach((item, index) => {
      if (!item) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentIndex(index + 1);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(item);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="bg-[#141414] text-white font-sans min-h-screen">
     
      {/* Portfolio Section - contains sticky header and items */}
      <section className="relative">
        {/* Sticky Counter Header - sticks when reached, releases when section ends */}
        <div className="sticky top-28 z-40 bg-[#141414] px-6 py-4">
          <h1 className="text-7xl font-normal leading-none">
            {String(currentIndex).padStart(2, "0")}
            <span className="text-3xl text-gray-400 ml-1">/{projects.length}</span>
          </h1>
        </div>

        {/* Portfolio Items */}
        <div className="px-6 pb-12 flex flex-col gap-12">
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { mobileItemRefs.current[index] = el; }}
              className="flex flex-col gap-4"
            >
              <div className="w-full aspect-4/3 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-medium uppercase tracking-wide">
                {project.name}
              </h2>
            </div>
          ))}
        </div>
      </section>

      {/* Outro Section */}
      <section className="h-svh flex justify-center items-center text-center px-6">
        <p className="text-2xl font-medium leading-tight">Scroll complete</p>
      </section>
    </div>
  );
}

function DesktopPortfolioList() {
  const spotlightRef = useRef<HTMLElement>(null);
  const projectIndexRef = useRef<HTMLHeadingElement>(null);
  const projectImagesRef = useRef<HTMLDivElement>(null);
  const projectNamesRef = useRef<HTMLDivElement>(null);
  const projectImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectNameRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const spotlightSection = spotlightRef.current;
    const projectIndex = projectIndexRef.current;
    const projectImagesContainer = projectImagesRef.current;
    const projectNamesContainer = projectNamesRef.current;
    const projectImgs = projectImgRefs.current.filter(Boolean) as HTMLDivElement[];
    const projectNames = projectNameRefs.current.filter(Boolean) as HTMLParagraphElement[];

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

    const imgActivationThreshold = window.innerHeight / 2;
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

        projectImgs.forEach((img) => {
          const imgRect = img.getBoundingClientRect();
          const imgTop = imgRect.top;
          const imgBottom = imgRect.bottom;

          if (imgTop <= imgActivationThreshold && imgBottom >= imgActivationThreshold) {
            gsap.set(img, { opacity: 1 });
          } else {
            gsap.set(img, { opacity: 0.2 });
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
        });
      },
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, []);

  return (
    <div className="bg-[#141414] text-white font-sans">
     
      {/* Spotlight Section - height accounts for nav */}
      <section
        ref={spotlightRef}
        className="relative w-full h-[calc(100svh-112px)] p-8 overflow-hidden"
      >
        {/* Project Index */}
        <div className="project-index">
          <h1
            ref={projectIndexRef}
            className="uppercase font-condensed text-[clamp(3rem,5vw,7rem)] font-light leading-none will-change-transform"
          >
            01<span>/10</span>
          </h1>
        </div>

        {/* Project Images */}
        <div
          ref={projectImagesRef}
          className="absolute top-0 inset-x-0 pl-16 w-[75%] flex flex-col gap-2 -z-10 will-change-transform"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              ref={(el) => { projectImgRefs.current[index] = el; }}
              className="w-full aspect-video opacity-50 transition-all duration-300 overflow-hidden"
            >
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Project Names */}
        <div
          ref={projectNamesRef}
          className="absolute right-8 bottom-8 flex flex-col items-end"
        >
          {projects.map((project, index) => (
            <p
              key={index}
              ref={(el) => { projectNameRefs.current[index] = el; }}
              className="text-3xl font-normal font-condensed leading-tight text-[#4a4a4a] transition-colors duration-300 will-change-transform"
            >
              {project.name}
            </p>
          ))}
        </div>
      </section>

      {/* Outro Section */}
      <section className="relative w-full h-svh p-8 overflow-hidden flex justify-center items-center text-center">
        <p className="text-2xl font-medium leading-tight">Scroll complete</p>
      </section>
    </div>
  );
}

export function PortfolioList() {
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
    <MobilePortfolioList key="mobile" />
  ) : (
    <DesktopPortfolioList key="desktop" />
  );
}
