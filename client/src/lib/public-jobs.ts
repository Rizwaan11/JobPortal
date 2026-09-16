export type PublicJobSummary = {
  _id: string;
  title: string;
  description: string;
  deadline?: string;
  createdAt: string;
  companyId: { _id: string; name: string } | null;
};

export type PublicJob = {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  createdAt: string;
  attributes: Record<string, unknown>;
  screeningQuestions: Record<string, unknown>[];
  companyName: string;
};

export type PublicJobsPage = {
  jobs: PublicJobSummary[];
  nextCursor: string | null;
};

function apiBaseUrl() {
  if (!process.env.API_URL) {
    throw new Error("API_URL is not configured");
  }

  return process.env.API_URL.replace(/\/$/, "");
}

export async function getPublicJobs({
  q,
  cursor,
}: {
  q?: string;
  cursor?: string;
} = {}): Promise<PublicJobsPage> {
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (cursor) query.set("cursor", cursor);

  const suffix = query.size ? `?${query.toString()}` : "";
  const response = await fetch(`${apiBaseUrl()}/api/public/jobs${suffix}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load jobs");
  }

  return response.json() as Promise<PublicJobsPage>;
}

export async function getPublicJob(id: string): Promise<PublicJob | null> {
  const response = await fetch(
    `${apiBaseUrl()}/api/public/jobs/${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load this job");

  return response.json() as Promise<PublicJob>;
}
