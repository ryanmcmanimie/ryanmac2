import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { FractalGlassHero } from "@/components/FractalGlassHero";

export type GlassHeroProps = SliceComponentProps<Content.GlassHeroSlice>;

const GlassHero: FC<GlassHeroProps> = ({ slice }) => {
  return (
    <div
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <FractalGlassHero />
    </div>
  );
};

export default GlassHero;
