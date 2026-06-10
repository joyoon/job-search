import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config/index.js";
import type { JobPost } from "../types/job.js";

function timestampedFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${timestamp}.${extension}`;
}

export async function saveJobsAsJson(
  jobs: JobPost[],
  filename = timestampedFilename("jobs", "json"),
): Promise<string> {
  await mkdir(config.outputDir, { recursive: true });
  const filePath = path.join(config.outputDir, filename);
  await writeFile(filePath, JSON.stringify(jobs, null, 2), "utf-8");
  return filePath;
}
