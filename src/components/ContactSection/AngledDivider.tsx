export function AngledDivider() {
  return (
    <>
      {/* Mobile: curved frown */}
      <div className="absolute -bottom-px left-0 w-full z-10 sm:hidden">
        <svg
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          className="block w-full h-20"
        >
          <path d="M0,12 Q50,0 100,12 L100,20 L0,20 Z" fill="black" />
        </svg>
      </div>

      {/* Desktop: angled */}
      <div
        className="absolute -bottom-px left-0 w-full h-28 bg-black z-10 hidden sm:block"
        style={{
          clipPath: "polygon(0 0, 100% 62%, 100% 100%, 0 100%)",
        }}
      />
    </>
  );
}
