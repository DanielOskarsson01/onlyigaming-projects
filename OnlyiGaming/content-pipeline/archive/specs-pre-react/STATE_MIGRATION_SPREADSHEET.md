# State Migration Spreadsheet

## Re-Run Behavior Decision: Option C - Cascade Invalidate

**Decision Made:** 2026-02-01

**Selected Option:** C - Cascade Invalidate

**Behavior:**
- Re-running a submodule marks its `submodule_run` as `superseded`
- Creates a new `submodule_run` with a `supersedes` foreign key pointing to old run
- All downstream approvals auto-transition to `needs_review` status
- UI shows "Results changed, re-review required" badge on affected items

**Why Option C:**
1. **Auditability** - Full history preserved, can see what changed and when
2. **Data Integrity** - No orphaned approvals, clear supersession chain
3. **User Experience** - Users know when their previous approvals need re-review
4. **Production-Ready** - This is not a prototype, it's the long-term content hub

**Schema Impact:**
```sql
-- Add to submodule_runs table
ALTER TABLE submodule_runs ADD COLUMN supersedes UUID REFERENCES submodule_runs(id);
ALTER TABLE submodule_runs ADD COLUMN superseded_at TIMESTAMPTZ;

-- Add to submodule_result_approvals table
ALTER TABLE submodule_result_approvals ADD COLUMN needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE submodule_result_approvals ADD COLUMN review_reason TEXT;
```

---

## State Property Inventory

**Total Top-Level Properties:** 56
**Total Nested (discoveryCategories):** 118 (30 category + 88 submodule)
**Total Nested (validationCategories):** 46 (10 category + 36 submodule)
**Total Nested (submoduleOptions):** 7
**Grand Total:** 56 + 118 + 46 + 7 = **227 properties fully mapped**

### Legend

| Destination | Meaning |
|-------------|---------|
| **DELETE** | Remove entirely, not needed in React |
| **CONFIG** | Move to static config file (e.g., `config/submodules.ts`) |
| **ZUSTAND** | UI-only state, goes to Zustand store |
| **QUERY** | Server data, managed by TanStack Query |
| **LOCAL** | Component-local state (useState) |
| **DERIVED** | Computed from other state, no storage needed |
| **SPLIT** | Part goes to one destination, part to another |

---

## Top-Level State Properties

