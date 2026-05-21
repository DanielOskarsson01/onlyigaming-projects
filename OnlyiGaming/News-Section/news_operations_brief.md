# OnlyiGaming News — Operations Brief

**Version:** 1.0 | **Date:** 2026-05-22
**Purpose:** Daily operational process for running the news section end-to-end — discovery, processing, editorial review, opinion content calendar, and LinkedIn distribution.

---

## Overview

The news section runs on two parallel tracks:

| Track | Type | Cadence | Owner |
|---|---|---|---|
| **News feed** | Scraped + AI-rewritten reactive news | Daily | Automated + editor |
| **Original content** | Opinion, analysis, interviews | 2× per week | Editor + AI draft |

Both tracks feed the same pipeline and front-end. The difference is where content originates.

---

## Part 1: Daily Discovery (Automated)

### Two methods running in parallel

**Method A — RSS (primary, Tier 1–2 sources)**

Poll RSS feeds every 6 hours. Compare all returned items against DB by URL. New URLs go into the processing queue. No scraping yet — just URL capture.

| Source | RSS Feed URL |
|---|---|
| SBC News | `https://sbcnews.co.uk/feed/` |
| iGaming Business | `https://igamingbusiness.com/feed/` |
| EGR Global | `https://egr.global/feed/` |
| Gambling Insider | `https://gamblinginsider.com/feed/` |
| CasinoBeats | `https://casinobeats.com/feed/` |
| Yogonet | `https://www.yogonet.com/international/rss.xml` |
| Focus Gaming News | `https://focusgn.com/feed/` |
| Asia Gaming Brief | `https://agbrief.com/feed/` |
| iGB North America | `https://igamingbusiness.com/na/feed/` |
| iGaming NEXT | `https://igamingnext.com/feed/` |
| European Gaming | `https://europeangaming.eu/portal/feed/` |
| SiGMA News | `https://sigma.world/news/feed/` |

**Add/verify these feeds before going live. Use `curl [url]` to test each one returns valid XML.**

**Method B — PSE daily sweep (Tier 3–4 + sites without RSS)**

Use Google Programmable Search Engine (PSE) configured with all 55+ source site domains. Run once daily at 06:00 with `dateRestrict=d1` to return only articles published in the last 24 hours.

PSE query set (run all daily):

```
[empty query]              → all new content from configured sites
M&A acquisition merger
regulation licence fine penalty
executive appointment CEO
market entry expansion
funding investment raise
product launch integration
```

Each query returns up to 10 results. Dedup against DB by URL. New URLs go into the queue alongside RSS results.

**PSE setup:** One Custom Search Engine configured with all source domains from `docs/news_source_sites.md`. API key stored in env. Daily cron job hits the JSON API endpoint.

**LinkedIn (supplementary)**

The `linkedin_post_tagger.py` + scraper already runs against company pages and groups. Executive move announcements from LinkedIn feed into the People & Moves queue. Run daily alongside PSE.

---

## Part 2: Processing Pipeline (Semi-Automated)

Once the discovery queue has new URLs, run this sequence:

```
Discovery queue (new URLs)
        ↓
1. Dedup check        → exact URL match + fuzzy headline match against DB
        ↓
2. Triage filter      → apply three-question test automatically (AI pass)
        ↓
3. Scrape             → page-scraper → browser-scraper → api-scraper (cascade)
        ↓
4. AI tagging         → phase2_analyzer_v3.py with prompt v3.2
        ↓
5. AI rewriting       → content-writer (pipeline) produces OnlyiGaming version
        ↓
6. Editorial queue    → human review before publish
```

### Step 2 — Triage filter (AI pass)

Before scraping, run a lightweight AI pass on title + meta description from RSS/PSE results. Apply the three-question test automatically:

- Is this B2B relevant? (filter out player-facing content)
- Is there actual news? (filter obvious "excitement" press releases with no event)
- Has this already been covered extensively? (duplicate angle check against recent DB articles)

Estimated drop rate: 30–40% of raw discoveries filtered here before scraping.

### Step 3 — Scrape

Use the existing scraper cascade. Mandatory fields: `title`, `body`, `publish_date`, `author`, `existing_tags`, `source_url`. Per pipeline brief v2.4 requirements.

Target scrape window: all new articles from the last 24 hours. If running bi-daily: all new since last run.

### Step 4 — AI Tagging

Run `phase2_analyzer_v3.py` with prompt `news_article_comprehensive_tagging_prompt_v3_2.md`. Per article, one LLM call, all 8 dimensions. Derives `presentation_priority` and `news_tier` automatically.

### Step 5 — AI Rewriting

