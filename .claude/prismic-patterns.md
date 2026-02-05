# Prismic Integration Patterns

> Reference file for Prismic CMS patterns. Read this when working with Prismic content, rich text, or the Migration/Content APIs.

## Rich Text Format

Prismic rich text is an **array of block objects** where inline formatting uses character-offset spans.

### Block Structure

```json
{
  "type": "paragraph",
  "text": "Text with bold and a link here",
  "spans": [
    {"type": "strong", "start": 10, "end": 14},
    {"type": "hyperlink", "start": 21, "end": 30, "data": {"link_type": "Web", "url": "https://example.com", "target": "_blank"}}
  ],
  "direction": "ltr"
}
```

### Block Types

| Type | Usage |
|------|-------|
| `paragraph` | Body text |
| `heading2` - `heading6` | Section headings |
| `list-item` | Unordered list item |
| `o-list-item` | Ordered list item |
| `preformatted` | Code blocks |
| `image` | Images (with alt, linkTo properties) |

### Span Types

```json
// Bold
{"type": "strong", "start": 0, "end": 4}

// Italic
{"type": "em", "start": 5, "end": 10}

// Hyperlink
{
  "type": "hyperlink",
  "start": 11,
  "end": 20,
  "data": {
    "link_type": "Web",
    "url": "https://example.com",
    "target": "_blank"
  }
}

// Internal link
{
  "type": "hyperlink",
  "start": 0,
  "end": 10,
  "data": {
    "link_type": "Document",
    "id": "YourDocId",
    "type": "page",
    "uid": "about-us",
    "lang": "en-us"
  }
}
```

### Complete Example

```json
[
  {
    "type": "heading2",
    "text": "Getting Started",
    "spans": [],
    "direction": "ltr"
  },
  {
    "type": "paragraph",
    "text": "This guide covers the basics of our platform.",
    "spans": [
      {"type": "strong", "start": 5, "end": 10}
    ],
    "direction": "ltr"
  },
  {
    "type": "list-item",
    "text": "First step",
    "spans": [],
    "direction": "ltr"
  },
  {
    "type": "list-item",
    "text": "Second step with a link",
    "spans": [
      {"type": "hyperlink", "start": 19, "end": 23, "data": {"link_type": "Web", "url": "/docs", "target": "_blank"}}
    ],
    "direction": "ltr"
  }
]
```

## Dual API Architecture

Prismic uses **two separate APIs** with different purposes:

| API | Purpose | Base URL | Auth Header |
|-----|---------|----------|-------------|
| **Migration API** | Create, update, delete | `https://migration.prismic.io` | `Authorization: Bearer {TOKEN}` |
| **Content API** | Read published content | `https://{repo}.cdn.prismic.io/api/v2` | `access_token` query param |

### Environment Variables

```bash
PRISMIC_KEY=           # Migration API write token (required for writes)
PRISMIC_READ_KEY=      # Content API read token (optional, for private repos)
PRISMIC_REPOSITORY=    # Repository name (e.g., "my-site")
```

### Migration API Patterns

```javascript
// Create document
POST https://migration.prismic.io/documents
Headers:
  Authorization: Bearer {PRISMIC_KEY}
  x-api-key: {PRISMIC_KEY}
  Repository: {PRISMIC_REPOSITORY}
  Content-Type: application/json

Body:
{
  "type": "blog",
  "uid": "my-article-slug",
  "lang": "en-us",
  "title": "Display title in release list",
  "tags": ["category-a", "featured"],
  "data": { ...field data... }
}

// Update document
PUT https://migration.prismic.io/documents/{doc_id}
// Same headers, body includes type, uid, lang, data

// Publish from migration release
POST https://migration.prismic.io/documents/{doc_id}/release
```

### Content API Patterns

```javascript
// Get master ref first (required for all queries)
GET https://{repo}.cdn.prismic.io/api/v2?access_token={READ_KEY}
// Response includes refs array, find isMasterRef: true

// Query by ID
GET https://{repo}.cdn.prismic.io/api/v2/documents/search
  ?ref={master_ref}
  &q=[[at(document.id, "{doc_id}")]]
  &access_token={READ_KEY}

// Query by UID and type
GET ...&q=[[at(my.blog.uid, "my-article-slug")]]

// Query by type
GET ...&q=[[at(document.type, "blog")]]
```

## Field Preservation (Critical)

**Problem:** Updating a document can accidentally erase fields you didn't modify.

**Solution:** Always fetch existing document, merge your changes, then update.

```javascript
// BAD: Overwrites ALL data fields
await updateDocument(docId, { title: "New Title" });

// GOOD: Preserves existing fields
const doc = await getDocument(docId);
const mergedData = { ...doc.data, title: "New Title" };
await updateDocument(docId, mergedData);
```

### What to Preserve

- **Tags**: Document metadata, not content. Preserve across updates.
- **Images**: Cannot be set via API. Set in dashboard.
- **Slices**: Custom content blocks. Preserve unless intentionally modifying.
- **Alternate languages**: Linked translations. Don't break the link.

## Multi-Language Documents

### Structure

- Each language variant is a **separate document**
- Same `uid` but different `lang` code
- Linked via `alternate_language_id` field

```javascript
// Create translation linked to source
POST https://migration.prismic.io/documents
{
  "type": "blog",
  "uid": "my-article",        // Same UID as source
  "lang": "zh-cn",            // Target language
  "alternate_language_id": "source_doc_id",  // Links to en-us version
  "data": { ...translated content... }
}
```

### Internal Link Updates

When translating, update internal links to match target locale:

```javascript
// Source (en-us)
"url": "/en-us/blog/some-article"

// Translation (zh-cn) - update the locale prefix
"url": "/zh-cn/blog/some-article"
```

## Common Gotchas

### UIDs
- Globally unique across all documents
- Max 60 characters
- Lowercase, alphanumeric, hyphens only
- Duplicate UID = 400 error

### Character Offsets
- Spans use **byte positions** in the text string
- One wrong offset breaks all inline formatting
- Test by rendering and verifying bold/links appear correctly

### Rate Limits
- Migration API: 1 request/second
- Use exponential backoff on 429 responses
- `Retry-After` header indicates wait time

### Images
- Cannot upload via Migration API
- Set `featured_image`, `meta_image` in Prismic dashboard
- Alt text can be set via API (it's just a string field)

### Migration Release
- Documents created via Migration API go to a "migration release"
- They're drafts until published via `/release` endpoint or dashboard
- Content API only sees published documents
- Use Migration API GET to fetch unpublished drafts

## Next.js Integration

### @prismicio/client Setup

```javascript
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

### Rendering Rich Text

```jsx
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

## Quick Reference

```
Block types:     paragraph | heading2-6 | list-item | o-list-item | preformatted | image
Span types:      strong | em | hyperlink
Link types:      Web | Document | Media
Migration API:   https://migration.prismic.io
Content API:     https://{repo}.cdn.prismic.io/api/v2
Rate limit:      1 req/sec (Migration)
UID max:         60 chars
```