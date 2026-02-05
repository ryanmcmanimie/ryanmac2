# Session Primer

Initialize a new Claude Code session with full project context.

## Instructions

1. **Load project memory** - Read and internalize the following files:
   - `.claude/memory/project-context.md` - What this project is
   - `.claude/memory/known-gotchas.md` - Mistakes to avoid
   - `.claude/memory/common-patterns.md` - How code is written here

2. **Check for in-progress work** - Read `.claude/memory/current-task.md`
   - If there's an active task, summarize it and ask if we should continue
   - If no active task, proceed to step 3

3. **Review recent changes** - Run `git log --oneline -10` and `git status`
   - Note any uncommitted changes
   - Understand recent work direction

4. **Report readiness** - Provide a brief summary:
   ```
   Session initialized.

   Project: [name from project-context]
   Recent work: [from git log]
   Active task: [from current-task or "None"]

   Ready to assist. What would you like to work on?
   ```

## When to Use

Run `/primer` at the start of each session to:
- Give Claude full project context
- Avoid repeating past mistakes (gotchas)
- Continue interrupted work seamlessly
- Maintain coding consistency (patterns)

## Memory Updates

If during the session you discover:
- A new gotcha → Add to `.claude/memory/known-gotchas.md`
- A useful pattern → Add to `.claude/memory/common-patterns.md`
- Key decisions → Update `.claude/memory/project-context.md`

This keeps the project memory current for future sessions.
