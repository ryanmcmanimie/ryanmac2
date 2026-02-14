"use client";

import { MouseEvent, ReactNode, useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { PrismicLink as BasePrismicLink } from "@prismicio/react";
import type { LinkField } from "@prismicio/client";
import { asLink } from "@prismicio/client";

function slideInOut() {
  const isMobile = "ontouchstart" in window || window.innerWidth < 768;
  const duration = isMobile ? 800 : 1500;

  document.documentElement.animate(
    [
      {
        opacity: 1,
        transform: "translateY(0)",
      },
      {
        opacity: 0.2,
        transform: "translateY(-35%)",
      },
    ],
    {
      duration,
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  if (isMobile) {
    // Simpler opacity + transform on mobile (avoids expensive clipPath)
    document.documentElement.animate(
      [
        { opacity: 0, transform: "translateY(8%)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  } else {
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          opacity: 1,
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          opacity: 1,
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }
}

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({
  href,
  children,
  className,
  onClick,
}: TransitionLinkProps) {
  const router = useTransitionRouter();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Allow external links and modified clicks to work normally
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        e.metaKey ||
        e.ctrlKey
      ) {
        onClick?.(e);
        return;
      }

      e.preventDefault();
      onClick?.(e);
      router.push(href, {
        onTransitionReady: slideInOut,
      });
    },
    [href, router, onClick]
  );

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

interface PrismicLinkProps {
  field: LinkField;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function PrismicLink({
  field,
  children,
  className,
  onClick,
}: PrismicLinkProps) {
  const router = useTransitionRouter();
  const href = asLink(field) ?? "#";

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Check if it's an external link
      const isExternal =
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");

      // Allow external links and modified clicks to work normally
      if (isExternal || e.metaKey || e.ctrlKey) {
        onClick?.(e);
        return;
      }

      e.preventDefault();
      onClick?.(e);
      router.push(href, {
        onTransitionReady: slideInOut,
      });
    },
    [href, router, onClick]
  );

  return (
    <BasePrismicLink field={field} onClick={handleClick} className={className}>
      {children}
    </BasePrismicLink>
  );
}
