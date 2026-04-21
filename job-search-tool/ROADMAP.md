# Job Search Tool — Roadmap

> See STRATEGY.md for full rationale, architecture, and module specifications.

---

## Phase 1: Contract Validation

Status: not started

- [ ] Create "Job Search" template in Supabase (execution_plan, seed_config, preset_map)
- [ ] Create `js_knowledge_bank` table in Supabase
- [ ] Port `jobtech` as Step 1 submodule (manifest.json + execute.js)
- [ ] Port `job-analyzer` as Step 5 submodule (hardcoded ad text input)
- [ ] Port `cv-generator` as Step 5 submodule (DOCX output)
- [ ] Create a project using the Job Search template
- [ ] Run discovery → inject ad text → analysis → generation
- [ ] Write contract validation report (what worked, what broke, skeleton needs)

**Done when:** Written report. Three module shapes (fetcher, analyzer, generator) execute without skeleton changes.

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
- [ ] Port `job-scraper` as Step 3 submodule (replaces hardcoded ad text)
- [ ] Wire search profile into template seed_config
- [ ] Set up daily cron trigger

**Done when:** All 6 providers return results. Scraper fetches real ad text. Dedup and filtering match current tool.

---

## Phase 3: Remaining Generation and Data Migration

Status: not started

- [ ] Port `cover-letter-gen` as Step 5 submodule
- [ ] Port `app-bundler` as Step 8 submodule
- [ ] Migrate CV source files into cv-generator module assets
- [ ] Migrate knowledge bank data to `js_knowledge_bank` table
- [ ] Wire prompt configuration into template preset_map options

**Done when:** One real job application processed from discovery to downloadable package inside the content pipeline.

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
