import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Video,
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "final_interview"
  | "offer"
  | "hired"
  | "rejected";

type UpcomingInterview = {
  _id: string;
  scheduledAt: string;
  meetingLink: string;
  notes: string | null;
};

type Application = {
  _id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  stage: ApplicationStage;
  status: "active" | "withdrawn";
  createdAt: string;
  upcomingInterview: UpcomingInterview | null;
};

type ApplicationsResponse = {
  applications: Application[];
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

async function loadApplications(): Promise<ApplicationsResponse | null> {
  try {
    return (await apiFetch(
      "/api/applicants/applications",
    )) as ApplicationsResponse;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export default async function ApplicationsPage() {
  const data = await loadApplications();

  if (data === null) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Complete your profile first</CardTitle>
          <CardDescription>
            You need an applicant profile before you can apply for jobs.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/portal/profile" className={buttonVariants()}>
            Create profile
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (data.applications.length === 0) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>No applications yet</CardTitle>
          <CardDescription>
            Jobs you apply for will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/jobs" className={buttonVariants()}>
            Browse jobs
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress and upcoming interviews.
        </p>
      </div>

      <div className="grid gap-4">
        {data.applications.map((application) => (
          <Card key={application._id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{application.jobTitle}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <BriefcaseBusiness className="size-4" />
                    {application.companyName}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {formatLabel(application.stage)}
                  </Badge>

                  {application.status === "withdrawn" && (
                    <Badge variant="destructive">Withdrawn</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                Applied on {formatDate(application.createdAt)}
              </p>

              {application.upcomingInterview && (
                <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Video className="size-4" />
                    Upcoming interview
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(
                      application.upcomingInterview.scheduledAt,
                    )}
                  </p>

                  {application.upcomingInterview.notes && (
                    <p className="text-sm">
                      {application.upcomingInterview.notes}
                    </p>
                  )}

                  <a
                    href={application.upcomingInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Join meeting
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              )}

              <Link
                href={`/jobs/${application.jobId}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}
              >
                View job
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
