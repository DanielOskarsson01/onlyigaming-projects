# PA Mobile Voice Capture

**Date**: 2026-01-26
**Status**: In progress - continue tomorrow

---

## What's Done

1. **Inbox system created**
   - `Projects/inbox/` - voice transcripts go here
   - `Projects/inbox/processed/` - archive after handling
   - `Projects/ideas-backlog.md` - idea storage

2. **PA agent updated** (`.agents/personal-assistant.md`)
   - New Step 1: Checks inbox on startup
   - Parses tasks, questions, ideas
   - Asks for approval before acting
   - Moves processed files to archive

3. **Tasker instructions ready** (`inbox/TASKER_SETUP.md`)

---

## Tomorrow: Finish Tasker Setup

Create task in Tasker with 6 actions:

| # | Action | Settings |
|---|--------|----------|
| 1 | Alert → Notify | "Recording for PA..." |
| 2 | Input → Get Voice | (defaults) |
| 3 | Alert → Notify Cancel | (defaults) |
| 4 | Variables → Variable Set | `%filename` = `%DATE-%TIME-voice` |
| 5 | File → Write File | `Dropbox/Projects/inbox/%filename.txt` with `%VOICE` |
| 6 | Alert → Flash | "Saved to PA inbox" |

Then add widget to home screen.

---

## Workflow When Complete

```
📱 Walk: Tap widget → Speak → Auto-saves to inbox
💻 Computer: Run "pa" → PA processes → You approve/discuss
```
