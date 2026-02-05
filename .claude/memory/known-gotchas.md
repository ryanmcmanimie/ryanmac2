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

### [Tailwind v4] Custom fonts not loading with next/font
**Discovered**: 2025-02-05
**Symptom**: `font-condensed` class shows wrong font; bundled fonts don't render
**Cause**: `@theme` is build-time only; can't access runtime CSS variables from `next/font`
**Fix**: Use `@theme inline` to reference `next/font` variables, and apply `.variable` class to body

---

### [GSAP] ScrollTrigger pinned elements don't move with animated parent
**Discovered**: 2026-02-06
**Symptom**: When opening PushMenu (which translates content container with `y: 100svh`), pinned ScrollTrigger sections disappear or stay in place instead of sliding down
**Cause**: ScrollTrigger's default `pin` uses `position: fixed`, which positions relative to viewport, not parent container
**Fix**: Add `pinType: "transform"` to ScrollTrigger config - this uses CSS transforms instead of fixed positioning, so pinned elements move with their parent

```js
ScrollTrigger.create({
  pin: true,
  pinType: "transform",  // <-- Add this
  // ...
});
```

---

<!-- Your gotchas here -->
