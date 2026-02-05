# Session Hand-Off

Prepare context for transitioning to a new Claude session.

## Instructions

When context is running low or you need to end a session mid-task:

1. **Summarize current state** - Capture:
   - What task we were working on
   - What's been completed
   - What's left to do
   - Any blockers or decisions needed
   - Files currently being modified

2. **Write to current-task.md** - Update `.claude/memory/current-task.md` with:

   ```markdown
   # Current Task

   ## Task
   [Brief description of what we're working on]

   ## Status
   [In Progress / Blocked / Ready for Review]

   ## Completed
   - [x] Thing 1
   - [x] Thing 2

   ## Remaining
   - [ ] Thing 3
   - [ ] Thing 4

   ## Blockers
   [Any blockers or decisions needed, or "None"]

   ## Files Modified
   - `path/to/file1.tsx` - [what was changed]
   - `path/to/file2.ts` - [what was changed]

   ## Notes for Next Session
   [Any context the next session needs to know]

   ## Last Updated
   [Current date/time]
   ```

3. **Capture any learnings** - If we discovered:
   - Gotchas → Add to `known-gotchas.md`
   - Patterns → Add to `common-patterns.md`

4. **Confirm hand-off** - Output:
   ```
   Hand-off complete.

   Task: [task name]
   Status: [status]
   Remaining: [count] items

   Next session: Run /primer to continue.
   ```

## When to Use

- Context is getting full (compaction warning)
- Need to pause work and continue later
- Switching to a different task temporarily
- End of work session

## Recovery

The next session runs `/primer` which will:
1. Load project memory
2. Find the current-task.md
3. Offer to continue where we left off
