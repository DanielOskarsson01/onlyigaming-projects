# Cross-Section Content Discovery

How content from different platform sections (News, Jobs, Directory, Podcasts, Events, M&A, Community) connects and displays related items across sections.

---

## The Problem

Each section has its own optimized taxonomy:
- **Jobs**: Tagged by function (Engineering, Marketing, Sales)
- **News**: Tagged by topic (Regulation, M&A, Technology)
- **Directory**: Tagged by business category (DIR-029 Payment Processing)
- **Podcasts**: Tagged by themes discussed

Simple tag matching doesn't work across sections. A job tagged "Engineering" won't match a news article tagged "AI in Payments" — even though they may be semantically related.

---

## Solution: Layered Widget Strategy

Widget behavior depends on page depth:

| Page Type | Widget Strategy | Query Type |
|-----------|-----------------|------------|
| **Homepage / Section landing** | Latest (generic) | `ORDER BY published_at DESC LIMIT 5` |
| **Category pages** (e.g., /news/payments) | Latest in category | `WHERE tags @> '{DIR-029}' ORDER BY published_at DESC` |
| **Detail pages** (article, profile, job, podcast) | Related (contextual) | `FROM related_content WHERE source_id = X LIMIT 5` |

### Rationale

- **Landing pages**: User is browsing/exploring — show fresh content to drive discovery
- **Category pages**: User has shown topic interest — filter by that category's tag
- **Detail pages**: User has shown specific intent — serve semantically related content across all sections

---

## Implementation

### Landing & Category Pages (Simple)

Standard SQL queries, highly cacheable:

```sql
-- Homepage: Latest news
SELECT * FROM news ORDER BY published_at DESC LIMIT 5;

-- Category page: Latest in Payments
SELECT * FROM news
WHERE tags @> '{DIR-029}'
ORDER BY published_at DESC LIMIT 5;
```

### Detail Pages (Pre-Computed Similarity)

Related content is computed **on publish**, not on page load.

#### Background Job (On Content Publish)

When content is published (article, job, podcast, etc.):

1. **Generate embedding**: AI analyzes content text → creates vector embedding
2. **Find similar content**: Search all content across all sections for semantic similarity
3. **Store top matches**: Save top N related items to `related_content` table
4. **Group by section**: Ensure mix of content types (jobs, news, companies, etc.)

#### Page Load (Fast Lookup)

```sql
SELECT
  rc.related_id,
  rc.related_type,  -- 'article', 'job', 'company', 'podcast'
  rc.score,
  rc.created_at
FROM related_content rc
WHERE rc.source_id = 'podcast_123'
ORDER BY rc.score DESC
LIMIT 15;
```

Page receives pre-computed list. No real-time AI processing.

---

## Related Content Schema (Website Database)

```sql
CREATE TABLE related_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL,           -- The content being viewed
  source_type TEXT NOT NULL,         -- 'article', 'job', 'company', 'podcast', 'event'
  related_id UUID NOT NULL,          -- The related content item
  related_type TEXT NOT NULL,        -- 'article', 'job', 'company', 'podcast', 'event'
  score DECIMAL(4,3) NOT NULL,       -- Similarity score (0.000 to 1.000)
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, related_id)
);

-- Index for fast lookups
CREATE INDEX idx_related_content_source ON related_content(source_id);

-- Index for cleanup jobs
CREATE INDEX idx_related_content_computed ON related_content(computed_at);
```

**Note**: This table lives in the **website database**, not Supabase (Content Pipeline).

---

## Similarity Computation

### Option A: Vector Embeddings (Recommended)

Use AI embeddings (OpenAI, Anthropic, or open-source) to create semantic vectors:

```javascript
// On publish
const embedding = await ai.embed(content.title + ' ' + content.body);

// Find similar (using pgvector or similar)
const similar = await db.query(`
  SELECT id, type, 1 - (embedding <=> $1) as score
  FROM content_embeddings
  WHERE type != $2  -- Exclude same type for variety
  ORDER BY embedding <=> $1
  LIMIT 20
`, [embedding, content.type]);
```

### Option B: Tag Overlap + Text Similarity (Simpler)

Combine tag matching with text similarity:

```javascript
// Score = (shared_tags * 0.4) + (text_similarity * 0.6)
const score = (sharedTagCount / totalTags * 0.4) + (cosineSimilarity * 0.6);
```

---

## Refresh Strategy

| Trigger | Action |
|---------|--------|
| Content published | Compute related items for new content |
| Content updated (significant) | Recompute related items |
| Daily batch job | Refresh stale entries (>30 days old) |
| Content deleted | Remove from related_content |

---

## Widget Display Rules

### Per-Section Limits

When displaying related content on a detail page, ensure variety:

| Widget | Max Items | Source |
|--------|-----------|--------|
| Related News | 3 | `related_type = 'article'` |
| Related Jobs | 3 | `related_type = 'job'` |
| Related Companies | 3 | `related_type = 'company'` |
| Related Podcasts | 2 | `related_type = 'podcast'` |
| Related Events | 2 | `related_type = 'event'` |

### Fallback Behavior

If pre-computed results are empty for a section:
1. Fall back to tag-based query (shared tags)
2. If still empty, fall back to "Latest" for that section

---

## Example Scenario

**User reads**: "How AI is Revolutionizing Player Safety in Live Casino" (podcast)

**On publish** (background job ran):
- AI analyzed: AI, Player Safety, Live Casino, Regulation
- Found semantically similar content across all sections
- Stored top matches in `related_content`

**On page load** (user viewing):
```
Sidebar shows:

📰 Related News
- "UKGC Proposes AI-Driven Player Protection Rules"
- "Evolution Gaming Partners with SafePlay AI"
- "Player Safety Metrics: Industry Benchmarks 2026"

💼 Related Jobs
- ML Engineer - Player Safety (Entain)
- Responsible Gaming Analyst (Flutter)
- AI Product Manager (Kindred)

🏢 Related Companies
- SafePlay Technologies
- Neccton GmbH
- Mindway AI
```

All discovered via semantic similarity — not tag matching.

---

## Document Information

| Field | Value |
|-------|-------|
| Created | January 2026 |
| Last Updated | January 2026 |
| Applies To | All platform sections |
| Related Docs | primary-triage.md, confidence-thresholds.md |