For articles that pass triage and tagging, run the content-writer. Input: original scraped body + tagging output (for context + angle). Output: OnlyiGaming version (300–800 words for news, 800–1,500 words for analysis-adjacent stories).

The rewrite must:
- Have a factual, specific headline (company name + action)
- Lead with the news in one sentence
- Add context not in the original
- Cite the original source

### Step 6 — Editorial Queue

All AI-written articles land in the editorial review queue. Editor spends 30–45 minutes daily:

| Action | When |
|---|---|
| **Approve** | AI write is clean, tagging looks right, article is good to go |
| **Edit + approve** | Minor corrections to headline, lead, or a bad paragraph |
| **Reject** | Triage filter missed something; article does not belong |
| **Override tags** | AI suggested wrong primary DIR or GEO; correct before publishing |
| **Hold** | Story needs additional research or a developing situation |

Target: publish 5–15 articles per day on weekdays. 2–5 on weekends.

---

## Part 3: Opinion & Analysis Content Calendar

### Why opinion content matters

LinkedIn data (597 posts, May 2026 dataset) shows the highest-engagement themes are not the highest-volume ones. Pure reactive news (Regulation, Financial Results) generates low engagement on LinkedIn. Original content and human interest themes dramatically outperform.

| LinkedIn Rank | Theme | Score | What this means for original content |
|---|---|---|---|
| #1 | Behind the Scenes | 41.3 | Exclusive access pieces, day-in-the-life, company culture stories. High effort, very high return. |
| #2 | Expansion | 24.0 | Market expansion analysis, growth strategy pieces. Write when a major player moves into a new market. |
| #3 | Events | 22.4 | Pre/post event coverage, keynote analysis. High volume opportunity around major conference calendar. |
| #4 | Market Entry | 17.5 | Deep dives on new market opens: Brazil, US states, new regulated markets. |
| #5 | Executive Moves | 14.6 | Profiles, interviews, career analysis. "What does this hire signal?" pieces. |
| #9 | Market Reports | 7.1 | Original market analysis, data synthesis. Monthly market roundups. |
| #18 | iGaming Insider Series | 3.7 | Recurring format already established. Consistent performance with small sample. |

### Weekly opinion schedule

**2 original pieces per week. Fixed slots:**

| Slot | Day | Theme | Format |
|---|---|---|---|
| **Slot A** | Tuesday | Rotating: Expansion / Market Entry / M&A analysis | 800–1,500 words. Data-backed analysis. |
| **Slot B** | Thursday | Rotating: Behind the Scenes / Executive profile / iGaming Insider Series | 600–1,000 words. Human-led. |

**Monthly:**
- One Market Report synthesis (last week of month) — aggregate industry data from the month
- One deep-dive feature on a regulation development (if major development occurred)

### Topic selection for Slot A (analytical)

Draw topics from the news queue. When 3+ articles about the same trend appear within 7 days, that is a signal to write a trend piece rather than individual articles. Examples:

- 3 market entries in Brazil in one week → "What's Driving the Brazil Rush in Q2 2026?"
- 2 major M&A deals in platform providers → "Platform Consolidation: Who's Left Standing?"
- Series of fines from UKGC → "The Regulator's New Enforcement Pattern"

### Topic selection for Slot B (human interest)

Sources:
1. LinkedIn: scan for interesting exec announcements or behind-the-scenes posts from company pages
2. Events: interview a keynote speaker or panel member the week after a major conference
3. iGaming Insider Series: one profile interview per month minimum. Target: senior operators, rising stars at suppliers, figures doing interesting things outside the mainstream.

### AI role in opinion content

AI drafts, editor owns. The workflow:

1. Editor identifies the angle and key argument
2. AI drafts to brief (content-writer with explicit angle in prompt)
3. Editor rewrites the lead, sharpens the argument, adds personal voice
4. Target: editor spends 30–60 minutes per opinion piece, not 3 hours

---

## Part 4: LinkedIn Distribution Pattern

### What to post on LinkedIn

Not every article. LinkedIn gets a curated selection:

| Content type | Post? | Format |
|---|---|---|
| Major M&A, funding, market entry | Yes | Short summary + link. 2–3 sentences on why it matters. |
| Regulation changes | Yes, major only | Context-first: "What this means for operators in X" |
| Executive moves (Tier 1 companies) | Yes | One-line + link. Keep it factual. |
| Slot releases / game launches | No | Too low engagement. Skip. |
| Routine press releases | No | Not worth the noise. |
| Opinion / analysis pieces | Yes, always | Longer post: pull the key argument, 3 bullet insights, link to full article. |
| Behind the Scenes / Insider Series | Yes, always | Personal, human, slightly informal tone. This is your highest-engagement category. |
| Market reports | Yes | Data first: "Number that surprised us this month: X. Here's why." |
| Events coverage | Yes, during events | Live feel: quick post each conference day. |

