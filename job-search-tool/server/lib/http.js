/**
 * Standalone HTTP wrapper — replaces pipeline's tools.http.get().
 * Native fetch() with AbortController timeout.
 */

async function httpGet(url, options = {}) {
  const { timeout = 10000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,sv;q=0.8",
      },
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") || "";
    const body = await res.text();

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      contentType,
      body,
      url: res.url,
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { httpGet };
