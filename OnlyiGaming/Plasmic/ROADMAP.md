# Plasmic Integration Roadmap

**Last Updated**: 2026-01-25
**Project Status**: Design System Setup — Awaiting Developer Token Import
**Scope**: Website frontend for onlyigaming.com (News Section MVP)

---

## Code Ownership Note

**IMPORTANT**: This project provides **specifications and guidance** for the site developer. Claude Code does NOT write production Plasmic code — only documentation, research, and specifications.

See: `GLOBAL_AGENT_INSTRUCTIONS.md` Section 8 (Code Ownership Boundaries)

---

## Current State

**Phase**: Design System Setup
**Status**: Developer has instructions, awaiting token import from Figma
**Blocker**: None

**What Exists**:
- OnlyiGaming Design System project created in Plasmic (blank)
- Design System Setup Guide created ([docs/Design-System-Setup-Guide.md](docs/Design-System-Setup-Guide.md))
- Background research completed ([research/](research/))

**What's Next**:
- Developer imports style tokens from Figma into Plasmic
- Test tokens in sample components
- Build reusable components
- News Section MVP implementation

---

## Phase 1: Design System Foundation
**Status**: IN PROGRESS | **Owner**: Site Developer

### Tasks

- [ ] 1.1: Import style tokens from Figma
  - Colors (brand, semantic, UI)
  - Font sizes (typography scale)
  - Line heights
  - Opacity values
  - Spacing (paddings, margins, dimensions)
  - Font families

- [ ] 1.2: Test tokens in sample components
  - Create test components using tokens
  - Verify responsive behavior
  - Validate across breakpoints

- [ ] 1.3: Document token naming conventions
  - Align with Figma naming
  - Create reference guide for team

---

## Phase 2: Component Library
**Status**: Not Started | **Dependencies**: Phase 1

### Tasks

- [ ] 2.1: Build core UI components
  - Buttons (primary, secondary, ghost)
  - Cards (news card, company card)
  - Navigation elements
  - Form elements

- [ ] 2.2: Build layout components
  - Page layouts
  - Grid systems
  - Responsive containers

- [ ] 2.3: Build content components
  - Article previews
  - Tag displays
  - Author bylines

---

## Phase 3: News Section MVP
**Status**: Not Started | **Dependencies**: Phase 2

### Tasks

- [ ] 3.1: News listing page
  - Article cards with tags
  - Filtering by tag
  - Pagination

- [ ] 3.2: News article page
  - Article content display
  - Related articles sidebar (uses tag system)
  - Author information

- [ ] 3.3: Tag-based navigation
  - Tag filter UI
  - Tag landing pages
  - Cross-section links

---

## Integration Points

### Tag System
- News Section uses tags from `/OnlyiGaming/tags/`
- Related content widgets use pre-computed semantic similarity
- See: `News-Section/ROADMAP.md` for tag architecture

### Content Pipeline
- News content may be generated via Content-Pipeline
- Article data flows from pipeline to Plasmic pages
- See: `Content-Pipeline/ROADMAP.md` for content generation

---

## Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Design System Setup Guide | [docs/Design-System-Setup-Guide.md](docs/Design-System-Setup-Guide.md) | Developer instructions for Plasmic token setup |
| Strategy & Goals | [docs/01-OnlyiGaming-Strategy-and-Goals_4.docx](docs/01-OnlyiGaming-Strategy-and-Goals_4.docx) | Project strategy |
| Solution Research | [docs/02-Solution-Research.docx](docs/02-Solution-Research.docx) | Technology evaluation |
| Technical Comparison | [docs/03-Technical-Comparison.docx](docs/03-Technical-Comparison.docx) | Platform comparison |
| Simplified Design System | [docs/04-Simplified-Design-System.docx](docs/04-Simplified-Design-System.docx) | Design system approach |
| Background Research | [research/plasmic_background research.docx](research/plasmic_background%20research.docx) | Initial research |

---

## Session Log

### 2026-01-25: Design System Setup Guide Added
- Created [docs/Design-System-Setup-Guide.md](docs/Design-System-Setup-Guide.md) from developer PDF
- Documents style token setup process in Plasmic
- Covers: colors, font sizes, line height, opacity, spacing, font family
- Links to Plasmic documentation for tokens, presets, variants, components

---

*Document Owner: Site Developer (implementation) / Claude Code (specifications)*
