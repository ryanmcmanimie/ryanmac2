"use client";

import { TestimonialSlider } from "./TestimonialSlider";
import { ContactForm } from "./ContactForm";
import { AngledDivider } from "./AngledDivider";

export function ContactSection() {
  return (
    <section className="relative w-full bg-neutral-100 overflow-hidden">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col lg:hidden">
        <div data-nav-theme="light" className="py-20">
          <TestimonialSlider />
        </div>
        <ContactForm />
      </div>

      {/* Desktop: overlay layout */}
      <div className="hidden lg:block">
        <div data-nav-theme-left="light" className="relative z-0 py-20">
          <TestimonialSlider />
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-1/3 z-[5] shadow-[-8px_0_24px_rgba(0,0,0,0.15)]">
          <ContactForm />
        </div>
      </div>

      {/* Top layer: Angled divider */}
      <AngledDivider />
    </section>
  );
}
