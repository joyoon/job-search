import type { JobPost } from "jobspy-js";

export interface FilterCriteria {
  /** Job is kept only if title or description contains at least one of these (case-insensitive). */
  includeKeywords?: string[];
  /** Job is dropped if title or description contains any of these (case-insensitive). */
  excludeKeywords?: string[];
  /** Only keep remote jobs. */
  remoteOnly?: boolean;
  /** Drop jobs whose max compensation is known and below this amount. */
  minSalary?: number;
}

function matchesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

export function filterJobs(jobs: JobPost[], criteria: FilterCriteria): JobPost[] {
  return jobs.filter((job) => {
    const text = `${job.title ?? ""} ${job.description ?? ""}`;

    if (criteria.includeKeywords?.length && !matchesAny(text, criteria.includeKeywords)) {
      return false;
    }

    if (criteria.excludeKeywords?.length && matchesAny(text, criteria.excludeKeywords)) {
      return false;
    }

    if (criteria.remoteOnly && !job.is_remote) {
      return false;
    }

    if (criteria.minSalary !== undefined) {
      const max = job.compensation?.max_amount ?? job.compensation?.min_amount;
      if (max !== undefined && max < criteria.minSalary) {
        return false;
      }
    }

    return true;
  });
}
