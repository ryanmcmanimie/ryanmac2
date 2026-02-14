"use client";

import { useRef, useLayoutEffect, ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

interface RedactTextProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  stagger?: number;
  duration?: number;
}

export function RedactText({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#000",
  stagger = 0.15,
  duration = 0.75,
}: RedactTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<HTMLElement[]>([]);
  const blocks = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      splitRefs.current = [];
      lines.current = [];
      blocks.current = [];

      let elements: Element[] = [];
      if (containerRef.current!.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current!.children);
      } else {
        elements = [containerRef.current!];
      }

      elements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "block-line",
          lineThreshold: 0.1,
        });

        splitRefs.current.push(split);

        (split.lines as HTMLElement[]).forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.className = "block-line-wrapper relative w-max block";
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);

          const block = document.createElement("div");
          block.className =
            "block-revealer absolute top-0 left-0 w-[101%] h-[101%] pointer-events-none z-10";
          block.style.backgroundColor = blockColor;
          block.style.willChange = "transform";
          wrapper.appendChild(block);

          lines.current.push(line);
          blocks.current.push(block);
        });
      });

      gsap.set(lines.current, { opacity: 0 });
      gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" });

      const createBlockRevealAnimation = (
        block: HTMLDivElement,
        line: HTMLElement,
        index: number
      ) => {
        const tl = gsap.timeline({ delay: delay + index * stagger });

        tl.to(block, { scaleX: 1, duration: duration, ease: "power4.inOut" });
        tl.set(line, { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, { scaleX: 0, duration: duration, ease: "power4.inOut" });

        return tl;
      };

      if (animateOnScroll) {
        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index
          );
          tl.pause();

          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top 90%",
            once: true,
            onEnter: () => tl.play(),
          });
        });
      } else {
        blocks.current.forEach((block, index) => {
          createBlockRevealAnimation(block, lines.current[index], index);
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
      splitRefs.current.forEach((split) => split?.revert());

      const wrappers =
        containerRef.current?.querySelectorAll(".block-line-wrapper");
      wrappers?.forEach((wrapper) => {
        if (wrapper.parentNode && wrapper.firstChild) {
          wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
          wrapper.remove();
        }
      });
    };
  }, [animateOnScroll, delay, blockColor, stagger, duration]);

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
