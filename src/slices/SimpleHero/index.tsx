import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";

export type SimpleHeroProps = SliceComponentProps<Content.SimpleHeroSlice>;

const SimpleHero: FC<SimpleHeroProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative flex h-125 w-full items-end justify-start bg-linear-to-b from-black to-white"
    >
      <div className="p-8 md:p-12">
        <PrismicRichText
          field={slice.primary.header}
          components={{
            paragraph: ({ children }) => (
              <h1 className="text-5xl font-bold text-black md:text-7xl lg:text-8xl">
                {children}
              </h1>
            ),
          }}
        />
      </div>
    </section>
  );
};

export default SimpleHero;
