# Google Docs Export Skill

**Purpose:** Automatically convert markdown documentation to Word documents (.docx) for sharing with team via Google Docs.

**When to use:** After updating key project documentation files (ROADMAP.md, PROJECT_STATUS.md, etc.) and the user needs to share with their team.

---

## Automatic Workflow

When you update documentation in a project, **automatically run the conversion script** if it exists:

```bash
cd [PROJECT_DIR] && ./auto-sync-to-google-docs.sh
```

**Key files that trigger auto-conversion:**
- PROJECT_STATUS.md
- ROADMAP.md
- QUICK_START.md
- README.md
- Any verification reports

---

## How It Works

### 1. After updating documentation, run the script
```bash
cd /path/to/project && ./auto-sync-to-google-docs.sh
```

### 2. Script converts markdown → .docx
- Uses Pandoc to convert markdown to Word format
- Removes all emojis/icons for clean professional documents
- Creates `.docx` files with same base name as source

### 3. Output
Creates Word documents like:
- `PROJECT_STATUS.docx`
- `ROADMAP.docx`
- `QUICK_START.docx`
- `README.docx`

### 4. Inform user
Tell the user:
```
✓ Auto-sync complete! Word documents created:
  - PROJECT_STATUS.docx
  - ROADMAP.docx
  - QUICK_START.docx
  - README.docx

Upload these to Google Drive to share with your team.
```

---

## Script Template

If the project doesn't have `auto-sync-to-google-docs.sh`, create it:

```bash
#!/bin/bash
# Auto-sync key markdown files to .docx format for Google Docs

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

KEY_FILES=(
    "PROJECT_STATUS.md"
    "ROADMAP.md"
    "QUICK_START.md"
    "README.md"
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Auto-syncing files to .docx format${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if pandoc is available
if ! command -v pandoc &> /dev/null; then
    echo -e "${YELLOW}⚠ Pandoc not found. Installing...${NC}"
    brew install pandoc
fi

for FILE in "${KEY_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        BASENAME=$(basename "$FILE" .md)
        OUTPUT_FILE="${BASENAME}.docx"

        echo -e "${GREEN}✓ Converting:${NC} $FILE → $OUTPUT_FILE"

        # Convert markdown to .docx, removing emojis
        sed 's/[😀-🙏🌀-🗿🚀-🛿✀-➿]//' "$FILE" | \
        sed 's/✅//g' | \
        sed 's/🔄//g' | \
        sed 's/⏳//g' | \
        sed 's/❌//g' | \
        sed 's/❓//g' | \
        sed 's/📋//g' | \
        sed 's/🚀//g' | \
        pandoc -f markdown -t docx -o "$OUTPUT_FILE"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Auto-sync complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Upload .docx files to Google Drive and share with team."
```

Make it executable:
```bash
chmod +x ./auto-sync-to-google-docs.sh
```

---

## When to Auto-Run

**Automatically run after these actions:**

1. **Major documentation updates:**
   - Updated PROJECT_STATUS.md with new milestones
   - Updated ROADMAP.md with progress
   - Created verification reports
   - Completed major tasks

2. **User explicitly requests:**
   - "Create docs for the team"
   - "Generate Google Docs version"
   - "Share this with the team"

3. **After milestone completion:**
   - Schema verification complete
   - Phase completion
   - Major feature deployment

---

## Example Usage

### Scenario 1: After updating status
```
User: "Update the project status with the schema verification results"

Agent:
1. Updates PROJECT_STATUS.md with verification info
2. Runs ./auto-sync-to-google-docs.sh
3. Tells user: "✓ Updated PROJECT_STATUS.md and created PROJECT_STATUS.docx.
   Upload to Google Drive to share with your team."
```

### Scenario 2: User explicitly requests
```
User: "Create a doc I can share with Bojan"

Agent:
1. Runs ./auto-sync-to-google-docs.sh
2. Lists all .docx files created
3. Suggests which file to share based on context
```

---

## Integration with CLAUDE.md

Add this to project CLAUDE.md files:

```markdown
## Auto-Sync to Google Docs

After updating documentation, automatically run:
```bash
cd /path/to/project && ./auto-sync-to-google-docs.sh
```

This creates .docx files for sharing with the team.
```

---

## Troubleshooting

### If Pandoc not installed:
```bash
brew install pandoc
```

### If script doesn't exist:
Create it using the template above and make it executable.

### If conversion fails:
Check that markdown files exist and are valid UTF-8.

---

## Summary

**When you update documentation:**
1. Make your changes to .md files
2. Run `./auto-sync-to-google-docs.sh`
3. Tell user which .docx files were created
4. Remind user to upload to Google Drive

**Simple, automatic, no manual copy/paste needed!**
