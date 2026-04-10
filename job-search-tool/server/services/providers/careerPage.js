/**
 * Career page / job board link extractor.
 * Supports single-page and paginated sites.
 * Uses HTTP fetch + linkedom for simple pages.
 * Falls back to (or directly uses) Playwright for JS-rendered / paginated pages.
 *
 * Config options:
 *   url           - page URL (required)
 *   linkSelector  - CSS selector for job links (required)
 *   baseUrl       - base for resolving relative URLs (optional)
 *   listingSelector  - CSS selector for listing container (optional, enables structured mode)
 *   companySelector  - CSS selector for company within listing (optional)
 *   locationSelector - CSS selector for location within listing (optional)
 *   titleSelector    - CSS selector for title (if different from link text) (optional)
 *   snippetSelector  - CSS selector for snippet within listing (optional)
 *   dateSelector     - CSS selector for posted date within listing (optional)
 *   titleSeparator   - split link text into title/company (e.g. " @ ") (optional)
 *   isJobBoard       - true = apply keyword filtering in discovery (optional)
 *   pagination       - { type, param, maxPages, startPage } (optional)
 *     type      - "query_param" (default) or "path"
 *     param     - query param name or path segment (default "page")
 *     maxPages  - max pages to crawl (default 10)
 *     startPage - first page number (default 1)
 */

const { httpGet } = require("../../lib/http");
const { parseHTML } = require("linkedom");

function extractJobLinks(html, source) {
  const {
    url, linkSelector, baseUrl,
    listingSelector, companySelector, locationSelector,
    titleSelector, snippetSelector, dateSelector, titleSeparator,
  } = source.config;

  const { document } = parseHTML(html);
  const results = [];
  const seen = new Set();
  const defaultCompany = source.name.replace(/ Careers?$/i, "");

  if (listingSelector) {
    // Structured mode: each listing container has child elements
    const listings = document.querySelectorAll(listingSelector);
    for (const listing of listings) {
      const linkEl = listing.querySelector(linkSelector);
      if (!linkEl) continue;

      let href = linkEl.getAttribute("href");
      if (!href) continue;
      href = resolveUrl(href, baseUrl, url);

      if (seen.has(href)) continue;
      seen.add(href);

      let title = linkEl.textContent.replace(/\s+/g, " ").trim();
      // Override title from dedicated selector if configured
      if (titleSelector) {
        const titleEl = listing.querySelector(titleSelector);
        if (titleEl) title = titleEl.textContent.replace(/\s+/g, " ").trim();
      }
      let company = defaultCompany;
      let location = null;
      let snippet = "";
      let postedAt = null;

      // Split title into title + company if separator configured
      if (titleSeparator && title.includes(titleSeparator)) {
        const parts = title.split(titleSeparator);
        title = parts[0].trim();
        company = parts.slice(1).join(titleSeparator).trim();
      }

      // Extract fields from dedicated selectors
      if (companySelector) {
        const el = listing.querySelector(companySelector);
        if (el) company = el.textContent.replace(/\s+/g, " ").trim();
      }
      if (locationSelector) {
        const el = listing.querySelector(locationSelector);
        if (el) location = el.textContent.replace(/\s+/g, " ").trim();
      }
      if (snippetSelector) {
        const el = listing.querySelector(snippetSelector);
        if (el) snippet = el.textContent.replace(/\s+/g, " ").trim().slice(0, 300);
      }
      if (dateSelector) {
        const el = listing.querySelector(dateSelector);
        if (el) {
          const dateText = el.textContent.replace(/\s+/g, " ").trim();
          const parsed = new Date(dateText);
          if (!isNaN(parsed.getTime())) postedAt = parsed.toISOString();
        }
      }

      if (!title) continue;

      results.push({
        externalId: `career-${Buffer.from(href).toString("base64url").slice(0, 40)}`,
        url: href,
        title,
        company,
        location,
        snippet,
        postedAt,
      });
    }
  } else {
    // Simple mode: just extract links (original behavior)
    const links = document.querySelectorAll(linkSelector);
    for (const el of links) {
      let href = el.getAttribute("href");
      if (!href) continue;
      href = resolveUrl(href, baseUrl, url);

      if (seen.has(href)) continue;
      seen.add(href);

      let title = el.textContent.replace(/\s+/g, " ").trim();
      let company = defaultCompany;

      if (titleSeparator && title.includes(titleSeparator)) {
        const parts = title.split(titleSeparator);
        title = parts[0].trim();
        company = parts.slice(1).join(titleSeparator).trim();
      }

      if (!title) continue;

      results.push({
        externalId: `career-${Buffer.from(href).toString("base64url").slice(0, 40)}`,
        url: href,
        title,
        company,
        location: null,
        snippet: "",
        postedAt: null,
      });
    }
  }

  return results;
}

