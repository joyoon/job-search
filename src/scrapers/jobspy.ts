import { scrapeJobs as jobspyScrapeJobs } from "jobspy-js";
import type { JobResponse, ScrapeJobsParams } from "../types/job.js";

/**
 * Thin wrapper around jobspy-js's scrapeJobs, kept separate so the rest of
 * the app depends on our own module rather than the third-party package
 * directly.
 */
export async function scrapeJobs(params: ScrapeJobsParams): Promise<JobResponse> {
  return jobspyScrapeJobs(params);
}