### LinkedIn post formula (news)

```
[One-line hook — the surprising or significant fact]

[2–3 sentences of context — why this matters to the industry]

[Link to full article on OnlyiGaming]

#iGaming #[relevant theme] #[company or market if relevant]
```

### LinkedIn post formula (opinion pieces)

```
[Provocative opening line or bold claim]

[3 bullet points — the key insights from the piece]

→ Full analysis: [link]

What do you think? [optional question to drive comments]

#iGaming #[theme]
```

### Posting schedule

| Day | LinkedIn action |
|---|---|
| Monday | 1 news post (best story from weekend/Monday morning) |
| Tuesday | Opinion piece (Slot A) + 1 news post |
| Wednesday | 1 news post |
| Thursday | Opinion piece (Slot B) + 1 news post |
| Friday | 1 news post (week roundup or most interesting story) |
| Weekend | Optional: event coverage if applicable |

**Best posting times (iGaming B2B LinkedIn audience):** 08:00–10:00 or 12:00–13:00 CET, Tuesday–Thursday.

---

## Part 5: Weekly Rhythm

### Monday

- Discovery pipeline runs overnight Sunday → Monday queue ready
- Editor reviews editorial queue: approve/reject weekend articles
- Plan the week: identify Slot A and Slot B topics from the news queue
- Check events calendar: any conferences this week generating coverage opportunities?

### Tuesday

- Publish Slot A opinion piece
- LinkedIn: Slot A post + 1 news post
- Process Monday's discovery queue

### Wednesday

- Editorial review: approve Tuesday pipeline articles
- LinkedIn: 1 news post
- Research for Slot B (interview, behind-the-scenes angle)

### Thursday

- Publish Slot B opinion piece
- LinkedIn: Slot B post + 1 news post
- Editorial review

### Friday

- Editorial review + publish strong articles from the week's queue
- LinkedIn: week roundup or best story
- Review wishlist: add new topics surfaced by this week's news
- Brief check: any Tier 1 tags showing thin coverage this week?

### Last week of month

- Publish monthly Market Report synthesis
- Review tier coverage (are all Tier 1 NEWS themes getting articles?)
- LinkedIn strategy review: what performed, what didn't

---

## Part 6: Content Wishlist

The wishlist is a running list of writable topics — factual, not outlet-specific, not pure opinion. Topics that are doable without a specific exclusive source.

**What qualifies for the wishlist:**
- Market analysis: "State of regulation in Brazil Q2 2026"
- Trend synthesis: "All the platform deals this year — what pattern emerges?"
- Explainers: "How the new UKGC affordability checks actually work"
- Profiles: "The 5 people who shaped iGaming in 2026"
- Comparisons: "US vs Europe: where is the money moving?"

**What doesn't qualify:**
- Stories that require a specific outlet's scoop to write
- Pure opinion with no factual basis
- B2C-facing content

**Format:** A simple running Markdown file `news_wishlist.md` in the News-Section root. Add topics as they occur. Weekly: editor picks 1–2 to schedule as upcoming opinion/analysis slots.

---

## Part 7: Tech Stack Required

| Component | Tool | Status |
|---|---|---|
| RSS polling | Python `feedparser` script | Needs building |
| PSE daily queries | Google Custom Search JSON API | Needs PSE setup + API key |
| Dedup check | URL match + fuzzy headline (existing DB query) | Needs building |
| AI triage filter | Lightweight LLM call on title + meta | Needs building |
| Scraper | `phase1_scraper.py` / content-pipeline scrapers | Exists |
| AI tagging | `phase2_analyzer_v3.py` + prompt v3.2 | Exists |
| AI rewriting | Content-writer (content-pipeline) | Exists |
| Editorial review UI | Bojan to build (per Phase 3 spec) | Planned |
| LinkedIn posting | Manual (copy from ops brief formula) or Buffer/Hootsuite | Manual for now |
| Wishlist | `news_wishlist.md` | Create manually |

---

## Document Information

| Field | Value |
|---|---|
| Version | 1.0 |
| Created | 2026-05-22 |
| Owner | Editorial / Danne |
| Related docs | `news_article_tagging_pipeline_brief_v2_4.md`, `docs/editorial_workflow_guide.md`, `docs/news_source_sites.md`, `linkedin_engagement_ranking.md` |
| Next review | After first 2 weeks of live operation |
