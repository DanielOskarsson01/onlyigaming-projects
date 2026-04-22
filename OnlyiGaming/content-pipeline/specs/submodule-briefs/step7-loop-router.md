# Submodule Research Brief: Loop Router

**Step:** 7 — Routing
**One-line purpose:** Read QA verdicts from Step 6 and route failed entities back to the appropriate earlier step for rework — automated decision routing based on failure reason.

---

### What goes in?

Entity with QA results from Step 6 submodules: keyword_sufficiency (pass/fail), meta_compliance (pass/fail), citation_coverage (pass/fail), hallucination_detector (pass/fail). Plus the entity's content from Step 5.

### What comes out?

Routing decision per entity. Items: entity_name, decision (approve|loop_discovery|loop_generation|loop_tone|flag_manual), route_reason, qa_summary.

**Important:** This submodule makes routing DECISIONS. It does NOT execute the loops — that's the skeleton's job (backward routing, Phase 3). In Phase 1/2, this submodule produces the recommendation; the user acts on it manually.

### Approach

**Routing rules (from master doc):**

| QA Failure | Route To | Reason |
|------------|----------|--------|
| Hallucination: unsupported claims | Step 1 (Discovery) | Need better sources |
| Citation coverage: too few citations | Step 1 (Discovery) | Need more sources to cite |
| Keyword sufficiency: missing keywords | Step 5 (Tone/SEO Editor) | Rewrite with better keyword integration |
| Meta compliance: bad meta tags | Step 5 (Content Writer) | Regenerate meta fields |
| All pass | Approve | Ready for distribution |
| Multiple failures | Flag for manual review | Too complex for auto-routing |
| Insufficient sources (<8 pages) | Flag for manual review | Can't fix with loops, needs manual source finding |

1. Aggregate QA results from all Step 6 submodules
2. Apply routing rules (configurable priority order)
3. If single clear failure → recommend specific loop target
4. If multiple failures → flag for manual review
5. If all pass → recommend approve

### External Dependencies

None — pure decision logic based on QA results already in the pool.

### Phase 3 Integration

In Phase 3 (automatic mode), this submodule's output feeds the orchestrator directly. The orchestrator reads the routing decision and automatically sends the entity back to the specified step. No human needed for clear-cut cases.

For now (Phase 1/2): the routing decision is displayed in the Step 7 UI. The user sees "Betsson: loop_discovery — insufficient sources" and manually triggers the rework.

### Edge Cases

- No QA results (Step 6 was skipped) → default to "approve" or "flag_manual" (configurable)
- Entity passed QA but has suggested categories pending review → flag_manual regardless of QA score
- Entity has been looped 3+ times already → flag_manual with "max_loops_exceeded" (prevent infinite loops)

### Example Output

```javascript
{
  entity_name: "Kindred Group",
  items: [{
    entity_name: "Kindred Group",
    decision: "loop_discovery",
    route_reason: "Hallucination detector flagged 5 unsupported claims. Need better source coverage.",
    qa_summary: { keyword: "pass", meta: "pass", citation: "fail", hallucination: "fail" },
    loop_count: 0,
  }],
  meta: { status: "routed", decision: "loop_discovery" }
}
```
