-- News-Section Database Schema Specification
-- Version: 1.0.0
-- Created: 2026-01-25
--
-- PURPOSE: This document specifies the database schema for the OnlyiGaming.com
-- website. It is a SPECIFICATION for the site developer, not code maintained
-- by the content team.
--
-- HANDOFF: Provide this file to the website developer for implementation.
--
-- This schema is designed for the website database (PostgreSQL recommended).
-- Tags are synchronized from Content-Pipeline's Supabase platform_tags table.
--
-- Tag Source of Truth: /OnlyiGaming/tags/ (~299 tags across 7 dimensions)

-- =============================================================================
-- TAGS TABLE
-- Synchronized from Content-Pipeline's platform_tags table
-- =============================================================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code TEXT UNIQUE NOT NULL,              -- Human-readable: 'DIR-029', 'NEWS-015', 'GEO-UK'
  dimension TEXT NOT NULL,                    -- 'DIR', 'NEWS', 'GEO', 'PROD', 'TYPE', 'COMM', 'CAREER'
  name TEXT NOT NULL,                         -- Display name: 'Payment Processing'
  description TEXT,                           -- Full description from atom documents
  parent_group TEXT,                          -- Grouping within dimension (e.g., 'Gaming Verticals')
  status TEXT DEFAULT 'active',               -- 'active', 'deprecated', 'retired'
  display_order INTEGER DEFAULT 0,            -- For UI ordering within groups
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_dimension CHECK (
    dimension IN ('DIR', 'NEWS', 'GEO', 'PROD', 'TYPE', 'COMM', 'CAREER')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('active', 'deprecated', 'retired')
  )
);

-- Indexes for tags table
CREATE INDEX idx_tags_dimension ON tags(dimension);
CREATE INDEX idx_tags_status ON tags(status) WHERE status = 'active';
CREATE INDEX idx_tags_parent_group ON tags(dimension, parent_group);

COMMENT ON TABLE tags IS 'Tag definitions synchronized from /OnlyiGaming/tags/ atom documents. Source: Content-Pipeline platform_tags.';


-- =============================================================================
-- ARTICLES TABLE
-- News articles with multi-dimensional tagging
-- =============================================================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content fields
  headline TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                  -- URL-friendly identifier
  excerpt TEXT,                               -- Short summary (max 300 chars)
  body TEXT,                                  -- Full article content (HTML or Markdown)
  body_format TEXT DEFAULT 'html',            -- 'html', 'markdown'

  -- Media
  featured_image_url TEXT,
  featured_image_alt TEXT,
  featured_image_caption TEXT,

  -- Author & source
  author_name TEXT,
  author_id UUID,                             -- FK to users table (if exists)
  source_name TEXT,                           -- Original source (for aggregated content)
  source_url TEXT,                            -- Original URL (for attribution)

  -- Publishing
  status TEXT DEFAULT 'draft',                -- 'draft', 'pending_review', 'published', 'archived'
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,                   -- For scheduled publishing

  -- SEO
  meta_title TEXT,                            -- Override headline for SEO
  meta_description TEXT,                      -- Override excerpt for SEO
  canonical_url TEXT,                         -- Canonical URL if republished

  -- Analytics & metrics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Content Pipeline integration
  content_pipeline_id UUID,                   -- Reference to content_items.id in Supabase

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'pending_review', 'published', 'archived')
  ),
  CONSTRAINT valid_body_format CHECK (
    body_format IN ('html', 'markdown')
  )
);

-- Indexes for articles table
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_author ON articles(author_id) WHERE author_id IS NOT NULL;
CREATE INDEX idx_articles_content_pipeline ON articles(content_pipeline_id) WHERE content_pipeline_id IS NOT NULL;

COMMENT ON TABLE articles IS 'News articles with multi-dimensional tagging. Validation: minimum 3-4 tags, maximum 8-10 tags, at least 1 NEWS and 1 GEO tag required.';


-- =============================================================================
-- ARTICLE_TAGS JUNCTION TABLE
-- Many-to-many relationship between articles and tags
-- =============================================================================

CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,

  -- Tagging metadata
  confidence DECIMAL(4,3) DEFAULT 1.000,      -- 0.000 to 1.000 (auto-tagging confidence)
  source TEXT DEFAULT 'manual',               -- 'manual', 'auto_llm', 'auto_rule'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,                            -- User who assigned the tag

  UNIQUE(article_id, tag_id),

  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT valid_source CHECK (source IN ('manual', 'auto_llm', 'auto_rule'))
);

-- Indexes for article_tags (optimized for common query patterns)
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX idx_article_tags_source ON article_tags(source);

-- Composite index for tag filtering queries
CREATE INDEX idx_article_tags_tag_article ON article_tags(tag_id, article_id);

COMMENT ON TABLE article_tags IS 'Junction table for article-tag relationships. Supports confidence scoring for AI-generated tags.';


-- =============================================================================
-- COMPANIES TABLE
-- Company directory with primary category tagging
-- =============================================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  legal_name TEXT,
  description TEXT,

  -- Contact & location
  website_url TEXT,
  headquarters_country TEXT,                  -- ISO 3166-1 alpha-2
  headquarters_city TEXT,

  -- Business info
  founded_year INTEGER,
  employee_count_range TEXT,                  -- '1-10', '11-50', '51-200', '201-500', '500+'
  company_type TEXT,                          -- 'operator', 'supplier', 'affiliate', 'regulator', 'association'

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,

  -- Publishing
  status TEXT DEFAULT 'draft',                -- 'draft', 'pending_review', 'published', 'archived'
  verified BOOLEAN DEFAULT FALSE,             -- Company has verified their profile
  featured BOOLEAN DEFAULT FALSE,             -- Premium listing

  -- Content Pipeline integration
  content_pipeline_id UUID,                   -- Reference to content_items.id in Supabase

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'pending_review', 'published', 'archived')
  )
);

-- Indexes for companies table
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_featured ON companies(featured, status) WHERE featured = TRUE;
CREATE INDEX idx_companies_verified ON companies(verified, status) WHERE verified = TRUE;

COMMENT ON TABLE companies IS 'Company directory listings. Each company has one primary DIR category plus secondary tags.';


-- =============================================================================
-- COMPANY_TAGS JUNCTION TABLE
-- Many-to-many relationship with primary category support
-- =============================================================================

CREATE TABLE company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,

  -- Primary category flag (only one DIR tag can be primary per company)
  is_primary BOOLEAN DEFAULT FALSE,

  -- Tagging metadata
  confidence DECIMAL(4,3) DEFAULT 1.000,
  source TEXT DEFAULT 'manual',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,

  UNIQUE(company_id, tag_id),

  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT valid_source CHECK (source IN ('manual', 'auto_llm', 'auto_rule'))
);

-- Indexes for company_tags
CREATE INDEX idx_company_tags_company ON company_tags(company_id);
CREATE INDEX idx_company_tags_tag ON company_tags(tag_id);
CREATE INDEX idx_company_tags_primary ON company_tags(company_id, is_primary) WHERE is_primary = TRUE;

-- Partial unique index: only one primary tag per company
CREATE UNIQUE INDEX idx_company_tags_one_primary
  ON company_tags(company_id)
  WHERE is_primary = TRUE;

COMMENT ON TABLE company_tags IS 'Junction table for company-tag relationships. is_primary=TRUE indicates the main DIR category.';


-- =============================================================================
-- RELATED_CONTENT TABLE
-- Pre-computed semantic similarity for cross-section discovery
-- See: /OnlyiGaming/tags/rules/cross-section-discovery.md
-- =============================================================================