| # | Alpine Property | Type | Current Usage | Destination | React Location | Notes |
|---|-----------------|------|---------------|-------------|----------------|-------|
| 1 | `useMockData` | boolean | Demo/Live toggle | ZUSTAND | `appStore.useMockData` | Keep as-is |
| 2 | `toast` | object\|null | Notification display | ZUSTAND | `appStore.toast` | Keep as-is |
| 3 | `activeTab` | string | Tab navigation | ZUSTAND | `appStore.activeTab` | Keep as-is |
| 4 | `tabs` | array | Tab definitions | CONFIG | `config/tabs.ts` | Static, never changes |
| 5 | `pipelineTemplates` | array | Template list | QUERY | `useTemplates()` | Server data |
| 6 | `selectedTemplateId` | string\|null | Selected template | LOCAL | Step0 component | Form state |
| 7 | `step0Mode` | string | 'new'\|'existing' | LOCAL | Step0 component | Form state |
| 8 | `step0NewProjectName` | string | New project name input | LOCAL | Step0 component | Form state |
| 9 | `step0SelectedProjectId` | string | Existing project dropdown | LOCAL | Step0 component | Form state |
| 10 | `showPipelineAccordion` | boolean | Show steps accordion | ZUSTAND | `pipelineStore.showAccordion` | UI visibility |
| 11 | `showNewProjectModal` | boolean | Legacy modal | DELETE | - | Not used in new design |
| 12 | `newProjectForm` | object | Legacy modal form | DELETE | - | Not used in new design |
| 13 | `pipelineSteps` | array | Step definitions | CONFIG | `config/steps.ts` | Reference to PIPELINE_STEPS constant |
| 14 | `projects` | array | Projects list | QUERY | `useProjects()` | Server data |
| 15 | `filteredProjects` | array | Filtered list | DERIVED | Computed in component | `projects.filter(...)` |
| 16 | `selectedProject` | object\|null | Selected project | SPLIT | ID→`pipelineStore.selectedProjectId`, Data→`useProject(id)` | ID in Zustand, data from Query |
| 17 | `projectSearchFilter` | string | Search input | LOCAL | ProjectList component | Form state |
| 18 | `expandedStep` | number\|null | Expanded accordion | ZUSTAND | `pipelineStore.expandedStep` | UI state |
| 19 | `stepStates` | object | Step completion status | SPLIT | Server status→`useRunStages()`, UI status→`pipelineStore` | Complex - needs analysis |
| 20 | `currentRunId` | string\|null | Active run ID | ZUSTAND | `pipelineStore.currentRunId` | ID only |
| 21 | `currentRunEntityId` | string\|null | Active entity ID | ZUSTAND | `pipelineStore.currentRunEntityId` | ID only |
| 22 | `currentRunEntityIds` | array | All entity IDs | QUERY | `useRunEntities(runId)` | Server data |
| 23 | `runningSubmodules` | object | Tracking running state | ZUSTAND | `pipelineStore.runningSubmodules` | `{submoduleId: true}` |
| 24 | `submoduleResults` | object | Results cache | QUERY | `useSubmoduleResults(runId, submoduleRunId)` | Server data cache |
| 25 | `currentSubmoduleRun` | object\|null | Current submodule run info | ZUSTAND | `panelStore.currentSubmoduleRunId` | ID only, data from Query |
| 26 | `currentViewingSubmodule` | object\|null | Inline results view | ZUSTAND | `pipelineStore.viewingSubmodule` | UI state |
| 27 | `runs` | array | Pipeline runs list | QUERY | `useRuns()` | Server data |
| 28 | `contentStats` | object | Aggregated stats | QUERY | `useContentStats()` | Server data |
| 29 | `recentContent` | array | Recent content items | QUERY | `useRecentContent()` | Server data |
| 30 | `templates` | array | Template list | QUERY | `useTemplates()` | Server data (duplicate of #5) |
| 31 | `editingTemplate` | object\|null | Template being edited | LOCAL | TemplateEditor component | Form state |
| 32 | `step0ProjectDescription` | string | Project description | LOCAL | Step0 component | Form state |
| 33 | `step0SelectedTemplateId` | string | Template selection | LOCAL | Step0 component | Form state |
| 34 | `resultsPanelOpen` | boolean | Legacy panel open | ZUSTAND | `panelStore.resultsPanelOpen` | UI state |
| 35 | `resultsPanel` | object\|null | Legacy panel data | DERIVED | Computed from Query data | Build from server response |
| 36 | `validationPanelOpen` | boolean | Validation panel open | ZUSTAND | `panelStore.validationPanelOpen` | UI state |
| 37 | `validationPanelState` | string | 'idle'\|'running'\|'completed' | ZUSTAND | `panelStore.validationState` | UI state |
| 38 | `validationRunResult` | object\|null | Validation results | QUERY | `useValidationResults(runId, submoduleRunId)` | Server data |
| 39 | `submodulePanelOpen` | boolean | Submodule panel open | ZUSTAND | `panelStore.submodulePanelOpen` | UI state |
| 40 | `activeSubmodule` | object\|null | Active submodule | SPLIT | ID→`panelStore.activeSubmoduleId`, Definition→CONFIG | Static def from config |
| 41 | `activeCategory` | object\|null | Active category | ZUSTAND | `panelStore.activeCategoryKey` | Key only |
| 42 | `activeSubmoduleRef` | object\|null | Reference to original | ZUSTAND | `panelStore.activeSubmoduleRef` | `{categoryKey, index}` |
| 43 | `submoduleState` | string | 'idle'\|'ready'\|'running'... | ZUSTAND | `panelStore.submoduleState` | UI state |
| 44 | `submoduleRunResult` | object\|null | Submodule results | QUERY | `useSubmoduleRunResult(runId, submoduleRunId)` | Server data |
| 45 | `panelAccordion` | string | 'input'\|'options'\|'results' | LOCAL | SubmodulePanel component | Panel-local UI |
| 46 | `showAdvancedOptions` | boolean | Show options section | LOCAL | SubmodulePanel component | Panel-local UI |
| 47 | `showUploadForm` | boolean | Show upload form | LOCAL | SubmodulePanel component | Panel-local UI |
| 48 | `submoduleInputUrls` | string | URL input textarea | LOCAL | SubmodulePanel component | Form state |
| 49 | `uploadedCsvInfo` | string\|null | CSV upload info | LOCAL | SubmodulePanel component | Form state |
| 50 | `submoduleOptions` | object | Submodule config | LOCAL | SubmodulePanel component | Form state |
| 51 | `entityContext` | object\|null | Shared entity context | QUERY | `useEntityContext(runId, stepIndex)` | Server data (step_context table) |
| 52 | `discoveryCategories` | object | Categories + submodules | SPLIT | See nested table below | Complex split |
| 53 | `validationCategories` | object | Validation categories | SPLIT | See nested table below | Complex split |
| 54 | `validationStats` | object | Validation summary | DERIVED | Computed from results | Calculate from Query data |
| 55 | `entities` | array | (from init) | QUERY | Part of `useRunEntities()` | Server data |
| 56 | `filteredEntities` | array | (from init) | DERIVED | Computed | `entities.filter(...)` |

---

## discoveryCategories — FULL EXPANSION (77 properties)

The `discoveryCategories` object contains both **static definitions** (never change) and **runtime state** (changes during execution).

### Category-Level Properties (6 categories × 5 props = 30 properties)

| # | Property Path | Type | Destination | React Location |
|---|---------------|------|-------------|----------------|
| 57 | `discoveryCategories.website.label` | string | CONFIG | `DISCOVERY_CATEGORIES.website.label` |
| 58 | `discoveryCategories.website.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.website.icon` |
| 59 | `discoveryCategories.website.description` | string | CONFIG | `DISCOVERY_CATEGORIES.website.description` |
| 60 | `discoveryCategories.website.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.website` |
| 61 | `discoveryCategories.website.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'website'` |
| 62 | `discoveryCategories.news.label` | string | CONFIG | `DISCOVERY_CATEGORIES.news.label` |
| 63 | `discoveryCategories.news.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.news.icon` |
| 64 | `discoveryCategories.news.description` | string | CONFIG | `DISCOVERY_CATEGORIES.news.description` |
| 65 | `discoveryCategories.news.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.news` |
| 66 | `discoveryCategories.news.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'news'` |
| 67 | `discoveryCategories.linkedin.label` | string | CONFIG | `DISCOVERY_CATEGORIES.linkedin.label` |
| 68 | `discoveryCategories.linkedin.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.linkedin.icon` |
| 69 | `discoveryCategories.linkedin.description` | string | CONFIG | `DISCOVERY_CATEGORIES.linkedin.description` |
| 70 | `discoveryCategories.linkedin.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.linkedin` |
| 71 | `discoveryCategories.linkedin.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'linkedin'` |
| 72 | `discoveryCategories.youtube.label` | string | CONFIG | `DISCOVERY_CATEGORIES.youtube.label` |
| 73 | `discoveryCategories.youtube.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.youtube.icon` |
| 74 | `discoveryCategories.youtube.description` | string | CONFIG | `DISCOVERY_CATEGORIES.youtube.description` |
| 75 | `discoveryCategories.youtube.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.youtube` |
| 76 | `discoveryCategories.youtube.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'youtube'` |
| 77 | `discoveryCategories.twitter.label` | string | CONFIG | `DISCOVERY_CATEGORIES.twitter.label` |
| 78 | `discoveryCategories.twitter.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.twitter.icon` |
| 79 | `discoveryCategories.twitter.description` | string | CONFIG | `DISCOVERY_CATEGORIES.twitter.description` |
| 80 | `discoveryCategories.twitter.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.twitter` |
| 81 | `discoveryCategories.twitter.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'twitter'` |
| 82 | `discoveryCategories.search.label` | string | CONFIG | `DISCOVERY_CATEGORIES.search.label` |
| 83 | `discoveryCategories.search.icon` | string | CONFIG | `DISCOVERY_CATEGORIES.search.icon` |
| 84 | `discoveryCategories.search.description` | string | CONFIG | `DISCOVERY_CATEGORIES.search.description` |
| 85 | `discoveryCategories.search.enabled` | boolean | ZUSTAND | `pipelineStore.enabledCategories.search` |
| 86 | `discoveryCategories.search.expanded` | boolean | ZUSTAND | `pipelineStore.expandedCategory === 'search'` |

### Submodule Properties — website (3 submodules × 8 props = 24 properties)

| # | Property Path | Type | Destination | React Location |
|---|---------------|------|-------------|----------------|
| 87 | `discoveryCategories.website.submodules[0].id` | string | CONFIG | `DISCOVERY_CATEGORIES.website.submodules[0].id` = 'sitemap' |
| 88 | `discoveryCategories.website.submodules[0].name` | string | CONFIG | `DISCOVERY_CATEGORIES.website.submodules[0].name` |
| 89 | `discoveryCategories.website.submodules[0].description` | string | CONFIG | `DISCOVERY_CATEGORIES.website.submodules[0].description` |
| 90 | `discoveryCategories.website.submodules[0].cost` | string | CONFIG | `DISCOVERY_CATEGORIES.website.submodules[0].cost` |
| 91 | `discoveryCategories.website.submodules[0].status` | string | QUERY | `useSubmoduleStatus(runId, 'sitemap')` |
| 92 | `discoveryCategories.website.submodules[0].result_count` | number | QUERY | `useSubmoduleResults(runId, 'sitemap').result_count` |
| 93 | `discoveryCategories.website.submodules[0].runResult` | object | QUERY | `useSubmoduleResults(runId, 'sitemap')` |
| 94 | `discoveryCategories.website.submodules[0].submodule_run_id` | string | QUERY | `useSubmoduleResults(runId, 'sitemap').submodule_run_id` |
| 95 | `discoveryCategories.website.submodules[1].id` | string | CONFIG | 'navigation' |
| 96 | `discoveryCategories.website.submodules[1].name` | string | CONFIG | 'Navigation' |
| 97 | `discoveryCategories.website.submodules[1].description` | string | CONFIG | Static |
| 98 | `discoveryCategories.website.submodules[1].cost` | string | CONFIG | 'cheap' |
| 99 | `discoveryCategories.website.submodules[1].status` | string | QUERY | `useSubmoduleStatus(runId, 'navigation')` |
| 100 | `discoveryCategories.website.submodules[1].result_count` | number | QUERY | From server |
| 101 | `discoveryCategories.website.submodules[1].runResult` | object | QUERY | From server |
| 102 | `discoveryCategories.website.submodules[1].submodule_run_id` | string | QUERY | From server |
| 103 | `discoveryCategories.website.submodules[2].id` | string | CONFIG | 'seed-expansion' |
| 104 | `discoveryCategories.website.submodules[2].name` | string | CONFIG | 'Seed Expansion' |
| 105 | `discoveryCategories.website.submodules[2].description` | string | CONFIG | Static |
| 106 | `discoveryCategories.website.submodules[2].cost` | string | CONFIG | 'cheap' |
| 107 | `discoveryCategories.website.submodules[2].status` | string | QUERY | `useSubmoduleStatus(runId, 'seed-expansion')` |
| 108 | `discoveryCategories.website.submodules[2].result_count` | number | QUERY | From server |
| 109 | `discoveryCategories.website.submodules[2].runResult` | object | QUERY | From server |
| 110 | `discoveryCategories.website.submodules[2].submodule_run_id` | string | QUERY | From server |

### Submodule Properties — news (2 submodules × 8 props = 16 properties)

| # | Property Path | Type | Destination | React Location |
|---|---------------|------|-------------|----------------|
| 111 | `discoveryCategories.news.submodules[0].id` | string | CONFIG | 'rss-feeds' |
| 112 | `discoveryCategories.news.submodules[0].name` | string | CONFIG | 'RSS Feeds' |
| 113 | `discoveryCategories.news.submodules[0].description` | string | CONFIG | Static |
| 114 | `discoveryCategories.news.submodules[0].cost` | string | CONFIG | 'cheap' |
| 115 | `discoveryCategories.news.submodules[0].status` | string | QUERY | From server |
| 116 | `discoveryCategories.news.submodules[0].result_count` | number | QUERY | From server |
| 117 | `discoveryCategories.news.submodules[0].runResult` | object | QUERY | From server |
| 118 | `discoveryCategories.news.submodules[0].submodule_run_id` | string | QUERY | From server |
| 119 | `discoveryCategories.news.submodules[1].id` | string | CONFIG | 'news-search' |
| 120 | `discoveryCategories.news.submodules[1].name` | string | CONFIG | 'News Search' |
| 121 | `discoveryCategories.news.submodules[1].description` | string | CONFIG | Static |
| 122 | `discoveryCategories.news.submodules[1].cost` | string | CONFIG | 'medium' |
| 123 | `discoveryCategories.news.submodules[1].status` | string | QUERY | From server |
| 124 | `discoveryCategories.news.submodules[1].result_count` | number | QUERY | From server |
| 125 | `discoveryCategories.news.submodules[1].runResult` | object | QUERY | From server |
| 126 | `discoveryCategories.news.submodules[1].submodule_run_id` | string | QUERY | From server |

### Submodule Properties — linkedin (2 submodules × 8 props = 16 properties)

| # | Property Path | Type | Destination | Notes |
|---|---------------|------|-------------|-------|
| 127-134 | `discoveryCategories.linkedin.submodules[0].*` | mixed | CONFIG/QUERY | 'linkedin-company' - same pattern |
| 135-142 | `discoveryCategories.linkedin.submodules[1].*` | mixed | CONFIG/QUERY | 'linkedin-posts' - same pattern |

### Submodule Properties — youtube (2 submodules × 8 props = 16 properties)

| # | Property Path | Type | Destination | Notes |
|---|---------------|------|-------------|-------|
| 143-150 | `discoveryCategories.youtube.submodules[0].*` | mixed | CONFIG/QUERY | 'youtube-channel' - same pattern |
| 151-158 | `discoveryCategories.youtube.submodules[1].*` | mixed | CONFIG/QUERY | 'youtube-search' - same pattern |

### Submodule Properties — twitter (1 submodule × 8 props = 8 properties)

| # | Property Path | Type | Destination | Notes |
|---|---------------|------|-------------|-------|
| 159-166 | `discoveryCategories.twitter.submodules[0].*` | mixed | CONFIG/QUERY | 'twitter-profile' - same pattern |

### Submodule Properties — search (1 submodule × 8 props = 8 properties)

| # | Property Path | Type | Destination | Notes |
|---|---------------|------|-------------|-------|
| 167-174 | `discoveryCategories.search.submodules[0].*` | mixed | CONFIG/QUERY | 'google-search' - same pattern |

**discoveryCategories Total: 30 category props + 88 submodule props = 118 properties**

---

## validationCategories — FULL EXPANSION (46 properties)

### Category-Level Properties (2 categories × 5 props = 10 properties)

| # | Property Path | Type | Destination | React Location |
|---|---------------|------|-------------|----------------|
| 175 | `validationCategories.filtering.label` | string | CONFIG | `VALIDATION_CATEGORIES.filtering.label` |
| 176 | `validationCategories.filtering.icon` | string | CONFIG | `VALIDATION_CATEGORIES.filtering.icon` |
| 177 | `validationCategories.filtering.description` | string | CONFIG | `VALIDATION_CATEGORIES.filtering.description` |
| 178 | `validationCategories.filtering.enabled` | boolean | ZUSTAND | `pipelineStore.enabledValidationCategories.filtering` |
| 179 | `validationCategories.filtering.expanded` | boolean | ZUSTAND | `pipelineStore.expandedValidationCategory === 'filtering'` |
| 180 | `validationCategories.dedup.label` | string | CONFIG | `VALIDATION_CATEGORIES.dedup.label` |
| 181 | `validationCategories.dedup.icon` | string | CONFIG | `VALIDATION_CATEGORIES.dedup.icon` |
| 182 | `validationCategories.dedup.description` | string | CONFIG | `VALIDATION_CATEGORIES.dedup.description` |
| 183 | `validationCategories.dedup.enabled` | boolean | ZUSTAND | `pipelineStore.enabledValidationCategories.dedup` |
| 184 | `validationCategories.dedup.expanded` | boolean | ZUSTAND | `pipelineStore.expandedValidationCategory === 'dedup'` |

### Submodule Properties — filtering (2 submodules × 9 props = 18 properties)

Validation submodules have additional props: `valid_count`, `invalid_count`

| # | Property Path | Type | Destination | React Location |
|---|---------------|------|-------------|----------------|
| 185 | `validationCategories.filtering.submodules[0].id` | string | CONFIG | 'url-format' |
| 186 | `validationCategories.filtering.submodules[0].name` | string | CONFIG | 'URL Format' |
| 187 | `validationCategories.filtering.submodules[0].description` | string | CONFIG | Static |
| 188 | `validationCategories.filtering.submodules[0].cost` | string | CONFIG | 'cheap' |
| 189 | `validationCategories.filtering.submodules[0].status` | string | QUERY | From server |
| 190 | `validationCategories.filtering.submodules[0].result_count` | number | QUERY | From server |
| 191 | `validationCategories.filtering.submodules[0].valid_count` | number | QUERY | From server |
| 192 | `validationCategories.filtering.submodules[0].invalid_count` | number | QUERY | From server |
| 193 | `validationCategories.filtering.submodules[0].submodule_run_id` | string | QUERY | From server |
| 194 | `validationCategories.filtering.submodules[1].id` | string | CONFIG | 'path-filter' |
| 195 | `validationCategories.filtering.submodules[1].name` | string | CONFIG | 'Path Filter' |
| 196 | `validationCategories.filtering.submodules[1].description` | string | CONFIG | Static |
| 197 | `validationCategories.filtering.submodules[1].cost` | string | CONFIG | 'cheap' |
| 198 | `validationCategories.filtering.submodules[1].status` | string | QUERY | From server |
| 199 | `validationCategories.filtering.submodules[1].result_count` | number | QUERY | From server |
| 200 | `validationCategories.filtering.submodules[1].valid_count` | number | QUERY | From server |
| 201 | `validationCategories.filtering.submodules[1].invalid_count` | number | QUERY | From server |
| 202 | `validationCategories.filtering.submodules[1].submodule_run_id` | string | QUERY | From server |

### Submodule Properties — dedup (2 submodules × 9 props = 18 properties)

| # | Property Path | Type | Destination | Notes |
|---|---------------|------|-------------|-------|
| 203-211 | `validationCategories.dedup.submodules[0].*` | mixed | CONFIG/QUERY | 'dedupe' - same pattern with valid/invalid counts |
| 212-220 | `validationCategories.dedup.submodules[1].*` | mixed | CONFIG/QUERY | 'lang-dedup' - same pattern |

**validationCategories Total: 10 category props + 36 submodule props = 46 properties**

---

## Static Config Files (Final)

### config/discoveryCategories.ts

```typescript
export const DISCOVERY_CATEGORIES = {
  website: {
    key: 'website',
    label: 'Website',
    icon: '🌐',
    description: 'Find URLs from company websites',
    submodules: [
      { id: 'sitemap', name: 'Sitemap', description: 'Parse sitemap.xml to find URLs', cost: 'cheap' },
      { id: 'navigation', name: 'Navigation', description: 'Extract links from site navigation', cost: 'cheap' },
      { id: 'seed-expansion', name: 'Seed Expansion', description: 'Expand from seed URLs', cost: 'cheap' }
    ]
  },
  news: {
    key: 'news',
    label: 'News',
    icon: '📰',
    description: 'Find news and press releases',
    submodules: [
      { id: 'rss-feeds', name: 'RSS Feeds', description: 'Parse RSS/Atom feeds', cost: 'cheap' },
      { id: 'news-search', name: 'News Search', description: 'Search news APIs', cost: 'medium' }
    ]
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    description: 'Company profiles and posts',
    submodules: [
      { id: 'linkedin-company', name: 'Company Page', description: 'Scrape company profile', cost: 'medium' },
      { id: 'linkedin-posts', name: 'Posts', description: 'Fetch recent posts', cost: 'medium' }
    ]
  },
  youtube: {
    key: 'youtube',
    label: 'YouTube',
    icon: '🎬',
    description: 'Videos and channel content',
    submodules: [
      { id: 'youtube-channel', name: 'Channel Videos', description: 'List channel videos', cost: 'cheap' },
      { id: 'youtube-search', name: 'YouTube Search', description: 'Search for videos', cost: 'medium' }
    ]
  },
  twitter: {
    key: 'twitter',
    label: 'Twitter/X',
    icon: '🐦',
    description: 'Profile and tweets',
    submodules: [
      { id: 'twitter-profile', name: 'Profile', description: 'Fetch profile & tweets', cost: 'medium' }
    ]
  },
  search: {
    key: 'search',
    label: 'Search',
    icon: '🔍',
    description: 'General web search (fallback)',
    submodules: [
      { id: 'google-search', name: 'Google Search', description: 'General web search', cost: 'expensive' }
    ]
  }
} as const;

export type DiscoveryCategoryKey = keyof typeof DISCOVERY_CATEGORIES;
export type DiscoverySubmoduleId = typeof DISCOVERY_CATEGORIES[DiscoveryCategoryKey]['submodules'][number]['id'];
```

### config/validationCategories.ts

```typescript
export const VALIDATION_CATEGORIES = {
  filtering: {
    key: 'filtering',
    label: 'URL Filtering',
    icon: '🔍',
    description: 'Filter URLs by path, format, and domain',
    submodules: [
      { id: 'url-format', name: 'URL Format', description: 'Validate URL structure and format', cost: 'cheap' },
      { id: 'path-filter', name: 'Path Filter', description: 'Filter unwanted paths (login, terms, etc)', cost: 'cheap' }
    ]
  },
  dedup: {
    key: 'dedup',
    label: 'Deduplication',
    icon: '🔄',
    description: 'Remove duplicate URLs',
    submodules: [
      { id: 'dedupe', name: 'Deduplicate', description: 'Remove duplicate URLs within each entity', cost: 'cheap' },
      { id: 'lang-dedup', name: 'Language Dedup', description: 'Remove translation duplicates, keep preferred language', cost: 'cheap' }
    ]
  }
} as const;

export type ValidationCategoryKey = keyof typeof VALIDATION_CATEGORIES;
export type ValidationSubmoduleId = typeof VALIDATION_CATEGORIES[ValidationCategoryKey]['submodules'][number]['id'];
```

---

## submoduleOptions → Local Component State

```typescript
// Initial state for SubmodulePanel
const initialOptions = {
  // Sitemap options
  sitemap_location: 'auto',
  include_nested: true,
  // Navigation options
  scan_header: true,
  scan_footer: true,
  scan_sidebar: false,
  follow_dropdowns: true,
  // Seed expansion options
  same_domain: true
};
```

**Destination:** `useState(initialOptions)` in SubmodulePanel component

---

## Summary by Destination (227 Total Properties)

| Destination | Count | Examples |
|-------------|-------|----------|
| **DELETE** | 2 | `showNewProjectModal`, `newProjectForm` |
| **CONFIG** | 72 | `tabs`, `pipelineSteps`, category labels/icons/descriptions, submodule id/name/description/cost |
| **ZUSTAND** | 40 | `useMockData`, `toast`, `activeTab`, `expandedStep`, panel states, enabled/expanded categories |
| **QUERY** | 93 | `projects`, `runs`, all submodule status/result_count/valid_count/invalid_count/runResult/submodule_run_id |
| **LOCAL** | 15 | Form inputs, panel-local UI state, `submoduleOptions` (7 props) |
| **DERIVED** | 5 | `filteredProjects`, `validationStats`, `filteredEntities` |

### Breakdown:
- **Top-level properties:** 56
- **discoveryCategories nested:** 118 (30 CONFIG category props, 24 CONFIG submodule static props, 12 ZUSTAND enabled/expanded, 52 QUERY runtime props)
- **validationCategories nested:** 46 (6 CONFIG category props, 8 CONFIG submodule static props, 4 ZUSTAND enabled/expanded, 28 QUERY runtime props)
- **submoduleOptions:** 7 LOCAL props

---

## Zustand Store Structure (Final)

### appStore.ts
```typescript
interface AppStore {
  // UI State
  useMockData: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  activeTab: 'projects' | 'monitor' | 'library' | 'templates';

  // Actions
  setUseMockData: (value: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setActiveTab: (tab: string) => void;
}
```

### pipelineStore.ts
```typescript
interface PipelineStore {
  // Selection (IDs only - data from Query)
  selectedProjectId: string | null;
  currentRunId: string | null;
  currentRunEntityId: string | null;

  // Accordion State
  showAccordion: boolean;
  expandedStep: number | null;
  expandedCategory: string | null; // 'website' | 'news' | etc.
  enabledCategories: Record<string, boolean>;

  // Execution Tracking
  runningSubmodules: Record<string, boolean>; // {submoduleId: isRunning}
  viewingSubmodule: { runEntityId: string; name: string } | null;

  // Step States (UI-only - server status from Query)
  stepStates: Record<number, { status: string; resultSummary: string }>;

  // Actions
  setSelectedProject: (id: string | null) => void;
  setCurrentRun: (runId: string | null, entityId?: string | null) => void;
  toggleStep: (step: number) => void;
  toggleCategory: (key: string) => void;
  setSubmoduleRunning: (id: string, running: boolean) => void;
  setViewingSubmodule: (data: { runEntityId: string; name: string } | null) => void;
  updateStepState: (step: number, state: Partial<{ status: string; resultSummary: string }>) => void;
}
```

### panelStore.ts
```typescript
interface PanelStore {
  // Panel Visibility
  submodulePanelOpen: boolean;
  validationPanelOpen: boolean;
  resultsPanelOpen: boolean;

  // Active Submodule (ID + reference only - definition from config)
  activeSubmoduleId: string | null;
  activeCategoryKey: string | null;
  activeSubmoduleRef: { categoryKey: string; submoduleIndex: number } | null;
  currentSubmoduleRunId: string | null;

  // Panel UI State
  submoduleState: 'idle' | 'ready' | 'running' | 'completed' | 'viewing' | 'approved';
  validationState: 'idle' | 'running' | 'completed' | 'approved' | 'error' | 'applying';

  // Actions
  openSubmodulePanel: (submoduleId: string, categoryKey: string, ref: { categoryKey: string; submoduleIndex: number }) => void;
  closeSubmodulePanel: () => void;
  openValidationPanel: (submoduleId: string, categoryKey: string, ref: { categoryKey: string; submoduleIndex: number }) => void;
  closeValidationPanel: () => void;
  openResultsPanel: () => void;
  closeResultsPanel: () => void;
  closeAllPanels: () => void;
  setSubmoduleState: (state: string) => void;
  setValidationState: (state: string) => void;
  setCurrentSubmoduleRunId: (id: string | null) => void;
}
```

---

## TanStack Query Hooks (Final)

```typescript
// Projects
useProjects() // GET /api/projects
useProject(id: string) // GET /api/projects/:id
useCreateProject() // POST /api/projects
useDeleteProject() // DELETE /api/projects/:id

// Runs
useRuns() // GET /api/runs
useRun(id: string) // GET /api/runs/:id
useRunEntities(runId: string) // GET /api/runs/:runId/entities
useStartRun() // POST /api/projects/:id/start

// Submodules
useSubmoduleRuns(runId: string) // GET /api/submodules/runs/:runId
useSubmoduleResults(runId: string, submoduleRunId: string) // GET /api/submodules/runs/:runId/:submoduleRunId/results
useExecuteSubmodule() // POST /api/submodules/:type/:name/execute
useApproveSubmodule() // POST /api/submodules/runs/:runId/:submoduleRunId/approve
useBatchApprove() // POST /api/submodules/runs/:runId/:submoduleRunId/batch-approval

// Entity Context
useEntityContext(runId: string, stepIndex: number) // GET /api/runs/:runId/step-context
useSaveEntityContext() // POST /api/runs/:runId/step-context

// Templates
useTemplates() // GET /api/templates

// Content
useContentStats() // GET /api/content/stats/summary
useRecentContent() // GET /api/content?limit=5
```

---

*Created: 2026-02-01*
*Updated: 2026-02-01 - Expanded all nested properties (discoveryCategories: 118, validationCategories: 46)*
*Purpose: Map all 227 Alpine.js state properties to React destinations*
*Validation: 56 top-level + 118 discovery + 46 validation + 7 options = 227 total*
