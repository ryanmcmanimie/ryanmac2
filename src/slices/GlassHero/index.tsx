import { FC } from "react";
import { Content, asText } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { GlassHero as GlassHeroComponent } from "@/components/GlassHero";

export type GlassHeroProps = SliceComponentProps<Content.GlassHeroSlice>;

const GlassHero: FC<GlassHeroProps> = ({ slice }) => {
  const { background_image_desktop, background_image_mobile, headline, tagline } = slice.primary;

  return (
    <div
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <GlassHeroComponent
        desktopImage={background_image_desktop?.url ?? undefined}
        mobileImage={background_image_mobile?.url ?? undefined}
        headline={headline ? asText(headline) : undefined}
        tagline={tagline ?? undefined}
      />
    </div>
  );
};

export default GlassHero;
