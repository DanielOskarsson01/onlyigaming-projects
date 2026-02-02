Create a professional PDF brochure from: $ARGUMENTS

## Toolkit Location

Brochure generator: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/.tools/brochures/md_to_brochure.py`

## Process

1. **Identify the source** - Determine what content to convert:
   - If user provides a file path → use that markdown file
   - If user provides a topic → create markdown content first, then convert

2. **Generate the brochure** - Run the Python script:
   ```bash
   python3 /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/.tools/brochures/md_to_brochure.py input.md output.pdf --title "Title" --author "Author"
   ```

3. **Save output** - Place the PDF in the same directory as the source or user-specified location

## Markdown Structure Recognition

The generator automatically converts markdown structure to professional brochure elements:

| Markdown | Brochure Element |
|----------|------------------|
| `# Heading 1` | Chapter (new page + colored divider bar) |
| `## Heading 2` | Section header (bold, large) |
| `### Heading 3` | Subsection header (bold, medium) |
| `- bullet` | Bullet list with styled bullets |
| `**bold**` | Bold text |
| `*italic*` | Italic text |
| `> quote` | Styled quote block |
| `| table |` | Formatted table with headers |
| `---` | Page break |

## Command Options

```bash
python3 md_to_brochure.py input.md [output.pdf] [options]

Options:
  --title, -t    Custom title (default: from first H1)
  --author, -a   Author name for cover
  --no-cover     Skip the cover page
```

## Design System

The brochure uses a professional iGaming theme:

| Element | Color |
|---------|-------|
| Primary Dark | #1a1a2e |
| Accent Gold | #d4a574 |
| Accent Teal | #0f9b8e |
| Accent Purple | #6b5b95 |
| Accent Orange | #e07a5f |
| Accent Green | #3d9970 |

Chapters cycle through accent colors for visual variety.

## Examples

**Convert existing markdown:**
```bash
python3 .tools/brochures/md_to_brochure.py docs/VISION.md --author "OnlyiGaming"
```

**Convert with custom title:**
```bash
python3 .tools/brochures/md_to_brochure.py README.md brochure.pdf --title "Product Overview" --author "Company Name"
```

## Requirements

- Python 3.x
- ReportLab library: `pip install reportlab`

## Tips for Best Results

1. **Use H1 for chapters** - Each `# Heading` creates a new chapter page with colored divider
2. **Keep sections focused** - H2 sections should be logical groupings
3. **Use tables for data** - Tables render with styled headers and alternating rows
4. **Add page breaks** - Use `---` to force page breaks between major sections
5. **Quotes stand out** - Use `> blockquote` for important callouts
