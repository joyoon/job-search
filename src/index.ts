import { Command } from "commander";
import { config } from "./config/index.js";
import { scrapeJobs } from "./scrapers/jobspy.js";
import { saveJobsAsJson } from "./storage/jobStore.js";
import { Site, type ScrapeJobsParams } from "./types/job.js";

const program = new Command();

program
  .name("job-search")
  .description("Scrape job postings from multiple job sites using JobSpy")
  .requiredOption("-s, --search-term <term>", "Search term, e.g. 'software engineer'")
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
  .option("-o, --out <filename>", "Output filename (saved under the configured output directory)");

program.parse();

const opts = program.opts();

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

try {
  const { jobs } = await scrapeJobs(scrapeParams);
  console.log(`Found ${jobs.length} job(s).`);

  const filePath = await saveJobsAsJson(jobs, opts.out);
  console.log(`Saved results to ${filePath}`);
} catch (err) {
  console.error("Scrape failed:", (err as Error).message);
  process.exitCode = 1;
}
