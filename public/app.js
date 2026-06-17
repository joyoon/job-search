const form = document.getElementById("search-form");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

function formatLocation(location) {
  if (!location) return "";
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}

function formatCompensation(compensation) {
  if (!compensation) return null;
  const { min_amount, max_amount, currency, interval } = compensation;
  if (min_amount == null && max_amount == null) return null;
  const amount =
    min_amount != null && max_amount != null
      ? `${min_amount.toLocaleString()} - ${max_amount.toLocaleString()}`
      : (min_amount ?? max_amount).toLocaleString();
  const parts = [currency, amount].filter(Boolean).join(" ");
  return interval ? `${parts} / ${interval}` : parts;
}

function jobCard(job) {
  const card = document.createElement("article");
  card.className = "job-card";

  const title = document.createElement("h2");
  const link = document.createElement("a");
  link.href = job.job_url_direct || job.job_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = job.title;
  title.appendChild(link);
  card.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "job-meta";
  meta.textContent = [job.company_name, formatLocation(job.location), job.date_posted]
    .filter(Boolean)
    .join(" • ");
  card.appendChild(meta);

  const tags = document.createElement("div");
  tags.className = "job-tags";
  if (job.is_remote) tags.appendChild(makeTag("Remote"));
  (job.job_type || []).forEach((type) => tags.appendChild(makeTag(type)));
  const comp = formatCompensation(job.compensation);
  if (comp) tags.appendChild(makeTag(comp));
  if (tags.childElementCount > 0) card.appendChild(tags);

  if (job.description) {
    const desc = document.createElement("p");
    desc.className = "job-description";
    desc.textContent = job.description;
    card.appendChild(desc);
  }

  return card;
}

function makeTag(text) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = text;
  return span;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultsEl.innerHTML = "";

  const formData = new FormData(form);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (value !== "" && value !== null) {
      params.set(key, value);
    }
  }
  if (formData.get("remote")) {
    params.set("remote", "true");
  }

  const submitButton = form.querySelector("button");
  submitButton.disabled = true;
  setStatus("Searching...");

  try {
    const response = await fetch(`/api/jobs?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Search failed");
    }

    setStatus(`Found ${data.total} job(s).`);
    data.jobs.forEach((job) => resultsEl.appendChild(jobCard(job)));
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    submitButton.disabled = false;
  }
});
