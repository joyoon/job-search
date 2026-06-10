import { readFile } from "node:fs/promises";

/**
 * Loads the applicant's profile/resume as plain text/markdown to be used
 * as context when drafting cover letters.
 */
export async function loadProfile(profilePath: string): Promise<string> {
  try {
    return await readFile(profilePath, "utf-8");
  } catch {
    throw new Error(
      `Could not read applicant profile at "${profilePath}". ` +
        `Create this file with your resume/background, or pass --profile <path>.`,
    );
  }
}
