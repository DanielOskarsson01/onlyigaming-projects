# Voice Inbox

Drop transcribed voice notes here. PA will process them when you start a session.

## How to Use

### Option A: Otter.ai (Recommended)
1. Record voice notes in Otter.ai app
2. Otter auto-transcribes
3. Export to this folder (or set up auto-sync)

### Option B: iPhone Voice Memos + Whisper
1. Record in Voice Memos
2. Use iOS Shortcut to transcribe via Whisper API
3. Shortcut saves transcript here

### Option C: Manual
1. Record voice notes anywhere
2. Transcribe (manually or any service)
3. Save as `.txt` or `.md` file here

## File Naming

Any name works, but suggested format:
```
YYYY-MM-DD-context.txt
```

Examples:
- `2026-01-25-morning-walk.txt`
- `2026-01-25-commute-ideas.txt`

## What Happens

When you run `pa` or start a session:
1. PA reads all files in `/inbox/`
2. Parses each note for: tasks, questions, ideas
3. Tasks → added to relevant project backlog
4. Questions → answered or flagged for research
5. Ideas → logged to `ideas-backlog.md`
6. Processed files → moved to `/inbox/processed/`

## Example Voice Note

```
Add a rate limiting feature to the content pipeline API before we launch.

Question: Did we decide on the tag hierarchy for the news section?

Idea for later - what if the directory had a comparison tool where users
could compare two companies side by side?
```

PA will parse this as:
- 1 task (rate limiting)
- 1 question (tag hierarchy)
- 1 idea (comparison tool)
