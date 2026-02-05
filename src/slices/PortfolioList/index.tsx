import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PortfolioList as PortfolioListComponent } from "@/components/PortfolioList";

/**
 * Props for `PortfolioList`.
 */
export type PortfolioListProps =
  SliceComponentProps<Content.PortfolioListSlice>;

/**
 * Component for "PortfolioList" Slices.
 */
const PortfolioList: FC<PortfolioListProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <PortfolioListComponent />
    </section>
  );
};

export default PortfolioList;
