# Primary Tag Triage Rules

## Purpose

When an article legitimately belongs to multiple tags within the same dimension, these rules determine which tag gets **primary** designation. Primary designation controls SEO (canonical URL, link equity, breadcrumbs).

Only three dimensions require primary designation: **DIR**, **GEO**, and **Company**.

---

## DIR Primary (Directory Category)

### Decision framework (apply in order):

1. **Subject test:** Which category is the article fundamentally *about*? Not which companies are mentioned, but what business domain is the focus.

2. **Reader test:** Which category page would a reader expect to find this article on?

3. **Company core business:** If the article is about a specific company, what is that company's primary business category?

4. **50/50 tie-breaker:** Choose the category with less existing content (builds weaker pages).

### Examples:

| Article | Primary DIR | Secondary DIR | Reasoning |
|---------|-------------|---------------|-----------|
| "Payment provider launches casino game" | DIR-058 (Payment Processing) | DIR-029 (Game Providers) | Company's core business is payments |
| "Game studio adds crypto payments" | DIR-029 (Game Providers) | DIR-061 (Crypto Payments) | Company's core business is games |
| "Platform integrates 5 payment providers" | DIR-016 (Casino Platforms) | DIR-058 (Payment Processing) | Article is about the platform's capability |
| "Affiliate tracking tool adds AI features" | DIR-043 (Affiliate Tracking) | DIR-035 (AI & ML) | Product category over technology used |
| "Casino operator wins compliance award" | DIR-074 (Casino Operator) | DIR-008 (Compliance) | Subject is the operator; compliance is context |

### Anti-patterns (common mistakes):

- Do NOT choose primary based on which category has more articles already
- Do NOT choose primary based on article length or word count per topic
- Do NOT change primary designation after publication unless factually wrong (damages SEO)

---

## GEO Primary (Geographic)

### Decision framework (apply in order):

1. **Specificity wins:** Most specific geographic focus becomes primary. Malta article affecting Europe → primary is GEO-MT.

2. **No single country focus:** Pan-regional story with no country focus → primary is the region (GEO-EU, GEO-ASIA).

3. **Global news:** No geographic focus at all → primary is GEO-GLOBAL.

4. **Company HQ is NOT primary:** An article about a Malta-based company expanding to the UK → primary is GEO-UK (where the news is happening), not GEO-MT (where the company is based).

### Examples:

| Article | Primary GEO | Secondary GEO | Reasoning |
|---------|-------------|---------------|-----------|
| "MGA updates licensing framework" | GEO-MT | GEO-EU | Malta-specific regulation |
| "EU gambling directive proposal" | GEO-EU | — | No single country focus |
| "Company X opens Malta office for EU expansion" | GEO-MT | GEO-EU | Office location is specific |
| "Global online gambling market report" | GEO-GLOBAL | — | No geographic specificity |
| "UK operator launches in New Jersey" | GEO-US-NJ | GEO-UK | News is about the NJ launch |
| "Asian regulation trends shifting" | GEO-ASIA | — | Regional, no country focus |
| "Cambodia revokes 3 licenses" | GEO-KH | — | Specific to Cambodia only |
| "Cambodia decision signals Asia-wide shift" | GEO-KH | GEO-ASIA | Cambodia is primary; Asia is implication |

### Anti-patterns:

- Do NOT automatically assign company HQ location as primary GEO
- Do NOT assign GEO-GLOBAL when a specific region is identifiable
- Do NOT use region tag when only one country is relevant (use the country)

---

## Company Primary

### Decision framework (apply in order):

1. **Subject, not partner:** Who is the article about? "Company X expands" → X is primary even if Y is mentioned as partner.

2. **Active party wins:** In deals, the acquirer/initiator is primary. "X acquires Y" → X is primary.

3. **Multiple subjects:** In comparison articles or industry roundups, choose the one mentioned first in the headline or with more text devoted to it.

4. **No clear subject:** In industry trend articles mentioning many companies as examples, primary company may be omitted (company tagging is not required for trend pieces).

### Examples:

| Article | Primary Company | Secondary | Reasoning |
|---------|----------------|-----------|-----------|
| "Flutter expands to Brazil" | Flutter | — | Single subject |
| "Evolution partners with Betway" | Evolution | Betway | Evolution is the active party (providing service) |
| "Betway launches Evolution live casino" | Betway | Evolution | Betway is the active party (launching) |
| "Company X acquires Company Y" | Company X | Company Y | Acquirer is primary |
| "5 companies leading AI in iGaming" | — | All 5 as secondary | No single primary in roundup |

### Mention types:

Each company mention should also be classified:
- **subject** — the article is about this company
- **partner** — mentioned as a business partner
- **competitor** — mentioned for comparison
- **quoted** — spokesperson quoted but company isn't the subject

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | January 2026 |
| Source of Truth | This file |
