#!/usr/bin/env python3
"""
Thin wrapper around python-jobspy.

Reads a JSON-encoded options object from stdin and writes a JSON array
of job postings to stdout. Intended to be invoked as a subprocess from
the Node/TypeScript application (see src/scrapers/jobspy.ts).
"""

import json
import sys

import pandas as pd
from jobspy import scrape_jobs


def main() -> None:
    raw_options = sys.stdin.read()
    options = json.loads(raw_options) if raw_options.strip() else {}

    jobs_df = scrape_jobs(
        site_name=options.get("site_name"),
        search_term=options.get("search_term"),
        google_search_term=options.get("google_search_term"),
        location=options.get("location"),
        distance=options.get("distance"),
        is_remote=options.get("is_remote"),
        job_type=options.get("job_type"),
        results_wanted=options.get("results_wanted", 20),
        hours_old=options.get("hours_old"),
        country_indeed=options.get("country_indeed", "USA"),
        linkedin_fetch_description=options.get("linkedin_fetch_description", False),
    )

    # Replace NaN/NaT with None so the output is valid JSON, and convert
    # any timestamp columns to ISO strings.
    jobs_df = jobs_df.where(pd.notnull(jobs_df), None)
    for column in jobs_df.columns:
        if pd.api.types.is_datetime64_any_dtype(jobs_df[column]):
            jobs_df[column] = jobs_df[column].apply(
                lambda v: v.isoformat() if v is not None else None
            )

    records = jobs_df.to_dict(orient="records")
    json.dump(records, sys.stdout, default=str)


if __name__ == "__main__":
    main()
