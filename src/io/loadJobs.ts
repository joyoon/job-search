import { readFile } from "node:fs/promises";
import type { CompensationInterval, JobPost } from "../types/job.js";

/**
 * Raw job records as commonly exported by python-jobspy / jobspy-js (flat
 * CSV-style columns rather than the nested JobPost shape).
 */
interface RawJobRecord {
  id?: string;
  site?: string;
  job_url?: string;
  job_url_direct?: string;
  title?: string;
  company?: string;
  company_url?: string;
  company_logo?: string;
  location?: string;
  description?: string;
  date_posted?: string;
  is_remote?: boolean;
  interval?: string;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
  salary_source?: string;
  listing_type?: string;
  [key: string]: unknown;
}

function normalizeJob(raw: RawJobRecord): JobPost {
  const hasCompensation =
    raw.min_amount !== undefined || raw.max_amount !== undefined || raw.currency !== undefined;

  return {
    id: raw.id,
    title: raw.title ?? "",
    company_name: raw.company,
    company_url: raw.company_url,
    company_logo: raw.company_logo,
    job_url: raw.job_url ?? "",
    job_url_direct: raw.job_url_direct,
    location: raw.location ? { city: raw.location } : undefined,
    description: raw.description,
    date_posted: raw.date_posted,
    is_remote: raw.is_remote,
    listing_type: raw.listing_type,
    compensation: hasCompensation
      ? {
          interval: raw.interval as CompensationInterval | undefined,
          min_amount: raw.min_amount,
          max_amount: raw.max_amount,
          currency: raw.currency,
        }
      : undefined,
  };
}

/**
 * Loads previously-scraped job listings from a JSON file (an array of job
 * records), normalizing them into the JobPost shape used by the filter and
 * draft-generation steps.
 */
export async function loadJobsFromFile(filePath: string): Promise<JobPost[]> {
  const raw = await readFile(filePath, "utf-8");
  const records = JSON.parse(raw) as RawJobRecord[];

  if (!Array.isArray(records)) {
    throw new Error(`Expected ${filePath} to contain a JSON array of job listings.`);
  }

  return records.map(normalizeJob);
}
