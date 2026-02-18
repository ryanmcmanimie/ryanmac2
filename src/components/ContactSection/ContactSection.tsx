"use client";

import { TestimonialSlider } from "./TestimonialSlider";
import { ContactForm } from "./ContactForm";
import { AngledDivider } from "./AngledDivider";

export function ContactSection() {
  return (
    <section className="relative w-full bg-neutral-100 overflow-hidden h-[860px]">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col lg:hidden">
        <div data-nav-theme="light" className="py-14 sm:py-20">
          <div className="px-6 pb-8 text-center">
            <h2 className="text-5xl font-serif font-semibold tracking-tight text-[#141414]">
              From brief to better
            </h2>
            <p className="text-black/50 mt-2 leading-relaxed">
              It's trite but I genuinely strive to build business relationships that last well beyond the initial deliverable.
            </p>
          </div>
          <TestimonialSlider />
        </div>
        <ContactForm />
      </div>

      {/* Desktop: overlay layout */}
      <div className="hidden lg:block">
        <div data-nav-theme-left="light" className="relative z-0 py-20">
          <TestimonialSlider />
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-2/5 z-[5] shadow-[-8px_0_24px_rgba(0,0,0,0.15)]">
          <ContactForm />
        </div>
      </div>

      {/* Top layer: Angled divider */}
      <AngledDivider />
    </section>
  );
}
