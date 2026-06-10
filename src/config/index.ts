import "dotenv/config";
import type { JobSite } from "../types/job.js";

function parseSites(value: string | undefined): JobSite[] {
  if (!value) return ["indeed", "linkedin", "zip_recruiter", "glassdoor"];
  return value.split(",").map((site) => site.trim()) as JobSite[];
}

export const config = {
  pythonBin: process.env.PYTHON_BIN ?? "python3",
  scriptPath: new URL("../../python/scrape.py", import.meta.url).pathname,
  defaultSites: parseSites(process.env.DEFAULT_SITES),
  defaultResultsWanted: Number(process.env.DEFAULT_RESULTS_WANTED ?? 20),
  defaultCountry: process.env.DEFAULT_COUNTRY ?? "USA",
  outputDir: process.env.OUTPUT_DIR ?? "./data",
};
