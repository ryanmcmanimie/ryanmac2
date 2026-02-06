import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { asImageSrc } from "@prismicio/client";
import { notFound } from "next/navigation";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("about").catch(() => null);

  if (!page) return {};

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
    },
  };
}

export default async function AboutPage() {
  const client = createClient();
  const page = await client.getSingle("about").catch(() => null);

  if (!page) {
    notFound();
  }

  return <SliceZone slices={page.data.slices} components={components} />;
}
