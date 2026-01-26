# Geographic Tagging Model

## Purpose

This document defines how geographic tags work across the platform. The key architectural decision: **region and country are independent editorial decisions**.

---

## Core Principle

A country tag does **NOT** automatically imply its parent region. A region tag does **NOT** automatically trickle down to its countries. Each level is tagged independently based on editorial relevance.

---

## Why Independent (Not Inherited)

| Scenario | What inheritance would do (wrong) | What independent does (correct) |
|----------|-----------------------------------|-------------------------------|
| "Cambodia revokes 3 licenses" | Would also show in "Asia" filter | Shows only in Cambodia filter |
| "Asian regulation trends" | Would need to tag every Asian country | Only tags GEO-ASIA |
| "EU directive affects Malta most" | Would show equally in all EU country feeds | Shows primarily in Malta, secondarily in EU |

---

## Tagging Decision Framework

For every article, the AI/editor asks two **separate** questions:

### Question 1: Is this article relevant to a specific country/countries?
- If yes → tag the specific country (GEO-MT, GEO-UK, etc.)
- If no → skip country tags

### Question 2: Is this article relevant to a broader region as a concept?
- If yes → tag the region (GEO-EU, GEO-ASIA, etc.)
- If no → skip region tags

### Question 3: Is this article geographically universal?
- If yes → tag GEO-GLOBAL
- This is rare; most articles have some geographic context

---

## Examples

| Article | GEO Tags | Reasoning |
|---------|----------|-----------|
| "Cambodia revokes 3 operator licenses" | GEO-KH | Specific to Cambodia; not an Asia-wide story |
| "Asian regulation trends are shifting" | GEO-ASIA | About the region broadly; no single country |
| "Cambodia decision signals Asia-wide regulatory shift" | GEO-KH + GEO-ASIA | Relevant at both levels |
| "EU gambling directive proposal" | GEO-EU | EU as a regulatory bloc; no single country |
| "MGA updates Malta licensing framework" | GEO-MT (primary) + GEO-EU (secondary) | Malta-specific but has EU implications |
| "UK operator launches in New Jersey" | GEO-US-NJ (primary) + GEO-UK (secondary) | NJ is where news happens; UK is company origin |
| "Global iGaming market reaches $100B" | GEO-GLOBAL | No geographic specificity |
| "Flutter expands to Brazil and Colombia" | GEO-BR (primary) + GEO-CO + GEO-LATAM | Two countries + regional context |
| "Ontario launches new licensing framework" | GEO-CA-ON (primary) + GEO-CA | Province-specific + national context |

---

## Hierarchy: Structure vs. Inheritance

The GEO hierarchy exists for **three purposes only**:

1. **UI organization** — Grouping countries under regions in filter dropdowns
2. **Tag validation** — Confirming GEO-KH is a valid, recognized tag
3. **AI context** — AI knows Cambodia is in Asia, can independently evaluate both levels

The hierarchy does **NOT** provide:
- Automatic inheritance (tagging Cambodia ≠ tagging Asia)
- Query roll-up (searching "Europe" does NOT auto-include all European countries)
- Implied relevance (article about Malta is NOT automatically about Europe)

---

## Filter Behavior (for UI/UX)

When a user selects a region filter (e.g., "Europe"):

- Show articles explicitly tagged with GEO-EU
- Do **NOT** auto-include articles only tagged with European countries
- This is intentional: "European news" is editorially distinct from "news happening to be in a European country"

When a user selects a country filter (e.g., "Malta"):
- Show articles tagged with GEO-MT
- Do NOT auto-include articles tagged with GEO-EU

**Exception:** If the UI team decides to combine them for user experience, this should be implemented as a **view-level configuration** (see news_views table), not as tag inheritance.

---

## Sub-National Tags

For countries with state/province-level regulation (US, Canada):

- State/province tags (GEO-US-NJ, GEO-CA-ON) are independent from country tags
- An article about New Jersey specifically → GEO-US-NJ only
- An article about US federal regulation → GEO-US only
- An article about NJ that affects broader US policy → GEO-US-NJ + GEO-US

Same principle: **tag what's editorially relevant, not what's geographically contained.**

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | January 2026 |
| Source of Truth | This file |
