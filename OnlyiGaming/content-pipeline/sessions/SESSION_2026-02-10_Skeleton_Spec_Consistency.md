# Session: 2026-02-09 to 2026-02-10 - Skeleton Spec Consistency Pass

**Date:** 2026-02-09 to 2026-02-10
**Duration:** Two-day session
**Phase:** Specification Consolidation & External Review
**Outcome:** Both specs now internally consistent and ready for implementation

---

## Executive Summary

Two specification documents for the Content Creation Tool underwent a complete consistency review and multiple fix rounds. Both documents passed two external review rounds (Gemini structural review + Claude Code implementation review) and are now ready to serve as the single source of truth for implementation.

**Files Modified:**
- `specs/SKELETON_SPEC_v2.md` (now 1607 lines, ~85KB)
- `specs/SUBMODULE_DEVELOPMENT.md` (now 486 lines, ~16KB)

**Status:** Both specs are internally consistent and consistent with each other. Ready for implementation.

---

## Day 1: Feb 9 - Pane Spec Rewrite + Submodule Guide Rewrite

### SKELETON_SPEC_v2.md Changes

**Part 6 (Universal Pane Template) Rewrite:**
- Rewritten as complete reference with three accordions (Input/Options/Results)
- Added `run_submodule_config` table for persisting input/options/data operation choices
- Added `render_schema` system with `display_type` and `ContentRenderer` component

**Internal Contradictions Fixed:**
11 internal contradictions identified and resolved:
1. React references in modules repo
2. `tools.progress` API inconsistencies
3. Options fallback behavior
4. BullMQ job data format
5. And 7 others

### SUBMODULE_DEVELOPMENT.md Changes

**Complete Rewrite (179 → 486 lines):**

**Removed (Stale Patterns):**
- `module.exports` pattern
- `context` parameter
- `type: 'discovery'` designation
- Monorepo structure assumptions

**Added (Current Patterns):**
- `manifest.json` + `execute.js` pattern
- Two-repo folder structure
- `options_component` contract
- `data_operation_default` table
- `tools` API documentation
- Cost levels specification
- Full RSS Feeds example
- "What You DON'T Do" section (skeleton responsibilities)

---

## Day 2: Feb 10 - External Review Rounds

### Round 1: Gemini Review

**Issues Found:** 12 total, 6 were valid

**Fixes Applied:**

1. **Options Rendering Contradiction**
   - Problem: Unclear when custom component vs auto-render is used
   - Fix: Two-case logic documented — custom component OR auto-render OR "no options"

2. **Entity-Grouped Results vs Flat UI**
   - Problem: Spec mentioned entity grouping but UI showed flat display
   - Fix: Skeleton flattens for display, entity as column

3. **Step 0 Example Label Wrong**
   - Problem: Example showed incorrect label
   - Fix: Changed to "From Step 1"

4. **render_schema → React Undefined**
   - Problem: Referenced React component not defined
   - Fix: Added ContentRenderer component and display_type system

5. **Working Pool Full Objects vs References**
   - Problem: Ambiguous whether pool stores full objects or IDs
   - Fix: Explicitly documented that pool stores full objects

6. **Auto-Resolution Priority Ambiguous**
   - Problem: Unclear which input source wins
   - Fix: Reordered priority, saved input wins, added override behavior

### Round 2: Claude Code Review

**Issues Found:** ~30 total, most already fixed in Round 1

**Remaining 5 Fixes Applied:**

1. **Duplicate ➕➖＝ Descriptions**
   - Problem: Data operations documented in multiple places inconsistently
   - Fix: Merged into single entity-scoped version

2. **Working Pool Race Condition**
   - Problem: Concurrent approval could corrupt pool
   - Fix: `SELECT FOR UPDATE` + frontend disable during save

3. **content_cards display_type Missing**
   - Problem: Step 6+ content-producing submodules need cards
   - Fix: Added content_cards display_type to all references

