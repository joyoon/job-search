import "dotenv/config";
import { Site } from "jobspy-js";

function parseSites(value: string | undefined): Site[] {
  if (!value) {
    return [Site.INDEED, Site.LINKEDIN, Site.ZIP_RECRUITER, Site.GLASSDOOR];
  }
  return value.split(",").map((site) => site.trim() as Site);
}

export const config = {
  defaultSites: parseSites(process.env.DEFAULT_SITES),
  defaultResultsWanted: Number(process.env.DEFAULT_RESULTS_WANTED ?? 20),
  defaultCountry: process.env.DEFAULT_COUNTRY ?? "USA",
  outputDir: process.env.OUTPUT_DIR ?? "./data",
};
