# job-search

Scrapes job postings from Indeed, LinkedIn, ZipRecruiter, Glassdoor, Google,
Bayt, Naukri, and BDJobs using [jobspy-js](https://github.com/borgius/jobspy-js),
a TypeScript port of [JobSpy](https://github.com/speedyapply/JobSpy).

## Project structure

```
job-search/
├── src/
│   ├── config/            # env-driven configuration
│   ├── scrapers/           # wrapper around jobspy-js
│   ├── storage/            # writes results to disk
│   ├── types/              # re-exported jobspy-js types
│   └── index.ts            # CLI entry point
├── data/                    # scraped output (gitignored)
├── package.json
└── tsconfig.json
```

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and adjust as needed.

## Usage

```bash
npm run dev -- --search-term "software engineer" --location "San Francisco, CA" --sites indeed,linkedin -n 20
```

Results are saved as JSON under `data/`.

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

## Build

```bash
npm run build
npm start -- --search-term "data analyst"
```
