import Image from "next/image";

export function Footer() {
  return (
    <footer className="h-[150px] bg-black text-white">
      <div className="flex h-full items-end justify-between p-5 sm:p-8">
        <div className="flex flex-col gap-1">
          <Image
            src="/ryanmacv2.svg"
            alt="Ryan Mac"
            width={346}
            height={70}
          />
          <p className="font-light tracking-wide text-neutral-400">
            &copy; twenty thousand twenty five
          </p>
        </div>
        <div className="flex items-center gap-2 font-light tracking-wide text-neutral-400">
          <a href="/terms" className="hover:text-white transition-colors">
            terms
          </a>
          <span>|</span>
          <a href="/privacy" className="hover:text-white transition-colors">
            privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
