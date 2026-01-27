# Agent System Restructure Proposal

**Date:** 2026-01-26
**Status:** DRAFT - Awaiting Approval
**Author:** Claude (with Daniel's direction)

---

## Problem Statement

The current agent system has structural flaws that lead to:

1. **Autonomous execution without user consent** - Agents create full deliverables without asking first (e.g., strategic-thinker creating complete strategies)
2. **Cross-session blindness** - PA only knows what happens in its own chat window; work in other sessions is invisible
3. **No central awareness** - No single place knows what exists across all projects, what changed, what was created
4. **Projects falling through cracks** - Without central tracking, work gets lost or forgotten
5. **Confusion about hierarchy** - Unclear which agent has authority, what order to invoke them

---

## Proposed Solution: Hierarchical Agent System with Central Registry

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                            │
│  - Central registry of ALL changes across ALL sessions       │
│  - Total project awareness                                   │
│  - Every agent reports to Orchestrator                       │
│  - Read at session start to catch up on other sessions       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌───────────┐         ┌───────────┐
   │   PA    │         │    CTO    │         │  Project  │
   │         │         │           │         │  Context  │
   │ Account-│         │ Technical │         │  Manager  │
   │ ability │         │ Oversight │         │           │
   └─────────┘         └───────────┘         └───────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌───────────┐         ┌───────────┐
   │Strategic│         │  Content  │         │ Research  │
   │ Thinker │         │  Writer   │         │  Expert   │
   └─────────┘         └───────────┘         └───────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                       ┌───────────┐
                       │  Session  │
                       │  Closer   │
                       └───────────┘
```

---

## Component Details

### 1. ORCHESTRATOR (New Agent)

**Purpose:** Central awareness and registry management

**Responsibilities:**
- Maintains `CENTRAL_REGISTRY.md` - a log of ALL significant actions across ALL sessions
- Read by PA/CTO at session start to understand what happened elsewhere
- Receives reports from all agents about what they created/modified
- Provides cross-project awareness ("What's the status across ALL projects?")
- Detects conflicts ("Two sessions modified the same file")
- Tracks what exists and where ("Where are all the FAQ files?")

**Registry Format:**
```markdown
# Central Registry

## Recent Actions (Last 7 Days)

| Timestamp | Session | Project | Agent | Action | Path |
|-----------|---------|---------|-------|--------|------|
| 2026-01-26 14:30 | abc123 | SEO | content-writer | Created | /SEO/faq-generation/output/wave-1/docs/*.docx |
| 2026-01-26 14:25 | abc123 | SEO | session-closer | Modified | /SEO/faq-generation/output/wave-1/*.md |
| 2026-01-26 10:00 | def456 | Content-Pipeline | cto | Verified | /Content-Pipeline/services/orchestrator.js |

## Project Index

### Content-Pipeline
- Last touched: 2026-01-26
- Key files: [list]
- Status: Dashboard ready for testing

### SEO
- Last touched: 2026-01-26
- Key files: [list]
- Status: Wave 1 complete, Wave 2 ready

### News-Section
- Last touched: 2026-01-25
- Key files: [list]
- Status: Schema complete, awaiting handoff
```

**When Invoked:**
- Automatically at session start (via PA)
- When any agent completes significant work
- When user asks "What's happening across projects?"

---

### 2. Universal Rules (New Section in GLOBAL_AGENT_INSTRUCTIONS.md)

**Section 0: Fundamental Operating Principles**

These rules supersede all other instructions. No agent may bypass them.

#### Rule 1: ASK BEFORE ACTING

**Before executing any significant work, you MUST:**

1. State what you understand the task to be
2. Describe your proposed approach (brief)
3. Ask: "Should I proceed with this approach?"
4. Wait for explicit approval

**What counts as "significant work":**
- Creating any new file
- Modifying more than 10 lines of code
- Making architectural decisions
- Creating strategies, plans, or proposals
- Running commands that change state
- Invoking other agents

**Exceptions (may proceed without asking):**
- Reading files to understand context
- Running read-only commands (git status, ls, etc.)
- Answering direct questions
- Clarifying questions back to user

#### Rule 2: REPORT ALL CHANGES

**After completing any action that creates or modifies files:**

1. Log the action to `CENTRAL_REGISTRY.md`
2. Format: `| [timestamp] | [session-id] | [project] | [agent] | [action] | [path] |`
3. Action types: Created, Modified, Deleted, Verified

**This is non-negotiable.** Every agent, every session, every change.

#### Rule 3: DISCOVERY BEFORE IMPLEMENTATION

**For new projects or major new features:**

1. Start with questions, not solutions
2. Explore the problem space collaboratively
3. Define explicit boundaries (in scope / out of scope)
4. Document assumptions and get them validated
5. Only after discovery: create roadmap and begin implementation

**Discovery is a conversation, not a deliverable.**

#### Rule 4: AGENTS ARE COLLABORATIVE PARTNERS

**Agents exist to support the user's thinking, not replace it.**

- Present options, don't make choices
- Suggest directions, don't dictate them
- Challenge assumptions, don't accept blindly
- Ask clarifying questions, don't assume intent

---

### 3. Updated Agent Definitions

#### PA (Personal Assistant) - Updated

**Changes:**
- At session start, read `CENTRAL_REGISTRY.md` to catch up on other sessions
- Report any cross-session work to user: "Since your last session here, another session did X"
- Scope creep detection now includes: "This wasn't in any session's declared focus"

**New startup step:**
```
### Step 0: Cross-Session Sync (NEW)

Read CENTRAL_REGISTRY.md and identify:
- Actions from OTHER sessions since this session's last close
- Projects touched that user may not be aware of
- Potential conflicts or duplications

Present: "While you were away, [N] actions occurred in other sessions..."
```

#### Strategic-Thinker - Updated

**Changes:** Completely reframed as collaborative thinking partner

**Old behavior:** Creates complete strategy documents autonomously
**New behavior:** Facilitates strategic thinking through dialogue

**New process:**
```
1. UNDERSTAND: "Help me understand the situation. What's the core challenge?"
2. EXPLORE: "What options are you considering? What's your gut telling you?"
3. CHALLENGE: "Let me push back on that assumption..."
4. CLARIFY: "If I understand correctly, the key trade-off is X vs Y?"
5. SUGGEST: "Here are three directions we could explore. Which resonates?"
6. DEVELOP: "Let's dig deeper into that one. What would success look like?"
7. DOCUMENT: "Should I capture what we've discussed as a decision document?"
```

**Only creates deliverables when explicitly asked:** "Write this up" or "Create a strategy doc"

#### Session-Closer - Updated

**Changes:**
- After updating project files, MUST update `CENTRAL_REGISTRY.md`
- Log all files created/modified during session
- Include session identifier for cross-reference

---

### 4. Skills Framework - Updated

#### Generic + Parameterized Structure

Skills should be **methodology-first**, with context injected at runtime.

**Example: FAQ Skill (Refactored)**

```markdown
# FAQ Generation Skill

## Parameters (Set at Invocation)
- INDUSTRY: [e.g., iGaming, FinTech, Healthcare]
- CATEGORY: [e.g., Payment Gateways, CRM Platforms]
- OUTPUT_PATH: [where to save files]
- CONTEXT_FILE: [path to industry-specific context]

## Process (Universal)
1. Research phase - gather industry knowledge
2. Question generation - 14 questions following template
3. Answer writing - following quality checklist
4. Schema creation - JSON-LD FAQPage
5. Output generation - .md, .json, .txt files

## Industry Context (Loaded from CONTEXT_FILE)
- Terminology
- Common entities
- Link targets
- Compliance considerations
```

**Invocation:**
```
/faq --industry=iGaming --category="Payment Gateways" --context=OnlyiGaming/SEO/faq-generation/config/
```

Or for a different project:
```
/faq --industry=FinTech --category="Digital Wallets" --context=FinTechProject/faq-config/
```

---

### 5. File Renames

| Current | New | Reason |
|---------|-----|--------|
| `*/AGENTS.md` | `*/CONTEXT.md` | These are project context files, not agent definitions |
| - | `CENTRAL_REGISTRY.md` | New file for cross-session tracking |

---

### 6. Project Discovery Protocol (New)

When starting a new project, follow this structured conversation:

**Phase 1: Problem Understanding**
- What problem are we solving?
- Who has this problem?
- What happens if we don't solve it?
- Have you tried solving it before?

**Phase 2: Success Definition**
- What does success look like?
- How will we measure it?
- What's the minimum viable version?
- What's explicitly NOT in scope?

**Phase 3: Constraints Mapping**
- What resources are available?
- What technical constraints exist?
- Who else is involved?
- What's the timeline pressure?

**Phase 4: Assumption Surfacing**
- What are we assuming is true?
- Which assumptions are validated?
- What would change if key assumptions are wrong?

**Phase 5: Approach Discussion**
- What approaches could we take?
- What are the trade-offs?
- What's your instinct?
- What would you regret not trying?

**Only After Discovery:**
- Create CONTEXT.md
- Create ROADMAP.md
- Begin implementation

---

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create `CENTRAL_REGISTRY.md` structure
2. Add Section 0 to `GLOBAL_AGENT_INSTRUCTIONS.md`
3. Update PA with cross-session sync
4. Update session-closer with registry logging

### Phase 2: Agent Updates
5. Rewrite strategic-thinker as collaborative
6. Add "ask before acting" to all agents
7. Add registry reporting to all agents

### Phase 3: Skills & Files
8. Refactor FAQ skill to be parameterized
9. Rename all `AGENTS.md` to `CONTEXT.md`
10. Create project discovery protocol document

### Phase 4: Validation
11. Test cross-session awareness
12. Test "ask before acting" enforcement
13. Test discovery protocol on mock project

---

## Questions for You

1. **Orchestrator as separate agent vs. built into PA?**
   - Option A: Separate agent that PA invokes
   - Option B: Merge Orchestrator responsibilities into PA (PA becomes the "king")

2. **Registry granularity?**
   - Option A: Log every file change (comprehensive but verbose)
   - Option B: Log only significant milestones (cleaner but may miss things)

3. **Skill parameterization depth?**
   - Option A: Full parameterization (works for any industry)
   - Option B: Keep some skills project-specific, create new ones for new projects

4. **Implementation priority?**
   - What should we tackle first?

---

## Approval

- [ ] Daniel approves overall architecture
- [ ] Daniel answers open questions
- [ ] Begin Phase 1 implementation

---

*This proposal was created collaboratively. No autonomous strategy creation occurred.*
