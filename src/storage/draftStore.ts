import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { JobPost } from "jobspy-js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/**
 * Writes a markdown file per job containing the posting details and a
 * drafted cover letter, for manual review before applying.
 */
export async function saveDraft(
  draftsDir: string,
  job: JobPost,
  coverLetter: string,
): Promise<string> {
  await mkdir(draftsDir, { recursive: true });

  const slug = slugify(`${job.company_name ?? "company"}-${job.title}`);
  const filename = `${slug || job.id || "job"}.md`;
  const filePath = path.join(draftsDir, filename);

  const content = [
    `# ${job.title} at ${job.company_name ?? "Unknown"}`,
    "",
    `- **Job URL:** ${job.job_url}`,
    `- **Location:** ${job.location?.city ?? ""} ${job.location?.state ?? ""}`.trim(),
    `- **Remote:** ${job.is_remote ? "Yes" : "No"}`,
    "",
    "## Cover letter draft",
    "",
    coverLetter,
  ].join("\n");

  await writeFile(filePath, content, "utf-8");
  return filePath;
}
