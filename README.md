# job-search

Scrapes job postings from Indeed, LinkedIn, ZipRecruiter, Glassdoor, Google,
Bayt, Naukri, and BDJobs using [jobspy-js](https://github.com/borgius/jobspy-js),
a TypeScript port of [JobSpy](https://github.com/speedyapply/JobSpy). Results
can be filtered and, optionally, used to draft tailored cover letters for
manual review.

> **Note:** This tool drafts cover letters for you to review — it does not
> submit applications. Automating actual submissions may violate the terms
> of service of job sites.

## Project structure

```
job-search/
├── src/
│   ├── applicant/          # loads your resume/profile for cover letter context
│   ├── config/             # env-driven configuration
│   ├── drafts/             # cover letter generation (Anthropic API)
│   ├── filters/            # keyword/salary/remote filtering
│   ├── scrapers/           # wrapper around jobspy-js
│   ├── storage/            # writes job results and drafts to disk
│   ├── types/              # re-exported jobspy-js types
│   └── index.ts            # CLI entry point
├── profile/
│   └── resume.example.md   # template; copy to resume.md and fill in
├── data/                    # scraped output and drafts (gitignored)
├── package.json
└── tsconfig.json
```

## Setup

```bash
npm install
cp .env.example .env
cp profile/resume.example.md profile/resume.md
```

Fill in `profile/resume.md` with your background, and adjust `.env` as
needed. Set `ANTHROPIC_API_KEY` if you want to use `--generate-drafts`.

## Usage

```bash
npm run dev -- --search-term "software engineer" --location "San Francisco, CA" --sites indeed,linkedin -n 20
```

Filtered results are saved as JSON under `data/`.

### Filtering and drafting

```bash
npm run dev -- \
  --search-term "software engineer" \
  --location "Remote" \
  --remote \
  --include-keywords "typescript,node" \
  --exclude-keywords "senior,staff" \
  --min-salary 120000 \
  --generate-drafts
```

Cover letter drafts are written as markdown files under `data/drafts/`, one
per matching job, for you to review and edit before applying.

### CLI options

| Flag | Description |
| --- | --- |
| `-s, --search-term` | Search term (required) |
| `-l, --location` | Location to search in |
| `--sites` | Comma-separated list of sites (`indeed,linkedin,zip_recruiter,glassdoor,google,google_careers,bayt,naukri,bdjobs`) |
| `-n, --results-wanted` | Number of results per site |
| `--remote` | Only return remote jobs |
| `--job-type` | `fulltime`, `parttime`, `internship`, `contract`, etc. |
| `--hours-old` | Only return jobs posted within this many hours |
| `--country` | Country to use for Indeed/Glassdoor search |
| `-o, --out` | Output filename within the output directory |
| `--include-keywords` | Comma-separated keywords; keep jobs whose title/description contain at least one |
| `--exclude-keywords` | Comma-separated keywords; drop jobs whose title/description contain any |
| `--min-salary` | Drop jobs with a known max salary below this amount |
| `--generate-drafts` | Generate a tailored cover letter draft for each remaining job (requires `ANTHROPIC_API_KEY`) |
| `--profile` | Path to your resume/background file (default `./profile/resume.md`) |

## Build

```bash
npm run build
npm start -- --search-term "data analyst"
```
