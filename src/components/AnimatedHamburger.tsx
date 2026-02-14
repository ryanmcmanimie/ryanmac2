"use client";

import React from "react";

interface AnimatedHamburgerButtonProps {
  isOpen: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const AnimatedHamburgerButton: React.FC<AnimatedHamburgerButtonProps> = ({
  isOpen,
  onClick,
  className = "",
}) => {
  return (
    <>
      <button
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={onClick}
        data-menu="Mobile Open"
        className={`ga-menu-mobile relative h-[25px] w-[25px] sm:h-[43px] sm:w-[43px] ${className}`}
      >
        {/* Top line */}
        <span
          className={`animated-hamburger-line animated-hamburger-top pointer-events-none absolute h-[3px] w-[25px] rounded-sm bg-current sm:w-[43px] ${isOpen ? "open" : ""}`}
        />
        {/* Middle line */}
        <span
          className={`animated-hamburger-line animated-hamburger-middle pointer-events-none absolute h-[3px] w-[25px] rounded-sm bg-current sm:w-[43px] ${isOpen ? "open" : ""}`}
        />
        {/* Bottom line (shorter, offset) */}
        <span
          className={`animated-hamburger-line animated-hamburger-bottom pointer-events-none absolute h-[3px] w-[14px] rounded-sm bg-current sm:w-[22px] ${isOpen ? "open" : ""}`}
        />
      </button>

      <style jsx>{`
        .animated-hamburger-line {
          left: 50%;
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(0.87, 0, 0.13, 1),
                      top 0.3s cubic-bezier(0.87, 0, 0.13, 1),
                      bottom 0.3s cubic-bezier(0.87, 0, 0.13, 1),
                      left 0.3s cubic-bezier(0.87, 0, 0.13, 1);
        }

        /* Top line - closed state */
        .animated-hamburger-top {
          top: 20%;
          transform: translateX(-50%) translateY(-50%) rotate(0deg);
        }

        /* Top line - open state */
        .animated-hamburger-top.open {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(45deg);
        }

        /* Middle line - closed state */
        .animated-hamburger-middle {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(0deg);
        }

        /* Middle line - open state */
        .animated-hamburger-middle.open {
          transform: translateX(-50%) translateY(-50%) rotate(-45deg);
        }

        /* Bottom line - closed state: flush left, no centering needed */
        .animated-hamburger-bottom {
          bottom: 17%;
          left: 0;
          transform: translateY(50%) rotate(0deg);
        }

        /* Bottom line - open state */
        .animated-hamburger-bottom.open {
          bottom: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(50%) rotate(45deg);
        }
      `}</style>
    </>
  );
};

export { AnimatedHamburgerButton };
export default AnimatedHamburgerButton;
