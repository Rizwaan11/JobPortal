import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { canManageJobs, getCompanyContext } from "@/lib/company";
import type { JobStatus, RecruiterJobSummary } from "@/types/jobs";

const statuses: { label: string; value?: JobStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

function formatDate(value?: string) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cursor?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const activeStatus = statuses.find((item) => item.value === params.status)?.value;
  if (activeStatus) query.set("status", activeStatus);
  if (params.cursor) query.set("cursor", params.cursor);

  const suffix = query.size ? `?${query.toString()}` : "";
  const [data, company] = await Promise.all([
    apiFetch(`/api/jobs${suffix}`) as Promise<{
      jobs: RecruiterJobSummary[];
      nextCursor: string | null;
    }>,
    getCompanyContext(),
  ]);
  const canManage = canManageJobs(company.companyRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create roles, prepare screening questions and control publishing.
          </p>
        </div>
        {canManage && (
          <Link href="/dashboard/jobs/new" className={buttonVariants()}>
            Create job
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const active = activeStatus === status.value;
          const href = status.value
            ? `/dashboard/jobs?status=${status.value}`
            : "/dashboard/jobs";

          return (
            <Link
              key={status.label}
              href={href}
              className={buttonVariants({
                variant: active ? "default" : "outline",
                size: "sm",
              })}
            >
              {status.label}
            </Link>
          );
        })}
      </div>

      {data.jobs.length === 0 ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>No jobs here</CardTitle>
            <CardDescription>
              {canManage
                ? "Create a job or choose another status filter."
                : "Choose another status filter."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.jobs.map((job) => (
            <Card key={job._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge
                    variant={job.status === "open" ? "default" : "secondary"}
                  >
                    {job.status}
                  </Badge>
                </div>
                <CardDescription>
                  {job.attributes.location ?? "Location not specified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {formatDate(job.deadline)}
                </p>
                <Link
                  href={`/dashboard/jobs/${job._id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.nextCursor && (
        <Link
          href={`/dashboard/jobs?${new URLSearchParams({
            ...(activeStatus ? { status: activeStatus } : {}),
            cursor: data.nextCursor,
          }).toString()}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Next page
        </Link>
      )}
    </div>
  );
}
