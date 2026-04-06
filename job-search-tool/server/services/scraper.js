/**
 * Scraper service — extracted from content-pipeline page-scraper.
 * HTTP fetch + Mozilla Readability for clean text extraction.
 */

const { Readability } = require("@mozilla/readability");
const { parseHTML } = require("linkedom");
const { httpGet } = require("../lib/http");

// ---- Pure extraction functions (from page-scraper execute.js) ----

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&nbsp;/g, " ");
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) return decodeEntities(titleMatch[1].trim());

  const ogMatch =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    );
  if (ogMatch) return decodeEntities(ogMatch[1].trim());

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) return decodeEntities(stripTags(h1Match[1]).trim());

  return null;
}

function extractMetaDescription(html) {
  const match =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    );
  return match ? decodeEntities(match[1].trim()) : null;
}

function extractOgDescription(html) {
  const match =
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    );
  return match ? decodeEntities(match[1].trim()) : null;
}

function isBlockPageText(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const markers = [
    "why have i been blocked",
    "cloudflare ray id",
    "this website is using a security service",
    "action you just performed triggered the security solution",
    "you can email the site owner to let them know you were blocked",
    "attention required",
  ];
  const matches = markers.filter((m) => lower.includes(m));
  return matches.length >= 2;
}

function extractTextReadability(html, url) {
  try {
    const { document } = parseHTML(html);
    if (url) {
      try {
        document.baseURI = url;
      } catch (_) {}
    }

    const reader = new Readability(document);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 50) {
      return article.textContent
        .replace(/[^\S\n]+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .replace(/^\s+|\s+$/gm, "")
        .trim();
    }
  } catch (_) {}

  return extractTextFallback(html);
}

function extractTextFallback(html) {
  let content = html;

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

  if (mainMatch) {
    content = mainMatch[1];
  } else if (articleMatch) {
    content = articleMatch[1];
  } else {
    const cmsPatterns = [
      /<div[^>]+class="[^"]*\bentry-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*\bpost-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*\bpage-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*\belementor-widget-text-editor\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      /<div[^>]+class="[^"]*\belementor-widget-theme-post-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      /<div[^>]+data-widget_type="text-editor[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      /<[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/[a-z]+>/i,
      /<div[^>]+class="[^"]*\bcontent-area\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*\bsite-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>/i,
    ];

    let cmsMatch = null;
    for (const pattern of cmsPatterns) {
      cmsMatch = html.match(pattern);
      if (cmsMatch && cmsMatch[1].length > 100) break;
      cmsMatch = null;
    }

    if (cmsMatch) {
      content = cmsMatch[1];
    } else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) content = bodyMatch[1];
    }
  }

  content = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  content = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /<\/(?:p|div|h[1-6]|li|tr|blockquote|section|article|figcaption)>/gi,
      "\n\n"
    )
    .replace(
      /<(?:p|div|h[1-6]|li|tr|blockquote|section|article|figcaption)[^>]*>/gi,
      ""
    )
    .replace(/<\/(?:ul|ol|table|dl)>/gi, "\n")
    .replace(/<(?:hr)[^>]*\/?>/gi, "\n---\n");

  content = stripTags(content);
  content = decodeEntities(content);

  return content
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

// ---- Shared extraction from HTML ----

function extractFromHtml(html, url) {
  const textContent = extractTextReadability(html, url);
  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  if (isBlockPageText(textContent)) {
    return {
      url, finalUrl: url, title, textContent: "", wordCount: 0,
      metaDescription, status: "blocked", error: "Cloudflare or bot protection detected",
    };
  }

  return {
    url, finalUrl: url, title, textContent, wordCount,
    metaDescription, status: wordCount < 50 ? "low_content" : "success", error: null,
  };
}

// ---- HTTP scrape ----

