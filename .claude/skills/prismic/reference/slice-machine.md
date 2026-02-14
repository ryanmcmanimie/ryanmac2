# Slice Machine Reference

Create, update, and manage Prismic slices without MCP tools.

> **Note:** Slice Machine is typically already running—it starts concurrently with `npm run dev`. Check http://localhost:9999 before trying to start it manually.

---

## File Structure

```
src/slices/{SliceName}/
├── model.json      # Slice model definition
├── mocks.json      # Mock data for development
└── index.tsx       # Component implementation

customtypes/{type}/
└── index.json      # Custom type with slice zone

slicemachine.config.json  # Config pointing to slice libraries
```

---

## Slice Model (model.json)

### Basic Structure

```json
{
  "id": "example_slice",           // snake_case
  "type": "SharedSlice",
  "name": "ExampleSlice",          // PascalCase
  "description": "Description",
  "variations": [
    {
      "id": "default",             // camelCase
      "name": "Default",           // Human-readable
      "docURL": "...",
      "version": "initial",
      "description": "Default variation",
      "imageUrl": "",
      "primary": {
        // Fields go here
      },
      "items": {}                  // Deprecated - don't use
    }
  ]
}
```

### Naming Rules

| Element | Format | Example |
|---------|--------|---------|
| Slice ID | snake_case | `hero_section` |
| Slice Name | PascalCase | `HeroSection` |
| Variation ID | camelCase | `imageRight` |
| Variation Name | Title Case | `Image Right` |
| Field API ID | snake_case | `background_image` |

---

## Field Types

### StructuredText (Rich Text)

```json
{
  "type": "StructuredText",
  "config": {
    "label": "Description",
    "placeholder": "Enter text",
    "allowTargetBlank": true,
    "single": "paragraph,strong,em,hyperlink",
    "multi": null
  }
}
```

**Config options:**
- `single` - Single block, no line breaks. Options: `paragraph`, `preformatted`, `heading1-6`, `strong`, `em`, `hyperlink`, `image`, `embed`, `list-item`, `o-list-item`
- `multi` - Multiple blocks, line breaks allowed. Same options.
- Use ONE of `single` or `multi`, not both.

**Best practices:**
- **Default permitted types:** Always use `paragraph,strong,em,hyperlink` unless otherwise specified. This allows bold, italic, and links.
- **Headers/Titles:** Use `single: "strong,em,hyperlink"` (NO paragraph). Render with `asText()` + semantic heading tag.
- Descriptions: `multi` with `paragraph,strong,em,hyperlink`
- Don't split highlighted text into separate fields

**Title pattern:**
```json
"header": {
  "type": "StructuredText",
  "config": { "label": "Header", "single": "strong,em,hyperlink" }
}
```
```tsx
import { asText } from "@prismicio/client";
<h2>{asText(slice.primary.header)}</h2>
```
Why: Developers control heading hierarchy, not editors.

### Text (Plain)

```json
{
  "type": "Text",
  "config": {
    "label": "Tagline",
    "placeholder": "Enter tagline"
  }
}
```

### Image

```json
{
  "type": "Image",
  "config": {
    "label": "Background Image",
    "constraint": {
      "width": 1920,
      "height": 1080
    },
    "thumbnails": [
      { "name": "Mobile", "width": 640, "height": 480 }
    ]
  }
}
```

**Best practices:**
- Use `constraint` for aspect ratio control
- Don't create Image fields for decorative elements (SVGs, icons, shapes)

### Link

```json
{
  "type": "Link",
  "config": {
    "label": "Button",
    "allowText": true,
    "repeat": true,
    "variants": ["Primary", "Secondary"],
    "select": null
  }
}
```

**Config options:**
- `allowText` - Enable custom display text
- `repeat` - Allow multiple links (better than Group for buttons)
- `variants` - Style options
- `select` - Restrict to: `"document"`, `"media"`, or `"web"`

### Boolean

```json
{
  "type": "Boolean",
  "config": { "label": "Show Icon" }
}
```

### Number

```json
{
  "type": "Number",
  "config": { "label": "Count" }
}
```

### Select

```json
{
  "type": "Select",
  "config": {
    "label": "Alignment",
    "options": ["Left", "Center", "Right"]
  }
}
```

### Date / Timestamp

```json
{
  "type": "Date",
  "config": { "label": "Event Date" }
}
```

```json
{
  "type": "Timestamp",
  "config": { "label": "Event Time" }
}
```

### Color

```json
{
  "type": "Color",
  "config": { "label": "Accent Color" }
}
```

### Embed

```json
{
  "type": "Embed",
  "config": { "label": "Video" }
}
```

### Group (Repeatable)

```json
{
  "type": "Group",
  "config": {
    "label": "Features",
    "fields": {
      "title": {
        "type": "Text",
        "config": { "label": "Title" }
      },
      "description": {
        "type": "StructuredText",
        "config": {
          "label": "Description",
          "multi": "paragraph"
        }
      }
    }
  }
}
```

**Use for:**
- Repeating groups of fields
- Sliders, carousels, feature lists
- Don't use for adjacent links/buttons (use Link with `repeat: true`)

---

## Mock Data (mocks.json)

Array of mock objects, one per variation:

