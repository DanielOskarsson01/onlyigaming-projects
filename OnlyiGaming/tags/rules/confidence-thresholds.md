# Auto-Tagging Confidence Thresholds

## Purpose

When AI auto-tags articles, confidence scores (0.0–1.0) determine whether tags are applied automatically, suggested for review, or discarded.

---

## Threshold Matrix

| Confidence | Action | Review Required? |
|------------|--------|-----------------|
| ≥ 0.85 | Auto-apply | No — applied without human review |
| 0.70 – 0.84 | Auto-apply, flag for audit | Weekly batch review |
| 0.50 – 0.69 | Suggest only | Human decides to accept/reject |
| < 0.50 | Discard | Not shown to editor |

---

## Per-Dimension Overrides

Some dimensions are higher risk than others. These overrides take precedence:

| Dimension | Auto-apply threshold | Reasoning |
|-----------|---------------------|-----------|
| DIR (primary) | Suggest only (any score) | Primary DIR drives SEO; always confirm |
| DIR (secondary) | ≥ 0.75 | Lower risk but still affects categorization |
| GEO (primary) | Suggest only (any score) | Primary GEO drives SEO; always confirm |
| GEO (secondary) | ≥ 0.70 | Standard threshold |
| NEWS | ≥ 0.70 | No primary; lower risk |
| PROD | ≥ 0.75 | Usually obvious; moderate risk |
| TYPE | ≥ 0.85 | Format is usually clear |
| COMM | N/A | Always editorial assignment |
| Company (primary) | Suggest only (any score) | Critical for entity association |
| Company (secondary) | ≥ 0.80 | Avoid false company associations |

---

## Key Rule: Primary Designation

**Primary tags are NEVER auto-applied regardless of confidence score.**

AI may suggest a primary DIR/GEO/Company with a confidence score, but editorial confirmation is always required. This protects SEO integrity.

---

## Threshold Calibration

These thresholds are starting points. After processing 100 articles:

1. **Measure false positive rate** per dimension
2. **Target:** < 5% false positive rate for auto-applied tags
3. **Adjust independently** per dimension based on data
4. **Document changes** with date and reasoning

### Calibration triggers:

- If false positive rate > 10% for any dimension → raise threshold by 0.05
- If false positive rate < 2% and editorial confirms > 95% of suggestions → lower threshold by 0.05
- Review thresholds monthly for the first 6 months, then quarterly

---

## Audit Process

For tags auto-applied in the 0.70–0.84 range:

1. Generate weekly report of all auto-applied tags in this range
2. Editor reviews sample (minimum 20% of tagged articles)
3. Track: confirmed correct / incorrectly applied / missing tags
4. Adjust thresholds based on findings

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | January 2026 |
| Source of Truth | This file |
