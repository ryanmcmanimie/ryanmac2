"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  ReactNode,
} from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { PrismicLink } from "@prismicio/react";
import { asText, asLink } from "@prismicio/client";
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/providers/LenisProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
  CustomEase.create("hop", ".87,0,.13,1");
}

interface PushMenuContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const PushMenuContext = createContext<PushMenuContextType | null>(null);

export function usePushMenu() {
  const context = useContext(PushMenuContext);
  if (!context) {
    throw new Error("usePushMenu must be used within a PushMenuProvider");
  }
  return context;
}

interface PushMenuProviderProps {
  children: ReactNode;
  navigation: Content.NavigationDocument | null;
  settings: Content.SettingsDocument | null;
}

function slideInOut() {
  document.documentElement.animate(
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0.2, transform: "translateY(-35%)" },
    ],
    {
      duration: 1500,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [
      { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", opacity: 1 },
      { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)", opacity: 1 },
    ],
    {
      duration: 1500,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
}

export function PushMenuProvider({ children, navigation, settings }: PushMenuProviderProps) {
  const lenis = useLenis();
  const router = useTransitionRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isAnimatingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuOverlayContentRef = useRef<HTMLDivElement>(null);
  const menuMediaWrapperRef = useRef<HTMLDivElement>(null);
  const menuToggleLabelRef = useRef<HTMLParagraphElement>(null);
  const hamburgerIconRef = useRef<HTMLDivElement>(null);
  const menuColsRef = useRef<HTMLDivElement[]>([]);
  const splitTextRef = useRef<{ container: HTMLDivElement; splits: SplitText[] }[]>([]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize SplitText for menu items
    splitTextRef.current = [];
    menuColsRef.current.forEach((container) => {
      if (!container) return;

      const textElements = container.querySelectorAll("a, p");
      const containerSplits: SplitText[] = [];

      textElements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "menu-line",
        });
        containerSplits.push(split);
        gsap.set(split.lines, { y: "-110%" });
      });

      splitTextRef.current.push({ container, splits: containerSplits });
    });

    return () => {
      splitTextRef.current.forEach(({ splits }) => {
        splits.forEach((split) => split?.revert());
      });
    };
  }, []);

  const openMenu = () => {
    if (isAnimatingRef.current || isOpen) return;
    isAnimatingRef.current = true;

    lenis?.stop();

    const tl = gsap.timeline();

    tl.to(menuToggleLabelRef.current, {
      y: "-110%",
      duration: 1,
      ease: "hop",
    }, "<")
      .to(containerRef.current, {
        y: "100svh",
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuOverlayRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuOverlayContentRef.current, {
        yPercent: 0,
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuMediaWrapperRef.current, {
        opacity: 1,
        duration: 0.75,
        ease: "power2.out",
        delay: 0.5,
      }, "<");

    splitTextRef.current.forEach(({ splits }) => {
      const copyLines = splits.flatMap((split) => split.lines);
      tl.to(copyLines, {
        y: "0%",
        duration: 2,
        ease: "hop",
        stagger: -0.075,
      }, -0.15);
    });

    hamburgerIconRef.current?.classList.add("active");

    tl.call(() => {
      isAnimatingRef.current = false;
      setIsOpen(true);
    });
  };

  const closeMenu = () => {
    if (isAnimatingRef.current || !isOpen) return;
    isAnimatingRef.current = true;

    hamburgerIconRef.current?.classList.remove("active");

    const tl = gsap.timeline();

    tl.to(containerRef.current, {
      y: "0svh",
      duration: 1,
      ease: "hop",
    })
      .to(menuOverlayRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuOverlayContentRef.current, {
        yPercent: -50,
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuToggleLabelRef.current, {
        y: "0%",
        duration: 1,
        ease: "hop",
      }, "<")
      .to(menuColsRef.current, {
        opacity: 0.25,
        duration: 1,
        ease: "hop",
      }, "<");

    tl.call(() => {
      splitTextRef.current.forEach(({ splits }) => {
        const copyLines = splits.flatMap((split) => split.lines);
        gsap.set(copyLines, { y: "-110%" });
      });

      gsap.set(menuColsRef.current, { opacity: 1 });
      gsap.set(menuMediaWrapperRef.current, { opacity: 0 });

      isAnimatingRef.current = false;
      setIsOpen(false);
      lenis?.start();

      // Refresh ScrollTrigger after menu close to recalculate positions
      ScrollTrigger.refresh();
    });
  };

  const toggle = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const addMenuColRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      menuColsRef.current[index] = el;
    }
  };

  const resetMenuState = useCallback(() => {
    // Immediately reset menu to closed state (no animation)
    hamburgerIconRef.current?.classList.remove("active");
    gsap.set(containerRef.current, { y: "0svh" });
    gsap.set(menuOverlayRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });
    gsap.set(menuOverlayContentRef.current, { yPercent: -50 });
    gsap.set(menuToggleLabelRef.current, { y: "0%" });
    gsap.set(menuMediaWrapperRef.current, { opacity: 0 });

    splitTextRef.current.forEach(({ splits }) => {
      const copyLines = splits.flatMap((split) => split.lines);
      gsap.set(copyLines, { y: "-110%" });
    });

    isAnimatingRef.current = false;
    setIsOpen(false);
    lenis?.start();
  }, [lenis]);

  const handleMenuLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string | null) => {
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return; // Let external links work normally
      }

      e.preventDefault();

      // Navigate immediately - the view transition captures the menu as part of the old page
      router.push(href, {
        onTransitionReady: () => {
          slideInOut();
          // Reset menu state after transition starts so new page has closed menu
          resetMenuState();
        },
      });
    },
    [router, resetMenuState]
  );

  return (
    <PushMenuContext.Provider
      value={{ isOpen, toggle, open: openMenu, close: closeMenu }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-screen h-svh pointer-events-none overflow-hidden z-50">
        {/* Menu Bar */}
        <div className="fixed top-0 left-0 w-screen p-5 sm:p-8 flex justify-between items-center pointer-events-auto text-[#5f5f5f] z-50">
          {/* Logo */}
          <a
            href="/"
            className="block"
            onClick={(e) => {
              e.preventDefault();
              if (isOpen) {
                resetMenuState();
              }
              router.push("/", {
                onTransitionReady: slideInOut,
              });
            }}
          >
            <Image
              src="/ryanmacv2.svg"
              alt="Ryan Mac"
              width={144}
              height={29}
            />
          </a>

          {/* Toggle Button */}
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={toggle}
          >
            <div className="overflow-hidden">
              <p
                ref={menuToggleLabelRef}
                className="text-sm font-medium will-change-transform text-white"
              >
                Menu
              </p>
            </div>
            <div
              ref={hamburgerIconRef}
              className="hamburger-icon relative w-12 h-12 flex justify-center items-center border border-white/10 rounded-full"
            >
              <span className="hamburger-line absolute w-[15px] h-[2.25px] bg-white transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] origin-center will-change-transform" />
              <span className="hamburger-line absolute w-[15px] h-[2.25px] bg-white transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] origin-center will-change-transform" />
            </div>
          </div>
        </div>

        {/* Menu Overlay */}
        <div
          ref={menuOverlayRef}
          className="fixed top-0 left-0 w-screen h-svh bg-[#0f0f0f] text-white overflow-hidden z-40"
          style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
        >
          <div
            ref={menuOverlayContentRef}
            className="fixed top-0 left-0 w-screen h-svh flex -translate-y-1/2 will-change-transform pointer-events-auto"
          >
            {/* Media */}
            <div
              ref={menuMediaWrapperRef}
              className="flex-[2] opacity-0 will-change-opacity max-md:hidden"
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/menu-media.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-25"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-3 relative flex">
              {/* Main Links */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-md:w-full p-8 flex max-md:flex-col items-end max-md:items-start gap-8 max-md:gap-20">
                <div
                  ref={(el) => addMenuColRef(el, 0)}
                  className="flex-3 flex flex-col gap-2"
                >
                  {navigation?.data.menu_items.map((item, index) => (
                    <div key={index} className="menu-link">
                      <PrismicLink
                        field={item.url}
                        className="text-5xl max-md:text-4xl font-medium leading-tight"
                        onClick={(e) => handleMenuLinkClick(e, asLink(item.url))}
                      >
                        {item.label}
                      </PrismicLink>
                    </div>
                  ))}
                </div>

                <div
                  ref={(el) => addMenuColRef(el, 1)}
                  className="flex-[2] flex flex-col gap-2"
                >
                  <div className="menu-tag">
                    <a
                      href="#"
                      className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]"
                    >
                      Web Architect
                    </a>
                  </div>
                  <div className="menu-tag">
                    <a
                      href="#"
                      className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]"
                    >
                      AI Automation
                    </a>
                  </div>
                  <div className="menu-tag">
                    <a
                      href="#"
                      className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]"
                    >
                      Angry Musician
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 max-md:w-full p-8 flex items-end gap-8">
                <div
                  ref={(el) => addMenuColRef(el, 2)}
                  className="flex-[3] flex flex-col gap-2"
                >
                  {settings?.data.location && (
                    <p className="text-sm font-medium text-[#5f5f5f]">
                      {asText(settings.data.location)}
                    </p>
                  )}
                </div>
                <div
                  ref={(el) => addMenuColRef(el, 3)}
                  className="flex-[2] flex flex-col gap-2"
                >
                  {settings?.data.phone && (
                    <p className="text-sm font-medium text-[#5f5f5f]">
                      {asText(settings.data.phone)}
                    </p>
                  )}
                  {settings?.data.email && (
                    <p className="text-sm font-medium text-[#5f5f5f]">
                      {asText(settings.data.email)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Container (gets pushed down) */}
      <div
        ref={containerRef}
        className="relative z-10 bg-[#171717] text-white"
      >
        {children}
      </div>

      {/* Hamburger icon active styles */}
      <style jsx global>{`
        .hamburger-icon .hamburger-line:nth-child(1) {
          transform: translateY(-4px);
        }
        .hamburger-icon .hamburger-line:nth-child(2) {
          transform: translateY(4px);
        }
        .hamburger-icon.active .hamburger-line:nth-child(1) {
          transform: translateY(0) rotate(45deg);
        }
        .hamburger-icon.active .hamburger-line:nth-child(2) {
          transform: translateY(0) rotate(-45deg);
        }
        .menu-line {
          position: relative;
          will-change: transform;
        }
      `}</style>
    </PushMenuContext.Provider>
  );
}
