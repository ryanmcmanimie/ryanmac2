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
  const project = await client.getByUID("project", uid).catch(() => null);

  if (!project) return {};

  return {
    title: asText(project.data.title),
    description: project.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(project.data.meta_image) ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const projects = await client.getAllByType("project");

  return projects.map((project) => ({ uid: project.uid }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const project = await client.getByUID("project", uid).catch(() => null);

  if (!project) {
    notFound();
  }

  return <SliceZone slices={project.data.slices} components={components} />;
}
