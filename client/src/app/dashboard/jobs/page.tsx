import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, MapPin, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { CursorPagination } from "@/components/cursor-pagination";
import { FilterPills } from "@/components/filter-pills";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { canManageJobs, getCompanyContext } from "@/lib/company";
import { formatDeadline, formatLabel } from "@/lib/format";
import type { JobStatus, RecruiterJobSummary } from "@/types/jobs";

const statuses: { label: string; value?: JobStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cursor?: string; direction?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const activeStatus = statuses.find((item) => item.value === params.status)?.value;
  if (activeStatus) query.set("status", activeStatus);
  if (params.cursor) query.set("cursor", params.cursor);
  const direction = params.direction === "previous" ? "previous" : "next";
  if (params.cursor) query.set("direction", direction);

  const suffix = query.size ? `?${query.toString()}` : "";
  const [data, company] = await Promise.all([
    apiFetch(`/api/jobs${suffix}`) as Promise<{
      jobs: RecruiterJobSummary[];
      previousCursor: string | null;
      nextCursor: string | null;
    }>,
    getCompanyContext(),
  ]);
  const canManage = canManageJobs(company.companyRole);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Jobs"
        description="Create roles, prepare screening questions and control publishing."
        actions={
          canManage ? (
            <Link href="/dashboard/jobs/new" className={buttonVariants()}>
              <Plus className="size-4" aria-hidden="true" />
              Create job
            </Link>
          ) : undefined
        }
      />

      <FilterPills
        label="Job status"
        items={statuses.map((status) => ({
          href: status.value ? `/dashboard/jobs?status=${status.value}` : "/dashboard/jobs",
          label: status.label,
          active: activeStatus === status.value,
        }))}
      />

      {data.jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No jobs here"
          description={
            canManage
              ? "Create a job or choose another status filter."
              : "Choose another status filter to find a role."
          }
          action={
            canManage ? (
              <Link href="/dashboard/jobs/new" className={buttonVariants()}>
                Create job
              </Link>
            ) : undefined
          }
          className="max-w-2xl"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.jobs.map((job) => (
            <Card key={job._id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {formatLabel(job.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {job.attributes.location ?? "Location not specified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {formatDeadline(job.deadline)}
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

      <CursorPagination
        previousHref={
          data.previousCursor
            ? `/dashboard/jobs?${new URLSearchParams({
                ...(activeStatus ? { status: activeStatus } : {}),
                cursor: data.previousCursor,
                direction: "previous",
              }).toString()}`
            : null
        }
        nextHref={
          data.nextCursor
            ? `/dashboard/jobs?${new URLSearchParams({
                ...(activeStatus ? { status: activeStatus } : {}),
                cursor: data.nextCursor,
                direction: "next",
              }).toString()}`
            : null
        }
      />
    </div>
  );
}
