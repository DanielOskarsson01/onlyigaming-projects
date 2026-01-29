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

## Session Log

### Session: 2026-01-29 - Community Vision Document Complete Review
**Accomplished:**
- Complete section-by-section review of `COMMUNITY_PRODUCT_VISION.md`
- Section 4: Added "why" for community layer (info is cheap/untrustworthy)
- Section 5: Added intro about pot commitment and competitive moat
- Section 6: Complete restructure with 11 subsections, "Why" intros, explained bullet points, new features (Paid Review Chat, Review Discussions)
- Section 7: Expanded to 12-phase Evolution Path with validation signals, added Cold Start Strategy (WhatsApp group migration), Feature-to-Phase Mapping table
- Section 8: Expanded destination vision with explanations for each statement, flywheel concept, emotional destination
- Section 9: Kept concise, added Appendix C (Feature-to-Revenue Mapping)
- Notes for Future Work: Expanded from 7 to 28 items, organized by category, Priority 0: Build vs Buy research first
- Appendix B: Created Maria user scenario demonstrating the "rabbit hole" effect
- Appendix C: Created Feature-to-Revenue Mapping with direct revenue, indirect revenue, subscriptions, diversification targets

**Key Decisions:**
- Community platform research (build vs buy) is Priority 0 before implementation
- Target revenue mix: 30% transaction fees, 25% company subs, 20% sponsorships, 15% individual subs, 10% ads

**Next Steps:**
- Research open source/low-cost community platforms (Discourse, Circle, Forem, etc.)
- Evaluate which platforms support Section 6 features
- Create GitHub repos and push

---

### Session: 2026-01-27 - Community Product Vision
**Accomplished:**
- Created `COMMUNITY_PRODUCT_VISION.md` - comprehensive strategic vision for community features
- Documented session in `SESSION_2026-01-27_Community_Vision.md`

**Pending Manual Actions (carried forward):**
- Create GitHub repos (content-pipeline, onlyigaming-projects) and push
- Add GitHub Secrets for CI/CD
- Schedule community partner discovery call

---

### Session: 2026-01-26 18:00 - Strategic Planning & Infrastructure Overhaul
**Accomplished:**
- Community partnership strategic analysis with strategic-thinker agent
- Created discovery questions for partner evaluation call
- Created CTO agent for technical oversight and git hygiene
- Fixed CRITICAL issue: 8,000+ lines of production code were untracked in git
- Split Content-Pipeline into separate code repo (`~/Dropbox/content-pipeline/`)
- Added production infrastructure: Dockerfile, docker-compose, GitHub CI/CD, tests
- Both repos committed and ready for GitHub push

**Decisions:**
- Content-Pipeline code lives in separate repo from docs/strategy
- CTO checkpoints added to session workflow
- 50/50 partnership split may be too generous - need discovery call first

**Created:**
- `.agents/cto.md` - Technical oversight agent
- `OnlyiGaming/Community/Discovery_Questions_Partner.md`
- `OnlyiGaming/Community/SESSION_2026-01-26_Full.md`
- `~/Dropbox/content-pipeline/` - New code repository with CI/CD

**Pending Manual Actions:**
- Create GitHub repos and push (see session doc for instructions)
- Add GitHub Secrets for CI/CD
- Schedule community partner discovery call

**Full documentation:** `OnlyiGaming/Community/SESSION_2026-01-26_Full.md`

---

### Session: 2026-01-26 14:30 - FAQ Skill Enhancement and Content Export
**Accomplished:**
- Converted all 10 Wave 1 FAQ markdown files to .docx format (saved to `OnlyiGaming/SEO/faq-generation/output/wave-1/docs/`)
- Updated FAQ skill (`.claude/commands/faq.md`) with mandatory Introduction section requirement
- Updated FAQ skill to use HTML links (`<a href="...">text</a>`) for Strapi CMS compatibility
- Added `**[H2 QUESTION]**` and `**[H3 QUESTION]**` labels to FAQ skill for CMS guidance
- Added .txt output file generation to FAQ skill for partner workflow
- Added Introduction sections to 5 FAQ files that were missing them (affiliate-programs, aml-solutions, game-providers, kyc-services, sportsbook-platforms)
- Converted all markdown links to HTML links in all 10 FAQ files
- Added H2/H3 question labels to all 10 FAQ files
- Generated .txt versions of all 10 files for partner CMS workflow

**Decisions:**
- HTML link format (`<a href="...">text</a>`) chosen for Strapi CMS markdown mode compatibility
- Question labels (`**[H2 QUESTION]**`, `**[H3 QUESTION]**`) added to help partners identify FAQ structure in CMS
- .txt file format added to workflow for partner who cannot copy from .md files

**Blockers/Questions:**
- None - Wave 1 FAQ content fully prepared for CMS integration

**Alignment:** Confirmed - Session advances SEO Phase 2 FAQ content strategy goals

**Updated by:** session-closer agent