```json
[
  {
    "__TYPE__": "SharedSliceContent",
    "variation": "default",
    "primary": {
      "title": {
        "__TYPE__": "StructuredTextContent",
        "value": [
          {
            "type": "heading1",
            "content": { "text": "Welcome to Our Site" }
          }
        ]
      },
      "description": {
        "__TYPE__": "StructuredTextContent",
        "value": [
          {
            "type": "paragraph",
            "content": { "text": "This is a sample description." }
          }
        ]
      },
      "image": {
        "__TYPE__": "ImageContent",
        "origin": {
          "id": "main",
          "url": "https://images.unsplash.com/photo-xxx",
          "width": 1920,
          "height": 1080
        },
        "url": "https://images.unsplash.com/photo-xxx?w=1920&h=1080",
        "width": 1920,
        "height": 1080,
        "edit": {
          "zoom": 1,
          "crop": { "x": 0, "y": 0 },
          "background": "transparent"
        },
        "alt": "Description",
        "thumbnails": {}
      },
      "tagline": {
        "__TYPE__": "FieldContent",
        "value": "Your tagline here",
        "type": "Text"
      }
    },
    "items": []
  }
]
```

### Mock Field Types

| Field Type | Mock Structure |
|------------|----------------|
| Text | `{ "__TYPE__": "FieldContent", "value": "text", "type": "Text" }` |
| StructuredText | `{ "__TYPE__": "StructuredTextContent", "value": [blocks] }` |
| Image | `{ "__TYPE__": "ImageContent", "origin": {...}, "url": "...", ... }` |
| Link | `{ "__TYPE__": "LinkContent", "value": { "link_type": "Web", "url": "..." } }` |
| Boolean | `{ "__TYPE__": "FieldContent", "value": true, "type": "Boolean" }` |
| Number | `{ "__TYPE__": "FieldContent", "value": 42, "type": "Number" }` |
| Select | `{ "__TYPE__": "FieldContent", "value": "Option", "type": "Select" }` |

---

## Component Implementation (Next.js + Tailwind)

### Imports

```tsx
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, PrismicText } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
```

### Component Structure

```tsx
export type ExampleSliceProps = SliceComponentProps<Content.ExampleSliceSlice>;

const ExampleSlice = ({ slice }: ExampleSliceProps): JSX.Element => {
  return (
    <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      {/* Content */}
    </section>
  );
};

export default ExampleSlice;
```

### Rendering Fields

**Text:**
```tsx
<p>{slice.primary.tagline}</p>
```

**Rich Text:**
```tsx
<PrismicRichText field={slice.primary.description} />
// or plain text:
<PrismicText field={slice.primary.title} />
```

**Image:**
```tsx
<PrismicNextImage field={slice.primary.image} />
// Don't add alt prop - it comes from field
```

**Link:**
```tsx
<PrismicNextLink field={slice.primary.button}>
  {slice.primary.button.text || "Learn More"}
</PrismicNextLink>
```

**Repeatable Link:**
```tsx
{slice.primary.buttons.map((button, i) => (
  <PrismicNextLink key={i} field={button}>
    {button.text}
  </PrismicNextLink>
))}
```

**Group:**
```tsx
{slice.primary.features.map((item, i) => (
  <div key={i}>
    <h3>{item.title}</h3>
    <PrismicRichText field={item.description} />
  </div>
))}
```

### Check if Field Has Value

```tsx
import { isFilled } from "@prismicio/client";

if (isFilled.keyText(slice.primary.tagline)) { ... }
if (isFilled.richText(slice.primary.description)) { ... }
if (isFilled.image(slice.primary.image)) { ... }
if (isFilled.link(slice.primary.button)) { ... }
```

---

## Register Slice to Custom Type

Edit `customtypes/{type}/index.json`:

```json
{
  "json": {
    "Main": {
      "slices": {
        "type": "Slices",
        "fieldset": "Slice Zone",
        "config": {
          "choices": {
            "existing_slice": { "type": "SharedSlice" },
            "new_slice_id": { "type": "SharedSlice" }
          }
        }
      }
    }
  }
}
```

Add the slice's snake_case ID to `choices`.

---

## Workflow

1. **Create directory:** `src/slices/{SliceName}/`
2. **Write model.json:** Define fields and variations
3. **Write mocks.json:** Create mock data for each variation
4. **Write index.tsx:** Implement the component
5. **Register in custom type:** Add slice ID to custom type's slice zone (`customtypes/{type}/index.json`)
6. **Register in SliceZone:** Add to `src/slices/index.ts` components export
7. **Regenerate types:** `npx prismic-ts-codegen`

---

## Critical Gotchas

### SliceZone Registration (Step 6)

**If you see:** `Could not find a component for slice type "slice_name"`

**You forgot to register the slice in `src/slices/index.ts`:**

```ts
import dynamic from "next/dynamic";

export const components = {
  // ... existing slices
  my_new_slice: dynamic(() => import("./MyNewSlice")),
};
```

The slice ID must be snake_case and match the `id` in model.json.

### Type Generation May Fail

`npx prismic-ts-codegen` sometimes doesn't pick up new slices. If types are missing:

1. Manually add the slice types to `prismicio-types.d.ts`
2. Add the slice to the `HomeDocumentDataSlicesSlice` union (or relevant custom type)
3. Add to the `Content` namespace exports at the bottom
