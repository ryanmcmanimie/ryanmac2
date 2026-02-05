# Project Instructions

## Overview

<!-- Customize this section for your project -->
This is a Next.js web application using Prismic as the headless CMS.

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
- Prefer named exports over default exports
- Components: PascalCase (`MyComponent.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Keep components small and focused

## Prismic Integration

When working with Prismic content (rich text, documents, slices, or API calls), **read `.claude/prismic-patterns.md`** for:
- Rich text block and span format (JSON structure)
- Migration API vs Content API patterns
- Field preservation rules
- Multi-language document patterns
- Common gotchas (UIDs, character offsets, rate limits)

### Quick Environment Setup

```bash
PRISMIC_REPOSITORY=your-repo-name
PRISMIC_READ_KEY=your-content-api-token    # For reading published content
PRISMIC_KEY=your-migration-api-token       # For creating/updating (if needed)
```

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
- `/frontend-design` - Anthropic's official skill for distinctive, production-grade UI (avoids generic AI aesthetics)

**Reference Files:**
- `.claude/prismic-patterns.md` - Prismic API and rich text patterns
- `.claude/agents/nextjs-expert.md` - Next.js architecture persona
- `.claude/vercel-status.md` - Vercel status line setup

**Memory:**
- `.claude/memory/project-context.md` - Project overview
- `.claude/memory/known-gotchas.md` - Discovered gotchas
- `.claude/memory/common-patterns.md` - Project patterns
