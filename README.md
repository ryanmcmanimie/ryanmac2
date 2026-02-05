# Web Project Template

A full-featured Claude Code setup for Next.js + Prismic projects with session management and project memory.

## What's Included

```
templates/web-project/
├── CLAUDE.md                          # Core instructions (always loaded)
└── .claude/
    ├── prismic-patterns.md            # Prismic API patterns (on-demand)
    ├── agents/
    │   └── nextjs-expert.md           # Next.js architecture persona
    ├── commands/
    │   ├── primer.md                  # Session startup command
    │   └── hand-off.md                # Session transition command
    ├── skills/
    │   └── frontend-design/
    │       └── SKILL.md               # Anthropic's official frontend skill
    ├── memory/
    │   ├── project-context.md         # Project overview (customize)
    │   ├── known-gotchas.md           # Discovered gotchas (grows over time)
    │   ├── common-patterns.md         # Project patterns (grows over time)
    │   └── current-task.md            # In-progress work (managed by /hand-off)
    ├── settings.local.json            # Optional hooks
    └── vercel-status.md               # Status line setup
```

## How It Works

**CLAUDE.md** is lean and always loaded into context. It covers:
- Tech stack summary
- File structure conventions
- Code style preferences
- References to on-demand files

**On-demand references** (`.claude/*.md`) are loaded when Claude needs them, keeping base context small.

**Project memory** (`.claude/memory/`) persists learnings across sessions - gotchas, patterns, and project context evolve as you work.

**Session commands** (`/primer`, `/hand-off`) manage context across sessions, especially when work spans multiple conversations.

## Usage

1. **Copy to your project:**
   ```bash
   cp -r templates/web-project/.claude your-project/
   cp templates/web-project/CLAUDE.md your-project/
   ```

2. **Customize CLAUDE.md:**
   - Update the Overview section with your project description
   - Fill in your tech stack (Tailwind, etc.)
   - Add your testing and deployment commands
   - Adjust code conventions to match your preferences

3. **Test it:**
   - Open Claude Code in your project
   - Ask: "How do I create a Prismic rich text block with a hyperlink?"
   - Verify Claude reads the patterns file and gives accurate JSON structure

## Session Management

### `/primer` - Start a session

Run at the beginning of each Claude Code session:

```
/primer
```

This command:
- Loads project context from memory
- Checks for in-progress tasks (from previous `/hand-off`)
- Reviews recent git changes
- Prepares Claude with full project awareness

### `/hand-off` - End a session

Run when context is getting full or pausing work:

```
/hand-off
```

This command:
- Summarizes current task state
- Captures what's done and what's remaining
- Writes to `.claude/memory/current-task.md`
- Enables seamless continuation in next session

## Project Memory (Self-Annealing)

The `.claude/memory/` folder captures project learnings:

| File | Purpose | Updates |
|------|---------|---------|
| `project-context.md` | What the project is, key decisions | Manually when decisions change |
| `known-gotchas.md` | Gotchas discovered during development | When Claude discovers issues |
| `common-patterns.md` | Patterns specific to this codebase | When patterns emerge |
| `current-task.md` | State of in-progress work | Managed by `/hand-off` |

**How it works:** Claude reads memory at session start (`/primer`) and updates it when discovering new patterns or gotchas. Over time, the project "teaches" Claude how to work on it.

## Extending

Add more reference files to `.claude/` as needed:

```
.claude/
├── prismic-patterns.md      # CMS patterns
├── component-patterns.md    # Your component conventions
└── api-patterns.md          # Your API conventions
```

Reference them from CLAUDE.md:
```markdown
## Additional References
- `.claude/prismic-patterns.md` - Prismic API and rich text patterns
- `.claude/component-patterns.md` - Component architecture
```

## Agent Personas

The `nextjs-expert.md` agent provides a specialized persona for architecture decisions:

```
> "As the Next.js expert, review this page structure for performance issues..."
```

Claude adopts the expert's decision framework, patterns, and anti-patterns when activated.

## Frontend Design Skill

The `/frontend-design` skill is Anthropic's official skill for creating distinctive, production-grade UI. It auto-activates when building components but can be invoked explicitly:

```
/frontend-design
```

Key principles:
- **Bold aesthetic direction** - Commit to a tone (brutalist, minimalist, retro-futuristic, etc.)
- **Distinctive typography** - Avoid generic fonts (Inter, Arial, system fonts)
- **Sophisticated motion** - Staggered reveals, scroll-triggered animations
- **Visual depth** - Gradients, textures, grain overlays, dramatic shadows
- **No "AI slop"** - Avoid purple gradients on white, cookie-cutter layouts

## Automation Hooks (Optional)

The `settings.local.json` includes pre-built hooks:

| Hook | Trigger | Action |
|------|---------|--------|
| Build guard | Before `vercel --prod` | Runs build, blocks deploy on failure |
| Bundle reporter | After `npm run build` | Reports bundle size |

To use: copy `settings.local.json` to your project's `.claude/` directory.

## Vercel Status Line (Optional)

Show deployment status in Claude Code's status bar:

```
▲ Vercel ✅ READY | my-app-abc123.vercel.app
```

See `.claude/vercel-status.md` for setup instructions (requires `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`).

## Why This Structure?

The DOE framework (Directives, Orchestrators, Execution) is designed for AI-assisted business automation workflows. For web development, you don't need orchestrators and execution scripts - you're doing code assistance, not multi-step automation.

This template gives you:
- **Lean context**: CLAUDE.md stays small, on-demand files load when needed
- **Project memory**: Learnings persist across sessions (self-annealing)
- **Session continuity**: `/primer` and `/hand-off` manage context transitions
- **Optional automation**: Hooks, status line, and agent personas are opt-in
- **Easy to port**: Copy the `.claude/` folder to any new project
