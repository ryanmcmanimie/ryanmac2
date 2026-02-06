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
  const post = await client.getByUID("blog_post", uid).catch(() => null);

  if (!post) return {};

  return {
    title: asText(post.data.title),
    description: post.data.meta_description,
    openGraph: {
      images: [{ url: asImageSrc(post.data.meta_image ?? post.data.featured_image) ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const posts = await client.getAllByType("blog_post");

  return posts.map((post) => ({ uid: post.uid }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const post = await client.getByUID("blog_post", uid).catch(() => null);

  if (!post) {
    notFound();
  }

  return <SliceZone slices={post.data.slices} components={components} />;
}
