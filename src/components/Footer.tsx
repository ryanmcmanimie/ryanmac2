import Image from "next/image";

export function Footer() {
  return (
    <footer className="h-[200px] sm:h-[150px] bg-black text-white">
      <div className="flex h-full flex-col items-center justify-end gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:gap-0 sm:p-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Image
            src="/ryanmacv2.svg"
            alt="Ryan Mac"
            width={277}
            height={56}
          />
          <p className="font-light tracking-wide text-neutral-400 sm:-ml-1">
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
