# Project Context

<!--
This file captures key context about your project.
Claude reads this at session start to understand what you're building.
Update it as your project evolves.
-->

## What This Project Is

Personal website and portfolio for RyanMac - a solo agency and creative based in Hong Kong.

**Purpose:**
- Showcase creative and agency work
- Attract potential clients
- Establish personal brand

**Target audience:**
<!-- Who are you trying to reach? -->
- Potential clients (SMBs)
- Collaborators

**Key sections:**
<!-- What pages/sections does the site have? 
- Portfolio/work
- About
- Services
- Contact
- Blog (if applicable)
-->

**Design direction:**
<!-- Any brand guidelines or aesthetic preferences? 
- Tone: [minimal / bold / playful / professional / etc.]
- Key colors: [if established]
- Vibe: [references or keywords]
-->

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Next.js 16+ (App Router) | Server Components for performance, streaming for perceived speed, built-in image optimization | 2025-02 |
| Tailwind v4 | Native CSS cascade layers, zero-config content detection, smaller runtime | 2025-02 |
| Prismic v7 | Slice-based content modeling fits portfolio structure, good preview support, lower cost than Contentful | 2025-02 |
| Vercel hosting | Zero-config Next.js deploys, edge functions, analytics built-in | 2025-02 |
| No database | Content lives in Prismic; no auth or user-generated content needed | 2025-02 |

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **CMS**: Prismic v7
- **Styling**: Tailwind v4
- **Hosting**: Vercel

## Important Files

<!-- List files that are central to understanding the codebase -->

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout |
| `lib/prismic.ts` | Prismic client setup |
| `prismicio-types.d.ts` | Generated Prismic types |

## Current Focus

<!-- What are you actively working on? -->

