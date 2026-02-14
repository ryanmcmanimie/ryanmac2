import localFont from "next/font/local";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";

export const helveticaNeue = localFont({
  src: [
    { path: "../../public/fonts/HelveticaNeueLTProLtEx.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProLtExO.otf", weight: "300", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProEx.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProExO.otf", weight: "400", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProMdEx.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProMdExO.otf", weight: "500", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProBdEx.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProBdExO.otf", weight: "700", style: "oblique" },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

export const helveticaNeueCn = localFont({
  src: [
    { path: "../../public/fonts/HelveticaNeueLTProLtCn.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProLtCnO.otf", weight: "300", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProCn.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProCnO.otf", weight: "400", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProMdCn.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProMdCnO.otf", weight: "500", style: "oblique" },
    { path: "../../public/fonts/HelveticaNeueLTProBdCn.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/HelveticaNeueLTProBdCnO.otf", weight: "700", style: "oblique" },
  ],
  variable: "--font-helvetica-cn",
  display: "swap",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
