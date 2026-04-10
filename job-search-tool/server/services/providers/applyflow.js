/**
 * Applyflow API provider for job boards powered by the Applyflow CMS.
 * (e.g. BettingJobs)
 *
 * Config options:
 *   apiUrl     - Applyflow search API base URL (required)
 *   searchPath - URL-encoded path segment for filtered search (required)
 *   siteCode   - site-code header value (required)
 *   jobBuckets - job-buckets header value (required)
 *   seekerBuckets - seeker-buckets header value (optional, defaults to lowercase jobBuckets)
 *   baseUrl    - for building job detail URLs (required)
 *   maxPages   - max pages to fetch (optional, default 5)
 */

async function fetchJobs(source) {
  const {
    apiUrl, searchPath, siteCode, jobBuckets,
    seekerBuckets, baseUrl, maxPages = 5,
  } = source.config;

  if (!apiUrl || !searchPath || !siteCode || !jobBuckets) {
    throw new Error("Applyflow source requires apiUrl, searchPath, siteCode, jobBuckets");
  }

  const headers = {
    "site-code": siteCode,
    "platform-code": "applyflow",
    "seeker-buckets": seekerBuckets || jobBuckets.toLowerCase(),
    "job-buckets": jobBuckets,
    "Accept": "application/json",
  };

  const allJobs = [];
  const seen = new Set();

  for (let page = 1; page <= maxPages; page++) {
    const url = `${apiUrl}?url=${searchPath}&facet=1&allow_backfill=true&page=${page}`;
    console.log(`[applyflow] ${source.name} page ${page}`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        console.warn(`[applyflow] ${source.name} page ${page}: HTTP ${res.status}`);
        break;
      }

      const data = await res.json();
      const jobs = data.search_results?.jobs || [];

      if (jobs.length === 0) {
        console.log(`[applyflow] ${source.name} page ${page}: no jobs — stopping`);
        break;
      }

      for (const j of jobs) {
        const jobUrl = j.URL
          ? `${baseUrl.replace(/\/$/, "")}/vacancy/${j.URL}`
          : j.apply_url;
        if (!jobUrl || seen.has(jobUrl)) continue;
        seen.add(jobUrl);

        allJobs.push({
          externalId: `applyflow-${j.uuid || j.id}`,
          url: jobUrl,
          title: j.job_title || "",
          company: j.company_name || source.name,
          location: j.location_label || null,
          snippet: (j.short_description || "").slice(0, 300),
          postedAt: j.created_at ? new Date(j.created_at).toISOString() : null,
        });
      }

      console.log(`[applyflow] ${source.name} page ${page}: ${jobs.length} jobs (total: ${allJobs.length})`);

      // Stop if we got all jobs
      const totalCount = data.search_results?.job_count || 0;
      if (allJobs.length >= totalCount) break;
    } catch (err) {
      console.warn(`[applyflow] ${source.name} page ${page} failed: ${err.message}`);
      break;
    }
  }

  return allJobs;
}

module.exports = { fetchJobs };
