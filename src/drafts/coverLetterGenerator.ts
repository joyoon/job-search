import Anthropic from "@anthropic-ai/sdk";
import type { JobPost } from "jobspy-js";

const MODEL = "claude-sonnet-4-6";

export interface CoverLetterGenerator {
  generate(job: JobPost, profile: string): Promise<string>;
}

export function createCoverLetterGenerator(apiKey: string): CoverLetterGenerator {
  const client = new Anthropic({ apiKey });

  return {
    async generate(job: JobPost, profile: string): Promise<string> {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              "Write a concise, tailored cover letter for the job posting below, based on the applicant's background.",
              "Keep it under 350 words, professional but not generic, and highlight relevant experience.",
              "",
              "## Applicant background",
              profile,
              "",
              "## Job posting",
              `Title: ${job.title}`,
              `Company: ${job.company_name ?? "Unknown"}`,
              `Location: ${job.location?.city ?? ""} ${job.location?.state ?? ""}`.trim(),
              "Description:",
              job.description ?? "(no description provided)",
            ].join("\n"),
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      return textBlock?.text ?? "";
    },
  };
}
