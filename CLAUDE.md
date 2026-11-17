# ryanmac2 (ryanmac.com)

## Overview

The website of RyanMac (RYANMAC LIMITED), Ryan McManimie's one-person Hong Kong agency selling web development,
design, SEO, paid ads, analytics and CRO to SMB clients, mostly HK/APAC plus some US. Next.js 16 (App Router),
Prismic (repo `ryanmac`), Tailwind 4, three.js/GSAP. Production branch `main`. This repo is the owner's own site
(`kind: owner` in hq, id `ryanmac`), not a client project.

## Tech Stack

- **Framework**: Next.js (App Router)
- **CMS**: Prismic
- **Styling**: <!-- Tailwind / CSS Modules / etc. -->
- **Deployment**: <!-- Vercel / etc. -->

## File Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── [uid]/
├── components/             # React components
├── lib/                    # Utilities and clients
│   └── prismic.ts          # Prismic client setup
├── slices/                 # Prismic Slice components (if using Slice Machine)
├── prismicio.ts            # Prismic configuration
└── .env.local              # Environment variables
```

## Session Management

**Start each session with `/primer`** - This loads project context, checks for in-progress work, and reviews recent changes.

**End sessions with `/hand-off`** - When context is running low or pausing work, this captures state for the next session.

## Project Memory

The `.claude/memory/` folder contains project learnings that persist across sessions:

- `project-context.md` - What this project is, key decisions
- `known-gotchas.md` - Gotchas discovered during development
- `common-patterns.md` - Patterns specific to this codebase
- `current-task.md` - State of in-progress work (managed by /hand-off)

**Update memory as you work** - When you discover gotchas or patterns, add them to the relevant file.

## Code Conventions

<!-- Customize these for your project -->

- Use TypeScript for all new files
- Always opt for Tailwind classes before vanilla CSS
- Prefer named exports over default exports
- Components: PascalCase (`MyComponent.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Keep components small and focused

## Prismic Integration

Prismic workflow: follow the `web:prismic-house-rules` skill; recipes: `web:prismic-shared-slice`, `web:blog-content`. Repo `ryanmac`. The repo-local `/prismic` skill in `.claude/skills/prismic/` predates the Slice Machine removal (see Operational notes); where it disagrees with the house rules, the house rules win.

## Testing

<!-- Customize for your project -->
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Linting
```

## Deployment

<!-- Add deployment notes specific to your project -->

For Vercel status line setup (shows deployment status in Claude Code), see `.claude/vercel-status.md`.

## Agents

When working on architecture decisions or performance optimization, activate the Next.js expert persona:

> "As the Next.js expert, review this component structure..."

See `.claude/agents/nextjs-expert.md` for the full persona with patterns and anti-patterns.

## Hooks (Optional)

The `.claude/settings.local.json` includes optional automation hooks:

- **Build guard**: Blocks production deploys if build fails
- **Bundle reporter**: Shows bundle size after builds

Copy to your project's `.claude/` and customize as needed.

## Additional References

**Commands:**
- `/primer` - Session startup (loads context, checks for tasks)
- `/hand-off` - Session transition (captures state for next session)

**Skills:**
- `/prismic` - repo-local Prismic notes (Slice Machine era; `web:prismic-house-rules` takes precedence)
- `/frontend-design` - Anthropic's official skill for distinctive, production-grade UI (avoids generic AI aesthetics)

**Reference Files:**
- `.claude/agents/nextjs-expert.md` - Next.js architecture persona
- `.claude/vercel-status.md` - Vercel status line setup

**Memory:**
- `.claude/memory/project-context.md` - Project overview
- `.claude/memory/known-gotchas.md` - Discovered gotchas
- `.claude/memory/common-patterns.md` - Project patterns

## Operational notes (from hq)

- Until 2026-11-17 this file was the unfilled starter template; the Overview above is now real, the rest of the
  template sections (Styling, Deployment, File Structure) are still generic. Actual layout: `src/app`,
  `src/components`, `src/slices`, `src/lib`, `src/providers`; dev server on port 3001.
- Slice Machine was removed in commit `4124bcb` ("Migrate from Slice Machine to Prismic Type Builder and CLI"):
  `prismic.config.json` replaces `slicemachine.config.json`, route resolvers live in `prismic.config.json`, and
  `npm run dev` runs Next only. As of 2026-11-17 that commit was still local-only on Ryan's laptop (origin/main is
  one commit behind and still has `slicemachine.config.json`).
- Nothing in this app serves `/slack-oauth`. A Slack app's OAuth redirect URL was once set to
  `https://ryanmac.com/slack-oauth`; that route does not exist here (only `/api/preview`, `/api/exit-preview`,
  `/api/revalidate`), so any Slack OAuth flow pointed at it will 404.
- Account ids (GA4 449237961, GSC `sc-domain:ryanmac.com`, Prismic `ryanmac`) are in
  `~/Github/hq/clients/ryanmac/client.yaml`.
- Business context, open work and client memory live in ~/Github/hq/clients/ryanmac/ (brief.md, now.md,
  memory.md). Run `wrap` at a stopping point.
