"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { PrismicLink } from "@prismicio/react";
import { asText, asLink, isFilled } from "@prismicio/client";
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/providers/LenisProvider";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";
import { AnimatedHamburgerButton } from "@/components/AnimatedHamburger";

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
  const [leftOverLight, setLeftOverLight] = useState(false);
  const [rightOverLight, setRightOverLight] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const isAnimatingRef = useRef(false);
  const isOpenRef = useRef(false);
  const isPastHeroRef = useRef(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuOverlayContentRef = useRef<HTMLDivElement>(null);
  const menuMediaWrapperRef = useRef<HTMLDivElement>(null);
  const menuToggleLabelRef = useRef<HTMLParagraphElement>(null);
  const menuToggleRef = useRef<HTMLDivElement>(null);
  const menuColsRef = useRef<HTMLDivElement[]>([]);
  const splitTextRef = useRef<{ container: HTMLDivElement; splits: SplitText[] }[]>([]);

  // Keep isOpen ref in sync for scroll handler access
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Fade hamburger toggle in on mount to prevent partial render flash
  // Initial opacity: 0 is set via inline style on the element
  useEffect(() => {
    if (menuToggleRef.current) {
      gsap.to(menuToggleRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.3,
      });
    }
  }, []);

  // Detect when nav is over light sections
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bothSections: Element[] = [];
    let leftOnlySections: Element[] = [];
    let rightOnlySections: Element[] = [];
    let rafId: number | null = null;
    let lastLeft = false;
    let lastRight = false;

    const cacheSections = () => {
      bothSections = Array.from(document.querySelectorAll('[data-nav-theme="light"]'));
      leftOnlySections = Array.from(document.querySelectorAll('[data-nav-theme-left="light"]'));
      rightOnlySections = Array.from(document.querySelectorAll('[data-nav-theme-right="light"]'));
    };

    const isOverSection = (sections: Element[], navY: number) => {
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navY && rect.bottom >= navY) return true;
      }
      return false;
    };

    const checkNavTheme = () => {
      if (rafId) return; // Already scheduled

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const navY = 60;

        const isMobile = window.innerWidth < 1024;
        const overBoth = isOverSection(bothSections, navY);
        const overLeft = isOverSection(leftOnlySections, navY);
        const overRight = isOverSection(rightOnlySections, navY);

        const left = overBoth || overLeft || (isMobile && overRight);
        const right = overBoth || overRight || (isMobile && overLeft);

        if (left !== lastLeft) {
          lastLeft = left;
          setLeftOverLight(left);
        }
        if (right !== lastRight) {
          lastRight = right;
          setRightOverLight(right);
        }

        // Check if floating (scrolled past threshold)
        const floating = window.scrollY > 20;
        setIsFloating(floating);

        // Hide "Menu" label when scrolled past hero
        const pastHero = window.scrollY > window.innerHeight;
        if (pastHero !== isPastHeroRef.current) {
          isPastHeroRef.current = pastHero;
          if (!isOpenRef.current && menuToggleLabelRef.current) {
            gsap.to(menuToggleLabelRef.current, {
              y: pastHero ? "-110%" : "0%",
              duration: 0.6,
              ease: "hop",
            });
          }
        }
      });
    };

    // Cache sections initially and on DOM changes
    cacheSections();
    const observer = new MutationObserver(cacheSections);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", checkNavTheme, { passive: true });
    checkNavTheme();

    return () => {
      window.removeEventListener("scroll", checkNavTheme);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
    setIsOpen(true);

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

    tl.call(() => {
      isAnimatingRef.current = false;
    });
  };

  const closeMenu = () => {
    if (isAnimatingRef.current || !isOpen) return;
    isAnimatingRef.current = true;
    setIsOpen(false);

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
      lenis?.start();

      // Re-hide "Menu" label if scrolled past hero
      if (isPastHeroRef.current && menuToggleLabelRef.current) {
        gsap.to(menuToggleLabelRef.current, {
          y: "-110%",
          duration: 0.6,
          ease: "hop",
        });
      }

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

    // Reset label visibility
    isPastHeroRef.current = false;
    gsap.set(menuToggleLabelRef.current, { y: "0%" });
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
        <div
          ref={menuBarRef}
          className={`fixed top-0 left-0 w-screen p-5 sm:p-8 flex justify-between items-center pointer-events-auto z-50 transition-all duration-300 ${isFloating && !isOpen ? `max-sm:backdrop-blur-sm ${leftOverLight ? "max-sm:bg-white/80" : "max-sm:bg-black/80"}` : ""}`}
        >
          {/* Logo */}
          <a
            href="/"
            className={`block transition-all duration-300 ${leftOverLight && !isOpen ? "**:text-black!" : ""}`}
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
              className={`transition-all duration-300 ${leftOverLight && !isOpen ? "invert" : ""}`}
            />
          </a>

          {/* Toggle Button */}
          <div
            ref={menuToggleRef}
            style={{ opacity: 0 }}
            className={`group/toggle -mt-3 flex items-center gap-3 cursor-pointer transition-all duration-300 ${rightOverLight && !isOpen ? "**:text-black! [&_.hamburger-wrapper]:border-black! [&_.hamburger-wrapper]:text-black!" : ""}`}
            onClick={toggle}
          >
            <div className="overflow-hidden max-sm:hidden h-5">
              <p
                ref={menuToggleLabelRef}
                className="text-sm tracking-wider font-bold will-change-transform text-white uppercase"
              >
                <span className="block transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover/toggle:-translate-y-full">Menu</span>
                <span className="block transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover/toggle:-translate-y-full">Do It</span>
              </p>
            </div>
            <div className="hamburger-wrapper relative max-sm:w-[28px] max-sm:h-[28px] sm:w-[70px] sm:h-[70px] flex justify-center items-center sm:border-none sm:border-white rounded-lg text-white pointer-events-none">
              <AnimatedHamburgerButton isOpen={isOpen} />
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-md:w-full p-4 sm:p-8 flex max-md:flex-col items-end max-md:items-start gap-8 max-md:gap-20">
                <div
                  ref={(el) => addMenuColRef(el, 0)}
                  className="flex-3 flex flex-col gap-2"
                >
                  {navigation?.data.menu_items.map((item, index) => (
                    <div key={index} className="menu-link">
                      <PrismicLink
                        field={item.url}
                        className="text-6xl max-md:text-5xl font-serif font-semibold leading-tight"
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
                  {isFilled.richText(navigation?.data.tag_1) && (
                    <div className="menu-tag">
                      <p className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]">
                        {asText(navigation.data.tag_1)}
                      </p>
                    </div>
                  )}
                  {isFilled.richText(navigation?.data.tag_2) && (
                    <div className="menu-tag">
                      <p className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]">
                        {asText(navigation.data.tag_2)}
                      </p>
                    </div>
                  )}
                  {isFilled.richText(navigation?.data.tag_3) && (
                    <div className="menu-tag">
                      <p className="text-2xl max-md:text-xl font-medium text-[#5f5f5f]">
                        {asText(navigation.data.tag_3)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 max-md:w-full p-4 sm:p-8 flex items-end gap-8">
                <div
                  ref={(el) => addMenuColRef(el, 2)}
                  className="flex-[3] flex flex-col gap-2"
                >
                  {settings?.data.location && (
                    <p className="font-medium text-[#5f5f5f]">
                      {asText(settings.data.location)}
                    </p>
                  )}
                </div>
                <div
                  ref={(el) => addMenuColRef(el, 3)}
                  className="flex-[2] flex flex-col gap-2"
                >
                  {settings?.data.phone && (
                    <a
                      href={`https://wa.me/${asText(settings.data.phone).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white transition-opacity duration-300 hover:opacity-60"
                    >
                      {asText(settings.data.phone)}
                    </a>
                  )}
                  {settings?.data.email && (
                    <a
                      href={`mailto:${asText(settings.data.email)}`}
                      className="font-medium text-white transition-opacity duration-300 hover:opacity-60"
                    >
                      {asText(settings.data.email)}
                    </a>
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
        <main>{children}</main>
        <ContactSection />
        <Footer />
      </div>

      {/* Menu line styles */}
      <style jsx global>{`
        .menu-line {
          position: relative;
          will-change: transform;
        }
      `}</style>
    </PushMenuContext.Provider>
  );
}
