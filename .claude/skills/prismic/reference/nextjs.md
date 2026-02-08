# Next.js Integration

## @prismicio/client Setup

```typescript
import * as prismic from '@prismicio/client';

const client = prismic.createClient('your-repo-name', {
  accessToken: process.env.PRISMIC_READ_KEY,
});

// Fetch single document
const doc = await client.getByUID('blog', 'my-article-slug');

// Fetch all of type
const posts = await client.getAllByType('blog');

// With filters
const featured = await client.getAllByType('blog', {
  filters: [prismic.filter.at('document.tags', ['featured'])],
  orderings: [{ field: 'my.blog.post_date', direction: 'desc' }],
});
```

## Rendering Rich Text

```tsx
import { PrismicRichText } from '@prismicio/react';

<PrismicRichText
  field={doc.data.content}
  components={{
    heading2: ({ children }) => <h2 className="text-2xl font-bold">{children}</h2>,
    paragraph: ({ children }) => <p className="mb-4">{children}</p>,
    hyperlink: ({ children, node }) => (
      <a href={node.data.url} target={node.data.target} className="text-blue-600 underline">
        {children}
      </a>
    ),
  }}
/>
```

## On-Demand Revalidation

Instead of rebuilding the entire site when content changes, use webhooks:

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, uid } = body;

  // Revalidate specific path
  if (type === 'blog_post') {
    revalidatePath(`/blog/${uid}`);
  }

  // Or use tags for grouped content
  revalidateTag('blog-posts');

  return Response.json({ revalidated: true });
}
```

**In Prismic:** Settings → Webhooks → Add your endpoint URL.

## Preview Mode

```typescript
// app/api/preview/route.ts
import { redirectToPreviewURL } from '@prismicio/next';
import { createClient } from '@/prismicio';

export async function GET(request: Request) {
  const client = createClient();
  return await redirectToPreviewURL({ client, request });
}
```

## Image Optimization

Use `<PrismicNextImage>` for automatic optimization:

```tsx
import { PrismicNextImage } from '@prismicio/next';

<PrismicNextImage field={doc.data.image} />
```

This integrates with Next.js Image component for lazy loading, responsive sizing, and format optimization.
