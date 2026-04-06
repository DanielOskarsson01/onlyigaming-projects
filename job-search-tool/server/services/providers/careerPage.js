/**
 * Career page link extractor.
 * Uses HTTP fetch + linkedom to parse HTML and extract job links via CSS selectors.
 * Falls back to Playwright for JS-rendered pages.
 */

const { httpGet } = require("../../lib/http");
const { parseHTML } = require("linkedom");

function extractJobLinks(html, source) {
  const { url, linkSelector, baseUrl } = source.config;
  const { document } = parseHTML(html);
  const links = document.querySelectorAll(linkSelector);
  const results = [];
  const seen = new Set();

  for (const el of links) {
    let href = el.getAttribute("href");
    if (!href) continue;

    // Resolve relative URLs
    if (href.startsWith("/")) {
      const base = baseUrl || new URL(url).origin;
      href = base.replace(/\/$/, "") + href;
    }

    if (seen.has(href)) continue;
    seen.add(href);

    const title = el.textContent.replace(/\s+/g, " ").trim();
    if (!title) continue;

    results.push({
      externalId: `career-${Buffer.from(href).toString("base64url").slice(0, 40)}`,
      url: href,
      title,
      company: source.name.replace(/ Careers?$/i, ""),
      location: null,
      snippet: "",
      postedAt: null,
    });
  }

  return results;
}

async function fetchJobs(source) {
  const { url, linkSelector } = source.config;
  if (!url || !linkSelector) {
    throw new Error("Career page source requires url and linkSelector in config");
  }

  // Try HTTP first
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

module.exports = { fetchJobs };
