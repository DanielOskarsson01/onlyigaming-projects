# Company Entity Extraction Rules

## Purpose

This document defines how AI and editors identify, classify, and tag company entities mentioned in articles. Company tagging connects news content to the directory and enables company-specific news feeds.

---

## Extraction Rules

### What counts as a company mention:

- Named companies explicitly referenced in the article text
- Brands that are subsidiaries of a parent company (tag the brand mentioned, not the parent unless parent is also discussed)
- Regulatory bodies when they are the subject (e.g., "MGA issues new rules" → MGA is the subject entity)

### What does NOT count:

- Generic references ("a major operator", "several suppliers")
- Companies mentioned only in passing context ("similar to what Bet365 did in 2023")
- Industry bodies/associations unless they are the article subject
- Historical references that are not current news

---

## Extraction Method

### For AI auto-tagging:

1. **Scan headline and first paragraph** — companies mentioned here are most likely primary
2. **Scan full article** — identify all named entities
3. **Match against company database** — resolve to known company_id where possible
4. **Flag new companies** — entities not in database get flagged for manual creation
5. **Assign mention_type** — see classification below

### For editorial:

1. Confirm AI suggestions
2. Add companies AI missed (especially those referred to by acronym or abbreviation)
3. Confirm primary company
4. Verify mention_type classification

---

## Mention Type Classification

Each company mention gets classified:

| Type | Definition | Example |
|------|-----------|---------|
| **subject** | The article is fundamentally about this company | "Flutter reports Q3 results" → Flutter is subject |
| **partner** | Mentioned as a business partner in a deal/agreement | "Evolution partners with Betway" → Betway is partner |
| **competitor** | Mentioned for comparison or competitive context | "Unlike Bet365, Company X chose to..." → Bet365 is competitor |
| **quoted** | Company spokesperson quoted but company isn't the subject | "Industry expert from Deloitte commented..." → Deloitte is quoted |

---

## Primary Company Rules

See `primary-triage.md` for full decision framework. Summary:

1. Subject company is always primary
2. In deals, the active/initiating party is primary
3. In roundups with no clear subject, primary may be omitted
4. Maximum 1 primary per article

---

## iGaming-Specific Name Patterns

Common naming patterns the AI should recognize:

### Abbreviations and name changes:
| Common Name | Also Known As | Notes |
|-------------|--------------|-------|
| Flutter | Flutter Entertainment, Paddy Power Betfair | Parent company name changed |
| Entain | GVC Holdings | Rebranded 2020 |
| Evolution | Evolution Gaming | Shortened name 2020 |
| Light & Wonder | Scientific Games | Rebranded 2022 |
| Allwyn | Sazka Group | Rebranded |
| IGT | International Game Technology | Always referred to as IGT |
| SBC | Sports Betting Community | Event organizer |
| MGA | Malta Gaming Authority | Regulator |
| UKGC | UK Gambling Commission | Regulator |
| KSA | Kansspelautoriteit | Dutch regulator |
| PAGCOR | Philippine Amusement and Gaming Corporation | Regulator |
| ADM | Agenzia delle Dogane e dei Monopoli | Italian regulator |

### Company type indicators:
- "Group" suffix often indicates parent company (888 Holdings, Kindred Group)
- "Gaming" suffix is extremely common — don't assume two companies with "Gaming" in the name are related
- "Bet" prefix is common for operators (Betway, Bet365, Betsson)

---

## Deduplication Rules

When the same company is mentioned multiple ways:

1. Use the **canonical company name** from the company database
2. If referred to as "the operator" or "the company" after first mention, count as one mention
3. Parent/subsidiary: tag the entity actually discussed
   - "Flutter's FanDuel brand" in a FanDuel-focused article → primary is FanDuel, secondary is Flutter
   - "Flutter, which owns FanDuel" in a Flutter strategy article → primary is Flutter

---

## Company Database Fields

When creating a new company record:

| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Canonical company name |
| slug | Yes | URL-safe identifier |
| aliases | No | Alternative names, abbreviations |
| primary_dir_category | Yes | Main DIR tag for this company |
| secondary_dir_categories | No | Additional DIR tags |
| hq_geo | No | Headquarters location (GEO tag) |
| company_type | Yes | operator, supplier, regulator, other |
| active | Yes | Currently operating? |

---

## Confidence Thresholds for Company Extraction

| Confidence | Action |
|------------|--------|
| ≥ 0.90 | Auto-apply (known company, clear mention) |
| 0.80 – 0.89 | Auto-apply, flag for audit |
| 0.60 – 0.79 | Suggest to editor (ambiguous reference) |
| < 0.60 | Discard |

Higher threshold than other dimensions because incorrect company associations damage credibility.

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | January 2026 |
| Source of Truth | This file |
