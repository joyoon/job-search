import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/index.js";
import { filterJobs, type FilterCriteria } from "./filters/jobFilter.js";
import { scrapeJobs } from "./scrapers/jobspy.js";
import { Site, type ScrapeJobsParams } from "./types/job.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.static(path.join(__dirname, "..", "public")));

function parseList(value: unknown): string[] | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

app.get("/api/jobs", async (req, res) => {
  const searchTerm = typeof req.query.search_term === "string" ? req.query.search_term : undefined;

  if (!searchTerm) {
    res.status(400).json({ error: "search_term is required" });
    return;
  }

  const sites = parseList(req.query.sites) as Site[] | undefined;

  const scrapeParams: ScrapeJobsParams = {
    search_term: searchTerm,
    location: typeof req.query.location === "string" ? req.query.location : undefined,
    site_name: sites ?? config.defaultSites,
    results_wanted: req.query.results_wanted ? Number(req.query.results_wanted) : config.defaultResultsWanted,
    is_remote: req.query.remote === "true" ? true : undefined,
    job_type: typeof req.query.job_type === "string" ? req.query.job_type : undefined,
    hours_old: req.query.hours_old ? Number(req.query.hours_old) : undefined,
    country_indeed: typeof req.query.country === "string" ? req.query.country : config.defaultCountry,
  };

  const filterCriteria: FilterCriteria = {
    includeKeywords: parseList(req.query.include_keywords),
    excludeKeywords: parseList(req.query.exclude_keywords),
    remoteOnly: req.query.remote === "true" ? true : undefined,
    minSalary: req.query.min_salary ? Number(req.query.min_salary) : undefined,
  };

  try {
    const { jobs } = await scrapeJobs(scrapeParams);
    const filtered = filterJobs(jobs, filterCriteria);
    res.json({ jobs: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Job search UI running at http://localhost:${port}`);
});
