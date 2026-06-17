import { Command } from "commander";
import { loadProfile } from "./applicant/profile.js";
import { config } from "./config/index.js";
import { createCoverLetterGenerator } from "./drafts/coverLetterGenerator.js";
import { filterJobs, type FilterCriteria } from "./filters/jobFilter.js";
import { loadJobsFromFile } from "./io/loadJobs.js";
import { scrapeJobs } from "./scrapers/jobspy.js";
import { createJobScorer, scoreJobs } from "./scoring/jobScorer.js";
import { saveDraft } from "./storage/draftStore.js";
import { saveJobsAsJson } from "./storage/jobStore.js";
import { Site, type JobPost, type ScrapeJobsParams } from "./types/job.js";

const program = new Command();

console.log("starting...");

program
  .name("job-search")
  .description("Scrape (or load) job postings, filter them, and draft tailored cover letters")
  .option("-s, --search-term <term>", "Search term, e.g. 'software engineer' (ignored if --input is set)")
  .option("--input <file>", "Load job listings from an existing JSON file instead of scraping")
  .option("-l, --location <location>", "Location to search in")
  .option(
    "--sites <sites>",
    "Comma-separated list of sites to search",
    (value) => value.split(",").map((s) => s.trim()) as Site[],
    config.defaultSites,
  )
  .option("-n, --results-wanted <number>", "Number of results per site", (v) => Number(v), config.defaultResultsWanted)
  .option("--remote", "Only return remote jobs")
  .option("--job-type <type>", "Filter by job type (fulltime, parttime, internship, contract, ...)")
  .option("--hours-old <hours>", "Only return jobs posted within this many hours", (v) => Number(v))
  .option("--country <country>", "Country to use for Indeed/Glassdoor search", config.defaultCountry)
  .option("-o, --out <filename>", "Output filename (saved under the configured output directory)")
  .option(
    "--include-keywords <keywords>",
    "Comma-separated keywords; only keep jobs whose title/description contain at least one",
    (value) => value.split(",").map((s) => s.trim()),
    config.defaultIncludeKeywords,
  )
  .option(
    "--exclude-keywords <keywords>",
    "Comma-separated keywords; drop jobs whose title/description contain any of these",
    (value) => value.split(",").map((s) => s.trim()),
    config.defaultExcludeKeywords,
  )
  .option("--min-salary <amount>", "Drop jobs with a known max salary below this amount", (v) => Number(v), config.defaultMinSalary)
  .option(
    "--generate-drafts",
    "Generate a tailored cover letter draft for each remaining job (requires ANTHROPIC_API_KEY)",
  )
  .option(
    "--score",
    "Score each remaining job against your profile and sort by match (requires ANTHROPIC_API_KEY)",
  )
  .option("--top-n <number>", "Keep only the top N scored jobs", (v) => Number(v))
  .option("--profile <path>", "Path to a text/markdown file describing your background", config.profilePath);

program.parse();

const opts = program.opts();

if (!opts.input && !opts.searchTerm) {
  console.error("Pipeline failed: either --search-term or --input must be provided.");
  process.exit(1);
}

const filterCriteria: FilterCriteria = {
  includeKeywords: opts.includeKeywords,
  excludeKeywords: opts.excludeKeywords,
  remoteOnly: opts.remote ?? undefined,
  minSalary: opts.minSalary,
};

try {
  let jobs: JobPost[];

  if (opts.input) {
    console.log(`Loading jobs from ${opts.input}...`);
    jobs = await loadJobsFromFile(opts.input);
  } else {
    const scrapeParams: ScrapeJobsParams = {
      search_term: opts.searchTerm,
      location: opts.location,
      site_name: opts.sites,
      results_wanted: opts.resultsWanted,
      is_remote: opts.remote ?? undefined,
      job_type: opts.jobType,
      hours_old: opts.hoursOld,
      country_indeed: opts.country,
    };

    console.log(`Scraping jobs for "${scrapeParams.search_term}"...`);
    ({ jobs } = await scrapeJobs(scrapeParams));
  }

  console.log(`Found ${jobs.length} job(s).`);

  let filtered: JobPost[] = filterJobs(jobs, filterCriteria);
  console.log(`${filtered.length} job(s) match your filters.`);

  if (opts.score) {
    if (!config.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY must be set to score jobs.");
    }

    const profile = await loadProfile(opts.profile);
    const scorer = createJobScorer(config.anthropicApiKey);

    console.log(`Scoring ${filtered.length} job(s) against your profile...`);
    let scored = await scoreJobs(filtered, profile, scorer);

    if (opts.topN !== undefined) {
      scored = scored.slice(0, opts.topN);
    }

    filtered = scored;
    console.log(`Kept ${filtered.length} job(s) after scoring.`);
  }

  const filePath = await saveJobsAsJson(filtered, opts.out);
  console.log(`Saved results to ${filePath}`);

  if (opts.generateDrafts) {
    if (!config.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY must be set to generate cover letter drafts.");
    }

    const profile = await loadProfile(opts.profile);
    const generator = createCoverLetterGenerator(config.anthropicApiKey);

    for (const job of filtered) {
      const coverLetter = await generator.generate(job, profile);
      const draftPath = await saveDraft(config.draftsDir, job, coverLetter);
      console.log(`Drafted cover letter: ${draftPath}`);
    }
  }
} catch (err) {
  console.error("Pipeline failed:", (err as Error).message);
  process.exitCode = 1;
}