async function scrapeUrlHttp(url, options = {}) {
  const { timeout = 10000 } = options;
  const res = await httpGet(url, { timeout });

  if (res.status >= 400) {
    return {
      url, finalUrl: res.url, title: null, textContent: "", wordCount: 0,
      metaDescription: null, status: "error", error: `HTTP ${res.status}`, scrapeMethod: "http",
    };
  }

  const isHtml = res.contentType.includes("text/html") || res.contentType.includes("application/xhtml");
  if (!isHtml) {
    return {
      url, finalUrl: res.url, title: null, textContent: "", wordCount: 0,
      metaDescription: null, status: "error", error: `Non-HTML content: ${res.contentType}`, scrapeMethod: "http",
    };
  }

  const result = extractFromHtml(res.body, res.url);
  result.finalUrl = res.url;
  result.scrapeMethod = "http";
  return result;
}

// ---- Browser scrape (Playwright fallback) ----

async function scrapeUrlBrowser(url, options = {}) {
  const { browserFetch } = require("./browserPool");
  const res = await browserFetch(url, { timeout: options.timeout || 30000 });

  if (res.status >= 400) {
    return {
      url, finalUrl: res.url, title: null, textContent: "", wordCount: 0,
      metaDescription: null, status: "error", error: `HTTP ${res.status}`, scrapeMethod: "browser",
    };
  }

  const result = extractFromHtml(res.body, res.url);
  result.finalUrl = res.url;
  result.scrapeMethod = "browser";
  return result;
}

// ---- Fetch raw HTML (for link discovery — no text extraction) ----

async function fetchHtml(url, options = {}) {
  const { timeout = 10000 } = options;
  try {
    const res = await httpGet(url, { timeout });
    if (res.status >= 400) return { html: null, url: res.url, error: `HTTP ${res.status}` };
    return { html: res.body, url: res.url, error: null };
  } catch (err) {
    return { html: null, url, error: err.message };
  }
}

async function fetchHtmlBrowser(url, options = {}) {
  const { browserFetch } = require("./browserPool");
  const res = await browserFetch(url, { timeout: options.timeout || 30000 });
  return { html: res.body, url: res.url, error: null };
}

// ---- Cascade: HTTP → Browser ----

async function scrapeUrl(url, options = {}) {
  try {
    const result = await scrapeUrlHttp(url, options);
    if (result.status === "success") return result;

    // Try browser fallback for blocked/low_content
    if (result.status === "blocked" || result.status === "low_content") {
      console.log(`[scraper] HTTP ${result.status} for ${url} — trying browser`);
      try {
        const browserResult = await scrapeUrlBrowser(url, options);
        if (browserResult.status === "success" || browserResult.wordCount > result.wordCount) {
          return browserResult;
        }
      } catch (browserErr) {
        console.warn(`[scraper] Browser fallback failed: ${browserErr.message}`);
      }
    }
    return result;
  } catch (err) {
    console.log(`[scraper] HTTP error for ${url}: ${err.message} — trying browser`);
    try {
      return await scrapeUrlBrowser(url, options);
    } catch (browserErr) {
      return {
        url, finalUrl: url, title: null, textContent: "", wordCount: 0,
        metaDescription: null, status: "error", scrapeMethod: "http",
        error: err.name === "AbortError" ? "Timeout" : err.message,
      };
    }
  }
}

/**
 * Scrape multiple URLs with concurrency control.
 */
async function scrapeUrls(urls, options = {}) {
  const { concurrency = 4, timeout = 10000 } = options;
  const results = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((url) => scrapeUrl(url, { timeout }))
    );
    batchResults.forEach((r, j) => {
      results.push(r.status === "fulfilled" ? r.value : {
        url: batch[j],
        status: "error",
        error: r.reason?.message || "Unknown error",
      });
    });
  }

  return results;
}

module.exports = { scrapeUrl, scrapeUrls, scrapeUrlHttp, scrapeUrlBrowser, fetchHtml, fetchHtmlBrowser, extractFromHtml, extractTitle, stripTags, decodeEntities };
