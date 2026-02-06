import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { asText, asImageSrc } from "@prismicio/client";
import { notFound } from "next/navigation";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Params = { uid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const service = await client.getByUID("service", uid).catch(() => null);

  if (!service) return {};

  return {
    title: asText(service.data.title),
    description: service.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(service.data.meta_image) ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const services = await client.getAllByType("service");

  return services.map((service) => ({ uid: service.uid }));
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const service = await client.getByUID("service", uid).catch(() => null);

  if (!service) {
    notFound();
  }

  return <SliceZone slices={service.data.slices} components={components} />;
}
