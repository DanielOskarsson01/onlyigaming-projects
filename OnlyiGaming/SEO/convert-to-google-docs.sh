#!/bin/bash
# Convert Markdown to Google Docs Format
# Usage: ./convert-to-google-docs.sh [filename.md]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Markdown to Google Docs Converter${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if file argument provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}No file specified. Available markdown files:${NC}"
    echo ""
    ls -1 *.md | grep -v "FOR_GOOGLE_DOCS" | nl
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./convert-to-google-docs.sh FILENAME.md"
    echo -e "${YELLOW}Example:${NC} ./convert-to-google-docs.sh ROADMAP.md"
    exit 1
fi

INPUT_FILE="$1"

# Check if file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${YELLOW}Error: File '$INPUT_FILE' not found${NC}"
    exit 1
fi

# Get base filename without extension
BASENAME=$(basename "$INPUT_FILE" .md)
OUTPUT_FILE="${BASENAME}_FOR_GOOGLE_DOCS.md"

echo -e "${GREEN}Converting:${NC} $INPUT_FILE"
echo -e "${GREEN}Output:${NC} $OUTPUT_FILE"
echo ""

# Copy the file with improved formatting for Google Docs
cat "$INPUT_FILE" > "$OUTPUT_FILE"

# Add metadata header
TIMESTAMP=$(date "+%B %d, %Y at %H:%M")
cat > /tmp/google_docs_header.txt << EOF
---
**Document:** $BASENAME
**Generated:** $TIMESTAMP
**Source:** OnlyiGaming SEO Project
**Instructions:** Copy all content below and paste into Google Docs

---

EOF

# Prepend header to output file
cat /tmp/google_docs_header.txt "$OUTPUT_FILE" > /tmp/temp_output.md
mv /tmp/temp_output.md "$OUTPUT_FILE"

echo -e "${GREEN}✓ Conversion complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Open the file: ${GREEN}$OUTPUT_FILE${NC}"
echo "2. Select all content (Cmd+A)"
echo "3. Copy (Cmd+C)"
echo "4. Go to https://docs.google.com"
echo "5. Create a blank document"
echo "6. Paste (Cmd+V)"
echo ""
echo -e "${YELLOW}Tip:${NC} Google Docs will preserve the formatting automatically"
echo ""

# Offer to open the file
read -p "Open the file now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "$OUTPUT_FILE"
    echo -e "${GREEN}File opened! Copy the content and paste into Google Docs.${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
