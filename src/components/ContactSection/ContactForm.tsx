"use client";

import { HongKongClock } from "@/components/HongKongClock";

export function ContactForm() {
  return (
    <div className="h-full flex flex-col bg-[#000]">
      {/* Contact Info */}
      <div className="p-6 sm:p-14 py-12 flex flex-col gap-4">
        <h2 className="text-5xl font-bold italic text-white font-serif">
          Let&apos;s Build Something
        </h2>
        <p className="text-white/70 leading-relaxed">
          Eiusmod anim nostrud eu irure eu ad amet irure ut. Dolor velit ipsum
          do consectetur nulla amet adipisicing et occaecat ad ullamco elit.
        </p>
        <div className="flex flex-row gap-4 mt-4 -mb-4">
          <a
            href="mailto:ryan@ryanmac.com"
            className="text-green font-medium hover:text-white transition-colors"
          >
            ryan@ryanmac.com
          </a>
          <span className="text-3xl font-serif text-white/60 -mt-0.5">/</span>
          <a
            href="tel:+85261939992"
            className="text-green font-medium hover:text-white transition-colors"
          >
            +852 6193 9992
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="bg-green p-6 py-12 pb-24 sm:p-14 sm:pb-40 flex-1 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          className="w-[80%] bg-white rounded-sm px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-white rounded-sm px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
        />
        <input
          type="tel"
          placeholder="Phone"
          className="w-3/5 bg-white rounded-sm px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
        />
        <textarea
          placeholder="Message"
          rows={3}
          className="w-full bg-white rounded-sm px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none resize-none"
        />
        <button
          type="button"
          className="w-full bg-black text-white rounded-sm py-3 px-6 text-sm font-medium hover:bg-black/80 hover:scale-102 transition-all"
        >
          Send Message
        </button>
        <HongKongClock className="text-black/40 text-xs tracking-wide text-center mt-4 justify-center" />
      </div>
    </div>
  );
}
