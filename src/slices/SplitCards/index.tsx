import { FC } from "react";
import { Content, asText } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { SplitCards as SplitCardsComponent, CardData } from "@/components/SplitCards";

export type SplitCardsProps = SliceComponentProps<Content.SplitCardsSlice>;

const DEFAULT_CARDS: CardData[] = [
  {
    image: "/images/split-cards/card_cover_1.jpg",
    label: "( 01 )",
    description: "Interactive Web Experiences",
    backgroundColor: "#b2b2b2",
    textColor: "#0f0f0f",
  },
  {
    image: "/images/split-cards/card_cover_2.jpg",
    label: "( 02 )",
    description: "Thoughtful Design Language",
    backgroundColor: "#ce2017",
    textColor: "#ffffff",
  },
  {
    image: "/images/split-cards/card_cover_3.jpg",
    label: "( 03 )",
    description: "Visual Design Systems",
    backgroundColor: "#2f2f2f",
    textColor: "#ffffff",
  },
];

const SplitCards: FC<SplitCardsProps> = ({ slice }) => {
  const { header, cards } = slice.primary;

  const cardData: CardData[] =
    cards.length > 0
      ? cards.map((card, index) => ({
          image: card.image?.url || `/images/split-cards/card_cover_${index + 1}.jpg`,
          imageAlt: card.image?.alt || undefined,
          label: card.label || `( 0${index + 1} )`,
          description: card.description || "",
          backgroundColor: card.background_color || "#2f2f2f",
          textColor: card.text_color || "#ffffff",
        }))
      : DEFAULT_CARDS;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <SplitCardsComponent
        header={header ? asText(header) : "Three pillars with one purpose"}
        cards={cardData}
      />
    </section>
  );
};

export default SplitCards;
