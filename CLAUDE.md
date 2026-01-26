# Projects Root - Claude Code Context

## Available Skills (Check BEFORE Starting Work)

Before beginning any task, check if a pre-built skill exists in `.claude/commands/`:

| Command | Trigger Keywords | What It Does |
|---------|-----------------|--------------|
| `/project:faq` | FAQ, frequently asked questions, category content | Generates 14-question FAQ with schema + research brief for iGaming categories |
| `/project:presentation` | presentation, PowerPoint, PPTX, slides, pitch deck | Creates professional dark-theme PPTX via JSON definition |
| `/project:google-docs` | docx, Word, Google Docs, share with team | Converts markdown files to .docx for team sharing |

**How to use:** Type the command directly (e.g., `/project:faq Payment Gateways`) or follow the process defined in the skill file if working manually.

**Skill files location:** `.claude/commands/*.md`
**Presentation toolkit:** `.tools/presentations/` (contains generator script, templates, pptxgenjs)

## Available Agents

Specialized agents in `.agents/`:

| Agent | When to Use |
|-------|-------------|
| **personal-assistant** | Session start (accountability + focus) or weekly ops review |
| **cto** | Technical oversight, git hygiene, progress validation, drift detection |
| brutal-critic | After completing significant work, before deployment |
| content-writer | Blog posts, documentation, emails, proposals |
| project-context-manager | Initialize projects, update context files |
| research-expert | Information gathering, competitive analysis |
| session-closer | End of session documentation |
| strategic-thinker | Ad-hoc architectural/strategic decisions |

## Key Files

- `GLOBAL_AGENT_INSTRUCTIONS.md` - Universal policies for all agents
- `README_FOR_AI_AGENTS.md` - Agent onboarding instructions
- `GO.md` - Interactive project launcher
- `PA_STATE.md` - Personal assistant state (accountability tracking)
- `project-launcher.sh` - Shell helper functions (pa, pulse, commitments)

## Universal Behaviors

- **Auto-convert to .docx**: After creating/updating key markdown docs (PROJECT_STATUS, ROADMAP, README, reports), run `auto-sync-to-google-docs.sh` to generate `.docx` versions. Docs are saved to `<project>/docs/` and mirrored to `Projects/docs/<project>/`. See `GLOBAL_AGENT_INSTRUCTIONS.md` section 4 for details.

## Session Workflow

1. **Start**: `pa` or `/project:personal-assistant` for accountability check-in
2. **CTO Baseline**: Run `cto` agent to check git status and establish ground truth
3. **Work**: Check skills first, then use appropriate agents
4. **CTO Checkpoint**: Run `cto` quick check after significant changes or claims of completion
5. **Pre-Close**: Run `cto` full audit to validate progress before documenting
6. **Close**: `session-closer` to document accomplishments

### CTO Checkpoints (When to Run)

| Trigger | Check Type |
|---------|------------|
| Session start | Full audit - establish baseline |
| After claiming something "done" | Quick check - verify it exists |
| Before deployment | Full audit - ensure code is committed |
| Mid-session (30+ min of coding) | Quick check - git status |
| Before session close | Full audit - validate all claims |

### Git Hygiene Rules

- **Never end a session with uncommitted code**
- **Every project must have a remote** (GitHub/GitLab)
- **Commit after completing each feature**, not at session end
- **Push to remote at least daily**

## Active Projects

All under `OnlyiGaming/`:
- **Content-Pipeline** - Automated company profile generation (P0)
- **News-Section** - Multi-dimensional news tagging system (P0)
- **SEO** - Schema markup + FAQ content strategy (P0)
