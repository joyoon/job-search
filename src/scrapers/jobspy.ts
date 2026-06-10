import { spawn } from "node:child_process";
import { config } from "../config/index.js";
import type { JobPosting, ScrapeOptions } from "../types/job.js";

/**
 * Runs python/scrape.py in a subprocess, passing scrape options as JSON
 * over stdin and parsing the JSON array of job postings from stdout.
 */
export function scrapeJobs(options: ScrapeOptions): Promise<JobPosting[]> {
  return new Promise((resolve, reject) => {
    const child = spawn(config.pythonBin, [config.scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start python process: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`scrape.py exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const jobs = JSON.parse(stdout) as JobPosting[];
        resolve(jobs);
      } catch (err) {
        reject(
          new Error(
            `Failed to parse scrape.py output: ${(err as Error).message}\n${stdout}`,
          ),
        );
      }
    });

    child.stdin.write(JSON.stringify(options));
    child.stdin.end();
  });
}
