export function AngledDivider() {
  return (
    <div
      className="absolute -bottom-px left-0 w-full h-28 bg-black z-10"
      style={{
        clipPath: "polygon(0 0, 100% 62%, 100% 100%, 0 100%)",
      }}
    />
  );
}
