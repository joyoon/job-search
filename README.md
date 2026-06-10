# job-search

Scrapes job postings from Indeed, LinkedIn, ZipRecruiter, Glassdoor, and other
sites using [JobSpy](https://github.com/speedyapply/JobSpy). The CLI is
written in Node/TypeScript and delegates the actual scraping to JobSpy (a
Python library) via a small subprocess wrapper.

## Project structure

```
job-search/
├── python/
│   ├── requirements.txt   # python-jobspy dependency
│   └── scrape.py          # JobSpy wrapper, JSON in (stdin) -> JSON out (stdout)
├── src/
│   ├── config/            # env-driven configuration
│   ├── scrapers/           # subprocess wrapper around scrape.py
│   ├── storage/            # writes results to disk
│   ├── types/              # shared TypeScript types
│   └── index.ts            # CLI entry point
├── data/                    # scraped output (gitignored)
├── package.json
└── tsconfig.json
```

## Setup

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Set up the Python environment for JobSpy:

   ```bash
   python3 -m venv python/.venv
   source python/.venv/bin/activate
   pip install -r python/requirements.txt
   ```

3. Copy `.env.example` to `.env` and adjust as needed (in particular
   `PYTHON_BIN` should point at the Python interpreter with `python-jobspy`
   installed, e.g. `python/.venv/bin/python`).

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
| `--sites` | Comma-separated list of sites (`indeed,linkedin,zip_recruiter,glassdoor,...`) |
| `-n, --results-wanted` | Number of results per site |
| `--remote` | Only return remote jobs |
| `--job-type` | `fulltime`, `parttime`, `internship`, or `contract` |
| `--hours-old` | Only return jobs posted within this many hours |
| `--country` | Country to use for Indeed search |
| `-o, --out` | Output filename within the output directory |

## Build

```bash
npm run build
npm start -- --search-term "data analyst"
```
