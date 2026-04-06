/**
 * AI-assisted source detection.
 * Given a URL, fetches the page and uses Claude to identify job listing links
 * and the extraction pattern for future scans.
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { fetchHtml, fetchHtmlBrowser } = require("./scraper");

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a job listing detector. Given HTML from a webpage, identify all job listing links on the page.

Return a JSON object with:
1. "jobs" - array of job objects found: { "title": string, "url": string, "company": string|null }
2. "linkPattern" - a CSS-like description of how to find job links on this page for future scans. Be specific about the selector pattern (e.g., "a[href*='/job/']", "a.job-listing-link", ".vacancy-card a"). If there are multiple valid patterns, pick the most reliable one.
3. "pageType" - one of: "career_page" (company careers), "job_board" (aggregator with many companies), "search_results" (filtered search), "other"
4. "confidence" - "high", "medium", or "low" based on how clearly structured the job listings are

IMPORTANT:
- Only include links that are clearly job postings (not blog posts, about pages, etc.)
- URLs must be absolute (resolve relative URLs using the page's base URL)
- If you find no job listings, return an empty jobs array
- Return ONLY valid JSON, no markdown fencing`;

/**
 * Detect job listings on a URL using AI analysis.
 * Tries HTTP first, falls back to Playwright for JS-rendered pages.
 */
function cleanHtml(html) {
  // Strip scripts, styles, SVGs, and other non-content to reduce size
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s{2,}/g, " ");
}

async function analyzeHtml(html, pageUrl) {
  const cleaned = cleanHtml(html);
  const truncatedHtml = cleaned.length > 60000 ? cleaned.slice(0, 60000) + "\n<!-- truncated -->" : cleaned;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this webpage HTML and find all job listing links.\n\nPage URL: ${pageUrl}\n\n<html>\n${truncatedHtml}\n</html>`,
      },
    ],
  });

  const text = response.content[0]?.text || "{}";

  // Try multiple JSON extraction strategies
  // 1. Direct parse
  try { return JSON.parse(text); } catch {}
  // 2. Markdown fencing
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) try { return JSON.parse(fenceMatch[1]); } catch {}
  // 3. Find first { to last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch {}
  }

  console.error("[sourceDetector] Failed to parse response:", text.slice(0, 200));
  throw new Error("Failed to parse AI response as JSON");
}

async function detectJobsOnPage(url) {
  // 1. Try HTTP first
  let { html, url: finalUrl, error } = await fetchHtml(url);
  let usedBrowser = false;

  if (!html) {
    // HTTP totally failed — go straight to browser
    console.log(`[sourceDetector] HTTP failed for ${url} — trying browser`);
    const browserResult = await fetchHtmlBrowser(url);
    html = browserResult.html;
    finalUrl = browserResult.url;
    usedBrowser = true;
  }

  // 2. Analyze HTML with AI
  let result = await analyzeHtml(html, finalUrl);

  // 3. If HTTP found few jobs (0-2) and we haven't tried browser yet, retry with Playwright.
  //    JS-rendered career pages (Workday, Jobvite) often return shell HTML with no real job links.
  //    A page with only 1-2 links is likely a landing page, not a real job listing.
  if (!usedBrowser && (!result.jobs || result.jobs.length <= 2)) {
    console.log(`[sourceDetector] HTTP found 0 jobs on ${url} — retrying with browser`);
    try {
      const browserResult = await fetchHtmlBrowser(url);
      if (browserResult.html && browserResult.html.length > 0) {
        const browserAnalysis = await analyzeHtml(browserResult.html, browserResult.url);
        if ((browserAnalysis.jobs || []).length > 0) {
          result = browserAnalysis;
          finalUrl = browserResult.url;
          usedBrowser = true;
        }
      }
    } catch (browserErr) {
      console.warn(`[sourceDetector] Browser retry failed: ${browserErr.message}`);
    }
  }

  return {
    url: finalUrl,
    jobs: result.jobs || [],
    linkPattern: result.linkPattern || null,
    pageType: result.pageType || "other",
    confidence: result.confidence || "low",
    jobCount: (result.jobs || []).length,
    usedBrowser,
  };
}

module.exports = { detectJobsOnPage };
