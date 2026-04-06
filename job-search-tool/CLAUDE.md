# Job Search Tool - Claude Code Context

## Purpose

Personal job application factory. 7-step pipeline from job discovery to ready-to-send application packages, with AI doing the heavy lifting and human reviewing at key gates.

## Architecture

- **Frontend:** React 19 + Vite (port 5174), Tailwind CSS
- **Backend:** Express (port 3005), JSON file database
- **AI:** Anthropic Claude API (Sonnet for analysis/generation)
- **Scraping:** HTTP fetch + Mozilla Readability, Playwright for JS-rendered sites (ported from content pipeline)

## The 7-Step Pipeline

```
DISCOVER -> VALIDATE -> SCRAPE -> EVALUATE -> GENERATE -> PACKAGE -> APPLY
   AI        HUMAN       AI      AI+HUMAN      AI         AUTO     Phase 2
```

1. **Discover** - Crawl configured job sites (APIs + career pages + manual URL upload)
2. **Validate** - Human reviews title + company, approves/dismisses before scraping
3. **Scrape** - Extract full job ad text (HTTP -> Playwright -> ScrapFly cascade)
4. **Evaluate** - Claude 5-layer analysis, fit scoring, gap detection, variant selection
5. **Generate** - CV + cover letter + suggestions + Q&A answers in one action
6. **Package** - Bundle into per-application folder, output to both tool and JobSearch/
7. **Apply** - Phase 2: Claude coworker handles submission

## Key Directories

| Path | Purpose |
|------|---------|
| `server/routes/` | Express API routes (jobs, scrape, analyze, generate, discovery) |
| `server/services/` | Business logic (analyzer, cvGenerator, coverLetterGenerator, discovery, scraper) |
| `server/services/providers/` | Discovery providers (jobtech, remoteok, remotive, careerPage) |
| `server/services/scraper/` | Ported pipeline scrapers (pageScraper, browserScraper, browserPool) |
| `server/lib/` | Database (db.js for jobs, discoveryDb.js for discovery) |
| `server/data/` | JSON databases (jobs.json, discovery.json) |
| `client/src/components/` | React UI components per pipeline step |
| `output/` | Generated files (CV, cover letter, suggestions docs) |

## Environment Variables

- `ANTHROPIC_API_KEY` - Claude API key
- `CVS_DIR` - Path to JobSearch/CVs folder (CV source documents)
- `PORT` - Server port (default 3005)

## CV Generation System

Uses pre-approved variant system from JobSearch/CVs/:
- 7 base variants: generic, igaming, cmo, cpo, ceo, startup, digital
- `CV_SECTION_VARIANTS.md` - Pre-written section variants
- `CV_JOB_VARIANTS.md` - Pre-written job entry variants
- `COMPETENCY_MASTER_POOL.json` - Competency categories (pick 3, 4-6 items each)
- `cv_data.json` - Structured CV data
- `MASTER_CV.md` - Complete CV (source of truth)

AI selects from pre-approved content. It does not invent new content.

## Writing Rules (MANDATORY)

All generated text output must follow:
1. **NEVER use em dashes** (the long dash: -). Use regular hyphen-dash (-) instead.
2. **NEVER use en dashes** (-). Use regular hyphen-dash (-) instead.
3. Avoid "leveraged", "spearheaded", "cutting-edge", "robust" and AI-typical words.
4. Write in a direct, confident, human tone. No filler phrases.

## Running the Tool

```bash
cd ~/Library/CloudStorage/Dropbox/Projects/job-search-tool
npm run dev
```

- Frontend: http://localhost:5174/
- API: http://localhost:3005/

## Related Projects

- **JobSearch/** (`CVS_DIR`) - File store for CV source docs, generated outputs, application tracking
- **Content Pipeline** - Source for scraper chain (page-scraper, browser-scraper, browserPool)

## Data Model

### Job (jobs.json)
```
{ id, url, title, company, status, createdAt, updatedAt,
  scrapeResult: { textContent, wordCount, title, metaDescription },
  analysis, userChoices, outputs }
```

Status flow: `scraped -> analyzed -> generated`

### Discovery Item (discovery.json)
```
{ id, sourceId, externalId, url, title, company, location, snippet,
  discoveredAt, status, promotedJobId }
```

Status flow: `new -> interested/dismissed` or `new -> validated -> promoted`