function resolveUrl(href, baseUrl, pageUrl) {
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) {
    const base = baseUrl || new URL(pageUrl).origin;
    return base.replace(/\/$/, "") + href;
  }
  // Relative path (e.g. "jobs/123", "./details") — resolve against page URL
  try { return new URL(href, pageUrl).href; } catch { return href; }
}

async function fetchJobs(source) {
  const { url, linkSelector, pagination } = source.config;
  if (!url || !linkSelector) {
    throw new Error("Career page source requires url and linkSelector in config");
  }

  // Paginated mode — always uses Playwright
  if (pagination) {
    return fetchPaginated(source);
  }

  // Non-paginated: HTTP first, Playwright fallback
  const res = await httpGet(url, { timeout: 15000 });
  if (res.status !== 200) {
    throw new Error(`Career page returned HTTP ${res.status}`);
  }

  let results = extractJobLinks(res.body, source);

  // If HTTP found nothing, try Playwright (JS-rendered page)
  if (results.length === 0) {
    console.log(`[careerPage] No links via HTTP for ${source.name} — trying browser`);
    try {
      const { browserFetch } = require("../browserPool");
      const browserRes = await browserFetch(url, { timeout: 30000 });
      results = extractJobLinks(browserRes.body, source);
      if (results.length > 0) {
        console.log(`[careerPage] Browser found ${results.length} jobs for ${source.name}`);
      }
    } catch (err) {
      console.warn(`[careerPage] Browser fallback failed for ${source.name}: ${err.message}`);
    }
  }

  return results;
}

async function fetchPaginated(source) {
  const { url, pagination } = source.config;
  const {
    type = "query_param",
    param = "page",
    maxPages = 10,
    startPage = 1,
  } = pagination;

  const { browserFetch } = require("../browserPool");
  const allResults = [];
  const seen = new Set();

  for (let page = startPage; page < startPage + maxPages; page++) {
    const pageUrl = buildPageUrl(url, type, param, page);
    console.log(`[careerPage] Page ${page}: ${pageUrl}`);

    try {
      const res = await browserFetch(pageUrl, { timeout: 30000 });
      const pageResults = extractJobLinks(res.body, source);

      // Deduplicate across pages
      const newResults = pageResults.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });

      if (newResults.length === 0) {
        console.log(`[careerPage] Page ${page}: no new jobs — stopping`);
        break;
      }

      allResults.push(...newResults);
      console.log(`[careerPage] Page ${page}: ${newResults.length} jobs (total: ${allResults.length})`);
    } catch (err) {
      console.warn(`[careerPage] Page ${page} failed: ${err.message} — stopping`);
      break;
    }
  }

  return allResults;
}

function buildPageUrl(baseUrl, type, param, page) {
  if (type === "path") {
    return baseUrl.replace(/\/$/, "") + `/${param}/${page}/`;
  }
  // Default: query_param
  const u = new URL(baseUrl);
  u.searchParams.set(param, page);
  return u.toString();
}

module.exports = { fetchJobs };
