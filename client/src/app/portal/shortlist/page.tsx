import Link from "next/link";
import { Bookmark, CalendarDays, MapPin } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDeadline } from "@/lib/format";
import type { ShortlistItem } from "@/types/applicant";
import RemoveButton from "./remove-button";

type AvailableShortlistItem = ShortlistItem & {
  jobId: NonNullable<ShortlistItem["jobId"]>;
};

async function loadShortlist(): Promise<ShortlistItem[] | null> {
  try {
    return (await apiFetch("/api/applicants/shortlist")) as ShortlistItem[];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function hasJob(item: ShortlistItem): item is AvailableShortlistItem {
  return item.jobId !== null;
}

export default async function ShortlistPage() {
  const shortlist = await loadShortlist();

  if (shortlist === null) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Create your applicant profile first"
        description="Your profile is needed before you can save jobs to a shortlist."
        className="max-w-2xl"
        action={
          <Button render={<Link href="/portal/profile" />} nativeButton={false}>
            Create profile
          </Button>
        }
      />
    );
  }

  const jobs = shortlist.filter(hasJob);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Saved jobs"
        description={`${jobs.length} ${jobs.length === 1 ? "saved role" : "saved roles"} · Keep interesting opportunities here while you decide.`}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Browse the public job board and save roles you want to revisit."
          className="max-w-2xl"
          action={
            <Button render={<Link href="/jobs" />} nativeButton={false}>
              Browse jobs
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((item) => {
            const job = item.jobId;
            const canApply = job.status === "open";

            return (
              <Card key={item._id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>
                        {job.companyId?.name ?? "Company unavailable"}
                      </CardDescription>
                    </div>
                    <Badge variant={canApply ? "default" : "secondary"}>{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" aria-hidden="true" />
                    {job.attributes?.location ?? "Location not specified"}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    Deadline: {formatDeadline(job.deadline)}
                  </p>
                  {!canApply ? <p>This role is not accepting applications.</p> : null}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3">
                  {canApply ? (
                    <Button
                      render={<Link href={`/jobs/${job._id}`} />}
                      nativeButton={false}
                      size="sm"
                    >
                      View job
                    </Button>
                  ) : null}
                  <RemoveButton jobId={job._id} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
