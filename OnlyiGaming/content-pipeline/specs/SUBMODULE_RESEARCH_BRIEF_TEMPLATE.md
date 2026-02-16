# Submodule Research Brief Template

**Purpose:** Open-ended functional design for a new submodule. Fill this in before the interface worksheet.
**Companion doc:** After this, fill in `SUBMODULE_DESIGN_WORKSHEET.md` for the technical interface.

This is intentionally freeform. A simple submodule might need 10 lines. A complex one might need 2 pages.

---

## Submodule: [name]

**Step:** [N] — [step name]
**One-line purpose:** [What problem does this solve in the pipeline?]

---

### What goes in?

[Describe the input in domain terms, not manifest fields.]
[What data does this submodule expect to receive? From where?]

### What comes out?

[Describe the output in domain terms.]
[What does a successful result look like? What fields matter to the user?]

### Approach

[How does it work? Can be bullet points, pseudocode, or a flowchart.]

Examples from existing submodules:
- **sitemap-parser:** Fetch robots.txt -> find sitemap URLs -> parse XML -> extract URLs -> filter by depth
- **url-dedup:** Flatten all items -> normalize URLs (www, trailing slash, query params) -> track seen URLs -> mark duplicates
- **AI content generator:** Select source content -> build prompt template -> call API -> parse response -> validate structure
- **QA scorer:** Define rubric -> score each section -> aggregate -> flag failures

### External Dependencies

[APIs, libraries, rate limits, costs, auth requirements.]
[Leave blank if none.]

### Edge Cases and Failure Modes

[What can go wrong? How should partial failures be handled?]

Examples:
- Website returns 403 -> skip entity, log error, continue others
- API rate limit hit -> respect retry-after header, slow down
- Empty input -> return empty results with description "No entities to process"

### Open Questions

[Unresolved decisions that need input before building.]

### Example Output

[Show a concrete example of what one entity's results look like.]

```javascript
{
  entity_name: "Example Corp",
  items: [
    // your example items here
  ],
  meta: {
    // your example metadata
  }
}
```

---

*After completing this brief, fill in the interface worksheet: `SUBMODULE_DESIGN_WORKSHEET.md`*
