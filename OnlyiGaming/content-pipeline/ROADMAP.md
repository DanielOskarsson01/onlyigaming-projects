# Content Pipeline — Development Roadmap

**Last Updated**: 2026-02-15
**Current Phase**: Phase 9 — End-to-End Pipeline Test
**Architecture**: Two-repo (skeleton + modules), database-mediated pipeline with React UI

---

## Phase 1: Universal Platform Foundation
**Status**: ✅ COMPLETE | **Priority**: P0

| Task | Status |
|------|--------|
| 1.0 Server Infrastructure (Hetzner, Redis, Node.js) | ✅ Complete |
| 1.1 Schema Design | ✅ Complete |
| 1.2 Create Supabase Tables | ✅ Complete |
| 1.3 Express API Server | ✅ Complete |
| 1.4 BullMQ Workers (entity-level) | ✅ Complete |
| 1.5 Web Dashboard (Alpine.js) | ✅ Complete |
| 1.6 React UI Migration | ✅ Phases 0–8 complete, Phase 9 next |

### React Migration Progress

| Build Phase | Status |
|-------------|--------|
| 0: Repo Scaffold | ✅ |
| 1: Header, routing | ✅ |
| 2: Step 0, Supabase tables | ✅ |
| 3: Run View, step accordion | ✅ |
| 4: Module auto-discovery | ✅ |
| 5: SubmodulePanel shell | ✅ |
| 6: Input/Options/ContentRenderer | ✅ |
| 7: BullMQ execution, Results, approval | ✅ |
| 8: Step-to-step data flow | ✅ |
| **9: End-to-end pipeline test** | **⏳ Next** |
| 10: Polish, error states | ⏳ |

---

## Phase 2: Company Profile Content Type (Proves Platform)
**Status**: Not Started | **Priority**: P0 | **Depends on**: Phase 1 complete

| Task | Status |
|------|--------|
| 2.1 Company Profile pipeline template | Not Started |
| 2.2 Company Profile operations (discovery → validation → scraping → filtering → generation → QA → routing → packaging) | Not Started |
| 2.3 End-to-end test (6 companies) | Not Started |

**Success criteria**: Complete profile generated via platform, 70%+ scraping success, 90%+ QA pass, content reusable by other projects.

---

## Phase 3: News Content Type (Business Need)
**Status**: Not Started | **Priority**: P1 | **Depends on**: Phase 2

| Task | Status |
|------|--------|
| 3.1 News pipeline template | Not Started |
| 3.2 News operations (topic-discovery → source-validation → content-extract → article-generate → QA → package) | Not Started |
| 3.3 Batch test (10 articles) | Not Started |

**Key feature**: Cross-project content reuse — news articles can use already-scraped company data.

---

## Phase 4: Podcast/Media Content Type (Business Need)
**Status**: Not Started | **Priority**: P1 | **Depends on**: Phase 3

| Task | Status |
|------|--------|
| 4.1 Podcast pipeline template | Not Started |
| 4.2 Podcast operations (metadata → transcript → summary → page → QA → package) | Not Started |

---

## Phase 5: Registration Self-Service
**Status**: Not Started | **Priority**: P2 | **Depends on**: Phase 2

Public registration form → triggers company_profile pipeline → moderation queue → admin approval.

---

## Phase 6: Advanced Features
**Status**: Not Started | **Priority**: P3

Visual pipeline designer, multi-project parallel processing, cost tracking, advanced monitoring, multi-language support, additional content types (events, consultants, reviews).

---

## Dependencies

```
Phase 1 (Platform) ← COMPLETE except Phase 9-10
  └── Phase 2 (Company Profiles — proves platform)
        ├── Phase 3 (News)
        │     └── Phase 4 (Podcasts)
        └── Phase 5 (Self-Service)
              └── Phase 6 (Advanced)
```

---

## Backlog

See `specs/BACKLOG.md` — single source of truth for known issues and backlog items.

---

## Success Metrics

| Milestone | Criteria |
|-----------|----------|
| Platform Foundation | All tables exist, API manages projects, worker loads templates dynamically, dashboard functional |
| Company Profile MVP | Complete profile generated, content tagged, 70%+ scrape / 90%+ QA, content reusable |
| Multi-Content-Type | News + podcasts running, cross-project content reuse verified, 3 types simultaneous |
