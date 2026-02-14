import { Content, asText } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { PortfolioList as PortfolioListComponent } from "@/components/PortfolioList";

/**
 * Props for `PortfolioList`.
 */
export type PortfolioListProps =
  SliceComponentProps<Content.PortfolioListSlice>;

/**
 * Component for "PortfolioList" Slices.
 */
async function PortfolioList({ slice }: PortfolioListProps) {
  const client = createClient();
  const projectDocs = await client.getAllByType("project");

  const projects = projectDocs
    .map((doc) => ({
      name: asText(doc.data.title),
      subtitle: doc.data.subtitle ? asText(doc.data.subtitle) : null,
      muxPlaybackId: doc.data.teaser_video_mux_id,
      order: doc.data.order ? parseInt(doc.data.order, 10) : Infinity,
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ name, subtitle, muxPlaybackId }) => ({ name, subtitle, muxPlaybackId }));

  return (
    <div
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <PortfolioListComponent projects={projects} />
    </div>
  );
}

export default PortfolioList;
