---
name: prismic
description: Work with Prismic CMS content—rich text, documents, translations, and API calls. Invoke when creating, updating, or migrating Prismic content.
---

# Prismic Integration Skill

Work with Prismic CMS content including rich text, documents, translations, and API operations.

## Core Principles

Before any Prismic work, internalize these rules:

### 1. Field Preservation (Critical)

> **Always fetch → merge → update. Never blind overwrite.**

Updating a document can accidentally erase fields you didn't modify.

### 2. Character Offset Sensitivity

Rich text spans use **byte positions**. One wrong offset breaks all inline formatting in that block.

### 3. API Selection

| Task | API |
|------|-----|
| Read published content | Content API |
| Create, update, delete | Migration API |
| Read unpublished drafts | Migration API GET |

### 4. Rate Limits

Migration API: 1 request/second. Use exponential backoff on 429.

---

## Reference Files

Load these on-demand based on what you're working on:

| File | When to Load |
|------|--------------|
| `reference/rich-text.md` | Working with rich text blocks, spans, formatting |
| `reference/api-patterns.md` | Making API calls, authentication, error handling |
| `reference/translation.md` | Multi-language documents, span rebuilding |
| `reference/nextjs.md` | @prismicio/client setup, rendering components |
| `reference/slice-machine.md` | Creating/updating slices (models, mocks, components) |

---

## Self-Annealing

When you discover errors, edge cases, or better patterns:

**Update the reference files directly.** Don't create separate notes—fix the source.

| Discovery | Update This File |
|-----------|------------------|
| Rich text format issue | `reference/rich-text.md` |
| API behavior, rate limits, auth | `reference/api-patterns.md` |
| Translation/multi-language | `reference/translation.md` |
| Next.js integration | `reference/nextjs.md` |
| Slice models, mocks, components | `reference/slice-machine.md` |

This keeps knowledge where it's used. The skill improves over time.

---

## Quick Reference

```
Block types:     paragraph | heading2-6 | list-item | o-list-item | preformatted | image
Span types:      strong | em | hyperlink
Link types:      Web | Document | Media
Migration API:   https://migration.prismic.io
Content API:     https://{repo}.cdn.prismic.io/api/v2
Rate limit:      1 req/sec (Migration)
UID max:         60 chars, lowercase, alphanumeric + hyphens
Field rule:      Fetch → merge → update (never blind overwrite)
```
