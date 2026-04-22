# Submodule Research Brief: LinkedIn Posts Scraper

**Step:** 3 — Scraping
**One-line purpose:** Fetch extended post history from LinkedIn company pages via Bright Data's dedicated LinkedIn Posts Scraper API, triggered as a second-pass enrichment for entities with thin content.

---

### What goes in?

Entity with `linkedin` field (company page URL) and a `needs_enrichment` flag set by `loop-router` (Step 7) after Step 6 QA detected shallow content. The entity should already have initial LinkedIn data from `linkedin-company-scraper` (first pass).

### What comes out?

Extended post history beyond the ~10 posts returned by the company scraper. Items: `post_url`, `post_text`, `date_posted`, `likes_count`, `comments_count`, `shares_count`, `images`, `tagged_companies`, `tagged_people`, `hashtags`.

### Approach

**Phase 1: Extract post URLs from company activity feed**

The company scraper (first pass) returns ~10 recent posts with their `post_url` fields. To get more posts, we need additional post URLs. Two strategies:

1. **Bright Data company activity scrape** — Re-scrape the company page's "Posts" tab to extract post URLs from the activity feed. Bright Data's JS rendering can scroll the feed to load more posts.
2. **Google search fallback** — `site:linkedin.com/posts/company-slug` returns indexed posts. Less reliable but free.

**Phase 2: Fetch individual posts**

Feed extracted post URLs to Bright Data's [LinkedIn Posts Scraper](https://brightdata.com/products/web-scraper/linkedin/post) endpoint. Each URL returns full post data including text, engagement metrics, tagged entities, and images.

**Phase 3: Normalize and deduplicate**

- Deduplicate against posts already in the entity's pool from the first-pass company scrape
- Normalize to pipeline item schema with `source_type: "linkedin_post"`
- Tag with `found_via: "linkedin_posts_scraper"` to distinguish from first-pass posts

### When Does This Run?

This is **not a default Step 3 submodule**. It runs only when:

1. Step 6 QA flags the entity as having thin content (e.g., < 500 words generated, few citations, low keyword coverage)
2. `loop-router` (Step 7) routes the entity back with `needs_enrichment` flag
3. The entity has a `linkedin` URL (skip if missing)

This keeps costs minimal — only entities that need more content trigger the scrape.

### External Dependencies

- **Bright Data LinkedIn Posts Scraper API** — $1.50/1,000 posts (pay-as-you-go). Same API key as company scraper (`BRIGHTDATA_API_KEY`).
- No Playwright/browser needed.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max_posts` | number | `50` | Maximum posts to fetch per entity |
| `min_word_count` | number | `50` | Skip posts shorter than this (filters out image-only or link-only posts) |
| `date_range_months` | number | `24` | Only fetch posts from the last N months |
| `include_engagement` | boolean | `true` | Include like/comment/share counts |

### Edge Cases and Failure Modes

- **Company has fewer posts than `max_posts`** — Return what's available, don't fail.
- **Post URLs from first pass are stale** — LinkedIn post URLs are permanent; this shouldn't happen.
- **Activity feed doesn't load more posts** — Some company pages have limited public activity. Return what's available.
- **Duplicate posts** — Dedup by `post_url` against items already in the entity pool.
- **Non-English posts** — Keep them, tag with detected language. Content downstream handles multilingual input.
- **Rate limiting** — Bright Data handles this internally. For batches > 100 posts, use async mode.

### Cost Analysis

- First pass (company scraper): ~10 posts included free with company data ($0.0015/company)
- Second pass (this module): ~50 posts × $0.0015/post = ~$0.075 per entity
- Expected trigger rate: ~10-20% of entities flagged as thin content
- For 1,200 companies: ~150 entities × $0.075 = ~$11.25 total for enrichment pass

### Example Output

```javascript
{
  entity_name: "Small iGaming Startup",
  items: [
    {
      source_type: "linkedin_post",
      found_via: "linkedin_posts_scraper",
      post_url: "https://www.linkedin.com/posts/small-startup_igaming-activity-123456-abcd",
      post_text: "We're excited to announce our partnership with Evolution Gaming to bring live dealer content to our platform...",
      date_posted: "2026-03-15T10:30:00.000Z",
      likes_count: 23,
      comments_count: 5,
      shares_count: 2,
      images: ["https://media.licdn.com/dms/image/..."],
      tagged_companies: ["Evolution Gaming"],
      hashtags: ["#igaming", "#livecasino"]
    },
    {
      source_type: "linkedin_post",
      found_via: "linkedin_posts_scraper",
      post_url: "https://www.linkedin.com/posts/small-startup_expansion-activity-789012-efgh",
      post_text: "Thrilled to share that we've obtained our MGA license, marking a major milestone in our European expansion...",
      date_posted: "2026-02-20T14:15:00.000Z",
      likes_count: 45,
      comments_count: 12,
      shares_count: 8,
      images: [],
      tagged_companies: [],
      hashtags: ["#MGA", "#igaming", "#Malta"]
    }
  ],
  meta: {
    api_provider: "brightdata",
    posts_fetched: 38,
    posts_after_dedup: 28,
    posts_after_filter: 25,
    date_range: "2024-04-15 to 2026-04-15",
    cost_usd: 0.057,
    trigger: "needs_enrichment"
  }
}
```

### Relationship to Other Submodules

- **Upstream:** `linkedin-company-scraper` (Step 3, first pass) provides initial ~10 posts and the company LinkedIn URL. `loop-router` (Step 7) triggers this module when QA flags thin content.
- **Parallel enrichment:** Runs alongside `google-pse-news` (Step 1, second pass) which discovers news articles — together they form the thin-content enrichment strategy.
- **Downstream:** `content-analyzer` (Step 4) and `content-writer` (Step 5) use the additional posts as source material for richer company profiles.
- **Dependency:** Requires `linkedin-company-scraper` to have run first (needs the company URL and existing post URLs for deduplication).
