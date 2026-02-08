# Multi-Language Documents

## Structure

- Each language variant is a **separate document**
- Same `uid` but different `lang` code
- Linked via `alternate_language_id` field

```javascript
// Create translation linked to source
POST https://migration.prismic.io/documents
{
  "type": "blog",
  "uid": "my-article",           // Same UID as source
  "lang": "zh-cn",               // Target language
  "alternate_language_id": "source_doc_id",  // Links to en-us version
  "data": { ...translated content... }
}
```

## Internal Link Updates

When translating, update internal links to match target locale:

```javascript
// Source (en-us)
"url": "/en-us/blog/some-article"

// Translation (zh-cn) - update the locale prefix
"url": "/zh-cn/blog/some-article"
```

## Span Position Rebuilding

When text length changes during translation, spans need repositioning. Use proportional positioning:

```python
# Calculate new position proportionally
original_ratio = original_start / original_text_length
new_start = int(original_ratio * new_text_length)

# Same for end position
original_end_ratio = original_end / original_text_length
new_end = int(original_end_ratio * new_text_length)
```

This is a heuristic—not perfect, but works well for most translations.

## Tags Are NOT Translated

Tags are document-level metadata, not content. Preserve them across translations without translating.

```python
# When cloning for translation
source_tags = source_doc.get("tags", [])
# Copy tags directly to translation (don't translate)
payload["tags"] = source_tags
```

## Safe Translation Pattern

```python
def clone_document_for_translation(source_doc_id, target_lang, data_overrides):
    # 1. Fetch complete source document
    source_doc = get_document(source_doc_id)

    # 2. Start with complete copy of source data
    translated_data = source_doc["data"].copy()

    # 3. Apply translated field overrides
    translated_data.update(data_overrides)

    # 4. Create translation with link to source
    return create_document(
        type=source_doc["type"],
        uid=source_doc["uid"],  # Same UID
        lang=target_lang,
        data=translated_data,
        alternate_language_id=source_doc_id,
        tags=source_doc.get("tags", []),  # Preserve tags
    )
```

This preserves all fields from source and only overrides what you explicitly translate.
