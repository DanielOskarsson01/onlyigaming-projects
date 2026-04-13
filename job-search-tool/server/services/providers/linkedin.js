/**
 * LinkedIn Guest API provider.
 * Uses the public guest jobs API (no auth required).
 *
 * Config options:
 *   searches         - Array of search objects: { keywords, location?, geoId?, f_WT? } (required)
 *   maxPagesPerSearch - Max pagination pages per search (optional, default 3)
 *   f_TPR            - Time posted filter: r86400=24h, r604800=7d, r2592000=30d (optional)
 *   f_E              - Experience level: 4=Director, 5=Executive (optional)
 */

const { parseHTML } = require("linkedom");

const API_BASE = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
const PAGE_SIZE = 25;

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  return 3000 + Math.random() * 2000; // 3-5 seconds
}

async function fetchJobs(source) {
  const { searches, maxPagesPerSearch = 3, f_TPR, f_E } = source.config;

  if (!searches || !searches.length) {
    throw new Error("LinkedIn source requires searches array");
  }

  const allJobs = [];
  const seen = new Set();

  for (const search of searches) {
    const searchLabel = search.keywords || "unknown";
    console.log(`[linkedin] ${source.name} searching: "${searchLabel}"`);

    for (let page = 0; page < maxPagesPerSearch; page++) {
      const start = page * PAGE_SIZE;
      const params = new URLSearchParams();
      if (search.keywords) params.set("keywords", search.keywords);
      if (search.location) params.set("location", search.location);
      if (search.geoId) params.set("geoId", search.geoId);
      if (search.f_WT) params.set("f_WT", search.f_WT);
      if (f_TPR) params.set("f_TPR", f_TPR);
      if (f_E) params.set("f_E", f_E);
      params.set("start", String(start));
      params.set("sortBy", "DD");

      const url = `${API_BASE}?${params.toString()}`;

      // Rate limit between requests
      if (page > 0 || searches.indexOf(search) > 0) {
        await sleep(randomDelay());
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
          headers: {
            "User-Agent": randomUA(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.status === 429) {
          console.warn(`[linkedin] Rate limited on "${searchLabel}" page ${page + 1} — waiting 60s`);
          await sleep(60000);
          // Retry once
          const retryController = new AbortController();
          const retryTimer = setTimeout(() => retryController.abort(), 15000);
          const retryRes = await fetch(url, {
            headers: { "User-Agent": randomUA(), "Accept": "text/html" },
            signal: retryController.signal,
          });
          clearTimeout(retryTimer);
          if (!retryRes.ok) {
            console.warn(`[linkedin] Retry failed (${retryRes.status}) — skipping remaining pages`);
            break;
          }
          const retryHtml = await retryRes.text();
          const retryJobs = parseJobCards(retryHtml);
          addJobs(retryJobs, allJobs, seen);
          console.log(`[linkedin] "${searchLabel}" page ${page + 1} (retry): ${retryJobs.length} jobs`);
          if (retryJobs.length < PAGE_SIZE) break;
          continue;
        }

        if (res.status === 999) {
          console.warn(`[linkedin] Bot detection (999) on "${searchLabel}" — skipping`);
          break;
        }

        if (!res.ok) {
          console.warn(`[linkedin] "${searchLabel}" page ${page + 1}: HTTP ${res.status}`);
          break;
        }

        const html = await res.text();
        const jobs = parseJobCards(html);

        if (jobs.length === 0) {
          console.log(`[linkedin] "${searchLabel}" page ${page + 1}: no results — stopping`);
          break;
        }

        addJobs(jobs, allJobs, seen);
        console.log(`[linkedin] "${searchLabel}" page ${page + 1}: ${jobs.length} jobs (total: ${allJobs.length})`);

        if (jobs.length < PAGE_SIZE) break;
      } catch (err) {
        console.warn(`[linkedin] "${searchLabel}" page ${page + 1} failed: ${err.message}`);
        break;
      }
    }
  }

  return allJobs;
}

/**
 * Parse LinkedIn job cards from HTML fragment.
 */
function parseJobCards(html) {
  if (!html || !html.trim()) return [];

  const { document } = parseHTML(`<div>${html}</div>`);
  const cards = document.querySelectorAll("li");
  const jobs = [];

  for (const card of cards) {
    try {
      const linkEl = card.querySelector("a.base-card__full-link");
      const titleEl = card.querySelector("h3.base-search-card__title");
      const companyEl = card.querySelector("h4.base-search-card__subtitle a") ||
                        card.querySelector("h4.base-search-card__subtitle");
      const locationEl = card.querySelector("span.job-search-card__location");
      const timeEl = card.querySelector("time");

      const href = linkEl?.getAttribute("href")?.trim();
      if (!href) continue;

      // Clean URL — remove tracking params, keep base job URL
      const jobUrl = href.split("?")[0].replace(/\/$/, "");

      // Extract job ID from URL for externalId
      const jobIdMatch = jobUrl.match(/\/view\/[^/]+-(\d+)/) || jobUrl.match(/(\d+)$/);
      const jobId = jobIdMatch ? jobIdMatch[1] : null;

      const title = titleEl?.textContent?.trim() || "";
      if (!title) continue;

      jobs.push({
        externalId: jobId ? `linkedin-${jobId}` : `linkedin-${Buffer.from(jobUrl).toString("base64").slice(0, 20)}`,
        url: jobUrl,
        title,
        company: companyEl?.textContent?.trim() || null,
        location: locationEl?.textContent?.trim() || null,
        snippet: null,
        postedAt: timeEl?.getAttribute("datetime") || null,
      });
    } catch {
      // Skip malformed cards
    }
  }

  return jobs;
}

/**
 * Add jobs to allJobs, deduplicating by URL.
 */
function addJobs(newJobs, allJobs, seen) {
  for (const job of newJobs) {
    if (!job.url || seen.has(job.url)) continue;
    seen.add(job.url);
    allJobs.push(job);
  }
}

module.exports = { fetchJobs };
