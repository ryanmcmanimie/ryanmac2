import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { RedactText } from "@/components/RedactText";

export type RedactTextProps = SliceComponentProps<Content.RedactTextSlice>;

const RedactTextSlice: FC<RedactTextProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      <RedactText blockColor="#fe0100">
        <h1 className="w-3/4 text-6xl max-md:text-3xl font-light leading-none tracking-tight text-center">
          Framed in tungsten and shadows, every shot holds its own deliberate
          tension.
        </h1>
      </RedactText>
    </section>
  );
};

export default RedactTextSlice;
