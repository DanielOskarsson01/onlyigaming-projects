# Instructions for AI Agents

**If you are an AI agent working on ANY project in this directory, read this first:**

## Global Instructions
📋 **[GLOBAL_AGENT_INSTRUCTIONS.md](file:///Users/danieloskarsson/Dropbox/Projects/GLOBAL_AGENT_INSTRUCTIONS.md)**

This file contains:
- Model selection & escalation policy (when to use Opus 4.5)
- Communication standards
- Quality standards
- Tool usage best practices
- Documentation requirements
- Lessons learned from past mistakes

## Project-Specific Instructions

Each project may have additional instructions in:
- `CLAUDE.md` - Main project context for Claude Code
- `AGENTS.md` - Agent-specific notes and architecture
- `GEMINI.md` - Gemini-specific context
- `LESSONS_LEARNED.md` - Project-specific lessons
- `MODEL_SELECTION_POLICY.md` - Project-specific escalation rules

## Priority Order

When instructions conflict:
1. **User's explicit instructions** (highest priority)
2. **Project-specific files** (AGENTS.md, CLAUDE.md, etc.)
3. **Global instructions** (GLOBAL_AGENT_INSTRUCTIONS.md)

## Custom Agents

Specialized agents are defined in `/Users/danieloskarsson/Dropbox/Projects/.agents/`:
- **personal-assistant.md** - Accountability & focus enforcement (invoke at session start)
- brutal-critic.md
- content-writer.md
- project-context-manager.md
- research-expert.md
- session-closer.md
- strategic-thinker.md

## Recommended Session Workflow

1. **Start**: Invoke `personal-assistant` agent to review commitments and declare focus
2. **Work**: Use appropriate specialized agents for the declared focus
3. **Close**: Invoke `session-closer` to document accomplishments

The personal-assistant agent reads session-closer output from CLAUDE.md to verify that stated commitments match actual accomplishments. State is tracked in `PA_STATE.md` at the Projects root.

---

*This structure ensures consistent quality and learning across all projects*
