# Plasmic Integration - Claude Context

## Project Purpose

Website frontend implementation for onlyigaming.com using Plasmic visual builder. **News Section is the MVP**.

---

## Code Ownership Boundary

**CRITICAL**: Claude Code does NOT write production Plasmic/website code.

**What Claude Code does**:
- Creates specifications, documentation, research
- Provides guidance on architecture and integration patterns
- Documents requirements for site developer

**What site developer does**:
- Implements Plasmic components
- Imports style tokens from Figma
- Builds production pages

See: `/GLOBAL_AGENT_INSTRUCTIONS.md` Section 8

---

## Current Status

**Phase**: Design System Setup
**Action**: Developer importing style tokens from Figma into Plasmic

**Key Deliverable**: [docs/Design-System-Setup-Guide.md](docs/Design-System-Setup-Guide.md)

---

## Project Structure

```
Plasmic/
├── ROADMAP.md              ← Implementation phases
├── CLAUDE.md               ← This file
├── AGENTS.md               ← Quick reference
├── GEMINI.md               ← Gemini context
├── docs/
│   ├── Design-System-Setup-Guide.md  ← Developer token setup instructions
│   ├── 01-OnlyiGaming-Strategy-and-Goals_4.docx
│   ├── 02-Solution-Research.docx
│   ├── 03-Technical-Comparison.docx
│   └── 04-Simplified-Design-System.docx
├── research/
│   └── plasmic_background research.docx
└── archive/
    ├── PLASMIC_TAILWIND_GUIDE.md
    ├── PLASMIC_SUCCESS.md
    └── PLASMIC_README.md
```

---

## Integration Points

### Tag System (`/OnlyiGaming/tags/`)
- News articles tagged using shared taxonomy (~299 tags)
- Tag-based navigation and filtering
- Related content widgets (pre-computed semantic similarity)

### News-Section Project
- Provides tag infrastructure specifications
- Defines database schema for articles and tags
- See: `News-Section/ROADMAP.md`

### Content-Pipeline Project
- May generate news content for Plasmic pages
- Content stored in universal content_items table
- See: `Content-Pipeline/ROADMAP.md`

---

## Key Resources

| Resource | Link |
|----------|------|
| Plasmic Tokens Docs | https://docs.plasmic.app/learn/tokens/ |
| Plasmic Components | https://docs.plasmic.app/learn/components/ |
| Plasmic Variants | https://docs.plasmic.app/learn/variants/ |
| Plasmic Responsive | https://docs.plasmic.app/learn/responsive-design/ |

---

## Session Actions

When working on this project:
1. Check ROADMAP.md for current phase and status
2. Remember: we provide SPECS, developer IMPLEMENTS
3. Add any new documentation to docs/ folder
4. Update ROADMAP.md session log with accomplishments
