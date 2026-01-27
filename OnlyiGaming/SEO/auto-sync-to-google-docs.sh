#!/bin/bash
# Auto-sync key markdown files to .docx format for Google Docs
# This script is called by Claude Code after updating documentation

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Key files to auto-sync
KEY_FILES=(
    "PROJECT_STATUS.md"
    "ROADMAP.md"
    "QUICK_START.md"
    "README.md"
    "Schema_Verification_Report_FOR_GOOGLE_DOCS.md"
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Auto-syncing files to .docx format${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get current timestamp
TIMESTAMP=$(date "+%B %d, %Y at %H:%M")

# Check if pandoc is available
if ! command -v pandoc &> /dev/null; then
    echo -e "${YELLOW}⚠ Pandoc not found. Please install: brew install pandoc${NC}"
    exit 1
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
    else
        echo -e "${YELLOW}⚠ Skipping:${NC} $FILE (not found)"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Auto-sync complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Updated files:${NC}"
for FILE in "${KEY_FILES[@]}"; do
    BASENAME=$(basename "$FILE" .md)
    OUTPUT_FILE="${BASENAME}_FOR_GOOGLE_DOCS.md"
    if [ -f "$OUTPUT_FILE" ]; then
        echo "  → ${GREEN}$OUTPUT_FILE${NC}"
    fi
done
echo ""
echo -e "${YELLOW}Next:${NC} Copy any updated file and paste into your Google Doc"
echo ""
