import Anthropic from "@anthropic-ai/sdk";
import type { JobPost } from "../types/job.js";

const MODEL = "claude-sonnet-4-6";

export interface ScoredJob extends JobPost {
  matchScore: number;
  matchRationale: string;
}

export interface JobScorer {
  score(job: JobPost, profile: string): Promise<{ score: number; rationale: string }>;
}

function extractJson(text: string): { score: number; rationale: string } {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Could not find JSON object in model response: ${text}`);
  }

  const parsed = JSON.parse(match[0]) as { score?: unknown; rationale?: unknown };
  const score = Number(parsed.score);

  if (!Number.isFinite(score)) {
    throw new Error(`Model response did not contain a numeric score: ${text}`);
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
  };
}

export function createJobScorer(apiKey: string): JobScorer {
  const client = new Anthropic({ apiKey });

  return {
    async score(job: JobPost, profile: string): Promise<{ score: number; rationale: string }> {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              "Score how well the job posting below matches the applicant's background, on a scale from 0 (no fit) to 100 (excellent fit).",
              "Consider required skills/experience, seniority level, and overall alignment with the applicant's background.",
              "Respond with ONLY a JSON object of the form {\"score\": <0-100 integer>, \"rationale\": \"<one sentence>\"} and nothing else.",
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
      return extractJson(textBlock?.text ?? "");
    },
  };
}

/**
 * Scores every job against the applicant's profile and returns them sorted
 * by descending match score.
 */
export async function scoreJobs(jobs: JobPost[], profile: string, scorer: JobScorer): Promise<ScoredJob[]> {
  const scored: ScoredJob[] = [];

  for (const job of jobs) {
    const { score, rationale } = await scorer.score(job, profile);
    scored.push({ ...job, matchScore: score, matchRationale: rationale });
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
