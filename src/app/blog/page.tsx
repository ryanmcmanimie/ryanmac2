import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { PrismicImage, PrismicText } from "@prismicio/react";
import { createClient } from "@/prismicio";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest posts",
};

export default async function BlogIndex() {
  const client = createClient();
  const posts = await client.getAllByType("blog_post", {
    orderings: [{ field: "my.blog_post.publication_date", direction: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-12 text-4xl font-bold">Blog</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={post.url ?? "#"} className="block">
              {post.data.featured_image?.url && (
                <PrismicImage
                  field={post.data.featured_image}
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <h2 className="text-2xl font-semibold group-hover:underline">
                <PrismicText field={post.data.title} />
              </h2>
              {post.data.publication_date && (
                <time className="mt-2 block text-sm text-gray-500">
                  {new Date(post.data.publication_date).toLocaleDateString()}
                </time>
              )}
            </Link>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
