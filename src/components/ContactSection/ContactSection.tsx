"use client";

import type { Content } from "@prismicio/client";
import { asText, isFilled } from "@prismicio/client";
import { TestimonialSlider } from "./TestimonialSlider";
import { ContactForm } from "./ContactForm";
import { AngledDivider } from "./AngledDivider";
import type { Testimonial } from "./testimonialData";
import { testimonials as fallbackTestimonials } from "./testimonialData";

const FALLBACK_PORTRAIT = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=667&fit=crop&crop=top,faces";

function mapReviewsToTestimonials(reviews: Content.ReviewDocument[]): Testimonial[] {
  return reviews.map((review, i) => ({
    id: i + 1,
    name: asText(review.data.name) || "Anonymous",
    position: review.data.position || "",
    company: review.data.Company || "",
    quote: asText(review.data.testimonial) || "",
    quoteRichText: review.data.testimonial,
    quoteShortRichText: review.data.short_testimonial,
    portrait: isFilled.image(review.data.image) ? review.data.image.url : FALLBACK_PORTRAIT,
  }));
}

interface ContactSectionProps {
  reviews: Content.ReviewDocument[];
}

export function ContactSection({ reviews }: ContactSectionProps) {
  const testimonials = reviews.length > 0 ? mapReviewsToTestimonials(reviews) : fallbackTestimonials;
  return (
    <section className="relative w-full bg-neutral-100 overflow-hidden lg:h-[860px]">
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
          <TestimonialSlider testimonials={testimonials} />
        </div>
        <ContactForm />
      </div>

      {/* Desktop: overlay layout */}
      <div className="hidden lg:block">
        <div data-nav-theme-left="light" className="relative z-0 pt-16">
          <TestimonialSlider testimonials={testimonials} />
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
