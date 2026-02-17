# Projects Root - Claude Code Context

## SPEED RULE - READ THIS FIRST

**NEVER ask permission for read-only operations. Just do them.**

- Reading files → Just read
- Bash commands that don't modify state → Just run (git status, ls, npm test, etc.)
- Searching with Glob/Grep → Just search
- Running tests, builds → Just run

**ONLY ask before:** Creating/modifying/deleting files, git commits, installing packages.

---

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

## Automatic Behaviors (No Invocation Needed)

See `GLOBAL_AGENT_INSTRUCTIONS.md` for full details. These happen automatically:

| When | What Happens |
|------|--------------|
| Conversation start | Cross-session sync from CENTRAL_REGISTRY.md |
| Before any work | Scope check against ROADMAP.md, goal validation |
| During work | All file changes logged to CENTRAL_REGISTRY.md |
| Before save/commit | Critical self-review, conflict detection |
| Session end | Documentation update, git commit, handoff summary |

**You don't need to invoke PA, CTO, session-closer, or brutal-critic.** Their behaviors are built-in.

## Agents (For Specialized Tasks Only)

| Agent | When to Use |
|-------|-------------|
| research-expert | Deep web research requiring multiple sources |
| content-writer | Long-form content (blog posts, proposals) |
| project-context-manager | Initializing new projects from scratch |

## Key Files

- `GLOBAL_AGENT_INSTRUCTIONS.md` - Automatic behaviors and protocols
- `CENTRAL_REGISTRY.md` - Cross-session change log
- `PA_STATE.md` - Accountability tracking (if using weekly reviews)

## Git Hygiene (Automatic)

These are enforced automatically before commits:
- Verify all claimed changes exist
- Check for uncommitted work
- Never commit secrets
- Specific file adds (not `git add .`)

## Active Projects

All under `OnlyiGaming/`:
- **Content-Pipeline** - Automated company profile generation (P0)
- **News-Section** - Multi-dimensional news tagging system (P0)
- **SEO** - Schema markup + FAQ content strategy (P0)
- **Community** - Community product vision and strategy (P0)

---

*Last updated: 2026-02-05*
