import Link from "next/link";
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

function formatDeadline(value?: string) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function ShortlistPage() {
  const shortlist = await loadShortlist();

  if (shortlist === null) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create your applicant profile first</CardTitle>
          <CardDescription>
            Your profile is needed before you can save jobs to a shortlist.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button render={<Link href="/portal/profile" />} nativeButton={false}>
            Create profile
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const jobs = shortlist.filter(hasJob);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep interesting roles here while you decide where to apply.
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No saved jobs yet</CardTitle>
            <CardDescription>
              Browse the public job board and save roles you want to revisit.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button render={<Link href="/jobs" />} nativeButton={false}>
              Browse jobs
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((item) => {
            const job = item.jobId;
            const canApply = job.status === "open";

            return (
              <Card key={item._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>
                        {job.companyId?.name ?? "Company unavailable"}
                      </CardDescription>
                    </div>
                    <Badge variant={canApply ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <p>{job.attributes?.location ?? "Location not specified"}</p>
                  <p>Deadline: {formatDeadline(job.deadline)}</p>
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
