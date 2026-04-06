require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/scrape", require("./routes/scrape"));
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/generate", require("./routes/generate"));
app.use("/api/discovery", require("./routes/discovery"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Preload CV content on startup
try {
  const { loadAll } = require("./services/cvContent");
  loadAll();
  console.log("CV content loaded from", process.env.CVS_DIR || "(default path)");
} catch (err) {
  console.error("Warning: Could not load CV content:", err.message);
}

// Scheduled discovery scan (daily at 07:00)
const cron = require("node-cron");
const { runScan } = require("./services/discovery");

cron.schedule("0 7 * * *", async () => {
  console.log("[Discovery] Starting scheduled scan...");
  try {
    const results = await runScan();
    console.log(`[Discovery] Scan complete: ${results.newFound} new, ${results.errors.length} errors`);
  } catch (err) {
    console.error("[Discovery] Scheduled scan failed:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Job Search Tool server running on http://localhost:${PORT}`);
});
