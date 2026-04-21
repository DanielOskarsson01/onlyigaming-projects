# Job Search Tool — Roadmap

> See STRATEGY.md for full rationale, architecture, and module specifications.

---

## Phase 1: Proof of Concept

Status: not started

- [ ] Create "Job Search" template in Supabase (execution_plan, seed_config, preset_map)
- [ ] Port `jobtech` provider as first Step 1 submodule (manifest.json + execute.js)
- [ ] Create a project using the Job Search template
- [ ] Run discovery scan, verify results render in universal step UI

**Done when:** JobTech results appear in the content pipeline UI.

---

## Phase 2: Full Discovery

Status: not started

- [ ] Port `remoteok` provider submodule
- [ ] Port `remotive` provider submodule
- [ ] Port `linkedin-jobs` provider submodule
- [ ] Port `applyflow` provider submodule
- [ ] Port `career-page` provider submodule
- [ ] Port `job-filter` as Step 2 submodule (keyword + location + exclude filtering)
- [ ] Port `job-dedup` as Step 2 submodule (URL, externalId, fuzzy title dedup)
- [ ] Wire search profile into template seed_config
- [ ] Set up daily cron trigger
- [ ] Verify: full scan matches standalone tool's output

**Done when:** All 6 providers return results. Dedup and filtering match current tool.

---

## Phase 3: Analysis and Generation

Status: not started

- [ ] Port `job-scraper` as Step 3 submodule
- [ ] Port `job-analyzer` as Step 5 submodule (5-layer analysis + fit score + variant)
- [ ] Port `cv-generator` as Step 5 submodule
- [ ] Port `cover-letter-gen` as Step 5 submodule
- [ ] Port `app-bundler` as Step 8 submodule
- [ ] Migrate CV source files (variants, competency pool, master CV)
- [ ] Migrate knowledge bank to Supabase table

**Done when:** One real job application processed from discovery to downloadable package.

---

## Phase 4: End-to-End Validation

Status: not started

- [ ] Process 5 real job applications through the full pipeline
- [ ] Fix issues found at each step
- [ ] Compare output quality with standalone tool
- [ ] Run daily scan for 7 consecutive days without errors

**Done when:** 5 complete application packages. No crashes. No manual workarounds.

---

## Backlog (out of scope for this phase)

- Application tracking (sent, interview, rejected, offer)
- Analytics (discovery hit rate, application success rate)
- Multi-language CV/cover letter support
- New providers (Indeed, Glassdoor, WeWorkRemotely)
- Notifications (email/Slack)
- Distribution step (auto-email applications)
- Multi-user support
