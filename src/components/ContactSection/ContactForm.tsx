"use client";

export function ContactForm() {
  return (
    <div className="h-full flex flex-col bg-[#000]">
      {/* Contact Info */}
      <div className="p-8 sm:p-14 py-12 flex flex-col gap-4">
        <h2 className="text-5xl font-bold italic text-white font-serif">
          Let&apos;s Build Something
        </h2>
        <p className="text-white/70 leading-relaxed">
          Eiusmod anim nostrud eu irure eu ad amet irure ut. Dolor velit ipsum
          do consectetur nulla amet adipisicing et occaecat ad ullamco elit in in
          fugiat.
        </p>
        <div className="flex flex-col gap-2 my-4">
          <a
            href="mailto:ryan@ryanmac.com"
            className="text-[#86DEAD] font-medium hover:text-white transition-colors"
          >
            ryan@ryanmac.com
          </a>
          <a
            href="tel:+85261939992"
            className="text-[#86DEAD] font-medium hover:text-white transition-colors"
          >
            +852 6193 9992
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#86DEAD] p-8 py-12 pb-40 sm:p-14 flex-1 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full bg-white rounded-sm px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
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
          className="w-full bg-black text-white rounded-sm py-3 px-6 text-sm font-medium hover:bg-black/80 transition-colors"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
