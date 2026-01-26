Create a professional PowerPoint presentation about: $ARGUMENTS

## Toolkit Location

All presentation tools are at: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/.tools/presentations/`

## Process

1. **Determine content** - Based on the user's request, plan the slide structure (5-10 slides typical)
2. **Create slides.json** - Write a JSON file defining all slides using the format below
3. **Generate PPTX** - Run the generator script to produce the .pptx file
4. **Save output** - Place the .pptx in the user's current working directory or specified location

## Slide Types Available

### title
Opening slide with centered title, subtitle, and accent divider.
```json
{
  "type": "title",
  "eyebrow": "CATEGORY OR CONTEXT",
  "title": "Main Presentation Title",
  "subtitle": "Supporting description text",
  "footer": "Author Name | January 2026"
}
```

### content
General content slide with eyebrow, title, and either bullet points or colored cards.
```json
{
  "type": "content",
  "eyebrow": "SECTION NAME",
  "eyebrowColor": "2ecc71",
  "title": "Slide Title",
  "cards": [
    { "label": "KEY POINT", "text": "Description of this point", "color": "2ecc71" },
    { "label": "WARNING", "text": "Something to watch out for", "color": "e63946" },
    { "label": "NOTE", "text": "Additional information", "color": "f59e0b" }
  ],
  "conclusion": "Optional footer conclusion text"
}
```

Or with bullets instead of cards:
```json
{
  "type": "content",
  "eyebrow": "OVERVIEW",
  "title": "Bullet Points Slide",
  "bullets": [
    "First point to make",
    "Second point with detail",
    "Third important item"
  ]
}
```

### comparison
Side-by-side comparison of two options (red=bad vs green=good).
```json
{
  "type": "comparison",
  "eyebrow": "ANALYSIS",
  "title": "Option A vs Option B",
  "optionA": {
    "label": "CURRENT APPROACH",
    "value": "1 490 kr",
    "bullets": ["Negative point 1", "Negative point 2", "Negative point 3"]
  },
  "optionB": {
    "label": "RECOMMENDED",
    "value": "1 200 kr",
    "bullets": ["Positive point 1", "Positive point 2", "Positive point 3"]
  },
  "conclusion": "Summary of why option B is better"
}
```

### conclusion
Final CTA slide with summary points and a green action box.
```json
{
  "type": "conclusion",
  "title": "Next Steps",
  "points": [
    { "label": "DECISION 1", "text": "What needs to happen first", "color": "2ecc71" },
    { "label": "DECISION 2", "text": "Follow-up action required", "color": "f59e0b" },
    { "label": "RISK", "text": "What happens if we don't act", "color": "e63946" }
  ],
  "cta": {
    "label": "RECOMMENDED ACTION",
    "text": "Clear statement of what should happen next, with specific details and timeline."
  }
}
```

## Complete slides.json Format

```json
{
  "title": "Presentation Title",
  "author": "Author Name",
  "subject": "Brief description",
  "output": "filename.pptx",
  "slides": [
    { "type": "title", ... },
    { "type": "content", ... },
    { "type": "comparison", ... },
    { "type": "content", ... },
    { "type": "conclusion", ... }
  ]
}
```

## Generation Command

```bash
cd /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/.tools/presentations && node create_pptx.js /path/to/slides.json
```

## Design System Colors

| Color | Hex | Use |
|-------|-----|-----|
| Red | e63946 | Warnings, problems, bad options |
| Green | 2ecc71 | Success, positive, CTAs, good options |
| Orange | f59e0b | Highlights, notes, caution |
| Blue | 3b82f6 | Information, neutral accent |

## Style Guidelines

- Keep slide titles concise (3-8 words)
- Use UPPERCASE for eyebrow text and card labels
- Limit cards to 3-4 per slide for readability
- Limit bullets to 5-6 per slide
- Use comparison slides for any A-vs-B decisions
- Always end with a conclusion slide that has a clear CTA
- Footer text should include author and date

## HTML Templates

Reference templates are in `.tools/presentations/templates/` for visual reference:
- title.html, two-column.html, comparison.html, evidence.html, legal.html, conclusion.html

These show the visual design but the actual PPTX is generated from the JSON, not from HTML.
