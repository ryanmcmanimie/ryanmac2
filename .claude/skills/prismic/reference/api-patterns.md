# API Patterns

## Dual API Architecture

| API | Purpose | Base URL | Auth |
|-----|---------|----------|------|
| **Migration API** | Create, update, delete | `https://migration.prismic.io` | `Authorization: Bearer {TOKEN}` |
| **Content API** | Read published content | `https://{repo}.cdn.prismic.io/api/v2` | `access_token` query param |

## Environment Variables

```bash
PRISMIC_KEY=           # Migration API write token (required for writes)
PRISMIC_READ_KEY=      # Content API read token (optional, for private repos)
PRISMIC_REPOSITORY=    # Repository name (e.g., "my-site")
```

## Migration API Patterns

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

// Publish from migration release
POST https://migration.prismic.io/documents/{doc_id}/release
```

## Content API Patterns

```javascript
// Get master ref first (required for all queries)
GET https://{repo}.cdn.prismic.io/api/v2?access_token={READ_KEY}
// Response includes refs array, find isMasterRef: true

// Query by ID
GET .../documents/search?ref={master_ref}&q=[[at(document.id, "{doc_id}")]]

// Query by UID and type
GET ...&q=[[at(my.blog.uid, "my-article-slug")]]
```

## Error Handling

```python
class PrismicAPIError(Exception):
    """Non-retryable errors (400, 401, 403, 404)"""
    pass

class PrismicRateLimitError(Exception):
    """429 responses - check retry_after attribute"""
    pass
```

**Retry strategy:** Exponential backoff, max 3 retries, initial wait 1-2 seconds, backoff factor 2.0.

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

| Field Type | Preserve? | Notes |
|------------|-----------|-------|
| Tags | Yes | Document metadata, not content |
| Images | N/A | Cannot set via API, use dashboard |
| Slices | Yes | Unless intentionally modifying |
| Alternate languages | Yes | Don't break translation links |

## UID Generation

**Constraints:**
- Globally unique across all documents
- Max 60 characters
- Lowercase, alphanumeric, hyphens only
- Duplicate UID = 400 error

```python
def generate_uid(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    if len(slug) > 60:
        slug = slug[:60].rsplit('-', 1)[0]
    return slug
```

## Publishing Workflow

1. **Create** → Document exists as draft in migration release
2. **Verify** → Use `--dry-run` to validate payload
3. **Publish** → `POST /documents/{id}/release` or via dashboard
4. **Live** → Content API now sees the document

**Note:** Content API only sees published documents. Use Migration API GET for unpublished drafts.
