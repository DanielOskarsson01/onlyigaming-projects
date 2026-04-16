/**
 * Discovery orchestrator.
 * Runs scans across configured sources, deduplicates, filters by search profile.
 */

const { v4: uuid } = require("uuid");
const db = require("../lib/discoveryDb");

// Provider registry — maps provider name to module
const PROVIDERS = {
  jobtech: require("./providers/jobtech"),
  remoteok: require("./providers/remoteok"),
  remotive: require("./providers/remotive"),
  career_page: require("./providers/careerPage"),
  applyflow: require("./providers/applyflow"),
  linkedin: require("./providers/linkedin"),
};

/**
 * Run a discovery scan across all enabled sources (or a single source).
 */
async function runScan(sourceId = null) {
  const sources = db.getSources();
  const toScan = sourceId
    ? sources.filter((s) => s.id === sourceId && s.enabled)
    : sources.filter((s) => s.enabled);

  const profile = db.getSearchProfile();
  const existing = db.getDiscoveries();
  const results = { scanned: 0, newFound: 0, errors: [] };

  for (const source of toScan) {
    try {
      const provider = PROVIDERS[source.provider];
      if (!provider) {
        results.errors.push({ sourceId: source.id, error: `Unknown provider: ${source.provider}` });
        continue;
      }

      console.log(`[Discovery] Scanning: ${source.name}`);
      let items = await provider.fetchJobs(source);

      // Keyword relevance filter for API sources and job boards (titles are often noisy).
      // Single-company career pages are already targeted, so skip filtering for those.
      if (source.provider !== "career_page" || source.config?.isJobBoard) {
        const before = items.length;
        items = filterByProfile(items, profile);
        if (before !== items.length) {
          console.log(`[Discovery] Filtered ${source.name}: ${before} -> ${items.length} (${before - items.length} irrelevant removed)`);
        }
      }

      // Deduplicate against existing discoveries
      let newCount = 0;
      const newItems = [];
      for (const item of items) {
        if (!isDuplicate(item, existing)) {
          const discovery = {
            id: uuid(),
            sourceId: source.id,
            ...item,
            discoveredAt: new Date().toISOString(),
            status: "new",
            promotedJobId: null,
          };
          newItems.push(discovery);
          existing.push(discovery); // Add to in-memory list for dedup within this scan
          newCount++;
        }
      }

      if (newItems.length > 0) {
        db.addDiscoveries(newItems);
      }

      // Update source metadata
      source.lastChecked = new Date().toISOString();
      source.lastFoundCount = items.length;
      source.lastError = null;
      db.saveSource(source);

      results.scanned++;
      results.newFound += newCount;
      console.log(`[Discovery] ${source.name}: ${items.length} found, ${newCount} new`);
    } catch (err) {
      console.error(`[Discovery] Error scanning ${source.name}:`, err.message);
      source.lastChecked = new Date().toISOString();
      source.lastError = err.message;
      db.saveSource(source);
      results.errors.push({ sourceId: source.id, error: err.message });
    }
  }

  db.setLastScanAt(new Date().toISOString());
  db.cleanupOldDismissed(30);

  return results;
}

/**
 * Check if an item is a duplicate of any existing discovery.
 */
function isDuplicate(item, existing) {
  return existing.some((d) => {
    // 1. Exact externalId match
    if (d.externalId === item.externalId) return true;
    // 2. Exact URL match
    if (d.url && item.url && normalizeUrl(d.url) === normalizeUrl(item.url)) return true;
    // 3. Fuzzy title+company match
    if (isFuzzyTitleMatch(d.title, d.company, item.title, item.company)) return true;
    return false;
  });
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function isFuzzyTitleMatch(titleA, companyA, titleB, companyB) {
  if (!companyA || !companyB) return false;
  if (companyA.toLowerCase().trim() !== companyB.toLowerCase().trim()) return false;
  return diceCoefficient(normalizeTitle(titleA), normalizeTitle(titleB)) > 0.85;
}

function normalizeTitle(title) {
  return (title || "")
    .toLowerCase()
    .replace(/\b(senior|junior|lead|principal|sr\.|jr\.)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function diceCoefficient(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigramsA = new Set();
  for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2));
  const bigramsB = new Set();
  for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.slice(i, i + 2));
  let intersection = 0;
  for (const bg of bigramsA) if (bigramsB.has(bg)) intersection++;
  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

/**
 * Filter items by search profile: keywords, exclude keywords, and location rules.
 *
 * Location rules:
 *   - No location data → pass through
 *   - Sweden → must be Stockholm or remote
 *   - Other allowed countries (from profile.locations) → any city
 *   - Any other country → must be remote
 */
function filterByProfile(items, profile) {
  const kwLower = (profile.keywords || []).map((k) => k.toLowerCase());
  const excludeLower = (profile.excludeKeywords || []).map((k) => k.toLowerCase());
  const locLower = (profile.locations || []).map((l) => l.toLowerCase());

  return items.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const loc = (item.location || "").toLowerCase();

    // 1. Title must match a keyword
    if (!kwLower.some((kw) => title.includes(kw))) return false;

    // 2. Title must NOT match any exclude keyword
    if (excludeLower.length > 0 && excludeLower.some((ex) => title.includes(ex))) {
      console.log(`[Discovery] Excluded (title blocklist): "${item.title}"`);
      return false;
    }

    // 3. Location filter (only when location data exists)
    if (loc) {
      const isRemote = loc.includes("remote");

      // Sweden special rule: must be Stockholm or remote
      if (loc.includes("sweden") || loc.includes("sverige")) {
        if (!loc.includes("stockholm") && !isRemote) {
          console.log(`[Discovery] Filtered out (Sweden, not Stockholm/remote): "${item.title}" — ${item.location}`);
          return false;
        }
        return true;
      }

      // Other allowed countries from profile: pass through
      const isAllowedCountry = locLower.some((l) => loc.includes(l));
      if (isAllowedCountry) return true;

      // Foreign country: must be remote
      if (!isRemote) {
        console.log(`[Discovery] Filtered out (foreign, not remote): "${item.title}" — ${item.location}`);
        return false;
      }
    }

    return true;
  });
}

module.exports = { runScan, filterByProfile, isDuplicate };
