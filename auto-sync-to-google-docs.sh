#!/bin/bash
# Universal auto-sync: Convert markdown files to .docx across all projects
#
# Modes:
#   ./auto-sync-to-google-docs.sh              — Full sweep: all projects
#   ./auto-sync-to-google-docs.sh file.md      — Single file conversion
#   ./auto-sync-to-google-docs.sh --project X  — Sweep specific project folder
#
# Output structure:
#   Each project gets a docs/ subfolder with .docx copies
#   Projects root gets a docs/ folder mirroring all project docs

set -e

PROJECTS_ROOT="/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects"
ONLYIGAMING="${PROJECTS_ROOT}/OnlyiGaming"
ROOT_DOCS="${PROJECTS_ROOT}/docs"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Key file patterns to convert
KEY_FILES=(
    "PROJECT_STATUS.md"
    "ROADMAP.md"
    "QUICK_START.md"
    "README.md"
    "TASKS.md"
    "ARCHITECTURE.md"
    "CHANGELOG.md"
)

# Check if pandoc is available
if ! command -v pandoc &> /dev/null; then
    echo -e "${YELLOW}Pandoc not found. Installing...${NC}"
    brew install pandoc
fi

convert_file() {
    local FILE="$1"
    local OUTPUT_DIR="$2"  # Where to save the .docx

    if [ ! -f "$FILE" ]; then
        return 1
    fi

    local BASENAME=$(basename "$FILE" .md)
    local OUTPUT_FILE="${OUTPUT_DIR}/${BASENAME}.docx"

    # Create output directory if needed
    mkdir -p "$OUTPUT_DIR"

    # Strip emojis and convert to docx
    sed 's/[✅🔄⏳❌❓📋🚀⚠️🎯💡🔧📊🏗️✨🛠️📝🔍📌⭐🎉💪🤖🧪📈📉🔐💾🌐🔗📦🎨😀-🙏🌀-🗿]//g' "$FILE" | \
    pandoc -f markdown -t docx -o "$OUTPUT_FILE" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}+${NC} $(basename "$FILE") -> $(basename "$OUTPUT_FILE")"
        return 0
    else
        echo -e "  ${YELLOW}!${NC} Failed: $(basename "$FILE")"
        return 1
    fi
}

sweep_project() {
    local PROJECT_DIR="$1"
    local PROJECT_NAME=$(basename "$PROJECT_DIR")
    local PROJECT_DOCS="${PROJECT_DIR}/docs"
    local MIRROR_DIR="${ROOT_DOCS}/${PROJECT_NAME}"
    local FOUND=0

    for PATTERN in "${KEY_FILES[@]}"; do
        local FILE="${PROJECT_DIR}/${PATTERN}"
        if [ -f "$FILE" ]; then
            if [ $FOUND -eq 0 ]; then
                echo -e "\n${CYAN}${PROJECT_NAME}${NC}" >&2
            fi
            # Save to project's docs/ folder
            convert_file "$FILE" "$PROJECT_DOCS" >&2
            # Mirror to root docs/ folder
            convert_file "$FILE" "$MIRROR_DIR" > /dev/null 2>&1
            FOUND=$((FOUND + 1))
        fi
    done

    # Also check for any .md files in a docs/ source folder within the project
    if [ -d "${PROJECT_DIR}/docs" ]; then
        for MD_FILE in "${PROJECT_DIR}/docs/"*.md; do
            if [ -f "$MD_FILE" ]; then
                if [ $FOUND -eq 0 ]; then
                    echo -e "\n${CYAN}${PROJECT_NAME}${NC}" >&2
                fi
                convert_file "$MD_FILE" "$PROJECT_DOCS" >&2
                convert_file "$MD_FILE" "$MIRROR_DIR" > /dev/null 2>&1
                FOUND=$((FOUND + 1))
            fi
        done
    fi

    echo $FOUND
}

# ============================================
# MODE: Single file
# ============================================
if [ -n "$1" ] && [ "$1" != "--project" ] && [ "$1" != "--sweep" ]; then
    FILE="$1"
    if [ ! -f "$FILE" ]; then
        echo -e "${YELLOW}File not found: $FILE${NC}"
        exit 1
    fi

    DIR=$(dirname "$FILE")
    DOCS_DIR="${DIR}/docs"

    convert_file "$FILE" "$DOCS_DIR"
    echo -e "\n${GREEN}Done.${NC} Created in ${DOCS_DIR}/"
    echo "Upload to Google Drive to share with team."
    exit 0
fi

# ============================================
# MODE: Specific project
# ============================================
if [ "$1" == "--project" ] && [ -n "$2" ]; then
    PROJECT_PATH="${ONLYIGAMING}/$2"
    if [ ! -d "$PROJECT_PATH" ]; then
        echo -e "${YELLOW}Project not found: $2${NC}"
        echo "Available projects:"
        ls -1 "$ONLYIGAMING"
        exit 1
    fi

    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Syncing: $2${NC}"
    echo -e "${BLUE}========================================${NC}"

    sweep_project "$PROJECT_PATH"

    echo -e "\n${GREEN}Done.${NC} Docs saved to:"
    echo "  - ${PROJECT_PATH}/docs/"
    echo "  - ${ROOT_DOCS}/$2/"
    exit 0
fi

# ============================================
# MODE: Full sweep (all projects)
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Full Sweep: All Projects${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL=0

# Sweep root-level key files first
echo -e "\n${CYAN}Projects Root${NC}"
for PATTERN in "${KEY_FILES[@]}"; do
    FILE="${PROJECTS_ROOT}/${PATTERN}"
    if [ -f "$FILE" ]; then
        convert_file "$FILE" "$ROOT_DOCS"
        TOTAL=$((TOTAL + 1))
    fi
done

# Also convert PA_STATE.md at root
if [ -f "${PROJECTS_ROOT}/PA_STATE.md" ]; then
    convert_file "${PROJECTS_ROOT}/PA_STATE.md" "$ROOT_DOCS"
    TOTAL=$((TOTAL + 1))
fi

# Sweep all project directories
for PROJECT_DIR in "${ONLYIGAMING}"/*/; do
    if [ -d "$PROJECT_DIR" ] && [ "$(basename "$PROJECT_DIR")" != "docs" ]; then
        COUNT=$(sweep_project "$PROJECT_DIR")
        TOTAL=$((TOTAL + COUNT))
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Sweep complete: ${TOTAL} file(s) converted${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Docs saved to:"
echo "  - Each project: <project>/docs/*.docx"
echo "  - Root mirror:  ${ROOT_DOCS}/<project>/*.docx"
echo ""
echo "Upload to Google Drive to share with team."
