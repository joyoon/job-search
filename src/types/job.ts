export type JobSite =
  | "indeed"
  | "linkedin"
  | "zip_recruiter"
  | "glassdoor"
  | "google"
  | "bayt"
  | "naukri";

export type JobType =
  | "fulltime"
  | "parttime"
  | "internship"
  | "contract";

export interface ScrapeOptions {
  site_name?: JobSite[];
  search_term?: string;
  google_search_term?: string;
  location?: string;
  distance?: number;
  is_remote?: boolean;
  job_type?: JobType;
  results_wanted?: number;
  hours_old?: number;
  country_indeed?: string;
  linkedin_fetch_description?: boolean;
}

export interface JobPosting {
  id?: string;
  site?: string;
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  date_posted?: string | null;
  salary_source?: string | null;
  interval?: string | null;
  min_amount?: number | null;
  max_amount?: number | null;
  currency?: string | null;
  is_remote?: boolean | null;
  job_url?: string;
  job_url_direct?: string | null;
  description?: string | null;
  company_url?: string | null;
  [key: string]: unknown;
}
