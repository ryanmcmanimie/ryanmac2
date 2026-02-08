# Rich Text Format

Prismic rich text is an **array of block objects** where inline formatting uses character-offset spans.

## Block Structure

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

## Block Types

| Type | Usage |
|------|-------|
| `paragraph` | Body text |
| `heading2` - `heading6` | Section headings |
| `list-item` | Unordered list item |
| `o-list-item` | Ordered list item |
| `preformatted` | Code blocks |
| `image` | Images (with alt, linkTo properties) |

## Span Types

```json
// Bold
{"type": "strong", "start": 0, "end": 4}

// Italic
{"type": "em", "start": 5, "end": 10}

// External hyperlink
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

// Internal document link
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

## Complete Example

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
  }
]
```

## Critical: Character Offsets

Spans use **byte positions** in the text string. One wrong offset breaks all inline formatting in that block.

- Test by rendering and verifying bold/links appear correctly
- When generating programmatically, track character positions carefully
- When translating, text length changes—use proportional positioning to approximate