4. **ContentRenderer Description Incomplete**
   - Problem: Component description lacked detail
   - Fix: Updated with full rendering logic

5. **Shared Context "[Use these]" UI**
   - Problem: How does user select shared context?
   - Fix: Clarified as inline banner UI element

---

## Major Architectural Additions

### Entity Scoping

Working pool is now explicitly organized by entity:
- Pool operations (➕➖＝) apply per-entity
- Stripe's URLs never mix with PayPal's
- UI displays entity column for clarity

### API Route Specifications

Full request/response contracts now documented:
- `POST /api/submodules/:name/execute` - Execute route
- `POST /api/submodules/runs/:runId/approve` - Approve route
- `GET /api/submodules/runs/:pipelineRunId` - Get submodule runs
- `GET /api/submodules` - List submodules

Each includes:
- Request body schema
- Response shape
- Server-side logic steps

### approved_items Format

Standardized approval data format:
- Array of `item_key` values
- Server filters `output_data` using these keys
- Clear contract between frontend and backend

### State Machine Completions

Missing state transitions documented:
- Re-approval flow: `approved → approved`
- CategoryCardGrid display per status
- Panel close during execution (toast + panelStore tracking)

### Aggregation Rule

Clarified how multiple runs combine:
- Only most recent approved run per submodule contributes to step aggregation
- Previous approved runs preserved in `decision_log` history

### Content Library Tables

Removed from skeleton spec:
- Module-level concern, not skeleton concern
- Deferred to Step 10 implementation
- Reduces spec complexity

### decision_log.entity_id

Made nullable:
- Some decisions are step-level, not entity-level
- Supports both granularities

---

## Key Design Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| step_context | One per step (shared) | Intentional simplicity. All submodules share context. New upload overwrites. |
| input_config | Metadata only | Entity data lives in step_context or previous step output, not duplicated |
| Filter (➖) | Filter-as-output | Approved items replace the pool entirely, not incremental removal |
| Run aggregation | Latest run wins | Step aggregation uses most recent approved run per submodule |
| Re-approval | Allowed | Modifying checkboxes on approved run updates pool without creating new run |
| Infrastructure docs | Deferred | One spec + one submodule guide covers everything for solo founder. Split when needed |

---

## Current State

### Specification Health

| Document | Lines | Size | Status |
|----------|-------|------|--------|
| SKELETON_SPEC_v2.md | 1607 | ~85KB | Consistent |
| SUBMODULE_DEVELOPMENT.md | 486 | ~16KB | Consistent |

### Review Status

| Review | Reviewer | Issues Found | Fixed |
|--------|----------|--------------|-------|
| Round 1 | Gemini | 12 (6 valid) | 6/6 |
| Round 2 | Claude Code | ~30 (5 new) | 5/5 |

---

## Implementation Readiness

**Ready to implement:**
- Both specs serve as single source of truth
- No known contradictions
- API contracts fully specified
- State machines complete
- Edge cases documented

**References for implementation:**
- CLAUDE.md in both repos should reference these spec file paths
- Any spec changes during implementation should be made in spec docs first, then code

---

## Next Steps

1. **Begin Implementation**
   - Use `SKELETON_SPEC_v2.md` for skeleton code
   - Use `SUBMODULE_DEVELOPMENT.md` for submodule creation

2. **Update CLAUDE.md Files**
   - Reference spec paths in both repos
   - Document spec-first workflow

3. **Track Spec Changes**
   - If implementation reveals spec gaps, update spec first
   - Maintain spec as living document

---

## Files Changed

### Modified

| File | Change Type | Details |
|------|-------------|---------|
| specs/SKELETON_SPEC_v2.md | Major revision | +400 lines, Part 6 rewrite, 11 fixes |
| specs/SUBMODULE_DEVELOPMENT.md | Complete rewrite | 179 → 486 lines |

### No New Files Created

All changes were to existing specification documents.

---

*Session documented by: Claude Opus 4.5*
*Session closed: 2026-02-10*
*Next session: Implementation using specs as source of truth*
