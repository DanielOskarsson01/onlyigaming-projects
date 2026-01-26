# OnlyiGaming Tag System — Atomic Documentation

## Architecture

This directory contains the **single source of truth** for all tag definitions, registries, and rules used across OnlyiGaming projects. It follows an atomic design principle:

```
tags/                          ← ATOMS (edit here, never duplicate)
├── dir-categories.md          ← 81 DIR business category descriptions
├── news-topics.md             ← 45 NEWS topic descriptions
├── geo-registry.md            ← All regions, countries, states
├── prod-verticals.md          ← 10 PROD gaming vertical descriptions
├── type-formats.md            ← 16 TYPE content format descriptions
├── comm-status.md             ← 4 COMM commercial status descriptions
├── career-categories.md       ← 28 CAREER job function categories
├── rules/
│   ├── primary-triage.md      ← How to choose primary tags (DIR, GEO, Company)
│   ├── confidence-thresholds.md ← AI auto-tagging score thresholds
│   ├── geographic-model.md    ← Independent region/country model
│   ├── company-extraction.md  ← How to identify and classify company entities
│   └── cross-section-discovery.md ← How related content displays across sections
└── README.md                  ← This file
```

---

## How to Use

### Editing a tag description
Edit the **atom file** directly. All projects reference this location.

### Adding a new tag
Add it to the appropriate atom file. Then update any database seed scripts.

### Changing a rule
Edit the rule file in `rules/`. The rule applies everywhere it's referenced.

### Building a molecule (combined document for a specific purpose)
Reference or import from these atoms. Never copy-paste into a new standalone doc.

---

## Molecule Examples

These atoms get **assembled** for specific purposes:

| Purpose | Atoms Used |
|---------|-----------|
| AI auto-tagging prompt | All tag descriptions + triage rules + confidence thresholds + geographic model + company extraction |
| Editorial workflow guide | Tag descriptions + triage rules |
| CMS tag picker tooltips | Tag descriptions (short form) |
| Database seed script | All tag registries (IDs, labels, slugs) |
| SEO FAQ generation | DIR descriptions |
| Content-Pipeline company profiles | DIR descriptions |
| News-Section tagging strategy | All rules + dimension overview |
| Website sidebar widgets | cross-section-discovery (widget strategy by page depth) |

---

## Cross-Project Usage

| Project | Which Atoms It Uses |
|---------|-------------------|
| **News-Section** | All atoms + all rules |
| **Content-Pipeline** | dir-categories, news-topics, geo-registry, prod-verticals, confidence-thresholds, company-extraction |
| **SEO** | dir-categories, geo-registry |
| **Directory** | dir-categories, geo-registry, prod-verticals |
| **Career** | career-categories, geo-registry, dir-categories, prod-verticals |
| **Website (all sections)** | cross-section-discovery (widget strategy) |

---

## Rules for Maintaining This System

1. **Never duplicate descriptions** — If you need a tag description somewhere, reference this directory
2. **One change, one place** — Edit the atom file; all consumers get the update
3. **Atoms are format-agnostic** — They describe *what* a tag means, not how it's displayed
4. **Rules are universal** — They apply identically across all projects
5. **Version control** — Each file has a version and last-updated date; update when changing

---

## Tag Count Summary

| Dimension | Count | File |
|-----------|-------|------|
| DIR (Directory Categories) | 81 | dir-categories.md |
| NEWS (News Topics) | 45 | news-topics.md |
| GEO (Geographic) | ~115 (8 regions + 80 countries + 24 US states + 4 CA provinces) | geo-registry.md |
| PROD (Product Verticals) | 10 | prod-verticals.md |
| TYPE (Content Formats) | 16 | type-formats.md |
| COMM (Commercial Status) | 4 | comm-status.md |
| CAREER (Job Categories) | 28 | career-categories.md |
| **Total** | **~299 structured tags** | + open-ended company entities |

---

## Document Information

| Field | Value |
|-------|-------|
| Created | January 2026 |
| Maintained By | Editorial + Development |
| Purpose | Single source of truth for all tag definitions |

---

## Session Log

### 2026-01-25: Cross-Section Discovery Architecture
- Added `rules/cross-section-discovery.md` — How related content displays across platform sections
- Updated Molecule Examples table with website sidebar widgets use case
- Updated Cross-Project Usage table with Website entry for widget strategy
- Architecture decision: Pre-computed semantic similarity (AI embeddings on publish, fast lookup on page load)
