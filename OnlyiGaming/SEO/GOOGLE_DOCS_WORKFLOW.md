# Google Docs Conversion Workflow

## 🚀 Automatic Sync (NEW!)

**Claude Code now auto-syncs key files after every update!**

When I update documentation, I automatically run:
```bash
./auto-sync-to-google-docs.sh
```

This creates Google Docs-ready versions of:
- `PROJECT_STATUS_FOR_GOOGLE_DOCS.md`
- `ROADMAP_FOR_GOOGLE_DOCS.md`
- `QUICK_START_FOR_GOOGLE_DOCS.md`
- `README_FOR_GOOGLE_DOCS.md`

**Your workflow:**
1. I update the markdown files (like I just did with schema verification)
2. I automatically run the sync script
3. You just open the `*_FOR_GOOGLE_DOCS.md` file you need
4. Copy/paste into Google Docs
5. Done!

---

## Manual Conversion (if needed)

To convert any other markdown file:

```bash
cd /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO
./convert-to-google-docs.sh FILENAME.md
```

The script will:
1. Create a Google Docs-ready version (e.g., `FILENAME_FOR_GOOGLE_DOCS.md`)
2. Add metadata header with timestamp
3. Open the file for you to copy

Then just:
1. Copy all content (Cmd+A, Cmd+C)
2. Paste into a new Google Doc (Cmd+V)
3. Share with your team

---

## Available Files to Convert

Key project documentation files:

- **ROADMAP.md** - Complete 5-phase implementation plan
- **PROJECT_STATUS.md** - Current status and priorities
- **QUICK_START.md** - Team quick reference guide
- **CLAUDE.md** - Full project context and session logs
- **README.md** - Project overview
- **Schema_Verification_Report_FOR_GOOGLE_DOCS.md** - Already formatted for Google Docs

---

## Workflow Recommendations

### For Major Milestones
Convert and share when you complete:
- Phase completion (e.g., Phase 1 schema verification)
- Major feature deployment
- Significant progress updates

**Files to convert:**
- `PROJECT_STATUS.md` - Quick overview
- `ROADMAP.md` - Progress against plan
- Create a custom report (like Schema Verification Report)

### For Weekly Updates
Convert and share every week:
- `PROJECT_STATUS.md` - What's done, what's next, any blockers

### For Team Onboarding
Convert and share these files:
- `README.md` - Project overview
- `QUICK_START.md` - Role-specific guidance
- `ROADMAP.md` - Implementation plan

---

## How It Works

### The Conversion Script
```bash
./convert-to-google-docs.sh FILENAME.md
```

**What it does:**
1. Adds a metadata header with timestamp
2. Creates a `_FOR_GOOGLE_DOCS.md` version
3. Preserves all markdown formatting
4. Optionally opens the file

**What it DOESN'T change:**
- Original files remain untouched
- Claude Code keeps updating the source markdown files
- You manually sync to Google Docs when needed

### Manual Conversion (No Script)
If you prefer manual control:
1. Open any `.md` file
2. Copy all content (Cmd+A, Cmd+C)
3. Create new Google Doc
4. Paste (Cmd+V)
5. Google Docs auto-converts markdown formatting

---

## Two-Way Workflow

### Claude Updates → Google Docs
1. Claude Code updates markdown files as you work together
2. When you need to share with team, run: `./convert-to-google-docs.sh FILENAME.md`
3. Copy/paste into Google Docs
4. Share with team

### Team Feedback → Claude Updates
1. Team adds comments/suggestions in Google Docs
2. You tell me about changes: "Stefan suggested we add X to the roadmap"
3. I update the markdown source files
4. Next sync includes the changes

---

## Pro Tips

### Keeping Docs in Sync
- **Source of truth:** Markdown files (Claude can update these)
- **Team sharing:** Google Docs (you manually sync these)
- **Sync frequency:** After milestones, weekly, or as needed

### Version Control
The script adds timestamps to help track versions:
```
**Generated:** January 23, 2026 at 14:30
```

### Batch Conversion
To convert multiple files at once:
```bash
for file in ROADMAP.md PROJECT_STATUS.md QUICK_START.md; do
    ./convert-to-google-docs.sh "$file"
done
```

### Auto-Open After Conversion
The script asks if you want to open the file automatically:
```
Open the file now? (y/n)
```
Type `y` to open immediately for copying

---

## Example: Weekly Status Update

```bash
# 1. Convert current status
./convert-to-google-docs.sh PROJECT_STATUS.md

# 2. Copy content (Cmd+A, Cmd+C)

# 3. Update existing Google Doc or create new one
# - If updating: Replace all content with fresh version
# - If new: Create blank doc, paste, share

# 4. Share with team
# - Bojan: Editor access
# - Stefan: Editor access
# - Daniel: Commenter access
# - Others: Viewer access
```

---

## Google Docs Settings Recommendations

### Sharing Permissions
- **Bojan, Stefan:** Editor (can make changes)
- **Daniel:** Commenter (can suggest changes)
- **Stakeholders:** Viewer (read-only)

### Notification Settings
Enable "Notify people" when sharing updates

### Suggested Edits
Enable "Suggesting" mode for collaborative editing:
- View → Mode → Suggesting

This way changes show as suggestions, not direct edits

---

## Alternative: Direct Google Drive Integration

If you prefer, you can:
1. Upload markdown files directly to Google Drive
2. Right-click → "Open with Google Docs"
3. Google Drive auto-converts to Google Docs format

**Trade-off:**
- Easier (no copy/paste)
- But creates separate copies in Drive
- Harder to track which version is current

---

## Troubleshooting

### Tables Not Formatting Correctly
Markdown tables should convert automatically, but if they don't:
- Use the HTML version of the report instead
- Or manually format the table in Google Docs

### Links Not Clickable
- Google Docs should auto-detect URLs and make them clickable
- If not, manually select the URL and Cmd+K to add link

### Checkboxes Not Converting
- `- [ ]` and `- [x]` might not convert to checkboxes
- Manually insert checkboxes in Google Docs: Insert → Checkbox

---

## Files Generated by Script

The script creates `*_FOR_GOOGLE_DOCS.md` files:
- `ROADMAP_FOR_GOOGLE_DOCS.md`
- `PROJECT_STATUS_FOR_GOOGLE_DOCS.md`
- `QUICK_START_FOR_GOOGLE_DOCS.md`

These are temporary files for copying to Google Docs. The originals remain unchanged.

---

## Questions?

Ask Claude Code:
- "Convert the roadmap for Google Docs"
- "Create a status report for the team"
- "Generate a report showing what we completed this week"

Claude can create custom reports formatted specifically for your needs.