CREATE TABLE related_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source content (the page being viewed)
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL,                  -- 'article', 'job', 'company', 'podcast', 'event'

  -- Related content (the recommended item)
  related_id UUID NOT NULL,
  related_type TEXT NOT NULL,                 -- 'article', 'job', 'company', 'podcast', 'event'

  -- Similarity score
  score DECIMAL(4,3) NOT NULL,                -- 0.000 to 1.000

  -- Computation metadata
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  embedding_model TEXT,                       -- e.g., 'openai-text-embedding-3-small'

  UNIQUE(source_id, related_id),

  CONSTRAINT valid_source_type CHECK (
    source_type IN ('article', 'job', 'company', 'podcast', 'event', 'page')
  ),
  CONSTRAINT valid_related_type CHECK (
    related_type IN ('article', 'job', 'company', 'podcast', 'event', 'page')
  ),
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 1)
);

-- Indexes for related_content (optimized for page load queries)
CREATE INDEX idx_related_content_source ON related_content(source_id);
CREATE INDEX idx_related_content_source_type ON related_content(source_id, related_type);
CREATE INDEX idx_related_content_computed ON related_content(computed_at);

-- Composite index for the main query pattern
CREATE INDEX idx_related_content_lookup
  ON related_content(source_id, score DESC);

COMMENT ON TABLE related_content IS 'Pre-computed semantic similarity for cross-section content discovery. Computed on publish, fast lookup on page load.';


-- =============================================================================
-- CONTENT_EMBEDDINGS TABLE (Optional - for vector search)
-- Store embeddings for similarity computation
-- Requires pgvector extension
-- =============================================================================

-- CREATE EXTENSION IF NOT EXISTS vector;

-- CREATE TABLE content_embeddings (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   content_id UUID NOT NULL,
--   content_type TEXT NOT NULL,
--   embedding vector(1536),                   -- OpenAI text-embedding-3-small dimension
--   model TEXT NOT NULL,                      -- e.g., 'openai-text-embedding-3-small'
--   computed_at TIMESTAMPTZ DEFAULT NOW(),
--
--   UNIQUE(content_id, model)
-- );
--
-- CREATE INDEX idx_content_embeddings_type ON content_embeddings(content_type);
-- CREATE INDEX idx_content_embeddings_vector ON content_embeddings
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);


-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Published articles with tag counts
CREATE VIEW v_articles_published AS
SELECT
  a.*,
  (SELECT COUNT(*) FROM article_tags WHERE article_id = a.id) AS tag_count
FROM articles a
WHERE a.status = 'published'
ORDER BY a.published_at DESC;

-- Articles by dimension (for navigation)
CREATE VIEW v_articles_by_dimension AS
SELECT
  a.id AS article_id,
  a.headline,
  a.slug,
  a.published_at,
  t.dimension,
  t.tag_code,
  t.name AS tag_name
FROM articles a
JOIN article_tags at ON a.id = at.article_id
JOIN tags t ON at.tag_id = t.id
WHERE a.status = 'published'
ORDER BY a.published_at DESC;

-- Company primary categories
CREATE VIEW v_companies_with_primary AS
SELECT
  c.*,
  t.tag_code AS primary_category_code,
  t.name AS primary_category_name
FROM companies c
LEFT JOIN company_tags ct ON c.id = ct.company_id AND ct.is_primary = TRUE
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.status = 'published';


-- =============================================================================
-- SAMPLE QUERIES
-- =============================================================================

-- Get articles by tag (for category pages)
-- SELECT a.* FROM articles a
-- JOIN article_tags at ON a.id = at.article_id
-- JOIN tags t ON at.tag_id = t.id
-- WHERE t.tag_code = 'DIR-029' AND a.status = 'published'
-- ORDER BY a.published_at DESC
-- LIMIT 10;

-- Get related content for a page (from pre-computed similarity)
-- SELECT rc.related_id, rc.related_type, rc.score
-- FROM related_content rc
-- WHERE rc.source_id = 'article-uuid-here'
-- ORDER BY rc.score DESC
-- LIMIT 15;

-- Validate article has minimum required tags (3-4 minimum)
-- SELECT a.id, a.headline, COUNT(at.tag_id) AS tag_count
-- FROM articles a
-- LEFT JOIN article_tags at ON a.id = at.article_id
-- WHERE a.status = 'pending_review'
-- GROUP BY a.id
-- HAVING COUNT(at.tag_id) < 3;
