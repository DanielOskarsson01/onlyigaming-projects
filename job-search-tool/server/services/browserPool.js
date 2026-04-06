/**
 * Shared browser pool for Playwright-based page fetching.
 * Ported from content-pipeline browserPool.js (ESM → CJS).
 *
 * Singleton Chromium instance, auto-recovers on crash,
 * each fetch gets isolated BrowserContext (separate cookies).
 * Lazy-loaded — zero cost if never called.
 */

let chromium;
let browserInstance = null;
let browserLaunchPromise = null;

const BASE_LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

function getChromium() {
  if (chromium) return chromium;
  try {
    const pw = require("playwright");
    chromium = pw.chromium;
  } catch (err) {
    throw new Error("playwright not installed — run: npm install playwright");
  }
  return chromium;
}

async function getBrowser() {
  if (browserInstance && !browserInstance.isConnected()) {
    console.warn("[browserPool] Browser disconnected — relaunching");
    browserInstance = null;
  }

  if (browserInstance) return browserInstance;
  if (browserLaunchPromise) return browserLaunchPromise;

  browserLaunchPromise = getChromium()
    .launch({ headless: true, args: [...BASE_LAUNCH_ARGS] })
    .then((browser) => {
      browserInstance = browser;
      browserLaunchPromise = null;
      console.log("[browserPool] Chromium launched");
      return browser;
    })
    .catch((err) => {
      browserLaunchPromise = null;
      browserInstance = null;
      throw err;
    });

  return browserLaunchPromise;
}

async function browserFetch(url, options = {}) {
  const { timeout = 30000, waitForNetworkIdle = true } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
  });

  const page = await context.newPage();

  try {
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    });

    const response = await page.goto(url, {
      timeout,
      waitUntil: waitForNetworkIdle ? "networkidle" : "domcontentloaded",
    });

    // Small delay for final JS execution
    await page.waitForTimeout(500);

    const body = await page.content();
    const status = response?.status() || 200;
    const finalUrl = page.url();

    return { status, body, url: finalUrl };
  } finally {
    await context.close();
  }
}

async function closeBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (_) {}
    browserInstance = null;
  }
}

module.exports = { browserFetch, closeBrowser };
