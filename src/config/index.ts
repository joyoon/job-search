import "dotenv/config";
import { Site } from "jobspy-js";

function parseSites(value: string | undefined): Site[] {
  if (!value) {
    return [Site.INDEED, Site.LINKEDIN, Site.ZIP_RECRUITER, Site.GLASSDOOR];
  }
  return value.split(",").map((site) => site.trim() as Site);
}

function parseList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  defaultSites: parseSites(process.env.DEFAULT_SITES),
  defaultResultsWanted: Number(process.env.DEFAULT_RESULTS_WANTED ?? 20),
  defaultCountry: process.env.DEFAULT_COUNTRY ?? "USA",
  outputDir: process.env.OUTPUT_DIR ?? "./data/filtered",
  draftsDir: process.env.DRAFTS_DIR ?? "./data/drafts",
  profilePath: process.env.PROFILE_PATH ?? "./profile/resume.md",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  defaultIncludeKeywords: parseList(process.env.INCLUDE_KEYWORDS),
  defaultExcludeKeywords: parseList(process.env.EXCLUDE_KEYWORDS),
  defaultMinSalary: process.env.MIN_SALARY ? Number(process.env.MIN_SALARY) : undefined,
};
