# Known Gotchas

<!--
Document gotchas discovered during development.
Claude reads this to avoid repeating mistakes.
Add new entries as you discover issues.
-->

## Format

```markdown
### [Category] Short description
**Discovered**: YYYY-MM-DD
**Symptom**: What went wrong
**Cause**: Why it happened
**Fix**: How to avoid/resolve
```

---

<!-- Add gotchas below as you discover them -->

### [Example] Prismic preview not updating
**Discovered**: 2024-01-15
**Symptom**: Preview mode shows stale content
**Cause**: Next.js caching the Prismic response
**Fix**: Add `{ cache: 'no-store' }` to fetch in preview mode

---

<!-- Your gotchas here -->
